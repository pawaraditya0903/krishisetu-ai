# KrishiSetu AI – Dynamic 3-in-1 Location Picker Guide

## 1. Overview
The **Dynamic 3-in-1 Location Picker Modal** (`LocationPickerModal.tsx`) solves the problem of rigid or hardcoded farm locations. It empowers farmers across India to pinpoint their exact agricultural parcel or collection hub using any of three flexible methods.

---

## 2. The Three Input Modes

### Mode 1: Device GPS Auto-Detect ("Use My Current Location")
- **Mechanism**: Invokes the browser/device `navigator.geolocation.getCurrentPosition` API with high accuracy options (`enableHighAccuracy: true, timeout: 10000`).
- **Precision**: Returns latitude and longitude to 5 decimal places (~1.1 meter resolution) with accuracy metrics (e.g. `±8m`).
- **Automatic Reverse Geocoding**: Cross-references coordinates with the Indian Agricultural Gazetteer to determine the closest taluka and district.
- **Visual Feedback**: Shows a pulsing radar ring and success badge once acquired.

### Mode 2: Indian Agricultural Gazetteer Search ("Search Village / Mandi")
- **Built-in Geographic Index**: Pre-indexed with major agricultural hubs, talukas, and APMC centers across Maharashtra and nationwide (Parbhani, Nashik, Baramati, Solapur, Jalna, Akola, Latur, Pune, Nagpur, Chhatrapati Sambhajinagar, Mumbai, Delhi Azadpur, Indore, Ahmedabad, etc.).
- **Live Autocomplete Filter**: Matches as the farmer types in Marathi or English.
- **Auto-Fill**: Selecting any gazetteer entry automatically populates Latitude, Longitude, Taluka, District, and State.

### Mode 3: Interactive Map Pinpoint ("Tap to Pinpoint on Map")
- **Cartographic Interface**: Renders the dynamic agriculture map with satellite/terrain coordinates.
- **Crosshair Reticle**: Drag or click anywhere on the cartographic canvas to move the farm marker pin.
- **Live Lat/Lng Readout**: Displays updated coordinates in real time at the bottom of the map.

---

## 3. Address Form Verification
Farmers can review or fine-tune their location fields before saving:
- **Village / Wasti / Shivar** (e.g. *Dharampuri*)
- **Taluka** (e.g. *Parbhani*)
- **District** (e.g. *Parbhani*)
- **State** (e.g. *Maharashtra*)
- **Pincode** (e.g. *431401*)
- **Latitude & Longitude**

---

## 4. Real-Time Platform Recalculation
Once confirmed:
1. The new location is saved to `useAppStore.getState().setFarmLocation(...)`.
2. Haversine distance is immediately computed to every mandi in the master registry.
3. The Farmer Market Discovery feed (`/farmer/market`) instantly reorganizes:
   - Nearest mandis rise to the top.
   - Travel times (hours) are recomputed based on agricultural vehicle speeds (40-60 km/h).
   - Net realization calculations update freight deductions ($D \times \text{₹/km}$).
4. The interactive map re-centers and draws the dynamic radius discovery circle over the new farm pin.
