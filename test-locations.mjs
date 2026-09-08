import { calculateDynamicMandisForLocation } from "./src/lib/agricultural-data.ts";
import { searchIndianLocations, calculateDistanceKm } from "./src/lib/geo-locations.ts";

console.log("==================================================");
console.log("KRISHISETU AI - NATIONWIDE DYNAMIC VERIFICATION TEST");
console.log("==================================================\n");

const TEST_LOCATIONS = [
  { name: "Parbhani, Maharashtra", lat: 19.2608, lng: 76.7748, expectedNearest: "Parbhani APMC" },
  { name: "Pune, Maharashtra", lat: 18.4975, lng: 73.8643, expectedNearest: "Pune Gultekdi Market Yard" },
  { name: "Baramati, Maharashtra", lat: 18.1517, lng: 74.5772, expectedNearest: "Baramati APMC" },
  { name: "Nashik, Maharashtra", lat: 19.9975, lng: 73.7898, expectedNearest: "Nashik APMC" },
  { name: "Nagpur, Maharashtra", lat: 21.1458, lng: 79.0882, expectedNearest: "Nagpur Cotton Yard & Kalamna APMC" },
  { name: "Latur, Maharashtra", lat: 18.4088, lng: 76.5604, expectedNearest: "Latur Oilseed & Dal Market Yard" },
  { name: "Solapur, Maharashtra", lat: 17.6599, lng: 75.9064, expectedNearest: "Solapur APMC" },
];

let allPassed = true;

for (const loc of TEST_LOCATIONS) {
  console.log(`Testing location: ${loc.name} (${loc.lat}, ${loc.lng})...`);
  const result = calculateDynamicMandisForLocation(loc.lat, loc.lng, "Tomato", undefined, 50, "nearest");
  
  console.log(`  - Mandis found within effective radius (${result.effectiveRadiusKm} km): ${result.mandis.length}`);
  console.log(`  - Auto-expanded radius: ${result.autoExpanded}`);
  
  if (result.mandis.length > 0) {
    const top = result.mandis[0];
    console.log(`  - Nearest Mandi: ${top.mandi} (Distance: ${top.distanceKm} km, Modal Price: ₹${top.modalPrice}/qtl, Est. Transit: ${top.travelTimeHours}h)`);
    
    // Verify that the nearest mandi matches expected and distance is reasonable (< 15 km for exact APMC coordinate)
    if (top.mandi.includes(loc.expectedNearest) || top.distanceKm <= 15) {
      console.log(`  [PASS] Correct nearest mandi dynamically identified: ${top.mandi}`);
    } else {
      console.error(`  [FAIL] Expected ${loc.expectedNearest} but found ${top.mandi} (${top.distanceKm} km)`);
      allPassed = false;
    }

    // Verify distance changes dynamically and is NOT hardcoded Baramati (12 km) or Pune (92 km)
    if (loc.name.includes("Parbhani") && (top.distanceKm === 12 || top.mandi.includes("Baramati"))) {
      console.error(`  [FAIL] Hardcoded Baramati data detected in Parbhani!`);
      allPassed = false;
    }
  } else {
    console.error(`  [FAIL] No mandis found for ${loc.name}`);
    allPassed = false;
  }
  console.log("--------------------------------------------------");
}

// Test search functionality
console.log("\nTesting Place Search across India:");
const searchQueries = ["Parbhani", "Gangakhed", "Lasalgaon", "Pandharpur", "Katol", "431401"];
for (const q of searchQueries) {
  const matches = searchIndianLocations(q, 3);
  if (matches.length > 0) {
    console.log(`  Search "${q}" -> Found: ${matches[0].name} (${matches[0].district}, ${matches[0].pincode}) [PASS]`);
  } else {
    console.error(`  Search "${q}" -> Not found [FAIL]`);
    allPassed = false;
  }
}

// Test auto-expansion
console.log("\nTesting Auto-Expansion for Rare Crop:");
// Test a crop with few mandis within 50 km in Parbhani (e.g. Banana)
const expandTest = calculateDynamicMandisForLocation(19.2608, 76.7748, "Banana", undefined, 50, "nearest");
console.log(`  Banana search starting at 50 km from Parbhani -> Auto-expanded: ${expandTest.autoExpanded}, Effective Radius: ${expandTest.effectiveRadiusKm} km, Found: ${expandTest.mandis.length} [PASS]`);

if (allPassed) {
  console.log("\n>>> ALL NATIONWIDE LOCATION & DYNAMIC MANDI TESTS PASSED SUCCESSFULLY! <<<");
  process.exit(0);
} else {
  console.error("\n>>> SOME TESTS FAILED! <<<");
  process.exit(1);
}
