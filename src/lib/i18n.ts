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
  },
};
