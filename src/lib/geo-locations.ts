/**
 * Comprehensive Indian Agricultural Gazetteer & Geolocation Engine
 * Supports exact coordinates, taluka/district search, 6-digit pincodes,
 * Haversine distance, rural travel time estimation, and browser geolocation.
 */

import { FarmLocation } from "./types";

export interface PlaceRecord {
  id: string;
  name: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  hubType?: "APMC Market Hub" | "Taluka Center" | "Rural Aggregation Center";
}

/**
 * Calculate great-circle distance between two points in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Estimate transit travel time in hours for agricultural freight (40 km/h + 30 min handling).
 */
export function calculateTravelTimeHours(distanceKm: number): number {
  if (distanceKm <= 5) return 0.25; // 15 mins
  const transitHours = distanceKm / 40; // 40 km/h average truck/tempo speed
  const handlingHours = 0.5; // 30 min buffer for tolls and market entry
  return Math.round((transitHours + handlingHours) * 10) / 10;
}

/**
 * Format travel time in a friendly bilingual display (e.g., "1 hr 45 min").
 */
export function formatTravelTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

/**
 * Built-in Indian Agricultural Places Gazetteer
 * Dense coverage for Maharashtra plus major national agricultural hubs.
 */
export const INDIAN_AGRICULTURAL_PLACES: PlaceRecord[] = [
  // ==================== PARBHANI (परभणी) ====================
  {
    id: "P-PBN-01",
    name: "Parbhani APMC Yard",
    taluka: "Parbhani",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431401",
    lat: 19.2608,
    lng: 76.7748,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PBN-02",
    name: "Gangakhed Market",
    taluka: "Gangakhed",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431514",
    lat: 18.9567,
    lng: 76.7533,
    hubType: "Taluka Center",
  },
  {
    id: "P-PBN-03",
    name: "Jintur Krishi Kendra",
    taluka: "Jintur",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431509",
    lat: 19.6144,
    lng: 76.6908,
    hubType: "Taluka Center",
  },
  {
    id: "P-PBN-04",
    name: "Manwath APMC Sub-Yard",
    taluka: "Manwath",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431505",
    lat: 19.3083,
    lng: 76.5022,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PBN-05",
    name: "Pathri Grain Market",
    taluka: "Pathri",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431506",
    lat: 19.2553,
    lng: 76.4172,
    hubType: "Taluka Center",
  },
  {
    id: "P-PBN-06",
    name: "Selu Cotton Market",
    taluka: "Selu",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431503",
    lat: 19.8058,
    lng: 76.4525,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PBN-07",
    name: "Palam Collection Center",
    taluka: "Palam",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431720",
    lat: 18.9833,
    lng: 76.95,
    hubType: "Rural Aggregation Center",
  },
  {
    id: "P-PBN-08",
    name: "Sonpeth Hub",
    taluka: "Sonpeth",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431516",
    lat: 19.0333,
    lng: 76.4667,
    hubType: "Rural Aggregation Center",
  },
  {
    id: "P-PBN-09",
    name: "Purna Agro Junction",
    taluka: "Purna",
    district: "Parbhani",
    state: "Maharashtra",
    pincode: "431511",
    lat: 19.1833,
    lng: 77.05,
    hubType: "Taluka Center",
  },

  // ==================== NASHIK (नाशिक) ====================
  {
    id: "P-NSK-01",
    name: "Nashik APMC Main Yard",
    taluka: "Nashik",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422001",
    lat: 19.9975,
    lng: 73.7898,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NSK-02",
    name: "Pimpalgaon Baswant Market",
    taluka: "Niphad",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422209",
    lat: 20.17,
    lng: 73.98,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NSK-03",
    name: "Lasalgaon Onion Mandi",
    taluka: "Niphad",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422306",
    lat: 20.1464,
    lng: 74.2289,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NSK-04",
    name: "Yeola APMC Yard",
    taluka: "Yeola",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "423401",
    lat: 20.04,
    lng: 74.48,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NSK-05",
    name: "Dindori Grape Packhouse",
    taluka: "Dindori",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422202",
    lat: 20.2,
    lng: 73.8333,
    hubType: "Rural Aggregation Center",
  },
  {
    id: "P-NSK-06",
    name: "Malegaon Agricultural Exchange",
    taluka: "Malegaon",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "423203",
    lat: 20.55,
    lng: 74.5333,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NSK-07",
    name: "Sinnar Mandi",
    taluka: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "422103",
    lat: 19.85,
    lng: 74.0,
    hubType: "Taluka Center",
  },
  {
    id: "P-NSK-08",
    name: "Satana Baglan Yard",
    taluka: "Baglan",
    district: "Nashik",
    state: "Maharashtra",
    pincode: "423301",
    lat: 20.5833,
    lng: 74.2,
    hubType: "APMC Market Hub",
  },

  // ==================== PUNE (पुणे) ====================
  {
    id: "P-PUN-01",
    name: "Pune Gultekdi Market Yard",
    taluka: "Haveli",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411037",
    lat: 18.4975,
    lng: 73.8643,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PUN-02",
    name: "Baramati APMC Yard",
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
    pincode: "413102",
    lat: 18.1517,
    lng: 74.5772,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PUN-03",
    name: "Indapur Agro Sub-Yard",
    taluka: "Indapur",
    district: "Pune",
    state: "Maharashtra",
    pincode: "413106",
    lat: 18.1167,
    lng: 75.0333,
    hubType: "Taluka Center",
  },
  {
    id: "P-PUN-04",
    name: "Daund Market Center",
    taluka: "Daund",
    district: "Pune",
    state: "Maharashtra",
    pincode: "413801",
    lat: 18.4667,
    lng: 74.6,
    hubType: "Taluka Center",
  },
  {
    id: "P-PUN-05",
    name: "Junnar Narayangaon Tomato Market",
    taluka: "Junnar",
    district: "Pune",
    state: "Maharashtra",
    pincode: "410502",
    lat: 19.2,
    lng: 73.88,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PUN-06",
    name: "Manchar Vegetable Hub",
    taluka: "Ambegaon",
    district: "Pune",
    state: "Maharashtra",
    pincode: "410503",
    lat: 19.0,
    lng: 73.9333,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PUN-07",
    name: "Khed Chakan APMC",
    taluka: "Khed",
    district: "Pune",
    state: "Maharashtra",
    pincode: "410501",
    lat: 18.76,
    lng: 73.85,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-PUN-08",
    name: "Shirur Market Yard",
    taluka: "Shirur",
    district: "Pune",
    state: "Maharashtra",
    pincode: "412210",
    lat: 18.82,
    lng: 74.37,
    hubType: "Taluka Center",
  },

  // ==================== SOLAPUR (सोलापूर) ====================
  {
    id: "P-SOL-01",
    name: "Solapur APMC Main Yard",
    taluka: "Solapur North",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413001",
    lat: 17.6599,
    lng: 75.9064,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SOL-02",
    name: "Pandharpur Mandi",
    taluka: "Pandharpur",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413304",
    lat: 17.6775,
    lng: 75.3264,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SOL-03",
    name: "Barshi APMC Yard",
    taluka: "Barshi",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413401",
    lat: 18.2333,
    lng: 75.6833,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SOL-04",
    name: "Mohol Agro Hub",
    taluka: "Mohol",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413213",
    lat: 17.8167,
    lng: 75.65,
    hubType: "Taluka Center",
  },
  {
    id: "P-SOL-05",
    name: "Karmala Mandi",
    taluka: "Karmala",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413203",
    lat: 18.4167,
    lng: 75.2,
    hubType: "Taluka Center",
  },
  {
    id: "P-SOL-06",
    name: "Sangola Pomegranate Center",
    taluka: "Sangola",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413307",
    lat: 17.4333,
    lng: 75.2,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SOL-07",
    name: "Akkalkot Pulse Market",
    taluka: "Akkalkot",
    district: "Solapur",
    state: "Maharashtra",
    pincode: "413216",
    lat: 17.52,
    lng: 76.2,
    hubType: "Taluka Center",
  },

  // ==================== NAGPUR (नागपूर) ====================
  {
    id: "P-NGP-01",
    name: "Nagpur Cotton Yard & Kalamna APMC",
    taluka: "Nagpur Urban",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "440001",
    lat: 21.1458,
    lng: 79.0882,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NGP-02",
    name: "Kalmeshwar Citrus Mandi",
    taluka: "Kalmeshwar",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "441501",
    lat: 21.2333,
    lng: 78.9167,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NGP-03",
    name: "Katol Orange Exchange",
    taluka: "Katol",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "441302",
    lat: 21.2667,
    lng: 78.5833,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NGP-04",
    name: "Saoner Grain Market",
    taluka: "Saoner",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "441107",
    lat: 21.3833,
    lng: 78.9167,
    hubType: "Taluka Center",
  },
  {
    id: "P-NGP-05",
    name: "Umred Chilli Yard",
    taluka: "Umred",
    district: "Nagpur",
    state: "Maharashtra",
    pincode: "441203",
    lat: 20.85,
    lng: 79.3333,
    hubType: "APMC Market Hub",
  },

  // ==================== LATUR (लातूर) ====================
  {
    id: "P-LTR-01",
    name: "Latur Oilseed & Dal Market Yard",
    taluka: "Latur",
    district: "Latur",
    state: "Maharashtra",
    pincode: "413512",
    lat: 18.4088,
    lng: 76.5604,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-LTR-02",
    name: "Ausa Mandi",
    taluka: "Ausa",
    district: "Latur",
    state: "Maharashtra",
    pincode: "413520",
    lat: 18.25,
    lng: 76.5,
    hubType: "Taluka Center",
  },
  {
    id: "P-LTR-03",
    name: "Ahmedpur Pulse Market",
    taluka: "Ahmedpur",
    district: "Latur",
    state: "Maharashtra",
    pincode: "413515",
    lat: 18.7,
    lng: 76.9333,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-LTR-04",
    name: "Udgir Grain Exchange",
    taluka: "Udgir",
    district: "Latur",
    state: "Maharashtra",
    pincode: "413517",
    lat: 18.39,
    lng: 77.12,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-LTR-05",
    name: "Nilanga Market",
    taluka: "Nilanga",
    district: "Latur",
    state: "Maharashtra",
    pincode: "413521",
    lat: 18.13,
    lng: 76.75,
    hubType: "Taluka Center",
  },

  // ==================== KOLHAPUR & SANGLI (कोल्हापूर / सांगली) ====================
  {
    id: "P-KOP-01",
    name: "Kolhapur APMC Market Yard",
    taluka: "Karveer",
    district: "Kolhapur",
    state: "Maharashtra",
    pincode: "416001",
    lat: 16.705,
    lng: 74.2433,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SNG-01",
    name: "Sangli Turmeric & Spices Market",
    taluka: "Miraj",
    district: "Sangli",
    state: "Maharashtra",
    pincode: "416416",
    lat: 16.8524,
    lng: 74.5815,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SNG-02",
    name: "Tasgaon Grape Hub",
    taluka: "Tasgaon",
    district: "Sangli",
    state: "Maharashtra",
    pincode: "416312",
    lat: 17.0333,
    lng: 74.6,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SNG-03",
    name: "Islampur Walwa Yard",
    taluka: "Walwa",
    district: "Sangli",
    state: "Maharashtra",
    pincode: "415409",
    lat: 17.05,
    lng: 74.2667,
    hubType: "Taluka Center",
  },

  // ==================== AHMEDNAGAR & SHIRDI (अहमदनगर / राहाता) ====================
  {
    id: "P-AHM-01",
    name: "Ahmednagar APMC",
    taluka: "Nagar",
    district: "Ahmednagar",
    state: "Maharashtra",
    pincode: "414001",
    lat: 19.0952,
    lng: 74.7496,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-AHM-02",
    name: "Rahata Shirdi Pomegranate Yard",
    taluka: "Rahata",
    district: "Ahmednagar",
    state: "Maharashtra",
    pincode: "423107",
    lat: 19.7,
    lng: 74.4833,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-AHM-03",
    name: "Sangamner Milk & Vegetable Hub",
    taluka: "Sangamner",
    district: "Ahmednagar",
    state: "Maharashtra",
    pincode: "422605",
    lat: 19.5667,
    lng: 74.2167,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-AHM-04",
    name: "Kopargaon Grain Mandi",
    taluka: "Kopargaon",
    district: "Ahmednagar",
    state: "Maharashtra",
    pincode: "423601",
    lat: 19.8833,
    lng: 74.4833,
    hubType: "Taluka Center",
  },

  // ==================== JALGAON (जळगाव - केळी हब) ====================
  {
    id: "P-JAL-01",
    name: "Jalgaon Banana & Agro Mandi",
    taluka: "Jalgaon",
    district: "Jalgaon",
    state: "Maharashtra",
    pincode: "425001",
    lat: 21.0077,
    lng: 75.5626,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-JAL-02",
    name: "Raver Banana Express Yard",
    taluka: "Raver",
    district: "Jalgaon",
    state: "Maharashtra",
    pincode: "425508",
    lat: 21.25,
    lng: 75.97,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-JAL-03",
    name: "Chalisgaon Cotton Yard",
    taluka: "Chalisgaon",
    district: "Jalgaon",
    state: "Maharashtra",
    pincode: "424101",
    lat: 20.47,
    lng: 75.02,
    hubType: "Taluka Center",
  },

  // ==================== CHHATRAPATI SAMBHAJINAGAR & JALNA ====================
  {
    id: "P-CSN-01",
    name: "Chhatrapati Sambhajinagar APMC",
    taluka: "Aurangabad",
    district: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    pincode: "431001",
    lat: 19.8762,
    lng: 75.3433,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-JLN-01",
    name: "Jalna Seed & Pulse Mandi",
    taluka: "Jalna",
    district: "Jalna",
    state: "Maharashtra",
    pincode: "431203",
    lat: 19.841,
    lng: 75.8864,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-JLN-02",
    name: "Ambad Agro Yard",
    taluka: "Ambad",
    district: "Jalna",
    state: "Maharashtra",
    pincode: "431205",
    lat: 19.62,
    lng: 75.78,
    hubType: "Taluka Center",
  },

  // ==================== NANDED & HINGOLI (नांदेड / हिंगोली) ====================
  {
    id: "P-NED-01",
    name: "Nanded Cotton & Turmeric Yard",
    taluka: "Nanded",
    district: "Nanded",
    state: "Maharashtra",
    pincode: "431601",
    lat: 19.1383,
    lng: 77.321,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-HNG-01",
    name: "Hingoli Turmeric APMC",
    taluka: "Hingoli",
    district: "Hingoli",
    state: "Maharashtra",
    pincode: "431513",
    lat: 19.7167,
    lng: 77.15,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-HNG-02",
    name: "Basmath Haldi Mandi",
    taluka: "Basmath",
    district: "Hingoli",
    state: "Maharashtra",
    pincode: "431512",
    lat: 19.33,
    lng: 77.15,
    hubType: "Taluka Center",
  },

  // ==================== AKOLA & AMRAVATI (अकोला / अमरावती) ====================
  {
    id: "P-AKL-01",
    name: "Akola Cotton & Soyabean Yard",
    taluka: "Akola",
    district: "Akola",
    state: "Maharashtra",
    pincode: "444001",
    lat: 20.7002,
    lng: 77.0082,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-AMR-01",
    name: "Amravati APMC Cotton Yard",
    taluka: "Amravati",
    district: "Amravati",
    state: "Maharashtra",
    pincode: "444601",
    lat: 20.932,
    lng: 77.7523,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-AMR-02",
    name: "Morshi Warud Orange Cluster",
    taluka: "Morshi",
    district: "Amravati",
    state: "Maharashtra",
    pincode: "444905",
    lat: 21.32,
    lng: 78.02,
    hubType: "APMC Market Hub",
  },

  // ==================== SATARA & BEED ====================
  {
    id: "P-SAT-01",
    name: "Satara APMC",
    taluka: "Satara",
    district: "Satara",
    state: "Maharashtra",
    pincode: "415001",
    lat: 17.6805,
    lng: 73.99,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SAT-02",
    name: "Karad Market Yard",
    taluka: "Karad",
    district: "Satara",
    state: "Maharashtra",
    pincode: "415110",
    lat: 17.28,
    lng: 74.2,
    hubType: "Taluka Center",
  },
  {
    id: "P-SAT-03",
    name: "Phaltan Pomegranate Yard",
    taluka: "Phaltan",
    district: "Satara",
    state: "Maharashtra",
    pincode: "415523",
    lat: 17.98,
    lng: 74.43,
    hubType: "Taluka Center",
  },
  {
    id: "P-BED-01",
    name: "Beed APMC Yard",
    taluka: "Beed",
    district: "Beed",
    state: "Maharashtra",
    pincode: "431122",
    lat: 18.99,
    lng: 75.76,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-BED-02",
    name: "Parli Vaijnath Agro Mandi",
    taluka: "Parli",
    district: "Beed",
    state: "Maharashtra",
    pincode: "431515",
    lat: 18.85,
    lng: 76.53,
    hubType: "Taluka Center",
  },

  // ==================== DHARASHIV / OSMANABAD ====================
  {
    id: "P-DHR-01",
    name: "Dharashiv Osmanabad APMC",
    taluka: "Dharashiv",
    district: "Dharashiv",
    state: "Maharashtra",
    pincode: "413501",
    lat: 18.17,
    lng: 76.04,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-DHR-02",
    name: "Tuljapur Grain Yard",
    taluka: "Tuljapur",
    district: "Dharashiv",
    state: "Maharashtra",
    pincode: "413601",
    lat: 18.01,
    lng: 76.08,
    hubType: "Taluka Center",
  },

  // ==================== YAVATMAL & WARDHA ====================
  {
    id: "P-YAV-01",
    name: "Yavatmal Cotton Exchange",
    taluka: "Yavatmal",
    district: "Yavatmal",
    state: "Maharashtra",
    pincode: "445001",
    lat: 20.3888,
    lng: 78.1204,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-WRD-01",
    name: "Wardha Agro Mandi",
    taluka: "Wardha",
    district: "Wardha",
    state: "Maharashtra",
    pincode: "442001",
    lat: 20.7453,
    lng: 78.6022,
    hubType: "APMC Market Hub",
  },

  // ==================== BULDHANA ====================
  {
    id: "P-BLD-01",
    name: "Khamgaon Cotton & Oilseed Yard",
    taluka: "Khamgaon",
    district: "Buldhana",
    state: "Maharashtra",
    pincode: "444303",
    lat: 20.68,
    lng: 76.57,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-BLD-02",
    name: "Malkapur Grain Exchange",
    taluka: "Malkapur",
    district: "Buldhana",
    state: "Maharashtra",
    pincode: "443101",
    lat: 20.88,
    lng: 76.2,
    hubType: "Taluka Center",
  },

  // ==================== DHULE & NANDURBAR ====================
  {
    id: "P-DHL-01",
    name: "Dhule APMC Yard",
    taluka: "Dhule",
    district: "Dhule",
    state: "Maharashtra",
    pincode: "424001",
    lat: 20.9042,
    lng: 74.7749,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-NDB-01",
    name: "Nandurbar Chilli Mandi",
    taluka: "Nandurbar",
    district: "Nandurbar",
    state: "Maharashtra",
    pincode: "425412",
    lat: 21.37,
    lng: 74.25,
    hubType: "APMC Market Hub",
  },

  // ==================== MUMBAI METROPOLITAN TERMINAL ====================
  {
    id: "P-MUM-01",
    name: "Mumbai Vashi APMC Terminal",
    taluka: "Thane",
    district: "Thane",
    state: "Maharashtra",
    pincode: "400703",
    lat: 19.076,
    lng: 73.0076,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-KLY-01",
    name: "Kalyan Vegetable Yard",
    taluka: "Kalyan",
    district: "Thane",
    state: "Maharashtra",
    pincode: "421301",
    lat: 19.2437,
    lng: 73.1355,
    hubType: "Taluka Center",
  },

  // ==================== NATIONAL AGRICULTURAL HUBS ====================
  {
    id: "P-DEL-01",
    name: "Delhi Azadpur Mandi",
    taluka: "North Delhi",
    district: "Delhi",
    state: "Delhi",
    pincode: "110033",
    lat: 28.715,
    lng: 77.178,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-IND-01",
    name: "Indore Mandi Yard",
    taluka: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    pincode: "452001",
    lat: 22.7196,
    lng: 75.8577,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-SUR-01",
    name: "Surat APMC Market",
    taluka: "Surat",
    district: "Surat",
    state: "Gujarat",
    pincode: "395003",
    lat: 21.1702,
    lng: 72.8311,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-HUB-01",
    name: "Hubballi APMC",
    taluka: "Hubballi",
    district: "Dharwad",
    state: "Karnataka",
    pincode: "580020",
    lat: 15.3647,
    lng: 75.124,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-BEL-01",
    name: "Belagavi APMC",
    taluka: "Belagavi",
    district: "Belagavi",
    state: "Karnataka",
    pincode: "590001",
    lat: 15.8497,
    lng: 74.4977,
    hubType: "APMC Market Hub",
  },
  {
    id: "P-GNT-01",
    name: "Guntur Spices Yard",
    taluka: "Guntur",
    district: "Guntur",
    state: "Andhra Pradesh",
    pincode: "522002",
    lat: 16.3067,
    lng: 80.4365,
    hubType: "APMC Market Hub",
  },
];

