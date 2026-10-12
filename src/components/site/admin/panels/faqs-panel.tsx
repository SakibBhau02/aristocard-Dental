"use client";

/* ------------------------------------------------------------------ */
/*  FAQs panel — full CRUD + one-click reordering.                      */
/*                                                                     */
/*  • List mode: numbered rows in display order (the number IS the     */
/*    position on the website), Bangla indicator dot, active/hidden    */
/*    pill, ↑ / ↓ reorder buttons and Edit / Delete.                   */
/*  • Reorder swaps two rows, then POSTs the full id array to          */
/*    { action: "reorder" } — the server persists sort indices and     */
/*    the public FAQ list re-renders instantly.                        */
/*  • Edit mode: bilingual question + answer and an active switch,     */
/*    with dirty tracking + sticky SaveBar.                            */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  CircleHelp,
  EyeOff,
  Languages,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { FaqRow } from "@/lib/content/shared";
import { useContent } from "@/components/site/content-provider";
import {
  BilingualField,
  ConfirmDeleteDialog,
  EmptyState,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  StatCard,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                      */
/* ------------------------------------------------------------------ */

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "slate";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    slate: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function EditorCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="font-heading text-sm font-bold text-brand-navy">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-ice/60 px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-navy">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
        ) : null}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className="data-[state=checked]:bg-brand-navy"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Draft                                                              */
/* ------------------------------------------------------------------ */

type FaqDraft = {
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  active: boolean;
};

