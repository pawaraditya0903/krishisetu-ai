"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AuditEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Download,
  ShieldCheck,
  Hash,
  Clock,
  Eye,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAuditLedgerPage() {
  const { auditEvents, language } = useAppStore();
  const isMr = language === "mr";

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filteredEvents = auditEvents.filter((evt) => {
    const matchesSearch =
      evt.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || evt.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(auditEvents.map((e) => e.action)));

  // Export Audit Ledger to CSV
  const handleExportCSV = () => {
    const headers = [
      "Event_ID",
      "Timestamp",
      "Actor_Name",
      "Actor_Role",
      "Action",
      "Entity_Type",
      "Entity_ID",
      "Details",
      "Previous_Hash",
      "SHA256_Hash",
    ];

    const rows = auditEvents.map((e) => [
      e.id,
      e.timestamp,
      `"${e.actorName}"`,
      e.actorRole,
      e.action,
      e.entityType,
      `"${e.entityId}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      e.prevHash,
      e.hash,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `krishisetu_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${auditEvents.length} audit records to CSV.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isMr ? "अपरिवर्तनीय क्रिप्टोग्राफिक ऑडिट लेजर" : "Cryptographic Immutable Audit Ledger"}
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> SHA-256 Hash Chained
            </Badge>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isMr
              ? "सर्व प्रशासकीय आणि आर्थिक बदलांची सुरक्षित व कायमस्वरूपी साखळी नोंद."
              : "Tamper-evident append-only ledger tracking all administrative mutations and governance events."}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Audit CSV
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by actor name, action, details, entity ID, or hash..."
              className="pl-9 text-xs h-9"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 text-xs px-3 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Actions ({uniqueActions.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action &amp; Target</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5">SHA-256 Hash</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                    <div>{new Date(evt.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-800 border-slate-300">
                      {evt.action}
                    </Badge>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {evt.entityType}: {evt.entityId}
                    </div>
                  </td>

                  <td className="p-3.5 font-sans">
                    <div className="font-semibold text-slate-900">{evt.actorName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{evt.actorRole}</div>
                  </td>

                  <td className="p-3.5 font-sans max-w-xs">
                    <p className="truncate text-slate-700">{evt.details}</p>
                  </td>

                  <td className="p-3.5 text-[10px] text-emerald-700 font-bold">
                    <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {evt.hash.slice(0, 12)}...{evt.hash.slice(-6)}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEvent(evt)}
                      className="w-7 h-7 text-slate-500 hover:text-emerald-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Audit Event Proof ({selectedEvent.id})
                </h3>
                <Badge variant="outline" className="text-[10px] mt-0.5 font-mono">
                  {selectedEvent.action}
                </Badge>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Actor:</span>
                <span className="font-bold text-slate-900">{selectedEvent.actorName} ({selectedEvent.actorRole})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Timestamp:</span>
                <span className="font-mono">{selectedEvent.timestamp}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Entity:</span>
                <span className="font-mono">{selectedEvent.entityType} → {selectedEvent.entityId}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Details:</span>
                <p className="p-2 bg-slate-50 rounded-lg border border-slate-200">{selectedEvent.details}</p>
              </div>
              <div className="pt-2 border-t space-y-1">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Chained Cryptographic Hashes:</span>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono text-[10px] space-y-1">
                  <div>
                    <span className="text-slate-400">Prev: </span>
                    {selectedEvent.prevHash}
                  </div>
                  <div>
                    <span className="text-emerald-400">Curr: </span>
                    {selectedEvent.hash}
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full text-xs"
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
