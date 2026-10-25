"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { QualityAnalysisResult } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Image as ImageIcon, CheckCircle2, AlertTriangle, Loader2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function GradeCropPage() {
  const router = useRouter();
  const { currentUser, addLot, isOffline } = useAppStore();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");

  const [formData, setFormData] = useState({
    crop: "Tomato",
    variety: "Abhinav (Hybrid)",
    quantity: "500",
    harvestDate: new Date().toISOString().split("T")[0],
    collectionHub: "Baramati FPO Hub #1",
  });

  const [imagesUploaded, setImagesUploaded] = useState(false);
  const [gradeResult, setGradeResult] = useState<QualityAnalysisResult | null>(null);

  const simulateAnalysis = () => {
    setAnalyzing(true);
    setAnalysisStatus("Checking Laplacian blur variance & exposure...");
    setProgress(20);

    setTimeout(() => {
      setAnalysisStatus("Validating crop occupancy & framing...");
      setProgress(50);
    }, 1200);

    setTimeout(() => {
      setAnalysisStatus("Running YOLO11 segmentation & defect detection...");
      setProgress(80);
    }, 2400);

    setTimeout(() => {
      setAnalysisStatus("Computing calibrated visual quality score...");
      setProgress(100);
    }, 3600);

    setTimeout(() => {
      setAnalyzing(false);
      // Deterministic high-quality pilot result for demo consistency
      const result: QualityAnalysisResult = {
        blurScore: 148.2,
        blurPassed: true,
        brightnessScore: 142.0,
        brightnessPassed: true,
        occupancyScore: 82.5,
        occupancyPassed: true,
        pHash: "9a2f7c81b0e35d12",
        externalScore: 88,
        estimatedGrade: "Grade A",
        confidence: "High",
        confidencePct: 92,
        detectedIssues: ["Minor sunscald on 1.8% sample (< 5% tolerance for Grade A)"],
        parameters: {
          sizeUniformity: "93% uniform within 55-65mm diameter",
          ripenessIndex: "Breaker-to-pink firm stage (Ideal table transport)",
          surfaceDefectsPct: 1.8,
          colorScore: "91% Uniform Red-Orange",
        },
        disclaimer:
          "External visual-quality estimate only. Internal moisture, pesticide residue, and sweetness (Brix) are not measurable from photos and require physical FPO verification.",
        modelTimestamp: new Date().toISOString(),
        isMockInference: true,
      };

      setGradeResult(result);
      setStep(3);
    }, 4200);
  };

  const handleSave = (status: "Draft" | "Submitted") => {
    if (!currentUser) return;

    const lotId = `LOT-TOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLot = {
      id: lotId,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      crop: formData.crop,
      variety: formData.variety,
      quantityKg: parseInt(formData.quantity) || 500,
      grade: gradeResult?.estimatedGrade || "Pending",
      confidenceScore: gradeResult?.externalScore,
      status: status,
      createdAt: new Date().toISOString(),
      images: ["/demo/tomato-top.jpg", "/demo/tomato-side.jpg", "/demo/tomato-crate.jpg"],
      qrCode: `KS-${lotId}-${status.toUpperCase()}-BARAMATI`,
      analysis: gradeResult || undefined,
    };

    addLot(newLot);

    if (isOffline) {
      toast.info("Offline: Lot Saved to Local Queue", {
        description: "Your crop lot will sync automatically once network connectivity is restored.",
      });
    } else {
      toast.success(status === "Draft" ? "Draft Saved" : "Sent to FPO for Verification", {
        description:
          status === "Draft"
            ? "Your crop details are safely saved."
            : "Saksham FPO manager has been notified to verify your lot.",
      });
    }

    router.push("/farmer/orders");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">AI Crop Visual Quality Grading</h1>
        <p className="text-slate-500 text-sm">
          Capture 3 guided photos of your harvest for an instant external quality assessment.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors ${
                step >= i
                  ? "bg-green-700 border-green-700 text-white"
                  : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              {i}
            </div>
            {i < 3 && (
              <div
                className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                  step > i ? "bg-green-700" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Crop & Volume Info */}
      {step === 1 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 1: Harvest &amp; Lot Information</CardTitle>
            <CardDescription className="text-xs">Specify the crop variety and estimated volume to sell.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Crop</Label>
                <Select
                  value={formData.crop}
                  onValueChange={(v) => setFormData({ ...formData, crop: v || "Tomato" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tomato">Tomato (टोमॅटो)</SelectItem>
                    <SelectItem value="Onion">Onion (कांदा)</SelectItem>
                    <SelectItem value="Pomegranate">Pomegranate (डाळिंब)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Variety</Label>
                <Select
                  value={formData.variety}
                  onValueChange={(v) => setFormData({ ...formData, variety: v || "Abhinav (Hybrid)" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abhinav (Hybrid)">Abhinav (Syngenta Hybrid)</SelectItem>
                    <SelectItem value="Vaishali">Vaishali</SelectItem>
                    <SelectItem value="Desi Special">Desi / Local Traditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Estimated Harvest Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Harvest Date</Label>
                <Input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Preferred FPO Collection Center</Label>
              <Input
                value={formData.collectionHub}
                onChange={(e) => setFormData({ ...formData, collectionHub: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setStep(2)} className="bg-green-700 hover:bg-green-800 text-xs">
              Next: Upload Photos <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: 3 Guided Photos Upload */}
      {step === 2 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Step 2: 3 Guided Harvest Photos</CardTitle>
            <CardDescription className="text-xs">
              Required for OpenCV quality filter: 1. Top View (Uniformity) | 2. Side View (Ripeness) | 3. Bulk Crate View
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!imagesUploaded ? (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setImagesUploaded(true)}
              >
                <div className="mx-auto w-14 h-14 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tap to Load 3 Guided Harvest Images</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Simulates device camera capture of top, side, and crate views.
                </p>
                <span className="inline-block mt-3 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-[10px] font-semibold">
                  Guided Capture Ready
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { title: "1. Top View", subtitle: "Size &amp; Uniformity" },
                  { title: "2. Side View", subtitle: "Ripeness &amp; Firmness" },
                  { title: "3. Crate View", subtitle: "Bulk Lot Framing" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-slate-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden text-white p-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <ImageIcon className="w-8 h-8 text-green-400 relative z-10 mb-1" />
                    <div className="relative z-10 text-center">
                      <div className="text-[11px] font-bold">{item.title}</div>
                      <div className="text-[9px] text-slate-300">{item.subtitle}</div>
                    </div>
                    <div className="absolute top-1.5 right-1.5 bg-green-600 text-white rounded-full p-0.5 z-10">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quality Checklist */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                OpenCV Image-Quality Gate Requirements:
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-600">
                <li>Laplacian variance &gt; 100 (Rejects blurred or out-of-focus camera shots)</li>
                <li>Brightness 100–180 (Rejects underexposed night or overexposed direct glare)</li>
                <li>Fruit occupancy &gt; 60% of frame (Rejects empty or distant backgrounds)</li>
              </ul>
            </div>

            {analyzing && (
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-green-700 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {analysisStatus}
                  </span>
                  <span className="text-slate-700">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-100" />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} disabled={analyzing} className="text-xs">
              Back
            </Button>
            <Button
              onClick={simulateAnalysis}
              disabled={!imagesUploaded || analyzing}
              className="bg-green-700 hover:bg-green-800 text-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processing AI Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Analyze Crop Quality
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Grade Report & Disclaimers */}
      {step === 3 && gradeResult && (
        <div className="space-y-5">
          <Card className="border-green-300 shadow-md overflow-hidden">
            <div className="bg-green-800 text-white p-6 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider bg-green-700/60 px-3 py-1 rounded-full text-green-100 inline-block mb-2">
                External Visual Quality Assessment
              </span>
              <h2 className="text-4xl font-extrabold mb-1">{gradeResult.estimatedGrade}</h2>
              <p className="text-sm text-green-100">
                Overall Quality Score: <strong>{gradeResult.externalScore}/100</strong> ({gradeResult.confidence} Confidence)
              </p>
            </div>

            <CardContent className="p-6 space-y-5">
              {/* FPO Review Flag Alert if low confidence */}
              {(gradeResult.needsFpoReview || gradeResult.confidence === "Low") && (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <strong className="block font-semibold">Flagged for FPO Physical Review</strong>
                    The visual confidence on this scan is below automated clearance thresholds. Saksham FPO manager will conduct physical inspection at the collection center before pool allocation.
                  </div>
                </div>
              )}

              {/* OpenCV Quality Gate Telemetry */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Image Quality Pre-Flight Gate (Passed)
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Laplacian Blur</span>
                    <strong className="text-slate-800">{gradeResult.blurScore} (&gt; 100)</strong>
                    <span className="text-[10px] text-green-600 block mt-0.5">Sharp focus</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Exposure / Lux</span>
                    <strong className="text-slate-800">{gradeResult.brightnessScore}</strong>
                    <span className="text-[10px] text-green-600 block mt-0.5">Even daylight</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Crop Occupancy</span>
                    <strong className="text-slate-800">{gradeResult.occupancyScore}%</strong>
                    <span className="text-[10px] text-green-600 block mt-0.5">Framed properly</span>
                  </div>
                </div>
              </div>

              {/* Visual Feature Parameters */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Extracted Visual Parameters
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Size Uniformity</span>
                    <strong className="text-slate-800">{gradeResult.parameters.sizeUniformity}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Ripeness Index</span>
                    <strong className="text-slate-800">{gradeResult.parameters.ripenessIndex}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Surface Defect Coverage</span>
                    <strong className="text-slate-800">{gradeResult.parameters.surfaceDefectsPct}%</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Color Uniformity</span>
                    <strong className="text-slate-800">{gradeResult.parameters.colorScore}</strong>
                  </div>
                </div>
              </div>

              {/* Mandatory Disclaimers */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Scope &amp; Scientific Limitations:</p>
                  <p>{gradeResult.disclaimer}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
              <Button variant="outline" className="w-full text-xs" onClick={() => handleSave("Draft")}>
                Save as Draft
              </Button>
              <Button
                className="w-full bg-green-700 hover:bg-green-800 text-xs"
                onClick={() => handleSave("Submitted")}
              >
                Send for Physical FPO Verification
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