function rowToDraft(row: FaqRow | null): FaqDraft {
  return row
    ? {
        question: row.question,
        questionBn: row.questionBn ?? "",
        answer: row.answer,
        answerBn: row.answerBn ?? "",
        active: row.active,
      }
    : { question: "", questionBn: "", answer: "", answerBn: "", active: true };
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

function FaqEditor({
  row,
  onSessionExpired,
  onSaved,
  onClose,
}: {
  row: FaqRow | null;
  onSessionExpired: () => void;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { post } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();
  const [draft, setDraft] = useState<FaqDraft>(() => rowToDraft(row));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snapshot] = useState(() => JSON.stringify(rowToDraft(row)));

  const dirty = JSON.stringify(draft) !== snapshot;

  function update(patch: Partial<FaqDraft>) {
    setFormError(null);
    setDraft((d) => ({ ...d, ...patch }));
  }

  function back() {
    if (dirty && !window.confirm("Discard unsaved changes to this FAQ?")) return;
    onClose();
  }

  function reset() {
    setDraft(JSON.parse(snapshot) as FaqDraft);
    setFormError(null);
  }

  async function save() {
    if (saving) return;
    const problems: string[] = [];
    if (draft.question.trim().length < 5)
      problems.push("Question must be at least 5 characters.");
    if (draft.answer.trim().length < 10)
      problems.push("Answer must be at least 10 characters.");
    if (problems.length) {
      setFormError(problems[0]);
      toastFail("Check the form", problems[0]);
      return;
    }

    setSaving(true);
    const res = await post<{ message?: string; error?: string }>("/api/admin/faqs", {
      ...(row ? { id: row.id, sort: row.sort } : {}),
      question: draft.question.trim(),
      questionBn: draft.questionBn.trim() || undefined,
      answer: draft.answer.trim(),
      answerBn: draft.answerBn.trim() || undefined,
      active: draft.active,
    });
    setSaving(false);

    if (res.ok) {
      toastOk(row ? "FAQ updated" : "FAQ created", res.data?.message);
      void refresh();
      onSaved();
      return;
    }
    const message =
      (res.data as { error?: string } | null)?.error ?? "Could not save this FAQ. Please try again.";
    setFormError(message);
    toastFail("Save failed", message);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={back}
          className="rounded-full border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to list
        </Button>
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-brand-navy">
            {row ? "Edit FAQ" : "Add a new FAQ"}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {row
              ? `Position ${row.sort + 1} · shown on the home page and FAQ page`
              : "New FAQs are appended to the end of the list."}
          </p>
        </div>
      </div>

      <EditorCard
        title="Question & answer"
        description="Answer-first phrasing works best — these also feed the FAQ schema on the public site."
      >
        <BilingualField
          label="Question"
          enValue={draft.question}
          bnValue={draft.questionBn}
          onEnChange={(v) => update({ question: v })}
          onBnChange={(v) => update({ questionBn: v })}
          placeholder="What causes tooth decay?"
        />
        <BilingualField
          label="Answer"
          textarea
          rows={5}
          enValue={draft.answer}
          bnValue={draft.answerBn}
          onEnChange={(v) => update({ answer: v })}
          onBnChange={(v) => update({ answerBn: v })}
          placeholder="A clear, patient-friendly answer…"
        />
        <SwitchRow
          label="Visible on the website"
          description="Hidden FAQs stay in the database but disappear from the public list."
          checked={draft.active}
          onCheckedChange={(checked) => update({ active: checked })}
        />
      </EditorCard>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100"
        >
          {formError}
        </p>
      ) : null}

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel={row ? "Save changes" : "Create FAQ"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel (list mode)                                                  */
/* ------------------------------------------------------------------ */

export function FaqsPanel({ onSessionExpired }: PanelProps) {
  const { post, del } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();

  const [rows, setRows] = useState<FaqRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ row: FaqRow | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { faqs?: FaqRow[]; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status}).`);
      setRows(data?.faqs ?? []);
      setLoaded(true);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load FAQs.");
    } finally {
      setLoadBusy(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.question, r.questionBn ?? "", r.answer].join(" ").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      withBn: rows.filter((r) => Boolean(r.questionBn)).length,
      hidden: rows.filter((r) => !r.active).length,
    }),
    [rows]
  );

  async function move(index: number, dir: -1 | 1) {
    if (movingId) return;
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const id = next[target].id;
    setRows(next);
    setMovingId(id);
    const res = await post<{ faqs?: FaqRow[]; message?: string; error?: string }>(
      "/api/admin/faqs",
      { action: "reorder", ids: next.map((r) => r.id) }
    );
    setMovingId(null);
    if (res.ok) {
      if (res.data?.faqs) setRows(res.data.faqs);
      toastOk("Order saved", res.data?.message);
      void refresh();
    } else {
      toastFail(
        "Reorder failed",
        (res.data as { error?: string } | null)?.error ?? "Restoring the previous order…"
      );
      void load();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await del<{ message?: string; error?: string }>(
      `/api/admin/faqs?id=${deleteTarget.id}`
    );
    setDeleting(false);
    if (res.ok) {
      toastOk("FAQ deleted", res.data?.message);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      void refresh();
    } else {
      toastFail(
        "Delete failed",
        (res.data as { error?: string } | null)?.error ?? "Please try again in a moment."
      );
      setDeleteTarget(null);
    }
  }

  if (!loaded) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-heading text-lg font-bold text-rose-700">Could not load FAQs</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-rose-600">{loadError}</p>
          <Button
            onClick={() => void load()}
            variant="outline"
            size="sm"
            className="mt-5 rounded-full border-rose-200 text-rose-600 hover:bg-rose-100"
          >
            <RefreshCw className={cn("h-4 w-4", loadBusy && "animate-spin")} aria-hidden="true" />
            Try again
          </Button>
        </div>
      );
    }
    return <PanelSkeleton />;
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 36 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <FaqEditor
              row={editing.row}
              onSessionExpired={onSessionExpired}
              onSaved={() => {
                setEditing(null);
                void load();
              }}
              onClose={() => setEditing(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="space-y-5"
          >
            <PanelHeader
              title="Question bank"
              description="Order matters — the list below is exactly what visitors see, top to bottom."
              actions={
                <Button
                  type="button"
                  onClick={() => setEditing({ row: null })}
                  className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add FAQ
                </Button>
              }
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={CircleHelp} label="FAQs" value={stats.total} />
              <StatCard
                icon={Languages}
                label="With Bangla"
                value={stats.withBn}
                tone="text-brand-blue bg-ice ring-blue-100"
              />
              <StatCard
                icon={EyeOff}
                label="Hidden"
                value={stats.hidden}
                tone="text-slate-500 bg-slate-100 ring-slate-200"
              />
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-80">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search questions…"
                    aria-label="Search FAQs"
                    className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-slate-400">
                    {filtered.length} of {rows.length} shown
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadBusy}
                    onClick={() => void load()}
                    className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loadBusy && "animate-spin")}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {loadError ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                {loadError}
              </p>
            ) : null}

            {/* Rows */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={CircleHelp}
                title={rows.length === 0 ? "No FAQs yet" : "No FAQs match your search"}
                description={
                  rows.length === 0
                    ? "Add the first question to start the public FAQ section."
                    : "Try a different search term."
                }
                action={
                  rows.length === 0 ? (
                    <Button
                      type="button"
                      onClick={() => setEditing({ row: null })}
                      className="rounded-full bg-brand-navy font-bold text-white hover:bg-brand-blue"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add FAQ
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-2.5">
                {filtered.map((r, index) => (
                  <motion.article
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Position */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-ice text-xs font-bold tabular-nums text-brand-blue ring-1 ring-blue-100"
                          title={`Display position ${index + 1}`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => void move(index, -1)}
                            disabled={index === 0 || movingId !== null}
                            aria-label="Move FAQ up"
                            title="Move up"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 ring-1 ring-blue-100 transition hover:bg-blue-50 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void move(index, 1)}
                            disabled={index === filtered.length - 1 || movingId !== null}
                            aria-label="Move FAQ down"
                            title="Move down"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 ring-1 ring-blue-100 transition hover:bg-blue-50 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold leading-snug text-brand-navy">
                          <span className="min-w-0 break-words">{r.question}</span>
                          {r.questionBn ? (
                            <span
                              title="Bangla translation available"
                              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100"
                            >
                              <Languages className="h-3 w-3" aria-hidden="true" />
                              বাংলা
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          {r.answer}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {r.active ? (
                          <StatusPill tone="green">
                            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                            Active
                          </StatusPill>
                        ) : (
                          <StatusPill tone="slate">
                            <EyeOff className="h-3 w-3" aria-hidden="true" />
                            Hidden
                          </StatusPill>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing({ row: r })}
                            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(r)}
                            className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Delete this FAQ?"
        description={
          <>
            <strong className="text-brand-navy">{deleteTarget?.question}</strong> will be removed
            from the home page and FAQ page. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
