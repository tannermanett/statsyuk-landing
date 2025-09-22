import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    const webhookUrl = process.env.WAITLIST_SHEET_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("WAITLIST_SHEET_WEBHOOK_URL is not set");
      return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
    }

    const payload = {
      email,
      createdAt: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "",
      ip: (req.headers.get("x-forwarded-for") || "").split(",")[0] || "",
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Apps Script web app requires CORS-less server call; this runs on server
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Waitlist webhook failed", res.status, text);
      return NextResponse.json({ ok: false, error: "Upstream error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}



