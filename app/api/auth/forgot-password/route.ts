import { NextResponse } from "next/server";
import { normalizeHost } from "@/lib/host";

export async function POST(req: Request) {
    const backend = process.env.BACKEND_URL!;
    const host = normalizeHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || "");

    const body = await req.json();

    const res = await fetch(`${backend}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-forwarded-host": host
        },
        body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        return NextResponse.json(data || { message: "Error sending email" }, { status: res.status });
    }

    return NextResponse.json(data);
}
