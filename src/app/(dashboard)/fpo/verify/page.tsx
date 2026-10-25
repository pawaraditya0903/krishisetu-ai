"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { CropLot, CropGrade } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Eye, AlertTriangle, Scale } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function FPOVerifyPage() {
  const { lots, updateLotStatus } = useAppStore();
  const pendingLots = lots.filter((l) => l.status === "Submitted");
  const [selectedLot, setSelectedLot] = useState<CropLot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyGrade, setVerifyGrade] = useState<CropGrade>("Grade A");
  const [verifyWeight, setVerifyWeight] = useState("");
  const [fpoNotes, setFpoNotes] = useState("Physical inspection matches Breaker-to-pink visual grade criteria.");

  const handleOpenDialog = (lot: CropLot) => {
    setSelectedLot(lot);
    setVerifyGrade(lot.grade);
    setVerifyWeight(lot.quantityKg.toString());
    setIsDialogOpen(true);
  };

  const handleVerify = () => {
    if (selectedLot) {
      const weightNum = parseFloat(verifyWeight) || selectedLot.quantityKg;
      updateLotStatus(selectedLot.id, "Verified", verifyGrade, weightNum, fpoNotes);
      setIsDialogOpen(false);
      toast.success("Lot Verified &amp; Approved!", {
        description: `Lot ${selectedLot.id} verified at ${weightNum} kg as ${verifyGrade}. Digital weigh-slip generated.`,
      });
    }
  };

  const handleReject = () => {
    if (selectedLot) {
      updateLotStatus(selectedLot.id, "Draft", undefined, undefined, "Returned to farmer for re-sorting.");
      setIsDialogOpen(false);
      toast.info("Lot Returned to Farmer Draft", {
        description: `Farmer notified to re-sort before submission.`,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Physical Lot Verification &amp; Weigh-Slip</h1>
        <p className="text-slate-500 text-sm">
          Review farmer-submitted AI estimates, enter certified weigh-bridge readings, and authorize pooling eligibility.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Lots Awaiting Physical Verification</CardTitle>
          <CardDescription className="text-xs">
            Baramati FPO Hub #1 incoming queue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pendingLots.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Crop &amp; Variety</TableHead>
                  <TableHead>Declared Weight</TableHead>
                  <TableHead>AI Visual Grade</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      {lot.farmerName}
                      <div className="text-[10px] text-slate-500 font-mono">{lot.id}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {lot.crop} ({lot.variety})
                    </TableCell>
                    <TableCell className="text-xs font-medium">{lot.quantityKg} kg</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 text-xs">
                        {lot.grade} ({lot.confidenceScore}%)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(lot.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleOpenDialog(lot)} className="bg-green-700 hover:bg-green-800 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Inspect &amp; Weigh
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-slate-500 border border-dashed rounded-lg bg-slate-50 text-xs sm:text-sm">
              No lots pending verification at the moment.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold mb-0.5">Dual-Grade Accountability Rule:</p>
          <p>
            The FPO manager has full authority to override the AI visual grade if physical crate inspection reveals moisture or undersized fruit. Both the original AI estimate and the verified FPO grade are permanently preserved in the hash-chained audit log.
          </p>
        </div>
      </div>

      {/* Verification Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Scale className="w-5 h-5 text-green-700" />
              Physical Weigh-Slip &amp; Grade Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirming arrival for Lot <strong>{selectedLot?.id}</strong> from <strong>{selectedLot?.farmerName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px]">Crop &amp; Variety</span>
                <strong className="text-slate-900">{selectedLot?.crop} ({selectedLot?.variety})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">AI Visual Estimate</span>
                <strong className="text-green-700">{selectedLot?.grade} ({selectedLot?.confidenceScore}% confidence)</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Certified Physical Weigh-Bridge Reading (kg)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={verifyWeight}
                  onChange={(e) => setVerifyWeight(e.target.value)}
                  className="font-bold text-slate-900"
                />
                <span className="text-slate-500 font-medium shrink-0">kg net</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Final Verified Grade</Label>
              <Select value={verifyGrade} onValueChange={(v) => setVerifyGrade((v as CropGrade) || "Grade A")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade A">Grade A (Premium Retail Table)</SelectItem>
                  <SelectItem value="Grade B">Grade B (Standard Commercial)</SelectItem>
                  <SelectItem value="Grade C">Grade C (Processing / Puree)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Verification &amp; Quality Notes (Audit Log)</Label>
              <Input
                value={fpoNotes}
                onChange={(e) => setFpoNotes(e.target.value)}
                placeholder="Enter notes on crate uniformity or tare deductions..."
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 text-xs" onClick={handleReject}>
              <XCircle className="w-3.5 h-3.5 mr-1" /> Return for Re-sorting
            </Button>
            <Button size="sm" className="bg-green-700 hover:bg-green-800 text-xs" onClick={handleVerify}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Weigh-Slip &amp; Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
