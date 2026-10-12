"use client";

/* ------------------------------------------------------------------ */
/*  Staff Accounts panel — OWNER-only account management.               */
/*                                                                     */
/*  • GET /api/admin/users → account cards (name, @handle, role badge,  */
/*    active toggle, last sign-in, added date).                        */
/*  • Add staff / edit account dialog: username (create only),         */
/*    display name, role select with per-role explanations, password   */
/*    with show/hide eye toggle (blank = unchanged when editing).      */
/*  • Active toggle posts immediately; delete uses the shared          */
/*    ConfirmDeleteDialog.                                             */
/*  • 403 (non-owner mid-session demotion) renders a friendly          */
/*    access-denied state; the shared 403 toast fires on mutations.    */
/*  • Business rule surfaced up top: the clinic always keeps ≥1        */
/*    active Owner account (enforced server-side too).                 */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADMIN_ROLE_INFO,
  ConfirmDeleteDialog,
  EmptyState,
  PanelHeader,
  PanelSkeleton,
  RoleBadge,
  StatCard,
  initialsOf,
  prettyDay,
  prettyStamp,
  relativeTime,
  useAdminFetch,
  useAdminToast,
  type AdminAccountRow,
  type AdminRole,
  type AdminSessionUser,
  type PanelProps,
} from "../admin-shared";

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9.-]{1,38}[a-z0-9])$/;
const ROLES: AdminRole[] = ["OWNER", "EDITOR", "VIEWER"];

/* ------------------------------------------------------------------ */
/*  Local atoms                                                        */
/* ------------------------------------------------------------------ */

