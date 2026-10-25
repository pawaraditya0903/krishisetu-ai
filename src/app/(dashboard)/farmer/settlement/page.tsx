"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";

export default function SettlementPage() {
  const { settlements, currentUser, lots, language } = useAppStore();
  const t = translations[language] || translations.en;
  const mySettlements = settlements.filter((s) => s.farmerId === currentUser?.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.settlement.title}</h1>
        <p className="text-slate-500 text-sm">
          {t.settlement.subtitle}
        </p>
      </div>

      {mySettlements.length === 0 && (
        <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl bg-slate-50 text-xs sm:text-sm">
          {t.settlement.noSettlements}
        </div>
      )}

      {mySettlements.map((settlement) => {
        const myLots = lots.filter((l) => l.farmerId === currentUser?.id);
        const associatedLot = myLots.find((l) => l.id === settlement.lotId) || myLots[0];

        return (
          <Card key={settlement.id} className="overflow-hidden border-green-300 shadow-sm">
            <div className="bg-emerald-700 text-white p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <h2 className="text-xl font-bold">{t.settlement.nodalPayoutReleased}</h2>
                </div>
                <p className="text-emerald-100 text-xs">
                  {t.settlement.txnId}: <strong className="font-mono">{settlement.transactionId}</strong>
                </p>
                <div className="text-[11px] text-emerald-200 mt-1">
                  {t.settlement.nodalRef}: {settlement.nodalAccountRef}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs text-emerald-200">{t.settlement.netAmount}</div>
                <div className="text-3xl font-extrabold text-white">₹{Math.round(settlement.amount).toLocaleString()}</div>
                <Badge className="bg-emerald-600 text-white border-none text-[10px] mt-1">
                  {t.settlement.creditedBadge}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-y-3 text-xs mb-6 pb-6 border-b border-slate-100">
                <div className="text-slate-500">{t.settlement.txnDate}</div>
                <div className="font-medium text-right text-slate-800">
                  {new Date(settlement.date).toLocaleDateString()}
                </div>

                <div className="text-slate-500">{language === "mr" ? "लाभार्थी शेतकरी" : language === "hi" ? "लाभार्थी किसान" : "Beneficiary Farmer"}</div>
                <div className="font-medium text-right text-slate-800">{currentUser?.name}</div>

                <div className="text-slate-500">{language === "mr" ? "पीक व पडताळलेला दर्जा" : language === "hi" ? "फसल एवं सत्यापित ग्रेड" : "Commodity & Verified Grade"}</div>
                <div className="font-medium text-right text-slate-800">
                  {associatedLot?.crop || "Tomato"} ({associatedLot?.variety || "Hybrid"}) • {associatedLot?.grade || "Grade A"}
                </div>

                <div className="text-slate-500">UPI / Bank Handle</div>
                <div className="font-mono font-medium text-right text-slate-800 flex items-center justify-end gap-1.5">
                  rameshpatil****@okhdfcbank
                  <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-300 px-1 py-0">
                    {language === "mr" ? "पडताळलेले" : language === "hi" ? "सत्यापित" : "Verified"}
                  </Badge>
                </div>
              </div>

              {/* Itemized Deductions */}
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  {language === "mr" ? "तपशीलवार पारदर्शक खर्च विवरण" : language === "hi" ? "मदवार पारदर्शी लागत विवरण" : "Itemized Transparent Cost Breakdown"}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.settlement.grossValue}:</span>
                    <span className="font-semibold text-slate-900">₹{settlement.breakdown.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.settlement.freightDeduction}:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.freight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.market.cratesPackaging}:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.packaging.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.settlement.handlingDeduction}:</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.handling.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saksham FPO (1.5%):</span>
                    <span className="text-red-600 font-medium">-₹{settlement.breakdown.fpoFee.toLocaleString()}</span>
                  </div>
                  {settlement.breakdown.qualityAdj > 0 && (
                    <div className="flex justify-between">
                      <span>{language === "mr" ? "गुणवत्ता कपात:" : language === "hi" ? "गुणवत्ता कटौती:" : "Quality Deduction:"}</span>
                      <span className="text-red-600 font-medium">-₹{settlement.breakdown.qualityAdj.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-sm text-slate-900">
                    <span>{t.settlement.netAmount}:</span>
                    <span className="text-green-700 text-base">₹{Math.round(settlement.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700"
                onClick={() => toast.success(language === "mr" ? "वजन पावती डाउनलोड केली (PDF)" : language === "hi" ? "वजन रसीद डाउनलोड हो गई (PDF)" : "Weigh-Slip Receipt downloaded (PDF).")}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> {t.settlement.downloadSlip}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600"
                onClick={() =>
                  toast.info("Nodal Ledger Entry: SHA-256 Hash Verified", {
                    description: `Hash: 3b7c89f2a4d9821ef9a12c8b74301dfca21980bc9e1a87c6b4e09f7a8b61c82e`,
                  })
                }
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> {t.settlement.viewEHR}
              </Button>
            </div>
          </Card>
        );
      })}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-slate-900 mb-0.5">RBI Compliant Nodal Protection</p>
          <p>{t.settlement.escrowGuarantee}</p>
        </div>
      </div>
    </div>
  );
}
