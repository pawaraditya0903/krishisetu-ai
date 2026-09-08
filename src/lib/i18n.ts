export type Language = "en" | "mr" | "hi";

export interface Translations {
  appName: string;
  tagline: string;
  demoBadge: string;
  online: string;
  offline: string;
  offlineNotice: string;
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
    },
  },
  mr: {
    appName: "कृषीसेतू AI",
    tagline: "शेतकरी उत्पादक कंपनी (FPO) सहाय्यित बाजारपेठ जोडणी मंच",
    demoBadge: "स्मार्ट इंडिया हॅकाथॉन २०२६ डेमो",
    online: "ऑनलाइन",
    offline: "ऑफलाइन मोड",
    offlineNotice: "तुम्ही ऑफलाइन आहात. तुमचे पीक ड्राफ्ट सुरक्षितपणे साठवले आहेत आणि इंटरनेट आल्यावर आपोआप सिंक होतील.",
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
    },
    fpo: {
      pendingVerification: "पडताळणीसाठी प्रलंबित लॉट्स",
      activePools: "सक्रिय पूल",
      scheduledDispatches: "नियोजित वाहने",
      activeBuyers: "सक्रिय खरेदीदार",
      verifyAndApprove: "तपासा आणि मंजूर करा",
      rejectReturn: "नाकारा आणि परत पाठवा",
    },
    buyer: {
      browseVerified: "FPO प्रमाणित शेतीमाल खरेदी करा",
      reserveLot: "लॉट आरक्षित करा",
      authorizedProtected: "सुरक्षित पेमेंट अधिकृत केले",
      acceptDelivery: "डिलिव्हरी स्वीकारा",
      raiseDispute: "तक्रार नोंदवा",
    },
    actions: {
      saveDraft: "ड्राफ्ट जतन करा",
      sendForVerification: "FPO पडताळणीसाठी पाठवा",
      joinPool: "या पूलमधे सामील व्हा",
      downloadReceipt: "पावती डाउनलोड करा",
      viewAuditLog: "ऑडिट नोंद पहा",
      analyzeCrop: "पिकाची तपासणी करा",
    },
    market: {
      title: "बाजारभाव शोध व निव्वळ नफा गणक",
      subtitle: "महाराष्ट्रातील अधिकृत ॲगमार्कनेट व एमएसएएमबी दैनिक बुलेटिन. वाहतूक, हमाली व कमिशन वजा करून हाती मिळणारा खरा नफा जाणा.",
      commodity: "शेतमाल / पीक:",
      all: "सर्व पिके",
      liveFeed: "थेट बाजारभाव अपडेट",
      calculatorTitle: "पारदर्शक निव्वळ नफा गणक",
      calculatorSubtitle: "खर्च व वाहतूक तपशील:",
      batchQuantity: "मालाचे एकूण वजन (किग्रा)",
      freightRate: "वाहतूक दर (₹/किमी स्वतंत्र वाहन)",
      apmcCommission: "बाजार समिती कमिशन (५%)",
      handlingFee: "हमाली व तोलाई (₹)",
      packagingFee: "क्रेट्स व पॅकिंग (₹)",
      spoilageBuffer: "वाहतुकीतील नुकसान अंदाज (२%)",
      grossValue: "एकूण मूल्य (Gross Value)",
      freight: "वाहतूक खर्च (Freight)",
      handling: "हमाली व तोलाई खर्च",
      cratesPackaging: "क्रेट्स व पॅकेजिंग",
      commission: "बाजार समिती कमिशन (५%)",
      spoilage: "वाहतुकीतील घट/नुकसान (२%)",
      takeHome: "हाती मिळणारी निव्वळ रक्कम",
      modalPrice: "सरासरी भाव / क्विंटल",
      range: "दर श्रेणी",
      arrivals: "दैनिक आवक",
      bestNetTag: "सर्वोत्तम निव्वळ नफा देणारी बाजारपेठ",
      freshToday: "आजचे ताजे भाव",
      distanceSuffix: "बारामतीहून अंतर",
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
      title: "AI पीक प्रतवारी व ३-कोनीय फोटो तपासणी",
      subtitle: "स्वयंचलित दृश्य गुणवत्ता (आकार, एकसमानता, पक्वता) तपासणीसाठी मार्गदर्शित ३ फोटो अपलोड करा.",
      step1: "१. बहु-कोनीय फोटो अपलोड",
      step2: "२. AI गुणवत्ता विश्लेषण",
      step3: "३. प्रमाणित लॉट सारांश",
      topTitle: "१. वरून घेतलेला फोटो (Top View)",
      topSub: "आकार व एकसमानता",
      topDesc: "व्यास एकसमानता, खांद्याचा रंग व देठाची स्थिती तपासतो",
      sideTitle: "२. बाजूचा फोटो (Side View)",
      sideSub: "पक्वता व मजबुती",
      sideDesc: "त्वचेचा पोत, टणकपणा व पक्वता टप्पा तपासतो",
      crateTitle: "३. क्रेटमधील फोटो (Crate View)",
      crateSub: "एकूण माल भरणा",
      crateDesc: "क्रेट भरणा, पृष्ठभागावरील डाग व आकारमान तपासतो",
      tapToUpload: "फोटो निवडा किंवा कॅमेऱ्याने फोटो काढा",
      replacePhoto: "फोटो बदला",
      cropType: "पिकाचा प्रकार",
      variety: "वाण / जात",
      quantity: "अंदाजित वजन (किग्रा)",
      runGrading: "AI प्रतवारी विश्लेषण सुरू करा",
      analyzing: "फोटो विश्लेषण चालू आहे...",
      assignedGrade: "मिळालेला दर्जा (Grade)",
      confidence: "विश्वास अचूकता",
      uniformity: "रंग एकसमानता",
      firmness: "पक्वता स्थिती",
      createLot: "FPO पूलिंगसाठी लॉट सादर करा",
      disclaimer: "फक्त बाह्य दृश्य प्रतवारी अंदाज. अंतिम पडताळणी FPO संकलन केंद्रावर केली जाईल.",
    },
    voice: {
      title: "कृषीसेतू प्रादेशिक व्हॉइस व चॅट सहाय्यक",
      subtitle: "थेट आवाज व AI कृषी सल्लागार (डिजिटल भाषिणी आधारित)",
      listening: "तुमचा आवाज ऐकत आहे... आता बोला!",
      tapToSpeak: "बोलण्यासाठी टॅप करा",
      stopListening: "बोलणे थांबवा",
      typePlaceholder: "तुमचा प्रश्न येथे टाईप करा किंवा माईक दाबा...",
      askButton: "विचारा",
      queryLabel: "शेतकऱ्याचा प्रश्न",
      advisoryLabel: "कृषीसेतू सल्लागार",
      repeatAudio: "पुन्हा ऐका",
      close: "बंद करा",
      sampleHeader: "किंवा खालील नमुना प्रश्न निवडा:",
    },
  },
  hi: {
    appName: "कृषिसेतु AI",
    tagline: "एफपीओ-सहायता प्राप्त किसान बाजार-संपर्क एवं मूल्य खोज मंच",
    demoBadge: "स्मार्ट इंडिया हैकाथॉन 2026 डेमो",
    online: "ऑनलाइन",
    offline: "ऑफलाइन मोड",
    offlineNotice: "आप ऑफलाइन हैं। आपके ड्राफ्ट स्थानीय रूप से सुरक्षित हैं और नेटवर्क आने पर अपने आप सिंक हो जाएंगे।",
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
    },
  },
};
