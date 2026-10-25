# KrishiSetu AI – Interactive Agriculture Map Engine

## 1. Overview
`InteractiveAgricultureMap.tsx` is an ultra-fast, zero-external-dependency cartographic engine engineered specifically for Indian agricultural logistics. Built with SVG/Canvas Web Mercator projection, it delivers fluid map interactions across both desktop workstations and rural mobile devices.

---

## 2. Interactive Navigation Controls
1. **Zoom In (`+`) / Zoom Out (`-`)**: Smooth geometric scaling with zoom level clamping (0.5x to 6.0x).
2. **Mouse Wheel Zoom**: Natural scroll zooming centered at cursor position.
3. **Pinch-to-Zoom**: Multi-touch pinch gesture support for smartphones and tablets.
4. **Pan & Drag**: Click-and-drag (mouse) or single-finger pan (touch) with inertia damping.
5. **Locate Me Button (`🎯`)**: Instantly resets pan and centers viewport directly on the farmer's parcel.
6. **Fit All Bounds (`⛶`)**: Automatically computes the minimum bounding box enclosing all active mandis, collection centers, and freight pools, ensuring zero off-screen points.
7. **Fullscreen Mode (`[ ]`)**: Expands cartographic canvas to fill entire display for command-center views.

---

## 3. Dynamic Radius Circle Overlay
- When active (`showRadiusOverlay: true`), the map renders a precision circular overlay centered on the farmer's GPS coordinates.
- **Visual Styling**: Translucent emerald radial gradient with a pulsing outer boundary ring.
- **Dynamic Resizing**: As the farmer toggles radius pills (25 km, 50 km, 100 km, 200 km, 300 km, 500 km, 1000 km) or moves the custom slider, the circle dynamically scales in physical kilometers.
- **Boundary Metric Tag**: Displays real-time radius distance text (e.g. `100 km Search Boundary`) at the circle edge.

---

## 4. Multi-Layer Filter Toggles
Users and administrators can selectively show or hide operational layers via floating quick-toggles:
- 🟢 **Farmer Farm Pin**: The exact agricultural production origin.
- 🔴 **APMC Mandis**: Regulated wholesale agricultural markets with modal commodity prices.
- 🔵 **FPO Collection Hubs**: Rural aggregation and grading centers with active capacities.
- 🟡 **Freight Pools**: Active multi-farmer consolidated transport batches.
- 🟣 **Institutional Buyers**: Verified processing factories, export terminals, and retail chains.
- 🌐 **Radius Boundary**: Visual range coverage ring.

---

## 5. Marker Popups & Action Cards
Clicking any entity marker reveals an interactive card containing:
- **Header**: Entity Name, District, and Operational Status (`Open`, `Active`).
- **Distance & Travel Time**: Calculated using haversine road factors (e.g. `114 km • ~2.5 hrs`).
- **Commercial Data**: Today's modal price for selected crop, daily arrivals (quintals), or collection center storage capacity.
- **Direct Action**: "Calculate Net Profit" link that auto-selects the mandi in the side panel calculator.
