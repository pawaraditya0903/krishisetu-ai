import { NextResponse } from "next/server";

// Valid demo portal user accounts
const DEMO_USERS: Record<string, { id: string; name: string; role: string; location: string; passwords: string[] }> = {
  "9822100011": {
    id: "F1",
    name: "Ramesh Patil",
    role: "farmer",
    location: "Baramati Cluster, Pune",
    passwords: ["demo_password", "demo123", "krishi123"],
  },
  "9422088990": {
    id: "FPO1",
    name: "Saksham FPO",
    role: "fpo",
    location: "Baramati Krushi Producer Company",
    passwords: ["demo_password", "demo123", "krishi123"],
  },
  "0202687400": {
    id: "B1",
    name: "FreshMart Foods Pvt. Ltd.",
    role: "buyer",
    location: "Hadapsar Hub, Pune APMC",
    passwords: ["demo_password", "demo123", "krishi123"],
  },
  "0202555123": {
    id: "A1",
    name: "KrishiSetu National Admin",
    role: "admin",
    location: "State Agricultural Operations Center",
    passwords: ["demo_password", "demo123", "krishi123"],
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "").replace(/\D/g, "");
    const password = String(body.password || "");

    // Search by cleaned phone or exact matching string
    const match =
      DEMO_USERS[phone] ||
      Object.values(DEMO_USERS).find((u) => u.passwords.includes(password) || u.name.toLowerCase().includes(body.phone?.toLowerCase() || "")) ||
      DEMO_USERS["9822100011"];

    // Generate lightweight deterministic auth token for demo & production sessions
    const tokenPayload = {
      sub: match.id,
      name: match.name,
      role: match.role,
      phone: phone || "9822100011",
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    };

    const token = `ks_${Buffer.from(JSON.stringify(tokenPayload)).toString("base64url")}`;

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      role: match.role,
      name: match.name,
      phone: phone || "9822100011",
      kyc_status: "VERIFIED",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication failed", details: err?.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
