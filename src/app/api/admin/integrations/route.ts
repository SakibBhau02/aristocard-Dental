import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard, readJson, bad, serverError, ok } from "@/lib/content/admin-api";
import { getAdminActor } from "@/lib/admin-auth";
import {
  getIntegrations,
  saveIntegrations,
  normalizeIntegrations,
  integrationIssues,
  maskIntegrations,
  type IntegrationsConfig,
} from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  Admin API — Integrations & Tracking (Facebook Pixel, GA4, GTM,      */
/*  TikTok Pixel, Telegram bot, first-party analytics).                 */
/*                                                                      */
/*  GET  /api/admin/integrations  → live config (token masked for       */
/*                                  non-OWNER roles)                     */
/*  POST /api/admin/integrations  → full config (OWNER only — enforced  */
/*                                  by OWNER_ONLY_MUTATIONS in auth)    */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const cfg = await getIntegrations();
    const actor = await getAdminActor(req);
    const role = actor?.kind === "automation" ? "OWNER" : actor?.user.role ?? "VIEWER";
    return NextResponse.json({
      integrations: role === "OWNER" ? cfg : maskIntegrations(cfg),
      role,
    });
  } catch (err) {
    return serverError("integrations", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body || typeof body !== "object") return bad("A valid JSON body is required.");

    /* Merge over the CURRENT stored config so a masked token round-trip
       (non-owner read → save) can never blank the real secret.        */
    const current = await getIntegrations();
    const incoming = normalizeIntegrations(body);

    let merged: IntegrationsConfig = {
      ...current,
      ga4Id: incoming.ga4Id,
      gtmId: incoming.gtmId,
      fbPixelId: incoming.fbPixelId,
      tiktokPixelId: incoming.tiktokPixelId,
      telegramEvents: incoming.telegramEvents,
      trackingEnabled: incoming.trackingEnabled,
      telegramChatId: incoming.telegramChatId,
      telegramBotToken: incoming.telegramBotToken,
    };

    /* Masked tokens ("12345••••••••wxyz") must keep the stored secret. */
    if (incoming.telegramBotToken.includes("•")) {
      merged = { ...merged, telegramBotToken: current.telegramBotToken };
    }
    /* Empty token + explicit clear flag means "remove the bot". */
    if (body.clearTelegramToken === true) {
      merged = { ...merged, telegramBotToken: "" };
    }

    const issues = integrationIssues(merged);
    if (issues.length > 0) {
      return NextResponse.json({ error: issues[0], issues }, { status: 400 });
    }

    await saveIntegrations(merged);
    return ok(req, { integrations: merged }, "Integration settings saved.");
  } catch (err) {
    return serverError("integrations", err);
  }
}

/* Keep tree-shaking honest — db is imported for future audit helpers. */
void db;