/** Password input with a show/hide eye toggle. */
function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-blue-100 bg-ice pl-4 pr-12 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        title={show ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-blue-50 hover:text-brand-navy"
      >
        {show ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add / edit dialog                                                  */
/* ------------------------------------------------------------------ */

function AccountDialog({
  open,
  onOpenChange,
  row,
  onSessionExpired,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: AdminAccountRow | null; /* null → create mode */
  onSessionExpired: () => void;
  onSaved: () => void;
}) {
  const { post } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const editing = row !== null;

  const [username, setUsername] = useState(row?.username ?? "");
  const [displayName, setDisplayName] = useState(row?.displayName ?? "");
  const [role, setRole] = useState<AdminRole>(row?.role ?? "EDITOR");
  const [active, setActive] = useState(row?.active ?? true);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* The shell remounts this dialog (key = target + open sequence) so
     the initializers above re-seed the form for every open. */

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setFormError(null);

    const problems: string[] = [];
    if (displayName.trim().length < 3) {
      problems.push("Display name must be at least 3 characters.");
    }
    if (!editing) {
      if (!USERNAME_RE.test(username.trim())) {
        problems.push(
          "Username must be 3-40 characters: lowercase letters, numbers, dots or hyphens."
        );
      }
      if (password.length < 8) problems.push("Password must be at least 8 characters.");
    } else if (password && password.length < 8) {
      problems.push("New password must be at least 8 characters.");
    }
    if (problems.length) {
      setFormError(problems[0]);
      toastFail("Check the form", problems[0]);
      return;
    }

    setSaving(true);
    const res = await post<{ message?: string; error?: string }>("/api/admin/users", {
      ...(editing
        ? {
            id: row.id,
            displayName: displayName.trim(),
            role,
            active,
            ...(password ? { password } : {}),
          }
        : {
            username: username.trim(),
            displayName: displayName.trim(),
            role,
            password,
          }),
    });
    setSaving(false);

    if (res.ok) {
      toastOk(editing ? "Account updated" : "Account created", res.data?.message);
      onSaved();
      return;
    }
    /* 403 already surfaced via the shared toast — skip the duplicate. */
    if (res.status !== 403) {
      const message =
        (res.data as { error?: string } | null)?.error ??
        "Could not save this account. Please try again.";
      setFormError(message);
      toastFail("Save failed", message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-blue-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg text-brand-navy">
            {editing ? `Edit @${row?.username}` : "Add a staff account"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-500">
            {editing
              ? "Update the name, role, status or password — leave the password blank to keep the current one."
              : "Create a sign-in for a colleague. Pick the least access their work needs; you can change it anytime."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {!editing ? (
            <div>
              <label
                htmlFor="staff-username"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Username
              </label>
              <Input
                id="staff-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. frontdesk"
                className="mt-1.5 h-11 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                3-40 characters — lowercase letters, numbers, dots or hyphens.
              </p>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="staff-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Display name
            </label>
            <Input
              id="staff-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              placeholder="e.g. Front Desk"
              className="mt-1.5 h-11 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
            />
          </div>

          <div>
            <label
              htmlFor="staff-role"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Role
            </label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger
                id="staff-role"
                className="mt-1.5 h-11 w-full rounded-xl border-blue-100 bg-ice text-sm text-brand-navy focus-visible:ring-brand-blue/25"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg py-2.5">
                    <RoleBadge role={r} />
                    <span className="ml-2 text-xs text-slate-500">
                      {ADMIN_ROLE_INFO[r].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              {ADMIN_ROLE_INFO[role].blurb}
            </p>
          </div>

          {editing ? (
            <label className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-ice/60 px-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-brand-navy">
                  Active
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  Disabled accounts can&rsquo;t sign in — their sessions end
                  immediately.
                </span>
              </span>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                aria-label="Account active"
                className="data-[state=checked]:bg-brand-navy"
              />
            </label>
          ) : null}

          <div>
            <label
              htmlFor="staff-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              {editing ? "New password" : "Password"}
            </label>
            <PasswordInput
              id="staff-password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder={editing ? "Leave blank to keep the current password" : "At least 8 characters"}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              {editing
                ? "Type a new password only if you want to reset it."
                : "At least 8 characters — share it with the staff member privately."}
            </p>
          </div>

          {formError ? (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600 ring-1 ring-rose-100"
            >
              {formError}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="rounded-full border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="h-4 w-4" aria-hidden="true" />
              )}
              {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

export function UsersPanel({
  onSessionExpired,
  currentUser,
}: PanelProps & { currentUser?: AdminSessionUser | null }) {
  const { post, del } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();

  const [rows, setRows] = useState<AdminAccountRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRow, setDialogRow] = useState<AdminAccountRow | null>(null);
  const [dialogSeq, setDialogSeq] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccountRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { users?: AdminAccountRow[]; error?: string }
        | null;
      if (res.status === 403) {
        setForbidden(
          data?.error ?? "Owner access is required for staff management."
        );
        setLoaded(true);
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status}).`);
      setRows(data?.users ?? []);
      setLoaded(true);
      setLoadError(null);
      setForbidden(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load staff accounts.");
    } finally {
      setLoadBusy(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((r) => r.active).length,
      owners: rows.filter((r) => r.role === "OWNER" && r.active).length,
    }),
    [rows]
  );

  async function toggleActive(row: AdminAccountRow, active: boolean) {
    if (togglingId) return;
    setTogglingId(row.id);
    const res = await post<{ message?: string; error?: string }>("/api/admin/users", {
      id: row.id,
      displayName: row.displayName,
      role: row.role,
      active,
    });
    setTogglingId(null);
    if (res.ok) {
      toastOk(active ? "Account enabled" : "Account disabled", res.data?.message);
      void load();
    } else if (res.status !== 403) {
      toastFail(
        "Update failed",
        (res.data as { error?: string } | null)?.error ?? "Please try again in a moment."
      );
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await del<{ message?: string; error?: string }>(
      `/api/admin/users?id=${deleteTarget.id}`
    );
    setDeleting(false);
    if (res.ok) {
      toastOk("Account removed", res.data?.message);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else if (res.status !== 403) {
      toastFail(
        "Delete failed",
        (res.data as { error?: string } | null)?.error ?? "Please try again in a moment."
      );
      setDeleteTarget(null);
    }
  }

  function openCreate() {
    setDialogRow(null);
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  function openEdit(row: AdminAccountRow) {
    setDialogRow(row);
    setDialogSeq((s) => s + 1);
    setDialogOpen(true);
  }

  /* ---- Boot / guard states ---- */
  if (!loaded) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-heading text-lg font-bold text-rose-700">
            Could not load staff accounts
          </p>
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
    return <PanelSkeleton rows={3} />;
  }

  if (forbidden) {
    return (
      <EmptyState
        icon={UserCog}
        tone="amber"
        title="Owner access required"
        description={`${forbidden} Role changes apply immediately — ask an owner if you need staff access.`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <PanelHeader
        title="Staff accounts"
        description="Who can sign in to the admin panel, and what each role may do."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadBusy}
              onClick={() => void load()}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className={cn("h-4 w-4", loadBusy && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              type="button"
              onClick={openCreate}
              className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add staff
            </Button>
          </>
        }
      />

      {/* Standing rule + role explanations */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-200"
            aria-hidden="true"
          >
            <ShieldAlert className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold text-brand-navy">
              The clinic must always keep at least one active Owner account.
            </p>
            <ul className="mt-2.5 grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <li
                  key={r}
                  className="rounded-xl bg-white/80 p-3 ring-1 ring-amber-100"
                >
                  <RoleBadge role={r} />
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {ADMIN_ROLE_INFO[r].blurb}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={UsersRound} label="Accounts" value={stats.total} />
        <StatCard
          icon={BadgeCheck}
          label="Active"
          value={stats.active}
          tone="text-emerald-700 bg-emerald-50 ring-emerald-100"
        />
        <StatCard
          icon={ShieldCheck}
          label="Active owners"
          value={stats.owners}
          tone="text-amber-700 bg-amber-50 ring-amber-100"
        />
      </div>

      {loadError ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
          {loadError}
        </p>
      ) : null}

      {/* Accounts */}
      {rows.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No staff accounts yet"
          description="Add a colleague account so the team can sign in with their own username."
          action={
            <Button
              type="button"
              onClick={openCreate}
              className="rounded-full bg-brand-navy font-bold text-white hover:bg-brand-blue"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add staff
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {rows.map((row) => {
              const isSelf = currentUser?.sub === row.id;
              return (
                <motion.article
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "rounded-2xl border bg-white p-4 shadow-sm transition-colors duration-300",
                    row.active ? "border-blue-100/70" : "border-slate-200 bg-slate-50/60"
                  )}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ice text-sm font-bold text-brand-navy ring-1 ring-blue-100"
                      aria-hidden="true"
                    >
                      {initialsOf(row.displayName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand-navy">
                        <span className="min-w-0 break-words">{row.displayName}</span>
                        <RoleBadge role={row.role} />
                        {isSelf ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-blue ring-1 ring-blue-100">
                            You
                          </span>
                        ) : null}
                        {!row.active ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                            Disabled
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">@{row.username}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                        <span
                          title={
                            row.lastLoginAt
                              ? `Last sign-in ${prettyStamp(row.lastLoginAt)}`
                              : undefined
                          }
                        >
                          Last sign-in:{" "}
                          {row.lastLoginAt ? relativeTime(row.lastLoginAt) : "never"}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span title={`Added ${prettyStamp(row.createdAt)}`}>
                          Added {prettyDay(row.createdAt)}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-ice/60 px-3.5 py-2">
                        <span className="text-xs font-semibold text-brand-navy">Active</span>
                        <Switch
                          checked={row.active}
                          disabled={togglingId !== null}
                          onCheckedChange={(checked) => void toggleActive(row, checked)}
                          aria-label={`Enable or disable the ${row.username} account`}
                          className="data-[state=checked]:bg-brand-navy"
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(row)}
                        className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => setDeleteTarget(row)}
                        title={
                          isSelf
                            ? "You can't delete the account you're signed in with"
                            : "Delete this account"
                        }
                        className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / edit — the key remounts the dialog per open so the form
          starts fresh from the target account */}
      <AccountDialog
        key={`account-${dialogSeq}-${dialogRow?.id ?? "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        row={dialogRow}
        onSessionExpired={onSessionExpired}
        onSaved={() => {
          setDialogOpen(false);
          void load();
        }}
      />

      {/* Delete */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Remove this staff account?"
        confirmLabel="Remove account"
        description={
          <>
            <strong className="text-brand-navy">
              {deleteTarget?.displayName} (@{deleteTarget?.username})
            </strong>{" "}
            will immediately lose access to the admin panel — their session ends
            the moment they touch anything. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
