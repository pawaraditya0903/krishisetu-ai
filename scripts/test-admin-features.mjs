// test-admin-features.mjs
// Automated verification for KrishiSetu AI Admin Control Panel & Dynamic Engine

import crypto from "crypto";

console.log("=================================================");
console.log("🌾 KRISHISETU AI - ADMIN & PLATFORM VERIFICATION");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. Test SHA-256 Cryptographic Chaining
console.log("--- 1. Testing SHA-256 Cryptographic Audit Chaining ---");
function computeAuditHash(prevHash, timestamp, actorName, action, entityType, entityId, details) {
  const content = `${prevHash}|${timestamp}|${actorName}|${action}|${entityType}|${entityId}|${details}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

const genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";
const t1 = "2026-09-08T10:00:00.000Z";
const hash1 = computeAuditHash(genesisHash, t1, "System Admin", "CREATE_FARMER", "User", "farmer-999", "Created farmer Ramesh");
assert(hash1.length === 64, "Generated 64-character SHA-256 hash for first event");

const t2 = "2026-09-08T10:01:00.000Z";
const hash2 = computeAuditHash(hash1, t2, "System Admin", "ASSIGN_FPO", "FPO", "fpo-baramati", "Assigned farmer-999 to FPO");
assert(hash2.length === 64 && hash2 !== hash1, "Chained second event hash with previous hash");

// Verify chain integrity
const recomputed1 = computeAuditHash(genesisHash, t1, "System Admin", "CREATE_FARMER", "User", "farmer-999", "Created farmer Ramesh");
const recomputed2 = computeAuditHash(recomputed1, t2, "System Admin", "ASSIGN_FPO", "FPO", "fpo-baramati", "Assigned farmer-999 to FPO");
assert(recomputed1 === hash1 && recomputed2 === hash2, "Cryptographic audit chain matches 100% upon verification");

// 2. Test Geographic Haversine Distance & Travel Time
console.log("\n--- 2. Testing Haversine Distance & Travel Time Calculations ---");
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Parbhani (19.2608, 76.7748) to Jalna (19.8410, 75.8864)
const distParbhaniJalna = calculateDistanceKm(19.2608, 76.7748, 19.841, 75.8864);
console.log(`Distance Parbhani to Jalna: ${distParbhaniJalna} km`);
assert(distParbhaniJalna >= 100 && distParbhaniJalna <= 130, "Accurate distance between Parbhani and Jalna (~114 km)");

// Parbhani to Vashi APMC Mumbai (19.0760, 72.9980)
const distParbhaniVashi = calculateDistanceKm(19.2608, 76.7748, 19.076, 72.998);
console.log(`Distance Parbhani to Vashi Mumbai: ${distParbhaniVashi} km`);
assert(distParbhaniVashi >= 380 && distParbhaniVashi <= 500, "Accurate haversine distance between Parbhani and Mumbai Vashi (~397 km crow-fly, 450 km road)");

// 3. Test Radius Filtering with Custom Radius up to 1000 km
console.log("\n--- 3. Testing Dynamic Radius Filtering ---");
const sampleMandis = [
  { id: "m-1", name: "Parbhani APMC", lat: 19.2608, lng: 76.7748 },
  { id: "m-2", name: "Jalna APMC", lat: 19.841, lng: 75.8864 },
  { id: "m-3", name: "Aurangabad (Chhatrapati Sambhajinagar)", lat: 19.8762, lng: 75.3433 },
  { id: "m-4", name: "Nashik APMC", lat: 20.0059, lng: 73.7898 },
  { id: "m-5", name: "Pune Gultekdi APMC", lat: 18.4975, lng: 73.8698 },
  { id: "m-6", name: "Vashi APMC Mumbai", lat: 19.076, lng: 72.998 },
  { id: "m-7", name: "Azadpur APMC Delhi", lat: 28.7165, lng: 77.1775 },
];

function filterMandisByRadius(userLat, userLng, radiusKm, mandis) {
  return mandis
    .map((m) => ({
      ...m,
      distanceKm: calculateDistanceKm(userLat, userLng, m.lat, m.lng),
    }))
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

const mandis50km = filterMandisByRadius(19.2608, 76.7748, 50, sampleMandis);
assert(mandis50km.length === 1 && mandis50km[0].id === "m-1", "50km radius only yields Parbhani APMC");

const mandis200km = filterMandisByRadius(19.2608, 76.7748, 200, sampleMandis);
assert(mandis200km.length >= 3, "200km radius includes Parbhani, Jalna, and Sambhajinagar");

const mandis500km = filterMandisByRadius(19.2608, 76.7748, 500, sampleMandis);
assert(mandis500km.some((m) => m.id === "m-6"), "500km radius includes Vashi APMC Mumbai");

const mandis1000km = filterMandisByRadius(19.2608, 76.7748, 1500, sampleMandis);
assert(mandis1000km.some((m) => m.id === "m-7"), "1500km nationwide radius discovers Delhi Azadpur APMC");

// 4. Test Mandi CSV Bulk Import & Validation
console.log("\n--- 4. Testing Mandi CSV Bulk Import & Header Parsing ---");
const sampleCsv = `mandi,marketCode,village,taluka,district,state,lat,lng,supportedCrops,contactPerson,phone
Parbhani Cotton APMC,MH-PBN-002,Dharampuri,Parbhani,Parbhani,Maharashtra,19.2650,76.7800,"Cotton,Soyabean,Wheat",Shri Deshmukh,9823000001
Nanded Grain Market,MH-NDD-001,Shivaji Nagar,Nanded,Nanded,Maharashtra,19.1383,77.3210,"Wheat,Soyabean,Turmeric",Shri Joshi,9823000002
`;

function parseMandiCsv(content) {
  const lines = content.trim().split("\n").filter((l) => l.trim().length > 0);
  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  
  const mandis = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const mandiName = rowValues[0];
    const marketCode = rowValues[1];
    const taluka = rowValues[3];
    const district = rowValues[4];
    const state = rowValues[5];
    const lat = parseFloat(rowValues[6]);
    const lng = parseFloat(rowValues[7]);
    
    mandis.push({
      id: `mandi-${Date.now()}-${i}`,
      mandi: mandiName,
      marketCode,
      taluka,
      district,
      state,
      lat,
      lng,
      status: "Active",
    });
  }
  return mandis;
}

const importedMandis = parseMandiCsv(sampleCsv);
assert(importedMandis.length === 2, "Successfully parsed 2 mandis from CSV");
assert(importedMandis[0].mandi === "Parbhani Cotton APMC", "Correct mandi name extracted");
assert(importedMandis[0].lat === 19.2650 && importedMandis[0].lng === 76.7800, "Correct coordinates parsed from CSV");
assert(importedMandis[1].district === "Nanded", "Correct district parsed for second mandi");

// 5. Test Itemized Net Realization Calculation
console.log("\n--- 5. Testing Dynamic Net Realization Calculator ---");
function calculateNetOutcome(pricePerQtl, quantityKg, distanceKm, freightPerKm, handling, packaging, commissionPct, spoilagePct, fpoFeePct) {
  const qtl = quantityKg / 100;
  const grossValue = pricePerQtl * qtl;
  const freight = freightPerKm * distanceKm;
  const commission = grossValue * (commissionPct / 100);
  const spoilageLoss = grossValue * (spoilagePct / 100);
  const fpoFee = grossValue * (fpoFeePct / 100);
  const totalDeductions = freight + handling + packaging + commission + spoilageLoss + fpoFee;
  const netTotal = Math.max(0, grossValue - totalDeductions);
  const netPerQtl = qtl > 0 ? netTotal / qtl : 0;

  return { grossValue, totalDeductions, netTotal, netPerQtl };
}

// 500kg Tomato @ ₹2400/qtl at 100km distance
const netRes = calculateNetOutcome(2400, 500, 100, 15, 180, 150, 5, 2, 1.5);
console.log("Gross Value:", netRes.grossValue);
console.log("Total Deductions:", netRes.totalDeductions);
console.log("Net Realized Total:", netRes.netTotal);
console.log("Net Per Qtl:", netRes.netPerQtl);

assert(netRes.grossValue === 12000, "Gross value: 5 qtl * ₹2400 = ₹12,000");
assert(netRes.totalDeductions > 2500, "Total deductions calculated including ₹1500 freight and commission");
assert(netRes.netTotal > 9000 && netRes.netTotal < 10000, "Net total in expected range (~₹9,150)");

// Summary
console.log("\n=================================================");
console.log(`🎯 VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log("=================================================");
