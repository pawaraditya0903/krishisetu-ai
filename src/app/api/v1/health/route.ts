import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "HEALTHY",
    service: "KrishiSetu-Cloud-API",
    version: "2.5.0",
    mode: "Serverless-Online",
    timestamp: new Date().toISOString(),
    features: {
      gemini_ai_assistant: true,
      wide_agmarknet_dataset: true,
      multi_crop_vision_grading: true,
      fpo_pooling_gateway: true,
      tamper_evident_audit_trail: true,
    },
  });
}
