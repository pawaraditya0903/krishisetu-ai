export type Language = "en" | "mr" | "hi";

export interface Translations {
  appName: string;
  tagline: string;
  demoBadge: string;
  online: string;
  offline: string;
  offlineNotice: string;
  offlineNoticeSub: string;
  nav: {
    dashboard: string;
    gradeCrop: string;
    marketPrices: string;
    saleAdvisor: string;
    pooling: string;
    myOrders: string;
    settlement: string;
    verifyLots: string;
    poolManagement: string;
    logistics: string;
    buyers: string;
    marketplace: string;
    myOffers: string;
    deliveryAcceptance: string;
    users: string;
    marketData: string;
    modelMonitoring: string;
    logout: string;
    navigationLabel: string;
    fpoTagline: string;
    pilotCluster: string;
  };
  farmer: {
    greeting: string;
    startSelling: string;
    bestNet: string;
    cropGrade: string;
    poolProgress: string;
    pendingPayout: string;
    recentLots: string;
    nearbyMandis: string;
    externalQualityDisclaimer: string;
    forecastDisclaimer: string;
    onlineStatus: string;
    offlineStatus: string;
    externalAIEstimate: string;
    releasedNodal: string;
    journeyTitle: string;
    journey1: string;
    journey2: string;
    journey3: string;
    journey4: string;
    journey5: string;
    viewAllOrders: string;
    lotsDescription: string;
    dailyRates: string;
    footerDisclaimer: string;
    noLots: string;
  };
  fpo: {
    pendingVerification: string;
    activePools: string;
    scheduledDispatches: string;
    activeBuyers: string;
    verifyAndApprove: string;
    rejectReturn: string;
  };
  buyer: {
    browseVerified: string;
    reserveLot: string;
    authorizedProtected: string;
    acceptDelivery: string;
    raiseDispute: string;
  };
  actions: {
    saveDraft: string;
    sendForVerification: string;
    joinPool: string;
    downloadReceipt: string;
    viewAuditLog: string;
    analyzeCrop: string;
  };
  market: {
    title: string;
    subtitle: string;
    commodity: string;
    all: string;
    liveFeed: string;
    calculatorTitle: string;
    calculatorSubtitle: string;
    batchQuantity: string;
    freightRate: string;
    apmcCommission: string;
    handlingFee: string;
    packagingFee: string;
    spoilageBuffer: string;
    grossValue: string;
    freight: string;
    handling: string;
    cratesPackaging: string;
    commission: string;
    spoilage: string;
    takeHome: string;
    modalPrice: string;
    range: string;
    arrivals: string;
    bestNetTag: string;
    freshToday: string;
    distanceSuffix: string;
    crops: Record<string, string>;
  };
  grade: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    topTitle: string;
    topSub: string;
    topDesc: string;
    sideTitle: string;
    sideSub: string;
    sideDesc: string;
    crateTitle: string;
    crateSub: string;
    crateDesc: string;
    tapToUpload: string;
    replacePhoto: string;
    cropType: string;
    variety: string;
    quantity: string;
    runGrading: string;
    analyzing: string;
    assignedGrade: string;
    confidence: string;
    uniformity: string;
    firmness: string;
    createLot: string;
    disclaimer: string;
    harvestWeight: string;
    harvestDate: string;
    collectionCenter: string;
    nextPhotos: string;
    back: string;
    specifyInfo: string;
    realPhotoLoaded: string;
    opencvGateTitle: string;
    blurVariance: string;
    exposureScore: string;
    crateFraming: string;
    gateStatus: string;
    uploadedImages: string;
    aiQualityClassification: string;
    visualParamsTitle: string;
    diameterLabel: string;
    defectLabel: string;
    ripenessLabel: string;
    colorLabel: string;
    onlineAnalysis: string;
    canvasAnalysis: string;
    mockBadge: string;
    step1Desc: string;
    step3Desc: string;
    passStatus: string;
    failStatus: string;
  };
  voice: {
    title: string;
    subtitle: string;
    listening: string;
    tapToSpeak: string;
    stopListening: string;
    typePlaceholder: string;
    askButton: string;
    queryLabel: string;
    advisoryLabel: string;
    repeatAudio: string;
    close: string;
    sampleHeader: string;
    speakingIndicator: string;
    tapStopEvaluate: string;
    pressMicToSpeak: string;
    tapMicOrType: string;
    languageLabel: string;
    generalFallback: string;
  };
  advisor: {
    title: string;
    subtitle: string;
    riskLabel: string;
    conservative: string;
    balanced: string;
    growth: string;
    recommendedOutlook: string;
    waitDays: string;
    waitDaysDesc: string;
    upsideEstimate: string;
    downsideRisk: string;
    confidenceLevel: string;
    storageSpoilage: string;
    preBookButton: string;
    sellNow: string;
    sellNowDesc: string;
    currentSpotRate: string;
    perishabilityExposure: string;
    payoutTimeline: string;
    compareMandisButton: string;
    perishabilityTitle: string;
    perishabilityAlert: string;
    explainabilityTitle: string;
    explainabilitySubtitle: string;
    factor1: string;
    factor2: string;
    factor3: string;
    factor4: string;
    chartTitle: string;
    chartSubtitle: string;
    chartBadge: string;
    expectedPriceLabel: string;
    uncertaintyBandLabel: string;
    disclaimerText: string;
  };
  orders: {
    title: string;
    subtitle: string;
    createNewLot: string;
    noLotsFound: string;
    noLotsDesc: string;
    startGradingNow: string;
    lotId: string;
    qrPass: string;
    downloadWeighSlip: string;
    assignedPool: string;
    viewPoolDetails: string;
    joinPoolPrompt: string;
    viewSettlement: string;
    readyForPooling: string;
    statuses: Record<string, string>;
  };
  pooling: {
    title: string;
    subtitle: string;
    selectLot: string;
    poolSavingsBadge: string;
    targetProgress: string;
    destination: string;
    dispatchDate: string;
    joinPoolButton: string;
    joinedStatus: string;
    poolFull: string;
    noLotsToPool: string;
    savingsDesc: string;
  };
  settlement: {
    title: string;
    subtitle: string;
    noSettlements: string;
    nodalPayoutReleased: string;
    txnId: string;
    nodalRef: string;
    netAmount: string;
    creditedBadge: string;
    txnDate: string;
    grossValue: string;
    freightDeduction: string;
    handlingDeduction: string;
    apmcCommission: string;
    spoilageBuffer: string;
    downloadSlip: string;
    viewEHR: string;
    escrowGuarantee: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "KrishiSetu AI",
    tagline: "Offline-first FPO-assisted farmer market-linkage platform",
    demoBadge: "SIH 2026 Sandbox Demo",
    online: "Online",
    offline: "Offline Mode",
    offlineNotice: "You are offline. Crop drafts and pool requests are safely queued in your local browser and will sync automatically when back online.",
    offlineNoticeSub: "Simulated local storage queue is active. You can create lots and join pools; they will synchronize when connection is restored.",
    nav: {
      dashboard: "Dashboard",
      gradeCrop: "Grade Crop",
      marketPrices: "Market Prices",
      saleAdvisor: "Sale Advisor",
      pooling: "Pooling",
      myOrders: "My Orders",
      settlement: "Settlement",
      verifyLots: "Verify Lots",
      poolManagement: "Pool Management",
      logistics: "Logistics",
      buyers: "Buyers",
      marketplace: "Marketplace",
      myOffers: "My Offers",
      deliveryAcceptance: "Delivery Acceptance",
      users: "Users",
      marketData: "Market Data",
      modelMonitoring: "Model Monitoring",
      logout: "Logout",
      navigationLabel: "Navigation",
      fpoTagline: "FPO & Market Linkage",
      pilotCluster: "Pilot: Baramati Tomato Cluster",
    },
    farmer: {
      greeting: "Namaste",
      startSelling: "Start Selling",
      bestNet: "Today's Best Net",
      cropGrade: "Current Crop Grade",
      poolProgress: "Active Pool Progress",
      pendingPayout: "Pending Payment",
      recentLots: "Recent Lots",
      nearbyMandis: "Nearby Mandis",
      externalQualityDisclaimer: "External visual-quality estimate only; not laboratory or official AGMARK certification.",
      forecastDisclaimer: "Price outlook is a probabilistic estimate (P10-P90 range), not a financial guarantee.",
      onlineStatus: "Online • Real-Time Baramati APMC Connected",
      offlineStatus: "Offline Mode • Queued locally",
      externalAIEstimate: "External Visual AI Estimate",
      releasedNodal: "Released in Nodal Account",
      journeyTitle: "End-to-End Market Linkage Journey",
      journey1: "1. Capture 3 Photos",
      journey2: "2. External AI Grade",
      journey3: "3. Net Mandi Compare",
      journey4: "4. FPO Group Pooling",
      journey5: "5. Nodal Payout",
      viewAllOrders: "View All Orders",
      lotsDescription: "Your active and verified crop lots in the system",
      dailyRates: "Daily rates for Tomato",
      footerDisclaimer: "Disclaimer: All prices and recommendations are demo estimates, not guarantees. This is an SIH prototype.",
      noLots: "No lots created yet. Click \"Start Selling\" to begin.",
    },
    fpo: {
      pendingVerification: "Lots Awaiting Verification",
      activePools: "Active Pools",
      scheduledDispatches: "Dispatches Scheduled",
      activeBuyers: "Active Buyers",
      verifyAndApprove: "Verify & Approve",
      rejectReturn: "Reject & Return",
    },
    buyer: {
      browseVerified: "Browse verified pooled lots from FPOs",
      reserveLot: "Reserve Lot",
      authorizedProtected: "Payment Authorized (Nodal Sandbox)",
      acceptDelivery: "Accept Delivery",
      raiseDispute: "Raise Dispute",
    },
    actions: {
      saveDraft: "Save Draft",
      sendForVerification: "Send for FPO Verification",
      joinPool: "Join This Pool",
      downloadReceipt: "Download PDF",
      viewAuditLog: "View Audit Log",
      analyzeCrop: "Analyze Crop",
    },
    market: {
      title: "Mandi Price Discovery & Net Realization",
      subtitle: "Authentic AGMARKNET & MSAMB daily bulletins across Maharashtra. Deduct freight, handling, and commission to find your true take-home pay.",
      commodity: "Commodity:",
      all: "All",
      liveFeed: "Live Feed Refresh",
      calculatorTitle: "Transparent Net Calculator",
      calculatorSubtitle: "Adjust parameters for",
      batchQuantity: "Batch Quantity (kg)",
      freightRate: "Freight Rate (₹/km for solo vehicle)",
      apmcCommission: "APMC Commission (5%)",
      handlingFee: "Handling (₹)",
      packagingFee: "Packaging (₹)",
      spoilageBuffer: "In-Transit Spoilage Buffer (2%)",
      grossValue: "Gross Value",
      freight: "Freight",
      handling: "Loading & Labour Handling",
      cratesPackaging: "Crates & Packaging",
      commission: "APMC Commission",
      spoilage: "In-Transit Spoilage Buffer",
      takeHome: "Take-Home",
      modalPrice: "MODAL PRICE / QUINTAL",
      range: "Range",
      arrivals: "Arrivals",
      bestNetTag: "Best Estimated Net Outcome",
      freshToday: "Fresh (Today)",
      distanceSuffix: "from Baramati",
      crops: {
        Tomato: "Tomato",
        Onion: "Onion",
        Potato: "Potato",
        Pomegranate: "Pomegranate",
        "Green Chilli": "Green Chilli",
        Soyabean: "Soyabean",
        All: "All",
      },
    },
    grade: {
      title: "AI Quality Gate & Multi-Angle Upload",
      subtitle: "Upload 3 guided photos for automated visual quality assessment (size, uniformity, ripeness).",
      step1: "1. Multi-Angle Photo Upload",
      step2: "2. AI Quality Analysis",
      step3: "3. Verified Lot Summary",
      topTitle: "1. Top View",
      topSub: "Size & Uniformity",
      topDesc: "Inspects diameter uniformity, shoulder color & calyx health",
      sideTitle: "2. Side View",
      sideSub: "Ripeness & Firmness",
      sideDesc: "Evaluates skin texture, firmness & breaker color stage",
      crateTitle: "3. Bulk Crate View",
      crateSub: "Harvest Occupancy",
      crateDesc: "Evaluates harvest occupancy, surface defects & crate framing",
      tapToUpload: "Tap to Upload / Camera",
      replacePhoto: "Replace Photo",
      cropType: "Crop Type",
      variety: "Variety",
      quantity: "Estimated Quantity (kg)",
      runGrading: "Run Multi-Angle AI Grading",
      analyzing: "Analyzing Images...",
      assignedGrade: "Assigned Grade",
      confidence: "Confidence",
      uniformity: "Color Uniformity",
      firmness: "Ripeness Stage",
      createLot: "Submit Lot for FPO Pooling",
      disclaimer: "External visual-quality estimate only. Final verification conducted at FPO Collection Hub.",
      harvestWeight: "Estimated Harvest Weight (kg)",
      harvestDate: "Harvest Date",
      collectionCenter: "Preferred FPO Collection Center",
      nextPhotos: "Next: Capture Photos",
      back: "Back",
      specifyInfo: "Specify the crop variety and estimated volume to sell.",
      realPhotoLoaded: "Real photo loaded • Ready for multi-angle AI grading",
      opencvGateTitle: "OpenCV Image Quality Pre-Flight Gate Telemetry",
      blurVariance: "Blur Laplacian Variance",
      exposureScore: "Exposure Mean Brightness",
      crateFraming: "Crate Edge Framing Score",
      gateStatus: "Quality Gate Status",
      uploadedImages: "Uploaded Harvest Images",
      aiQualityClassification: "AI Visual Quality Classification",
      visualParamsTitle: "Visual Parameters Evaluated",
      diameterLabel: "Diameter Uniformity",
      defectLabel: "Surface Defect Density",
      ripenessLabel: "Ripeness Stage",
      colorLabel: "Color Homogeneity",
      onlineAnalysis: "Online API Analysis (FastAPI Backend)",
      canvasAnalysis: "Offline In-Browser Canvas AI Simulation",
      mockBadge: "Simulation / Heuristic Analysis",
      step1Desc: "Capture 3 clear photos in natural light against the crate.",
      step3Desc: "Review AI estimated parameters and confirm to submit lot.",
      passStatus: "Passed Pre-Flight Gate",
      failStatus: "Gate Tolerance Alert",
    },
    voice: {
      title: "KrishiSetu Regional Voice & Chat Assistant",
      subtitle: "Live speech-to-text & AI agricultural advisory powered by Digital Bhashini",
      listening: "Listening to your voice... Speak now!",
      tapToSpeak: "Tap to Speak",
      stopListening: "Stop Listening",
      typePlaceholder: "Type your agricultural question here (or tap mic)...",
      askButton: "Ask AI",
      queryLabel: "Farmer Query",
      advisoryLabel: "KrishiSetu Advisory",
      repeatAudio: "Repeat Audio",
      close: "Close",
      sampleHeader: "Or Tap Sample Regional Queries:",
      speakingIndicator: "Speaking...",
      tapStopEvaluate: "Tap to stop & evaluate",
      pressMicToSpeak: "Press mic button and speak into your microphone",
      tapMicOrType: "Tap the mic button or type your question below.",
      languageLabel: "Language:",
      generalFallback: "Here is the agricultural advisory for your query:",
    },
    advisor: {
      title: "AI Sale & Timing Advisor",
      subtitle: "14-day price outlook (P10, P50, P90 quantiles) and scenario analysis for Baramati Cluster.",
      riskLabel: "Risk Appetite:",
      conservative: "Conservative",
      balanced: "Balanced",
      growth: "Growth",
      recommendedOutlook: "Recommended Outlook",
      waitDays: "Wait 3 to 5 Days",
      waitDaysDesc: "Supply dip in neighboring Solapur and Ahmednagar creates short-term price surge.",
      upsideEstimate: "+₹110/qtl estimated upside against today's spot rate",
      downsideRisk: "Downside Risk (P10):",
      confidenceLevel: "Confidence Level:",
      storageSpoilage: "Storage Spoilage Penalty:",
      preBookButton: "Pre-Book in Friday's Pune Pool",
      sellNow: "Sell Now (Today)",
      sellNowDesc: "Immediate spot liquidation at Baramati APMC. Eliminates post-harvest spoilage.",
      currentSpotRate: "Current spot benchmark rate",
      perishabilityExposure: "Perishability Exposure:",
      payoutTimeline: "Payout Timeline:",
      compareMandisButton: "Compare Spot Mandis",
      perishabilityTitle: "Important Perishability Constraint for Tomato:",
      perishabilityAlert: "Tomato is highly perishable. Without cold-chain reefer storage, ambient holding beyond 4-5 days causes exponential firmness loss and surface rot. The \"Store\" option is disabled unless verified cold storage access is available.",
      explainabilityTitle: "Why this recommendation? (Explainable AI Factors)",
      explainabilitySubtitle: "The LightGBM price forecast engine evaluated the following feature drivers for the Baramati cluster:",
      factor1: "Arrival Volume: Baramati daily arrivals dropped by 14% over the last 3 days due to seasonal picking gaps.",
      factor2: "Price Momentum (7-day lag): Modal price has climbed from ₹1,750 to ₹1,850/qtl (+5.7%).",
      factor3: "Pune Destination Spread: Pune Gultekdi currently commands a ₹300/qtl premium over local Baramati rates, comfortably covering the freight difference.",
      factor4: "Weather Factor: Clear road conditions along NH-65 guarantee uninterrupted transit.",
      chartTitle: "Price Trajectory (14-Day Quantile Band)",
      chartSubtitle: "Historical prices and P10 (Downside) - P50 (Expected) - P90 (Upside) outlook for Baramati Mandi",
      chartBadge: "Medium Confidence (78% Backtest Coverage)",
      expectedPriceLabel: "Expected Price (P50)",
      uncertaintyBandLabel: "Uncertainty Band (P10 - P90)",
      disclaimerText: "Decision support only — not a financial price guarantee. Verify current arrivals before dispatch.",
    },
    orders: {
      title: "My Crop Lots & Orders",
      subtitle: "Track lot progress from AI quality grading to FPO pooling and payment release.",
      createNewLot: "Create New Lot",
      noLotsFound: "No crop lots found",
      noLotsDesc: "Start by capturing photos and getting your crop graded.",
      startGradingNow: "Start Grading Now",
      lotId: "Lot ID",
      qrPass: "QR Code / Digital Pass",
      downloadWeighSlip: "Download Digital Weigh-Slip (PDF)",
      assignedPool: "Assigned Pool:",
      viewPoolDetails: "View Pool Details",
      joinPoolPrompt: "Ready for Pooling",
      viewSettlement: "View Settlement Receipt",
      readyForPooling: "Join an FPO Pool",
      statuses: {
        Draft: "Draft",
        Submitted: "Awaiting FPO Check",
        Verified: "FPO Verified",
        Pooled: "Pooled for Dispatch",
        Reserved: "Buyer Reserved",
        Dispatched: "In Transit",
        Delivered: "Delivered to Buyer",
        Accepted: "Settled & Paid",
        Paid: "Settled & Paid",
      },
    },
    pooling: {
      title: "FPO Group Pooling",
      subtitle: "Pool your verified harvest with other farmers to unlock bulk freight savings (up to 30%) and access wholesale institutional buyers.",
      selectLot: "Select Your Verified Lot to Pool:",
      poolSavingsBadge: "Freight Savings",
      targetProgress: "Capacity Filled",
      destination: "Destination Mandi",
      dispatchDate: "Scheduled Dispatch",
      joinPoolButton: "Join This Pool",
      joinedStatus: "Lot Allocated to Pool",
      poolFull: "Pool Full",
      noLotsToPool: "No unpooled verified lots available. Create or verify a crop lot first.",
      savingsDesc: "Savings compared to individual small-vehicle transport",
    },
    settlement: {
      title: "Settlement Receipts & Payout Audit",
      subtitle: "Transparent, verifiable digital receipts for completed transactions released through partner nodal accounts.",
      noSettlements: "No settlements available yet. Join an active pool and wait for buyer acceptance.",
      nodalPayoutReleased: "Nodal Payout Released",
      txnId: "Transaction ID",
      nodalRef: "Nodal Reference",
      netAmount: "Net Realized Amount",
      creditedBadge: "Direct Bank/UPI Credited",
      txnDate: "Transaction Date",
      grossValue: "Gross Value",
      freightDeduction: "Shared Freight Deduction",
      handlingDeduction: "Loading & Handling",
      apmcCommission: "APMC Commission (5%)",
      spoilageBuffer: "In-Transit Buffer (2%)",
      downloadSlip: "Download Digital Receipt (PDF)",
      viewEHR: "View Blockchain / Nodal Audit Log",
      escrowGuarantee: "Disbursed via authorized RBI nodal escrow partner under electronic mandate guidelines.",
    },
  },
  mr: {
    appName: "कृषीसेतू AI",
    tagline: "शेतकरी उत्पादक कंपनी (FPO) सहाय्यित बाजारपेठ जोडणी मंच",
    demoBadge: "स्मार्ट इंडिया हॅकाथॉन २०२६ डेमो",
    online: "ऑनलाइन",
    offline: "ऑफलाइन मोड",
    offlineNotice: "तुम्ही ऑफलाइन आहात. तुमचे पीक ड्राफ्ट सुरक्षितपणे साठवले आहेत आणि इंटरनेट आल्यावर आपोआप सिंक होतील.",
    offlineNoticeSub: "स्थानिक साठवणूक रांग सक्रिय आहे. तुम्ही लॉट तयार करू शकता व पूलमध्ये सामील होऊ शकता; नेटवर्क आल्यावर ते आपोआप सिंक होतील.",
    nav: {
      dashboard: "डॅशबोर्ड",
      gradeCrop: "पीक प्रतवारी",
      marketPrices: "बाजारभाव व नफा",
      saleAdvisor: "विक्री सल्लागार",
      pooling: "एकत्रित विक्री (पूल)",
      myOrders: "माझे ऑर्डर्स",
      settlement: "हिशोब व पावती",
      verifyLots: "लॉट पडताळणी",
      poolManagement: "पूल व्यवस्थापन",
      logistics: "वाहतूक नियोजन",
      buyers: "खरेदीदार",
      marketplace: "बाजारपेठ",
      myOffers: "माझ्या ऑफर्स",
      deliveryAcceptance: "डिलिव्हरी स्वीकृती",
      users: "वापरकर्ते",
      marketData: "बाजार माहिती",
      modelMonitoring: "मॉडेल निरीक्षण",
      logout: "लॉगआउट",
      navigationLabel: "नेव्हिगेशन मेनू",
      fpoTagline: "एफपीओ आणि बाजारपेठ जोडणी",
      pilotCluster: "पायलट: बारामती टोमॅटो क्लस्टर",
    },
    farmer: {
      greeting: "नमस्ते",
      startSelling: "विक्री सुरू करा",
      bestNet: "आजचा निव्वळ भाव",
      cropGrade: "पिकाचा अंदाजित दर्जा",
      poolProgress: "पूल भरण्याची स्थिती",
      pendingPayout: "प्रलंबित रक्कम",
      recentLots: "अलिकडील लॉट्स",
      nearbyMandis: "जवळचे बाजार",
      externalQualityDisclaimer: "फक्त बाह्य दृश्य प्रतवारी अंदाज; अधिकृत प्रयोगशाळा प्रमाणपत्र नाही.",
      forecastDisclaimer: "किंमत अंदाज हा संभाव्यता श्रेणीवर आधारित आहे, ही निश्चित हमी नाही.",
      onlineStatus: "ऑनलाइन • थेट बारामती एपीएमसी जोडणी",
      offlineStatus: "ऑफलाइन मोड • स्थानिकरित्या जतन केलेले",
      externalAIEstimate: "बाह्य दृश्य एआय अंदाज",
      releasedNodal: "नोडल खात्यात जमा",
      journeyTitle: "संपूर्ण बाजारपेठ विक्री प्रवास",
      journey1: "१. ३ फोटो काढा",
      journey2: "२. एआय प्रतवारी",
      journey3: "३. निव्वळ भाव तुलना",
      journey4: "४. एफपीओ पूल विक्री",
      journey5: "५. बँक खात्यात जमा",
      viewAllOrders: "सर्व ऑर्डर्स पहा",
      lotsDescription: "प्रणालीमधील तुमचे सक्रिय आणि पडताळलेले पीक लॉट्स",
      dailyRates: "टोमॅटोचे दैनिक बाजारभाव",
      footerDisclaimer: "अस्वीकरण: सर्व दर व शिफारसी प्रात्यक्षिक अंदाज आहेत, कोणतीही आर्थिक हमी नाही. हा SIH प्रोटोटाइप आहे.",
      noLots: "अजून कोणताही लॉट तयार केलेला नाही. सुरुवात करण्यासाठी \"विक्री सुरू करा\" वर क्लिक करा.",
    },
    fpo: {
      pendingVerification: "पडताळणीसाठी प्रलंबित लॉट्स",
      activePools: "सक्रिय पूल्स",
      scheduledDispatches: "नियोजित गाड्या",
      activeBuyers: "सक्रिय खरेदीदार",
      verifyAndApprove: "तपासा आणि मंजूर करा",
      rejectReturn: "नाकारा व परत पाठवा",
    },
    buyer: {
      browseVerified: "एफपीओने पडताळलेले शेतीमाल लॉट्स पहा",
      reserveLot: "लॉट आरक्षित करा",
      authorizedProtected: "पेमेंट अधिकृत (नोडल सुरक्षा)",
      acceptDelivery: "माल स्वीकारा",
      raiseDispute: "तक्रार नोंदवा",
    },
    actions: {
      saveDraft: "ड्राफ्ट जतन करा",
      sendForVerification: "एफपीओ पडताळणीसाठी पाठवा",
      joinPool: "या पूलमध्ये सामील व्हा",
      downloadReceipt: "पावती डाउनलोड करा",
      viewAuditLog: "नोंद वही पहा",
      analyzeCrop: "पीक तपासा",
    },
    market: {
      title: "बाजारभाव शोध आणि निव्वळ नफा कॅल्क्युलेटर",
      subtitle: "महाराष्ट्रातील अधिकृत पणन मंडळ व बाजार समित्यांचे आजचे ताजे दर. वाहतूक, हमाली आणि कमिशन वजा जाता तुमच्या हातात पडणारा खरा नफा तपासा.",
      commodity: "पीक निवडा:",
      all: "सर्व पिके",
      liveFeed: "थेट भाव अपडेट",
      calculatorTitle: "पारदर्शक निव्वळ नफा कॅल्क्युलेटर",
      calculatorSubtitle: "खर्च व कपातीचे तपशील:",
      batchQuantity: "एकूण माल (किग्रॅ)",
      freightRate: "वाहतूक दर (₹/किमी स्वतंत्र गाडी)",
      apmcCommission: "बाजार समिती कमिशन (५%)",
      handlingFee: "हमाली व तोलाई (₹)",
      packagingFee: "क्रेट्स व पॅकेजिंग (₹)",
      spoilageBuffer: "वाहतुकीतील संभाव्य घट (२%)",
      grossValue: "एकूण मूल्य (Gross)",
      freight: "वाहतूक खर्च (Freight)",
      handling: "हमाली व तोलाई",
      cratesPackaging: "क्रेट्स व पॅकेजिंग",
      commission: "बाजार समिती कमिशन",
      spoilage: "संभाव्य नुकसान बफर",
      takeHome: "हातात मिळणारा निव्वळ नफा",
      modalPrice: "सरासरी भाव / क्विंटल",
      range: "किमान - कमाल",
      arrivals: "दैनिक आवक",
      bestNetTag: "सर्वोत्तम निव्वळ नफा मिळणारे ठिकाण",
      freshToday: "आजचे ताजे भाव",
      distanceSuffix: "बारामतीपासून अंतर",
      crops: {
        Tomato: "टोमॅटो",
        Onion: "कांदा",
        Potato: "बटाटा",
        Pomegranate: "डाळिंब",
        "Green Chilli": "हिरवी मिरची",
        Soyabean: "सोयाबीन",
        All: "सर्व पिके",
      },
    },
    grade: {
      title: "एआय गुणवत्ता तपासणी व बहुकोनीय फोटो अपलोड",
      subtitle: "स्वयंचलित गुणवत्ता (आकार, एकसमानता, पक्वता) तपासण्यासाठी मार्गदर्शित ३ फोटो अपलोड करा.",
      step1: "१. बहुकोनीय फोटो अपलोड",
      step2: "२. एआय गुणवत्ता विश्लेषण",
      step3: "३. पडताळलेला लॉट सारांश",
      topTitle: "१. वरून घेतलेला फोटो (Top View)",
      topSub: "आकार व एकसमानता",
      topDesc: "व्यास एकसमानता, रंग आणि देठाचे आरोग्य तपासतो",
      sideTitle: "२. बाजूचा फोटो (Side View)",
      sideSub: "पक्वता व टणकपणा",
      sideDesc: "सालाचा पोत, टणकपणा आणि रंग स्थिती तपासतो",
      crateTitle: "३. क्रेटमधील भराव (Crate View)",
      crateSub: "क्रेट व्यापणे व दोष",
      crateDesc: "क्रेटमधील मालाचे प्रमाण, डाग व एकूण स्थिती तपासतो",
      tapToUpload: "फोटो अपलोड करा / कॅमेरा सुरू करा",
      replacePhoto: "फोटो बदला",
      cropType: "पिकाचा प्रकार",
      variety: "जात / व्हरायटी",
      quantity: "अंदाजित वजन (किग्रॅ)",
      runGrading: "एआय प्रतवारी सुरू करा",
      analyzing: "फोटोचे विश्लेषण सुरू आहे...",
      assignedGrade: "मिळालेला ग्रेड",
      confidence: "अचूकता विश्वास",
      uniformity: "रंग एकसमानता",
      firmness: "पक्वता स्थिती",
      createLot: "एफपीओ पूलिंगसाठी लॉट सबमिट करा",
      disclaimer: "केवळ बाह्य दृश्य प्रतवारी अंदाज. अंतिम पडताळणी एफपीओ संकलन केंद्रावर केली जाईल.",
      harvestWeight: "अंदाजित काढणी वजन (किग्रॅ)",
      harvestDate: "काढणीची तारीख",
      collectionCenter: "पसंतीचे एफपीओ संकलन केंद्र",
      nextPhotos: "पुढे: फोटो घ्या",
      back: "मागे जा",
      specifyInfo: "पिकाची जात आणि विक्रीसाठी अंदाजित वजन निवडा.",
      realPhotoLoaded: "खरा फोटो अपलोड झाला • एआय विश्लेषणासाठी सज्ज",
      opencvGateTitle: "ओपनसीव्ही प्रतिमा गुणवत्ता प्री-फ्लाइट चाचणी",
      blurVariance: "ब्लर लॅपलेशियन पातळी (Blur Score)",
      exposureScore: "प्रकाश ब्राइटनेस सरासरी",
      crateFraming: "क्रेट कडा फ्रेमिंग स्कोअर",
      gateStatus: "गुणवत्ता गेट स्थिती",
      uploadedImages: "अपलोड केलेले पीक फोटो",
      aiQualityClassification: "एआय दृश्य गुणवत्ता वर्गीकरण",
      visualParamsTitle: "तपासलेले दृश्य मापदंड",
      diameterLabel: "आकार / व्यास एकरूपता",
      defectLabel: "पृष्ठभागावरील डाग / दोष",
      ripenessLabel: "परिपक्वता / पिकण्याची अवस्था",
      colorLabel: "रंग एकरूपता",
      onlineAnalysis: "ऑनलाइन एपीआय विश्लेषण (FastAPI बॅकएंड)",
      canvasAnalysis: "ऑफलाइन इन-ब्राउझर कॅनव्हास एआय विश्लेषण",
      mockBadge: "सिम्युलेशन / अंदाजित विश्लेषण",
      step1Desc: "नैसर्गिक प्रकाशात क्रेटमध्ये ३ स्पष्ट फोटो काढा.",
      step3Desc: "एआयने तपासलेले मापदंड पहा आणि लॉट सबमिट करा.",
      passStatus: "गुणवत्ता गेट उत्तीर्ण",
      failStatus: "गुणवत्ता सूचना",
    },
    voice: {
      title: "कृषीसेतू प्रादेशिक व्हॉइस आणि चॅट सहाय्यक",
      subtitle: "थेट आवाजाद्वारे प्रश्न विचारा व कृषी सल्ला मिळवा (डिजिटल भाषिणी आधारित)",
      listening: "तुमचा आवाज ऐकत आहे... बोला!",
      tapToSpeak: "बोलण्यासाठी टॅप करा",
      stopListening: "थांबवा",
      typePlaceholder: "येथे तुमचा शेतीविषयक प्रश्न लिहा (किंवा माइक दाबा)...",
      askButton: "विचारा",
      queryLabel: "शेतकऱ्याचा प्रश्न",
      advisoryLabel: "कृषीसेतू सल्ला",
      repeatAudio: "पुन्हा ऐका",
      close: "बंद करा",
      sampleHeader: "किंवा खालील नमुना प्रश्न निवडा:",
      speakingIndicator: "बोलत आहे...",
      tapStopEvaluate: "थांबवण्यासाठी व विचारण्यासाठी टॅप करा",
      pressMicToSpeak: "माइक बटण दाबा आणि तुमच्या आवाजात बोला",
      tapMicOrType: "माइक बटण दाबा किंवा खाली तुमचा प्रश्न टाईप करा.",
      languageLabel: "भाषा:",
      generalFallback: "तुमच्या प्रश्नासाठी कृषी सल्ला खालीलप्रमाणे आहे:",
    },
    advisor: {
      title: "एआय विक्री व वेळ सल्लागार",
      subtitle: "बारामती क्लस्टरसाठी १४ दिवसांचा किंमत कल (P10, P50, P90 अंदाज) आणि परिस्थिती विश्लेषण.",
      riskLabel: "जोखीम प्राधान्य:",
      conservative: "सुरक्षित (कमी जोखीम)",
      balanced: "संतुलित",
      growth: "जास्त नफा (वाढ)",
      recommendedOutlook: "शिफारस केलेला निर्णय",
      waitDays: "३ ते ५ दिवस थांबावे",
      waitDaysDesc: "सोलापूर आणि अहमदनगरमधील आवक कमी झाल्यामुळे अल्प मुदतीत भाव वाढण्याची दाट शक्यता.",
      upsideEstimate: "आजच्या स्पॉट दरापेक्षा +₹११०/क्विंटल अंदाजित नफा",
      downsideRisk: "संभाव्य किमान दर (P10):",
      confidenceLevel: "विश्वास पातळी:",
      storageSpoilage: "साठवणूक घट अंदाज:",
      preBookButton: "शुक्रवारच्या पुणे पूलमध्ये प्री-बुक करा",
      sellNow: "आजच विक्री करा (Sell Now)",
      sellNowDesc: "बारामती बाजार समितीत त्वरित रोख विक्री. साठवणुकीतील मालाची घट टळेल.",
      currentSpotRate: "आजचा चालू स्पॉट दर",
      perishabilityExposure: "नाशवंतपणा जोखीम:",
      payoutTimeline: "पेमेंट मिळण्याचा कालावधी:",
      compareMandisButton: "जवळच्या बाजारांचे भाव तपासा",
      perishabilityTitle: "टोमॅटो पिकासाठी महत्त्वाची नाशवंत मर्यादा:",
      perishabilityAlert: "टोमॅटो हे अत्यंत नाशवंत पीक आहे. कोल्ड-स्टोरेज शिवाय सामान्य तापमानात ४-५ दिवसांपेक्षा जास्त ठेवल्यास टणकपणा कमी होतो व डाग पडतात. वातानुकूलित साठवणूक नसल्यास जास्त काळ थांबू नये.",
      explainabilityTitle: "हीच शिफारस का? (एआयचे प्रमुख घटक)",
      explainabilitySubtitle: "लाइटजीबीएम (LightGBM) मॉडेलने बारामती परिसरासाठी खालील घटकांचे विश्लेषण केले:",
      factor1: "आवक प्रमाण: मागील ३ दिवसांत बारामतीतील दैनिक आवक १४% ने घटली आहे.",
      factor2: "किंमत वेग (७ दिवसांचा कल): सरासरी भाव ₹१,७५० वरून ₹१,८५०/क्विंटल (+५.७%) वर पोहोचला आहे.",
      factor3: "पुणे बाजारातील तफावत: पुणे गुलटेकडी येथे स्थानिक बारामतीपेक्षा ₹३००/क्विंटल जास्त दर असून वाहतूक खर्च भरून चांगला नफा मिळतो.",
      factor4: "हवामान व रस्ता: राष्ट्रीय महामार्ग ६५ वर वाहतूक सुरळीत राहण्याचा अंदाज आहे.",
      chartTitle: "किंमत अंदाज आलेख (१४ दिवसांचा संभाव्यता पट्टा)",
      chartSubtitle: "बारामती बाजार समितीसाठी मागील दर आणि P10 (किमान) - P50 (अपेक्षित) - P90 (कमाल) कल",
      chartBadge: "मध्यम-उच्च अचूकता (७८% बॅकटेस्ट व्याप्ती)",
      expectedPriceLabel: "अपेक्षित दर (P50)",
      uncertaintyBandLabel: "संभाव्यता पट्टा (P10 - P90)",
      disclaimerText: "केवळ निर्णय सहाय्यासाठी — कोणतीही आर्थिक हमी नाही. माल पाठवण्यापूर्वी आजची आवक तपासा.",
    },
    orders: {
      title: "माझे पीक लॉट्स आणि ऑर्डर्स",
      subtitle: "एआय गुणवत्ता प्रतवारीपासून ते एफपीओ पूलिंग आणि बँक खात्यात पैसे मिळेपर्यंतचा प्रवास.",
      createNewLot: "नवीन लॉट तयार करा",
      noLotsFound: "कोणताही पीक लॉट आढळला नाही",
      noLotsDesc: "फोटो काढून तुमच्या पिकाची एआय प्रतवारी करून सुरुवात करा.",
      startGradingNow: "आत्ताच प्रतवारी करा",
      lotId: "लॉट क्रमांक",
      qrPass: "क्यूआर कोड / डिजिटल पास",
      downloadWeighSlip: "वजन पावती डाउनलोड करा (PDF)",
      assignedPool: "जोडलेला पूल:",
      viewPoolDetails: "पूल तपशील पहा",
      joinPoolPrompt: "पूलिंगसाठी तयार",
      viewSettlement: "पेमेंट पावती पहा",
      readyForPooling: "एफपीओ पूलमध्ये जोडा",
      statuses: {
        Draft: "ड्राफ्ट (अपूर्ण)",
        Submitted: "एफपीओ तपासणी प्रलंबित",
        Verified: "एफपीओ पडताळणी पूर्ण",
        Pooled: "गाडीत एकत्रित (पूल)",
        Reserved: "खरेदीदाराने आरक्षित केले",
        Dispatched: "वाहतुकीत (रस्त्यावर)",
        Delivered: "खरेदीदाराला पोहोचले",
        Accepted: "स्वीकृत व पैसे जमा",
        Paid: "स्वीकृत व पैसे जमा",
      },
    },
    pooling: {
      title: "एफपीओ एकत्रित विक्री (पूलिंग)",
      subtitle: "इतर शेतकऱ्यांसोबत मिळून माल पाठवा आणि मालवाहतूक भाड्यात ३०% पर्यंत बचत मिळवा.",
      selectLot: "पूल करण्यासाठी तुमचा पडताळलेला लॉट निवडा:",
      poolSavingsBadge: "भाडे बचत",
      targetProgress: "गाडी भरण्याची स्थिती",
      destination: "जाण्याचे ठिकाण (बाजार समिती)",
      dispatchDate: "गाडी सुटण्याची तारीख",
      joinPoolButton: "या पूलमध्ये सामील व्हा",
      joinedStatus: "लॉट पूलमध्ये जोडला गेला",
      poolFull: "पूल पूर्ण भरला आहे",
      noLotsToPool: "पूल करण्यासाठी कोणताही पडताळलेला लॉट उपलब्ध नाही. आधी लॉट तयार करा किंवा पडताळणी करा.",
      savingsDesc: "स्वतंत्र लहान गाडीपेक्षा एकत्रित भाड्यातील थेट बचत",
    },
    settlement: {
      title: "हिशोब व पेमेंट पावत्या",
      subtitle: "अधिकृत आरबीआय नोडल बँक खात्याद्वारे सुरक्षित हस्तांतरित झालेल्या व्यवहारांच्या डिजिटल पावत्या.",
      noSettlements: "अद्याप कोणताही हिशोब उपलब्ध नाही. चालू पूलमध्ये सहभागी व्हा व खरेदीदाराच्या पोच पावतीची वाट पहा.",
      nodalPayoutReleased: "नोडल खात्यातून रक्कम जमा झाली",
      txnId: "व्यवहार क्रमांक (Txn ID)",
      nodalRef: "नोडल संदर्भ क्रमांक",
      netAmount: "हातात जमा झालेली निव्वळ रक्कम",
      creditedBadge: "थेट बँक / यूपीआय जमा",
      txnDate: "व्यवहाराची तारीख",
      grossValue: "एकूण मूल्य (Gross Value)",
      freightDeduction: "एकत्रित वाहतूक भाडे कपात",
      handlingDeduction: "हमाली व तोलाई खर्च",
      apmcCommission: "बाजार समिती कमिशन (५%)",
      spoilageBuffer: "मार्ग घट बफर (२%)",
      downloadSlip: "डिजिटल पावती डाउनलोड करा (PDF)",
      viewEHR: "ब्लॉकचेन / नोडल ऑडिट लॉग पहा",
      escrowGuarantee: "आरबीआय मान्यताप्राप्त नोडल एस्क्रो खात्याद्वारे ई-मँडेट नियमांनुसार थेट बँक खात्यात वितरित.",
    },
  },
  hi: {
    appName: "कृषिसेतु AI",
    tagline: "एफपीओ-सहायता प्राप्त किसान बाजार-संपर्क एवं मूल्य खोज मंच",
    demoBadge: "स्मार्ट इंडिया हैकाथॉन 2026 डेमो",
    online: "ऑनलाइन",
    offline: "ऑफलाइन मोड",
    offlineNotice: "आप ऑफलाइन हैं। आपके ड्राफ्ट स्थानीय रूप से सुरक्षित हैं और नेटवर्क आने पर अपने आप सिंक हो जाएंगे।",
    offlineNoticeSub: "स्थानीय स्टोरेज कतार सक्रिय है। आप लॉट बना सकते हैं और पूल में शामिल हो सकते हैं; इंटरनेट आने पर वे सिंक हो जाएंगे।",
    nav: {
      dashboard: "डैशबोर्ड",
      gradeCrop: "फसल ग्रेडिंग",
      marketPrices: "मंडी भाव एवं मुनाफा",
      saleAdvisor: "बिक्री सलाहकार",
      pooling: "पूलिंग (समूह)",
      myOrders: "मेरे ऑर्डर्स",
      settlement: "भुगतान रसीद",
      verifyLots: "लॉट सत्यापन",
      poolManagement: "पूल प्रबंधन",
      logistics: "लॉजिस्टिक्स",
      buyers: "खरीदार",
      marketplace: "मार्केटप्लेस",
      myOffers: "मेरे प्रस्ताव",
      deliveryAcceptance: "डिलीवरी स्वीकार",
      users: "उपयोगकर्ता",
      marketData: "मंडी डेटा",
      modelMonitoring: "मॉडल निगरानी",
      logout: "लॉगआउट",
      navigationLabel: "नेविगेशन मेनू",
      fpoTagline: "एफपीओ एवं बाजार संपर्क",
      pilotCluster: "पायलट: बारामती टमाटर क्लस्टर",
    },
    farmer: {
      greeting: "नमस्ते",
      startSelling: "बेचना शुरू करें",
      bestNet: "आज का शुद्ध भाव",
      cropGrade: "फसल का ग्रेड",
      poolProgress: "सक्रिय पूल प्रगति",
      pendingPayout: "बकाया भुगतान",
      recentLots: "हाल के लॉट",
      nearbyMandis: "निकटतम मंडियां",
      externalQualityDisclaimer: "केवल बाहरी दृश्य-गुणवत्ता का अनुमान; कोई प्रयोगशाला प्रमाणन नहीं।",
      forecastDisclaimer: "मूल्य दृष्टिकोण संभाव्यता सीमा पर आधारित है, कोई वित्तीय गारंटी नहीं।",
      onlineStatus: "ऑनलाइन • बारामती एपीएमसी लाइव कनेक्टेड",
      offlineStatus: "ऑफलाइन मोड • स्थानीय रूप से सुरक्षित",
      externalAIEstimate: "बाहरी दृश्य एआई अनुमान",
      releasedNodal: "नोडल खाते में जारी",
      journeyTitle: "सम्पूर्ण बाजार संपर्क यात्रा",
      journey1: "1. 3 फोटो खींचें",
      journey2: "2. एआई ग्रेडिंग",
      journey3: "3. शुद्ध भाव तुलना",
      journey4: "4. एफपीओ समूह पूलिंग",
      journey5: "5. सीधा बैंक भुगतान",
      viewAllOrders: "सभी ऑर्डर्स देखें",
      lotsDescription: "सिस्टम में आपके सक्रिय और सत्यापित फसल लॉट",
      dailyRates: "टमाटर के दैनिक बाजार भाव",
      footerDisclaimer: "अस्वीकरण: सभी मूल्य और सिफारिशें डेमो अनुमान हैं, कोई वित्तीय गारंटी नहीं। यह SIH प्रोटोटाइप है।",
      noLots: "अभी तक कोई लॉट नहीं बनाया गया है। शुरुआत करने के लिए \"बेचना शुरू करें\" पर क्लिक करें।",
    },
    fpo: {
      pendingVerification: "सत्यापन हेतु लंबित लॉट",
      activePools: "सक्रिय पूल",
      scheduledDispatches: "निर्धारित डिस्पैच",
      activeBuyers: "सत्यापित खरीदार",
      verifyAndApprove: "सत्यापित और स्वीकृत करें",
      rejectReturn: "अस्वीकार करें",
    },
    buyer: {
      browseVerified: "एफपीओ द्वारा सत्यापित लॉट देखें",
      reserveLot: "लॉट आरक्षित करें",
      authorizedProtected: "सुरक्षित भुगतान अधिकृत",
      acceptDelivery: "डिलीवरी स्वीकार करें",
      raiseDispute: "विवाद दर्ज करें",
    },
    actions: {
      saveDraft: "ड्राफ्ट सहेजें",
      sendForVerification: "एफपीओ सत्यापन हेतु भेजें",
      joinPool: "इस पूल में जुड़ें",
      downloadReceipt: "रसीद डाउनलोड करें",
      viewAuditLog: "ऑडिट लॉग देखें",
      analyzeCrop: "फसल जांचें",
    },
    market: {
      title: "मंडी भाव खोज एवं शुद्ध आय कैलकुलेटर",
      subtitle: "महाराष्ट्र भर के प्रामाणिक एग्मार्कनेट और एमएसएएमबी दैनिक बुलेटिन। मालभाड़ा, पल्लेदारी और कमीशन काटकर अपनी वास्तविक शुद्ध आय जानें।",
      commodity: "फसल / कमोडिटी:",
      all: "सभी फसलें",
      liveFeed: "लाइव मंडी भाव अपडेट",
      calculatorTitle: "पारदर्शी शुद्ध आय कैलकुलेटर",
      calculatorSubtitle: "कटौती और खर्च विवरण:",
      batchQuantity: "फसल की कुल मात्रा (किग्रा)",
      freightRate: "मालभाड़ा दर (₹/किमी)",
      apmcCommission: "मंडी कमीशन (5%)",
      handlingFee: "पल्लेदारी व मजदूरी (₹)",
      packagingFee: "क्रेट्स व पैकेजिंग (₹)",
      spoilageBuffer: "रास्ते में टूट-फूट नुकसान (2%)",
      grossValue: "सकल मूल्य (Gross Value)",
      freight: "मालभाड़ा खर्च (Freight)",
      handling: "पल्लेदारी व मजदूरी",
      cratesPackaging: "क्रेट्स एवं पैकेजिंग",
      commission: "मंडी आढ़त कमीशन (5%)",
      spoilage: "मार्ग नुकसान बफर (2%)",
      takeHome: "हाथ में आने वाली शुद्ध राशि",
      modalPrice: "मॉडल भाव / क्विंटल",
      range: "भाव सीमा",
      arrivals: "दैनिक आवक",
      bestNetTag: "सर्वोत्तम शुद्ध आय परिणाम",
      freshToday: "आज का ताजा भाव",
      distanceSuffix: "बारामती से दूरी",
      crops: {
        Tomato: "टमाटर",
        Onion: "प्याज",
        Potato: "आलू",
        Pomegranate: "अनार",
        "Green Chilli": "हरी मिर्च",
        Soyabean: "सोयाबीन",
        All: "सभी फसलें",
      },
    },
    grade: {
      title: "एआई फसल ग्रेडिंग एवं मल्टी-एंगल फोटो जांच",
      subtitle: "स्वचालित दृश्य गुणवत्ता (आकार, एकरूपता, परिपक्वता) जांच के लिए 3 फोटो अपलोड करें।",
      step1: "1. मल्टी-एंगल फोटो अपलोड",
      step2: "2. एआई गुणवत्ता विश्लेषण",
      step3: "3. सत्यापित लॉट सारांश",
      topTitle: "1. ऊपर से फोटो (Top View)",
      topSub: "आकार एवं एकरूपता",
      topDesc: "व्यास एकरूपता, रंग एवं डंठल स्वास्थ्य की जांच",
      sideTitle: "2. साइड प्रोफाइल (Side View)",
      sideSub: "परिपक्वता एवं दृढ़ता",
      sideDesc: "छिलके की बनावट, कसावट एवं पकने के चरण की जांच",
      crateTitle: "3. क्रेट में थोक दृश्य (Crate View)",
      crateSub: "थोक भराव एवं सतह",
      crateDesc: "क्रेट भराव, सतह के दोष एवं समग्र स्थिति की जांच",
      tapToUpload: "फोटो चुनें या कैमरे से खींचें",
      replacePhoto: "फोटो बदलें",
      cropType: "फसल का प्रकार",
      variety: "किस्म / वैरायटी",
      quantity: "अनुमानित मात्रा (किग्रा)",
      runGrading: "एआई ग्रेडिंग शुरू करें",
      analyzing: "छवियों का विश्लेषण हो रहा है...",
      assignedGrade: "निर्धारित ग्रेड",
      confidence: "विश्वास स्कोर",
      uniformity: "रंग एकरूपता",
      firmness: "परिपक्वता चरण",
      createLot: "एफपीओ पूलिंग के लिए लॉट जमा करें",
      disclaimer: "केवल बाहरी दृश्य गुणवत्ता का अनुमान। अंतिम सत्यापन एफपीओ संकलन केंद्र पर किया जाएगा।",
      harvestWeight: "अनुमानित फसल वजन (किग्रा)",
      harvestDate: "कटाई की तिथि",
      collectionCenter: "पसंदीदा एफपीओ संकलन केंद्र",
      nextPhotos: "आगे: फोटो लें",
      back: "पीछे जाएं",
      specifyInfo: "फसल की किस्म और बिक्री के लिए अनुमानित वजन चुनें।",
      realPhotoLoaded: "वास्तविक फोटो अपलोड हुआ • एआई जांच के लिए तैयार",
      opencvGateTitle: "ओपनसीवी छवि गुणवत्ता प्री-फ्लाइट टेलीमेट्री",
      blurVariance: "ब्लर लैपलेशियन स्कोर",
      exposureScore: "एक्सपोजर ब्राइटनेस स्तर",
      crateFraming: "क्रेट एज फ्रेमिंग स्कोर",
      gateStatus: "क्वालिटी गेट स्थिति",
      uploadedImages: "अपलोड किए गए फसल फोटो",
      aiQualityClassification: "एआई दृश्य गुणवत्ता वर्गीकरण",
      visualParamsTitle: "जांचे गए दृश्य मापदंड",
      diameterLabel: "व्यास / आकार एकरूपता",
      defectLabel: "सतह के दोष / धब्बे",
      ripenessLabel: "परिपक्वता / पकने की अवस्था",
      colorLabel: "रंग एकरूपता",
      onlineAnalysis: "ऑनलाइन एपीआई विश्लेषण (FastAPI बैकएंड)",
      canvasAnalysis: "ऑफलाइन इन-ब्राउज़र कैनवास एआई सिमुलेशन",
      mockBadge: "सिमुलेशन / अनुमानित विश्लेषण",
      step1Desc: "प्राकृतिक रोशनी में क्रेट में 3 स्पष्ट फोटो खींचें।",
      step3Desc: "एआई द्वारा निकाले गए मापदंड जांचें और लॉट सबमिट करें।",
      passStatus: "क्वालिटी गेट उत्तीर्ण",
      failStatus: "गुणवत्ता चेतावनी",
    },
    voice: {
      title: "कृषिसेतु क्षेत्रीय वॉइस एवं चैट सहायक",
      subtitle: "लाइव भाषण और एआई कृषि सलाहकार (डिजिटल भाषिणी संचालित)",
      listening: "आपकी आवाज़ सुन रहे हैं... बोलिए!",
      tapToSpeak: "बोलने के लिए टैप करें",
      stopListening: "रुकें",
      typePlaceholder: "यहाँ अपना कृषि प्रश्न लिखें या माइक दबाएं...",
      askButton: "पूछें",
      queryLabel: "किसान का प्रश्न",
      advisoryLabel: "कृषिसेतु सलाह",
      repeatAudio: "दोबारा सुनें",
      close: "बंद करें",
      sampleHeader: "या नीचे दिए गए नमूना प्रश्न चुनें:",
      speakingIndicator: "बोल रहे हैं...",
      tapStopEvaluate: "रोकने और पूछने के लिए टैप करें",
      pressMicToSpeak: "माइक बटन दबाएं और अपनी आवाज में बोलें",
      tapMicOrType: "माइक बटन दबाएं या नीचे अपना प्रश्न लिखें।",
      languageLabel: "भाषा:",
      generalFallback: "आपके प्रश्न के लिए कृषि सलाह निम्नलिखित है:",
    },
    advisor: {
      title: "एआई फसल बिक्री एवं समय सलाहकार",
      subtitle: "बारामती क्लस्टर के लिए 14-दिवसीय मूल्य दृष्टिकोण (P10, P50, P90 परिदृश्य) और बाजार विश्लेषण।",
      riskLabel: "जोखिम पसंद:",
      conservative: "सुरक्षित (कम जोखिम)",
      balanced: "संतुलित",
      growth: "उच्च लाभ (वृद्धि)",
      recommendedOutlook: "अनुशंसित दृष्टिकोण",
      waitDays: "3 से 5 दिन रुकें",
      waitDaysDesc: "सोलापुर और अहमदनगर में आवक कम होने से अल्पकालिक मूल्य वृद्धि की संभावना है।",
      upsideEstimate: "आज के स्पॉट भाव की तुलना में +₹110/क्विंटल अनुमानित लाभ",
      downsideRisk: "संभावित न्यूनतम भाव (P10):",
      confidenceLevel: "विश्वास स्तर:",
      storageSpoilage: "भंडारण हानि कटौती:",
      preBookButton: "शुक्रवार के पुणे पूल में प्री-बुक करें",
      sellNow: "आज ही बेचें (Sell Now)",
      sellNowDesc: "बारामती एपीएमसी में तत्काल नकद बिक्री। कटाई के बाद खराब होने का शून्य जोखिम।",
      currentSpotRate: "वर्तमान हाजिर बेंचमार्क दर",
      perishabilityExposure: "खराब होने का जोखिम:",
      payoutTimeline: "भुगतान समयसीमा:",
      compareMandisButton: "मंडी भावों की तुलना करें",
      perishabilityTitle: "टमाटर के लिए महत्वपूर्ण भंडारण सीमा:",
      perishabilityAlert: "टमाटर अत्यधिक नाशवान है। बिना कोल्ड-स्टोरेज के 4-5 दिनों से अधिक रखने पर कसावट कम हो जाती है और सड़न पैदा होती है। कोल्ड स्टोरेज न होने पर अधिक दिन न रोकें।",
      explainabilityTitle: "यह सिफारिश क्यों? (एआई व्याख्या कारक)",
      explainabilitySubtitle: "लाइटजीबीएम (LightGBM) मॉडल ने बारामती क्षेत्र के लिए निम्नलिखित कारकों का विश्लेषण किया:",
      factor1: "आवक की मात्रा: पिछले 3 दिनों में बारामती में दैनिक आवक 14% तक घट गई है।",
      factor2: "मूल्य गति (7-दिवसीय रुझान): मॉडल भाव ₹1,750 से बढ़कर ₹1,850/क्विंटल (+5.7%) हो गया है।",
      factor3: "पुणे मंडी का अंतर: पुणे गुलटेकडी में बारामती से ₹300/क्विंटल अधिक भाव है, जो भाड़ा खर्च के बाद भी शुद्ध लाभ देता है।",
      factor4: "मौसम और मार्ग: राष्ट्रीय राजमार्ग 65 पर मौसम साफ है और यातायात सुगम रहेगा।",
      chartTitle: "मूल्य दृष्टिकोण चार्ट (14-दिवसीय क्वांटाइल बैंड)",
      chartSubtitle: "बारामती मंडी के लिए ऐतिहासिक मूल्य और P10 (न्यूनतम) - P50 (अपेक्षित) - P90 (अधिकतम) दृष्टिकोण",
      chartBadge: "मध्यम-उच्च विश्वास (78% बैकटेस्ट कवरेज)",
      expectedPriceLabel: "अपेक्षित मूल्य (P50)",
      uncertaintyBandLabel: "अनिश्चितता सीमा (P10 - P90)",
      disclaimerText: "केवल निर्णय सहायता के लिए — कोई वित्तीय मूल्य गारंटी नहीं। माल भेजने से पहले दैनिक आवक जांचें।",
    },
    orders: {
      title: "मेरे फसल लॉट और ऑर्डर्स",
      subtitle: "एआई गुणवत्ता ग्रेडिंग से लेकर एफपीओ पूलिंग और बैंक भुगतान तक की पूरी यात्रा।",
      createNewLot: "नया लॉट बनाएं",
      noLotsFound: "कोई फसल लॉट नहीं मिला",
      noLotsDesc: "फोटो खींचकर अपनी फसल का एआई ग्रेडिंग कराएं।",
      startGradingNow: "अभी ग्रेडिंग करें",
      lotId: "लॉट आईडी",
      qrPass: "क्यूआर कोड / डिजिटल पास",
      downloadWeighSlip: "वजन रसीद डाउनलोड करें (PDF)",
      assignedPool: "आवंटित पूल:",
      viewPoolDetails: "पूल विवरण देखें",
      joinPoolPrompt: "पूलिंग के लिए तैयार",
      viewSettlement: "भुगतान रसीद देखें",
      readyForPooling: "एफपीओ पूल में शामिल हों",
      statuses: {
        Draft: "ड्राफ्ट",
        Submitted: "एफपीओ सत्यापन लंबित",
        Verified: "एफपीओ सत्यापित",
        Pooled: "डिस्पैच हेतु पूल्ड",
        Reserved: "खरीदार द्वारा आरक्षित",
        Dispatched: "रास्ते में (ट्रांजिट)",
        Delivered: "खरीदार को डिलीवर हुआ",
        Accepted: "स्वीकृत व भुगतान पूर्ण",
        Paid: "स्वीकृत व भुगतान पूर्ण",
      },
    },
    pooling: {
      title: "एफपीओ सामूहिक पूलिंग",
      subtitle: "अन्य किसानों के साथ मिलकर फसल भेजें और मालभाड़े में 30% तक की बचत प्राप्त करें।",
      selectLot: "पूलिंग के लिए अपना सत्यापित लॉट चुनें:",
      poolSavingsBadge: "भाड़ा बचत",
      targetProgress: "क्षमता भराव",
      destination: "गंतव्य मंडी",
      dispatchDate: "निर्धारित डिस्पैच तिथि",
      joinPoolButton: "इस पूल में जुड़ें",
      joinedStatus: "लॉट पूल में शामिल हो गया",
      poolFull: "पूल पूरी तरह भर चुका है",
      noLotsToPool: "पूल करने के लिए कोई असंबद्ध सत्यापित लॉट उपलब्ध नहीं है। पहले लॉट बनाएं या सत्यापन कराएं।",
      savingsDesc: "अकेले वाहन की तुलना में सामूहिक मालभाड़ा बचत",
    },
    settlement: {
      title: "भुगतान रसीदें एवं ऑडिट",
      subtitle: "साझेदार नोडल खातों के माध्यम से जारी किए गए पूर्ण लेन-देन की पारदर्शी और सत्यापित डिजिटल रसीदें।",
      noSettlements: "अभी तक कोई रसीद उपलब्ध नहीं है। सक्रिय पूल में शामिल हों और खरीदार की स्वीकृति की प्रतीक्षा करें।",
      nodalPayoutReleased: "नोडल खाते से भुगतान जारी हुआ",
      txnId: "लेनदेन आईडी (Txn ID)",
      nodalRef: "नोडल संदर्भ",
      netAmount: "हाथ में आने वाली शुद्ध राशि",
      creditedBadge: "सीधा बैंक / यूपीआई क्रेडिट",
      txnDate: "लेनदेन की तिथि",
      grossValue: "सकल मूल्य (Gross Value)",
      freightDeduction: "सामूहिक मालभाड़ा कटौती",
      handlingDeduction: "पल्लेदारी व मजदूरी खर्च",
      apmcCommission: "मंडी कमीशन (5%)",
      spoilageBuffer: "मार्ग नुकसान बफर (2%)",
      downloadSlip: "डिजिटल रसीद डाउनलोड करें (PDF)",
      viewEHR: "ब्लॉकचेन / नोडल ऑडिट लॉग देखें",
      escrowGuarantee: "आरबीआई द्वारा विनियमित नोडल एस्क्रो खाते के माध्यम से इलेक्ट्रॉनिक अधिदेश दिशानिर्देशों के तहत सीधे बैंक खाते में भुगतान।",
    },
  },
};
