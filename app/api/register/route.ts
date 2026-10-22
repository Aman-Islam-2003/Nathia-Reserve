import { NextResponse } from "next/server";
import { z } from "zod";

const Lead = z.object({
  interest: z.string().max(60),
  timing: z.string().max(60),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.union([z.literal(""), z.string().email().max(200)]),
});

/**
 * Receives a registration. Forwards to a CRM/automation webhook and/or emails it via Resend
 * when those env vars are set; otherwise just logs it (fine for local dev).
 */
export async function POST(req: Request) {
  const parsed = Lead.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  const lead = { ...parsed.data, receivedAt: new Date().toISOString() };

  const jobs: Promise<unknown>[] = [];
  if (process.env.LEADS_WEBHOOK_URL) {
    jobs.push(fetch(process.env.LEADS_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) }));
  }
  if (process.env.RESEND_API_KEY && process.env.LEADS_TO_EMAIL && process.env.LEADS_FROM_EMAIL) {
    jobs.push(fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEADS_FROM_EMAIL,
        to: process.env.LEADS_TO_EMAIL,
        subject: `New registration: ${lead.name} (${lead.interest})`,
        text: Object.entries(lead).map(([k, v]) => `${k}: ${v}`).join("\n"),
      }),
    }));
  }
  if (!jobs.length) console.log("[register] lead", lead);

  const results = await Promise.allSettled(jobs);
  if (jobs.length && results.every((r) => r.status === "rejected")) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
