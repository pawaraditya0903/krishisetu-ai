"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { Info, TrendingUp, AlertTriangle, CalendarClock, Sparkles } from "lucide-react";
import Link from "next/link";

interface ForecastPoint {
  day: string;
  price: number;
  range: [number, number];
  p10: number;
  p50: number;
  p90: number;
}

const FORECAST_DATA: ForecastPoint[] = [
  { day: "-7d", price: 1750, range: [1700, 1800], p10: 1700, p50: 1750, p90: 1800 },
  { day: "-5d", price: 1780, range: [1720, 1820], p10: 1720, p50: 1780, p90: 1820 },
  { day: "-3d", price: 1800, range: [1750, 1850], p10: 1750, p50: 1800, p90: 1850 },
  { day: "Today", price: 1850, range: [1800, 1900], p10: 1800, p50: 1850, p90: 1900 },
  { day: "+3d", price: 1960, range: [1880, 2040], p10: 1880, p50: 1960, p90: 2040 },
  { day: "+7d", price: 2020, range: [1910, 2130], p10: 1910, p50: 2020, p90: 2130 },
  { day: "+14d", price: 2160, range: [1950, 2370], p10: 1950, p50: 2160, p90: 2370 },
];

export default function SaleAdvisorPage() {
  const [riskPreference, setRiskPreference] = useState<"conservative" | "balanced" | "growth">("balanced");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Sale &amp; Timing Advisor</h1>
          <p className="text-slate-500 text-sm">
            14-day price outlook (P10, P50, P90 quantiles) and scenario analysis for Tomato in Baramati.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Risk Appetite:</span>
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setRiskPreference("conservative")}
              className={`px-2.5 py-1 rounded transition-colors ${
                riskPreference === "conservative" ? "bg-white font-bold text-slate-900 shadow-xs border" : "text-slate-500"
              }`}
            >
              Conservative
            </button>
            <button
              onClick={() => setRiskPreference("balanced")}
              className={`px-2.5 py-1 rounded transition-colors ${
                riskPreference === "balanced" ? "bg-white font-bold text-green-700 shadow-xs border" : "text-slate-500"
              }`}
            >
              Balanced
            </button>
            <button
              onClick={() => setRiskPreference("growth")}
              className={`px-2.5 py-1 rounded transition-colors ${
                riskPreference === "growth" ? "bg-white font-bold text-slate-900 shadow-xs border" : "text-slate-500"
              }`}
            >
              Growth
            </button>
          </div>
        </div>
      </div>

      {/* 14-Day Price Forecast Recharts */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Tomato Price Trajectory (14-Day Quantile Band)</CardTitle>
              <CardDescription className="text-xs">
                Historical prices and P10 (Downside) - P50 (Expected) - P90 (Upside) outlook for Baramati Mandi
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-xs">
              Medium Confidence (78% Backtest Coverage)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={FORECAST_DATA} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[1500, 2500]} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(
                    value: number | string | ReadonlyArray<number | string> | undefined,
                    name: string | number | undefined
                  ): [string, string] => {
                    const strName = String(name || "");
                    if (strName === "price") return [`₹${value}/qtl`, "Expected P50"];
                    if (Array.isArray(value)) return [`₹${value[0]} - ₹${value[1]}/qtl`, "P10 - P90 Uncertainty Band"];
                    return [String(value), strName];
                  }}
                />
                <Area type="monotone" dataKey="range" fill="#dcfce7" stroke="none" />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#166534"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#166534" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-700 rounded-full inline-block"></span> Expected Price (P50)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block"></span> Uncertainty Band (P10 - P90)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Decision Scenarios Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-600 ring-2 ring-green-600/30 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Recommended Outlook
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-5 h-5 text-green-700" />
              <CardTitle className="text-lg">Wait 3 to 5 Days</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Supply dip in neighboring Solapur and Ahmednagar creates short-term price surge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹1,960 - ₹2,040 <span className="text-sm font-normal text-slate-500">/qtl</span>
              </div>
              <p className="text-xs text-green-700 font-semibold mt-0.5">
                +₹110/qtl estimated upside against today&apos;s spot rate
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Downside Risk (P10):</span>
                <strong className="text-slate-800">₹1,880/qtl</strong>
              </div>
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <strong className="text-green-700">74% Medium-High</strong>
              </div>
              <div className="flex justify-between">
                <span>Storage Spoilage Penalty:</span>
                <strong className="text-amber-700">-2.0% (Breaker stage)</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/farmer/pooling" className="w-full">
              <Button className="w-full bg-green-700 hover:bg-green-800 text-xs">
                Pre-Book in Friday&apos;s Pune Pool
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-lg">Sell Now (Today)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Immediate spot liquidation at Baramati APMC. Eliminates post-harvest spoilage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹1,850 - ₹1,900 <span className="text-sm font-normal text-slate-500">/qtl</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Current spot benchmark rate
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Downside Risk (P10):</span>
                <strong className="text-slate-800">₹1,800/qtl</strong>
              </div>
              <div className="flex justify-between">
                <span>Perishability Exposure:</span>
                <strong className="text-green-700">0% (Zero holding loss)</strong>
              </div>
              <div className="flex justify-between">
                <span>Payout Timeline:</span>
                <strong className="text-slate-800">Same-day settlement</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/farmer/market" className="w-full">
              <Button variant="outline" className="w-full text-xs">
                Compare Spot Mandis
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Tomato Perishability Warning */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3 text-amber-900 text-xs">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Important Perishability Constraint for Tomato:</p>
          <p>
            Tomato is highly perishable. Without cold-chain reefer storage, ambient holding beyond 4-5 days causes exponential firmness loss and surface rot. The <strong>&quot;Store&quot;</strong> option is disabled unless verified cold storage access is available.
          </p>
        </div>
      </div>

      {/* Explainability Accordion */}
      <details className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer text-slate-800 group shadow-xs">
        <summary className="font-semibold text-sm flex items-center gap-2 list-none">
          <Info className="w-4 h-4 text-green-700" />
          Why this recommendation? (Explainable AI Factors)
        </summary>
        <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 mt-3 leading-relaxed">
          <p>The LightGBM price forecast engine evaluated the following feature drivers for the Baramati cluster:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Arrival Volume:</strong> Baramati daily arrivals dropped by 14% over the last 3 days due to seasonal picking gaps.</li>
            <li><strong>Price Momentum (7-day lag):</strong> Modal price has climbed from ₹1,750 to ₹1,850/qtl (+5.7%).</li>
            <li><strong>Pune Destination Spread:</strong> Pune Gultekdi currently commands a ₹300/qtl premium over local Baramati rates, comfortably covering the ₹92/qtl freight difference.</li>
            <li><strong>Weather Factor:</strong> Clear road conditions along NH-65 guarantee uninterrupted transit.</li>
          </ul>
        </div>
      </details>

      <div className="text-center text-xs text-slate-400 pb-2">
        Decision support only — not a financial price guarantee. Verify current arrivals before dispatch.
      </div>
    </div>
  );
}
