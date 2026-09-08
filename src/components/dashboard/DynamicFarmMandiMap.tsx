"use client";

import React from "react";
import { FarmLocation, MandiPrice } from "@/lib/types";
import InteractiveAgricultureMap from "./InteractiveAgricultureMap";

interface DynamicFarmMandiMapProps {
  farmLocation: FarmLocation;
  mandis: MandiPrice[];
  selectedMandiId?: string;
  onSelectMandi?: (mandi: MandiPrice) => void;
  language?: "mr" | "hi" | "en";
}

export default function DynamicFarmMandiMap({
  farmLocation,
  mandis,
  selectedMandiId,
  onSelectMandi,
  language = "en",
}: DynamicFarmMandiMapProps) {
  const isMr = language === "mr";

  const handleSelectMarker = (marker: any) => {
    if (marker.type === "mandi" && onSelectMandi) {
      const match = mandis.find((m) => m.id === marker.id);
      if (match) onSelectMandi(match);
    }
  };

  return (
    <InteractiveAgricultureMap
      centerLat={farmLocation.lat}
      centerLng={farmLocation.lng}
      selectedMarkerId={selectedMandiId}
      onSelectMarker={handleSelectMarker}
      language={language}
      heightClassName="h-80 sm:h-96"
      customTitle={
        isMr
          ? `थेट कृषी नकाशा: ${farmLocation.label}`
          : `Live Agriculture Grid: ${farmLocation.label}`
      }
    />
  );
}
