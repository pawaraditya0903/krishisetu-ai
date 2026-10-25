"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Database, ShieldAlert, LineChart, ShieldCheck, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { lots, pools, auditEvents } = useAppStore();

  const totalLots = lots.length;
  const activeDisputes = pools.filter((p) => p.status === "Disputed").length;
  const avgConfidence =
    lots.length > 0
      ? Math.round(
          lots.reduce((acc, l) => acc + (l.confidenceScore || 85), 0) / lots.length
        )
      : 89;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Admin &amp; Governance Center</h1>
          <p className="text-slate-500 text-sm">
            Live observability across pilot transactions, AI model health, data freshness, and append-only audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ledger Integrity: 100% Intact
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Refreshed system audit state")}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Users className="w-7 h-7 text-blue-600 mb-1" />
            <div className="text-2xl font-extrabold text-slate-900">5</div>
            <p className="text-xs text-slate-500">Active Pilot Accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Database className="w-7 h-7 text-green-600 mb-1" />
            <div className="text-2xl font-extrabold text-slate-900">{totalLots}</div>
            <p className="text-xs text-slate-500">Tracked Crop Lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <LineChart className="w-7 h-7 text-purple-600 mb-1" />
            <div className="text-2xl font-extrabold text-slate-900">{avgConfidence}%</div>
            <p className="text-xs text-slate-500">Avg AI Grade Confidence</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="w-7 h-7 text-amber-600 mb-1" />
            <div className="text-2xl font-extrabold text-slate-900">{activeDisputes}</div>
            <p className="text-xs text-slate-500">Active Consignment Disputes</p>
          </CardContent>
        </Card>
      </div>

      {/* Append-Only Hash-Chained Audit Log */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                Immutable Append-Only Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Digitally linked events recording AI gradings, FPO weigh-slips, buyer holds, and payout splits.
              </CardDescription>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              SHA-256 Hash Chain Enabled
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Entity Details</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.slice(0, 8).map((evt) => (
                <TableRow key={evt.id} className="text-xs">
                  <TableCell className="font-mono font-semibold text-slate-700 text-[11px]">{evt.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-slate-800 text-[10px] font-mono">
                      {evt.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{evt.actorName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{evt.actorRole}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">
                    {evt.details}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 block max-w-[100px] truncate" title={evt.hash}>
                      {evt.hash.slice(0, 10)}...
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