/**
 * Search Indian locations by village, taluka, district, state, or 6-digit pincode.
 */
export function searchIndianLocations(query: string, limit = 8): PlaceRecord[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return INDIAN_AGRICULTURAL_PLACES.slice(0, limit);

  // Exact or prefix pincode match
  if (/^\d+$/.test(q)) {
    return INDIAN_AGRICULTURAL_PLACES.filter((p) => p.pincode.startsWith(q)).slice(0, limit);
  }

  // Text matching with relevance score
  const matches = INDIAN_AGRICULTURAL_PLACES.map((place) => {
    let score = 0;
    const nameL = place.name.toLowerCase();
    const talukaL = place.taluka.toLowerCase();
    const distL = place.district.toLowerCase();
    const stateL = place.state.toLowerCase();

    if (nameL === q || distL === q || talukaL === q) score += 100;
    else if (distL.startsWith(q)) score += 80;
    else if (talukaL.startsWith(q)) score += 70;
    else if (nameL.startsWith(q)) score += 60;
    else if (distL.includes(q)) score += 40;
    else if (talukaL.includes(q)) score += 30;
    else if (nameL.includes(q)) score += 20;
    else if (stateL.includes(q)) score += 10;

    return { place, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.place);

  return matches.slice(0, limit);
}

/**
 * Find the closest registered place to given coordinates.
 */
export function findNearestRegisteredPlace(lat: number, lng: number): PlaceRecord {
  let nearest = INDIAN_AGRICULTURAL_PLACES[0];
  let minDistance = calculateDistanceKm(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < INDIAN_AGRICULTURAL_PLACES.length; i++) {
    const candidate = INDIAN_AGRICULTURAL_PLACES[i];
    const dist = calculateDistanceKm(lat, lng, candidate.lat, candidate.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = candidate;
    }
  }

  return nearest;
}

/**
 * Reverse geocode latitude and longitude to detected administrative levels.
 * Uses OpenStreetMap Nominatim with fast fallback to nearest Indian agricultural place.
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<FarmLocation> {
  const nearest = findNearestRegisteredPlace(lat, lng);
  const now = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      {
        headers: {
          "User-Agent": "KrishiSetu-AI-Agriculture-Platform/1.0",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village =
        addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || addr.town;
      const taluka =
        addr.county || addr.subdistrict || addr.tehsil || nearest.taluka;
      const district =
        addr.state_district || addr.district || addr.city || nearest.district;
      const state = addr.state || nearest.state || "Maharashtra";
      const pincode = addr.postcode || nearest.pincode;

      const label = [village || taluka, district, state].filter(Boolean).join(", ");

      return {
        id: `LOC-${Date.now()}`,
        label,
        village: village || undefined,
        taluka,
        district,
        state,
        pincode,
        lat,
        lng,
        accuracy: "High (GPS)",
        updatedAt: now,
      };
    }
  } catch {
    // Network / timeout / offline: fall back to built-in gazetteer
  }

  return {
    id: `LOC-${Date.now()}`,
    label: `${nearest.name}, ${nearest.district}, ${nearest.state}`,
    taluka: nearest.taluka,
    district: nearest.district,
    state: nearest.state,
    pincode: nearest.pincode,
    lat,
    lng,
    accuracy: "High (GPS)",
    updatedAt: now,
  };
}
