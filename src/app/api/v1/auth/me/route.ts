import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader.startsWith("Bearer ks_")) {
      const tokenBody = authHeader.replace("Bearer ks_", "");
      const decoded = JSON.parse(Buffer.from(tokenBody, "base64url").toString("utf-8"));
      return NextResponse.json({
        id: decoded.sub,
        name: decoded.name,
        role: decoded.role,
        phone: decoded.phone,
        location: "Baramati Cluster, Pune",
        kyc_status: "VERIFIED",
      });
    }

    // Default fallback authorized user
    return NextResponse.json({
      id: "F1",
      name: "Ramesh Patil",
      role: "farmer",
      phone: "9822100011",
      location: "Baramati Cluster, Pune",
      kyc_status: "VERIFIED",
    });
  } catch {
    return NextResponse.json({
      id: "F1",
      name: "Ramesh Patil",
      role: "farmer",
      phone: "9822100011",
      location: "Baramati Cluster, Pune",
      kyc_status: "VERIFIED",
    });
  }
}
