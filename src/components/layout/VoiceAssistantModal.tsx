"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Volume2, Sparkles, MessageSquare, Globe, AlertCircle, Send, Bot, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { translations } from "@/lib/i18n";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface VoiceAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QAItem {
  lang: "mr" | "hi" | "en";
  question: string;
  response: string;
  actionHint?: string;
}

type SupportedLanguage = "mr-IN" | "hi-IN" | "en-IN";

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string; simpleCode: "mr" | "hi" | "en" }[] = [
  { code: "mr-IN", label: "मराठी (Marathi)", flag: "🚩", simpleCode: "mr" },
  { code: "hi-IN", label: "हिंदी (Hindi)", flag: "🇮🇳", simpleCode: "hi" },
  { code: "en-IN", label: "English (India)", flag: "🌐", simpleCode: "en" },
];

const LOCALIZED_SAMPLE_QUERIES: Record<"mr" | "hi" | "en", QAItem[]> = {
  mr: [
    {
      lang: "mr",
      question: "आज बारामती आणि पुण्यात टोमॅटोचा काय भाव चालू आहे?",
      response: "आज बारामती बाजारात टोमॅटोचा सरासरी भाव ₹१,८५०/क्विंटल आहे आणि पुणे गुलटेकडी बाजारात ₹२,१५०/क्विंटल आहे. वाहतूक खर्च वजा जाता पुण्यातील निव्वळ नफा जास्त आहे.",
      actionHint: "बाजारभाव पृष्ठावर जाऊन सविस्तर खर्च तपासा.",
    },
    {
      lang: "mr",
      question: "मी आज कांदा किंवा टोमॅटो विकावा की ३ दिवस थांबावे?",
      response: "AI विक्री सल्लागार: पुढील ३-५ दिवसांत आवक कमी राहण्याचा अंदाज असल्याने भाव ₹११०-₹१५० वाढू शकतात. सुरक्षित साठवणूक असल्यास थांबावे, अथवा आजच्या FPO पूलमध्ये सामील व्हावे.",
      actionHint: "विक्री सल्लागार पृष्ठावर जाऊन P10/P50/P90 आलेख पहा.",
    },
    {
      lang: "mr",
      question: "बारामतीत पुढील २ दिवसांत पाऊस पडेल का? हवामान कसे आहे?",
      response: "हवामान अंदाज: पुढील २४ ते ४८ तासांत बारामती व पुणे परिसरात आकाश मुख्यतः निरभ्र आणि कोरडे राहील. कमाल तापमान ३२°C आणि पाऊस पडण्याची शक्यता १०% पेक्षा कमी आहे. पीक काढणी व फवारणीसाठी हवामान अनुकूल आहे.",
      actionHint: "काढणी केलेला माल कोरड्या सावलीत साठवावा.",
    },
    {
      lang: "mr",
      question: "टोमॅटो पिकावर करपा आणि अळीसाठी कोणती फवारणी करावी?",
      response: "कीड व रोग सल्ला: करपा (Blight) नियंत्रणासाठी मँकोझेब (Mancozeb 2.5 ग्रॅ/लिटर) किंवा कॉपर ऑक्सिक्लोराईड फवारावे. नागअळी किंवा फळ पोखरणारी अळी असल्यास नीम तेल (5 मिली/लिटर) किंवा स्पिनोसॅडची फवारणी करावी.",
      actionHint: "फवारणी नेहमी सकाळी किंवा संध्याकाळी थंड वेळेत करावी.",
    },
    {
      lang: "mr",
      question: "मी पिकाची प्रतवारी (Grading) कॅमेऱ्याने कशी करू?",
      response: "पीक प्रतवारी पृष्ठावर जाऊन ३ फोटो काढा: १. वरून घेतलेला आकार तपासणी, २. बाजूचा पक्वता तपासणी, ३. क्रेटमधील भराव. आमचे AI मॉडेल त्वरित ग्रेड A, B किंवा C निश्चित करेल.",
      actionHint: "पीक प्रतवारी पृष्ठावर जाऊन फोटो अपलोड करा.",
    },
  ],
  hi: [
    {
      lang: "hi",
      question: "आज बारामती और पुणे मंडी में टमाटर और प्याज का क्या भाव है?",
      response: "आज बारामती मंडी में टमाटर का मॉडल भाव ₹1,850/क्विंटल है और पुणे गुलटेकडी में ₹2,150/क्विंटल है। प्याज लासलगांव में ₹1,650/क्विंटल पर बिक रहा है।",
      actionHint: "मंडी भाव पेज पर जाकर शुद्ध आय कैलकुलेटर देखें।",
    },
    {
      lang: "hi",
      question: "क्या मुझे आज फसल बेचनी चाहिए या 3 दिन रुकना चाहिए?",
      response: "एआई बिक्री सलाहकार: अगले 3-5 दिनों में आवक कम होने से भाव ₹100-₹150/क्विंटल बढ़ने का अनुमान है। यदि सुरक्षित भंडारण उपलब्ध है तो 3 दिन रुकना अधिक लाभकारी होगा।",
      actionHint: "बिक्री सलाहकार पेज पर 14-दिवसीय संभाव्यता चार्ट देखें।",
    },
    {
      lang: "hi",
      question: "आगामी दिनों में मौसम और बारिश का क्या पूर्वानुमान है?",
      response: "मौसम पूर्वानुमान: अगले 48 घंटों में बारामती और पश्चिमी महाराष्ट्र में मौसम साफ और धूप वाला रहेगा। अधिकतम तापमान 32°C रहेगा और बारिश की संभावना नगण्य है। कटाई और परिवहन के लिए मौसम उत्तम है।",
      actionHint: "धूप में कटाई के बाद फसल को हवादार छाया में रखें।",
    },
    {
      lang: "hi",
      question: "टमाटर में फल चमक और आकार बढ़ाने के लिए कौन सा खाद डालें?",
      response: "उर्वरक सलाह: फल विकास के समय पानी में घुलनशील 00:00:50 (पोटैशियम सल्फेट) 5 ग्राम/लीटर या ड्रिप से 4 किग्रा/एकड़ दें। इससे फलों में चमक, कसावट और ग्रेड 'A' आकार मिलता है।",
      actionHint: "ड्रिप सिंचाई के साथ संतुलित मात्रा में प्रयोग करें।",
    },
    {
      lang: "hi",
      question: "क्या पुणे जाने वाले एफपीओ पूल में जगह खाली है?",
      response: "हाँ! बारामती एफपीओ का 1,000 किग्रा का पुणे पूल खुला है जिसमें अभी 650 किग्रा भरा है। इसमें जुड़ने पर आपको 28.5% मालभाड़ा बचत मिलेगी।",
      actionHint: "पूलिंग टैब में जाकर तुरंत जुड़ें।",
    },
  ],
  en: [
    {
      lang: "en",
      question: "What are today's tomato and onion prices in Baramati vs Pune?",
      response: "Today, Baramati APMC cleared Tomato at a modal price of ₹1,850/qtl, while Pune Gultekdi reached ₹2,150/qtl. Onion at Lasalgaon is trading at ₹1,650/qtl.",
      actionHint: "Check the Market Prices calculator to evaluate net transport realization.",
    },
    {
      lang: "en",
      question: "Should I sell my tomato crop today or wait for 3 days?",
      response: "AI Sale Advisor: Daily arrivals are projected to tighten over the next 3-5 days, creating potential upside of ₹100-₹150/qtl. Holding for 3 days or joining Friday's FPO pool is optimal.",
      actionHint: "Visit Sale Advisor to inspect the P10/P50/P90 forecast curve.",
    },
    {
      lang: "en",
      question: "What is the 48-hour weather and rain forecast for Baramati?",
      response: "Weather Outlook: Clear, dry, and sunny conditions will persist across Baramati and Pune clusters for the next 48 hours. Max temperature will touch 32°C with rain probability under 10%. Perfect for picking and open transit.",
      actionHint: "Harvest during cool morning hours to maintain fruit firmness.",
    },
    {
      lang: "en",
      question: "What fertilizer should I apply for uniform fruit size and firmness?",
      response: "Nutrient Guide: Apply water-soluble 00:00:50 (Sulphate of Potash) via fertigation at 4-5 kg/acre during fruit sizing. Supplement with Boron (1 g/L spray) to eliminate shoulder cracking and ensure Grade A qualification.",
      actionHint: "Check fertilizer application guidelines in Krishi Advisor.",
    },
    {
      lang: "en",
      question: "What is my pending payout for verified crop lots?",
      response: "Farmer Ramesh Patil has ₹8,420 credited in settlement from the previous dispatch via RBI nodal escrow account. Today's verified lot is queued for buyer delivery acceptance.",
      actionHint: "Visit Settlement tab to view the itemized digital weigh-slip and receipt.",
    },
  ],
};

export default function VoiceAssistantModal({ open, onOpenChange }: VoiceAssistantModalProps) {
  const { mandiPrices, pools, lots, settlements, language, setLanguage } = useAppStore();
  const t = translations[language] || translations.en;

  const selectedLang: SupportedLanguage =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

  const [typedQuery, setTypedQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [activeQA, setActiveQA] = useState<QAItem | null>(LOCALIZED_SAMPLE_QUERIES[language]?.[0] || LOCALIZED_SAMPLE_QUERIES.en[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<"gemini" | "fallback">("gemini");

  const transcriptAccumulatorRef = useRef("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const speechSupported = useSyncExternalStore(
    () => () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    () => true
  );

  // Update default QA when language changes
  useEffect(() => {
    const list = LOCALIZED_SAMPLE_QUERIES[language] || LOCALIZED_SAMPLE_QUERIES.en;
    setActiveQA(list[0]);
  }, [language]);

  const speakText = useCallback((text: string, langCode: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        // Remove markdown formatting
        const cleanText = text.replace(/[*#_`]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = langCode;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const langPrefix = langCode.split("-")[0];
        const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
      }
    }
  }, []);

  // Google Assistant-like Omniscient Agricultural NLU query parser
  const parseAgriculturalIntent = useCallback((query: string, lang: SupportedLanguage): QAItem => {
    const q = query.toLowerCase().trim();
    const isMarathi = lang === "mr-IN";
    const isHindi = lang === "hi-IN";

    // 1. Greetings & System Identity
    if (
      q.includes("नमस्कार") ||
      q.includes("hello") ||
      q.includes("hi") ||
      q.includes("hey") ||
      q.includes("namaste") ||
      q.includes("नमस्ते") ||
      q.includes("कोण आहेस") ||
      q.includes("तू कोण") ||
      q.includes("who are you") ||
      q.includes("मदत") ||
      q.includes("help") ||
      q.includes("कृषीसेतू") ||
      q.includes("कृषिसेतु") ||
      q.includes("krishisetu")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "नमस्कार शेतकरी बंधूंनो! मी तुमचा कृषीसेतू AI सहाय्यक आहे. जसे गुगल असिस्टंट काम करतो, तसाच मी तुम्हाला शेतीमधील प्रत्येक प्रश्नाचे उत्तर देतो — जसे की आजचे थेट बाजारभाव, हवामान व पाऊस, खत व औषध फवारणी, कीड-रोग नियंत्रण, पीक प्रतवारी, एफपीओ सामूहिक पूलिंग आणि थेट बँक खात्यात पेमेंट जमा होणे. मला कोणताही प्रश्न विचारा!",
          actionHint: "खालील माइक बटण दाबून तुमच्या आवाजात थेट बोला.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "नमस्ते किसान भाई! मैं आपका कृषिसेतु एआई सहायक हूँ। गूगल असिस्टेंट की तरह आप मुझसे खेती-बाड़ी से जुड़ा कोई भी सवाल पूछ सकते हैं — जैसे आज के ताजा मंडी भाव, बारिश व मौसम, खाद एवं उर्वरक, कीट व रोग प्रबंधन, एआई फसल ग्रेडिंग, सामूहिक पूलिंग और बैंक खाते में भुगतान। अपना सवाल बोलें या लिखें!",
          actionHint: "नीचे दिए गए माइक बटन को दबाकर पूछें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Namaste Farmer! I am your KrishiSetu AI Assistant, operating like Google Assistant for agriculture. You can ask me anything — real-time AGMARKNET mandi rates, 48-hour weather & rain, fertilizer & spray schedules, pest & disease control, visual crop grading, FPO freight pooling, and direct nodal bank payouts. Ask me any question!",
          actionHint: "Tap the microphone below and speak naturally.",
        };
      }
    }

    // 2. Weather, Rainfall, Climate & Temperature
    if (
      q.includes("हवामान") ||
      q.includes("पाऊस") ||
      q.includes("पावसाचा") ||
      q.includes("ढगाळ") ||
      q.includes("वादळ") ||
      q.includes("तापमान") ||
      q.includes("मौसम") ||
      q.includes("बारिश") ||
      q.includes("तापमान") ||
      q.includes("weather") ||
      q.includes("rain") ||
      q.includes("climate") ||
      q.includes("temperature") ||
      q.includes("monsoon")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "हवामान व पाऊस अंदाज (बारामती व पुणे क्लस्टर): पुढील २४ ते ४८ तासांत हवामान मुख्यतः निरभ्र, कोरडे व सूर्यप्रकाशित राहील. कमाल तापमान ३२°C आणि किमान २१°C राहील. पावसाची शक्यता १०% पेक्षा कमी आहे. पीक काढणी, प्रतवारी, फवारणी व खुल्या वाहनाने बाजारात माल पाठवण्यासाठी हवामान उत्तम आहे.",
          actionHint: "काढणी केलेला माल कोरड्या, हवेशीर सावलीत क्रेट्समध्ये ठेवावा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "मौसम एवं बारिश पूर्वानुमान (बारामती एवं पुणे क्षेत्र): अगले 24-48 घंटों में मौसम साफ और शुष्क रहेगा। अधिकतम तापमान 32°C और रात का तापमान 21°C रहेगा। बारिश की संभावना 10% से कम है। फसल कटाई, ग्रेडिंग और परिवहन के लिए स्थितियां अत्यंत अनुकूल हैं।",
          actionHint: "फसल को धूप से बचाकर हवादार स्थान पर रखें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Weather & Rain Forecast (Baramati & Pune cluster): Clear, dry, and sunny conditions will prevail over the next 24 to 48 hours. Daytime temperatures will peak at 32°C with nights around 21°C. Rain probability is under 10%. Excellent conditions for harvest, grading, and mandi dispatch.",
          actionHint: "Maintain shade storage in ventilated plastic crates post-harvest.",
        };
      }
    }

    // 3. Fertilizer, Soil Health & Crop Nutrition
    if (
      q.includes("खत") ||
      q.includes("खते") ||
      q.includes("युरिया") ||
      q.includes("डीएपी") ||
      q.includes("पोटॅश") ||
      q.includes("माती") ||
      q.includes("उर्वरक") ||
      q.includes("खाद") ||
      q.includes("यूरिया") ||
      q.includes("fertilizer") ||
      q.includes("urea") ||
      q.includes("dap") ||
      q.includes("npk") ||
      q.includes("potash") ||
      q.includes("soil") ||
      q.includes("nutrient")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "पीक पोषण व खत व्यवस्थापन सल्ला: भाजीपाला व टोमॅटो पिकासाठी: फळ वाढीच्या व पक्वतेच्या अवस्थेत ००:००:५० (पोटॅशियम सल्फेट) प्रति एकर ४-५ किग्रॅ ठिबक सिंचनाद्वारे द्यावे. सोबत बोरॉन (१ ग्रॅ/लिटर) फवारल्यास फळांना तडे जात नाहीत, रंग गडद लाल होतो आणि १००% ग्रेड 'A' दर्जा मिळून बाजारात सर्वोच्च दर मिळतो.",
          actionHint: "ठिबकद्वारे खत देताना जमिनीमध्ये पुरेसा ओलावा असावा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "उर्वरक एवं पोषण प्रबंधन सलाह: फल विकास के समय ड्रिप द्वारा 00:00:50 (पोटाश) 4-5 किग्रा/एकड़ दें। साथ ही 1 ग्राम/लीटर बोरॉन का छिड़काव करें। इससे फल मजबूत, चमकदार और एकसमान ग्रेड 'A' आकार के बनते हैं तथा फटने की समस्या समाप्त होती है।",
          actionHint: "खाद हमेशा सुबह या शाम के समय ड्रिप से दें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Crop Nutrition & Fertilizer Advisory: During fruit development, apply 00:00:50 (Sulphate of Potash) at 4-5 kg/acre via drip irrigation. Combine with a foliar spray of Boron (1 g/L) to eliminate fruit cracking, enhance red-orange color uniformity, and maximize Grade A recovery.",
          actionHint: "Ensure adequate root-zone moisture before fertigation.",
        };
      }
    }

    // 4. Pests, Diseases & Crop Protection
    if (
      q.includes("रोग") ||
      q.includes("किड") ||
      q.includes("अळी") ||
      q.includes("बुरशी") ||
      q.includes("डाग") ||
      q.includes("फवारणी") ||
      q.includes("औषध") ||
      q.includes("कीट") ||
      q.includes("बीमारी") ||
      q.includes("झुलसा") ||
      q.includes("दवा") ||
      q.includes("pest") ||
      q.includes("disease") ||
      q.includes("fungus") ||
      q.includes("blight") ||
      q.includes("spray") ||
      q.includes("insect") ||
      q.includes("borer")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "कीड व रोग नियंत्रण सल्ला: करपा (Blight) किंवा पानावरील ठिपक्यांसाठी मँकोझेब (Mancozeb २.५ ग्रॅ/लिटर) किंवा कॉपर ऑक्सिक्लोराईडची फवारणी करावी. फळ पोखरणारी अळी किंवा नागअळी नियंत्रणासाठी इमामेक्टिन बेन्झोएट (०.५ ग्रॅ/लिटर) किंवा नीम तेल (५ मिली/लिटर) वापरावे. फवारणी नेहमी थंड वेळेत करावी.",
          actionHint: "काढणीच्या ३ दिवस आधी रासायनिक फवारणी थांबवावी.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "कीट एवं रोग नियंत्रण सलाह: अगेती या पछेती झुलसा (Blight) के लिए मैंकोजेब (2.5 ग्राम/लीटर) का छिड़काव करें। फल छेदक इल्ली या थ्रिप्स के नियंत्रण हेतु इमामेक्टिन बेंजोएट (0.5 ग्राम/लीटर) या नीम तेल का प्रयोग करें। तेज धूप में छिड़काव न करें।",
          actionHint: "कटाई से 3 दिन पूर्व रासायनिक कीटनाशक न डालें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Pest & Disease Management Advisory: For early or late blight, apply Mancozeb (2.5 g/L) or Copper Oxychloride as a preventive spray. For fruit borer caterpillars and thrips, use Emamectin Benzoate (0.5 g/L) or neem-based azadirachtin (5 ml/L). Spray during cool morning or evening hours.",
          actionHint: "Observe a 3-day pre-harvest waiting interval.",
        };
      }
    }

    // 5. Irrigation & Water Management
    if (
      q.includes("पाणी") ||
      q.includes("सिंचन") ||
      q.includes("ठिबक") ||
      q.includes("सिंचाई") ||
      q.includes("irrigation") ||
      q.includes("drip") ||
      q.includes("water schedule")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "पाणी व ठिबक सिंचन व्यवस्थापन: टोमॅटो व भाजीपाला पिकाला ठिबक सिंचनाद्वारे दर २ दिवसांनी २ ते ३ तास पाणी द्यावे. फळ पक्वतेच्या काळात अचानक जास्त पाणी देऊ नका, अन्यथा फळे तडकतात. नियमित व हलके पाणी देणे दर्जेदार उत्पादनासाठी आवश्यक आहे.",
          actionHint: "उन्हाळ्यात जमिनीवर आच्छादन (Mulching) केल्यास ५०% पाणी बचत होते.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "सिंचाई प्रबंधन सलाह: ड्रिप से हर 2 दिन में 2 से 3 घंटे संतुलित पानी दें। फल पकने के समय अचानक ज्यादा पानी न दें, अन्यथा फलों में क्रैकिंग (दरारें) आ सकती हैं। मल्चिंग का उपयोग करने से नमी बनी रहती है और पानी की बचत होती है।",
          actionHint: "हमेशा सुबह के समय ड्रिप चलाएं।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Water & Irrigation Advisory: Operate drip irrigation for 2 to 3 hours every 48 hours. Avoid water stress followed by sudden heavy watering during fruiting, as osmotic shock induces blossom end rot and skin splitting. Plastic mulching preserves 50% soil moisture.",
          actionHint: "Schedule irrigation cycles during early morning hours.",
        };
      }
    }

    // 6. Government Schemes & Subsidies
    if (
      q.includes("योजना") ||
      q.includes("सबसिडी") ||
      q.includes("अनुदान") ||
      q.includes("विमा") ||
      q.includes("पीएम किसान") ||
      q.includes("कर्ज") ||
      q.includes("योजनाएं") ||
      q.includes("बीमा") ||
      q.includes("subsidy") ||
      q.includes("scheme") ||
      q.includes("pm kisan") ||
      q.includes("insurance") ||
      q.includes("loan")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "शेतकरी शासकीय योजना: १. महाडीबीटी पोर्टल: ठिबक सिंचनावर ७५% पर्यंत अनुदान आणि शेती अवजारे अनुदान. २. पीएम किसान व नमो शेतकरी योजना: पात्र शेतकऱ्यांना वार्षिक ₹१२,००० थेट बँक खात्यात. ३. प्रधानमंत्री पीक विमा योजना (PMFBY): नैसर्गिक नुकसानीपासून संरक्षण. अधिक माहितीसाठी महाडीबीटी पोर्टल किंवा आपल्या FPO कार्यालयाशी संपर्क साधावा.",
          actionHint: "FPO केंद्रावर जाऊन आधार-संलग्न ई-केवायसी पूर्ण करा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "सरकारी योजनाएं एवं सब्सिडी: 1. महाडीबीटी सूक्ष्म सिंचाई: ड्रिप और स्प्रिंकलर पर 75% तक अनुदान। 2. पीएम-किसान सम्मान निधि: ₹6,000 वार्षिक प्रत्यक्ष सहायता। 3. प्रधानमंत्री फसल बीमा योजना (PMFBY): प्राकृतिक आपदा से फसल सुरक्षा। आवेदन हेतु नजदीकी सीएससी सेंटर या एफपीओ से संपर्क करें।",
          actionHint: "अपने बैंक खाते को एनपीसीआई से लिंक कराएं।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Government Agricultural Schemes: 1. MahaDBT Portal provides up to 75% capital subsidy on drip irrigation and plastic harvest crates. 2. PM-KISAN & Namo Shetkari provide ₹12,000 annual direct income support. 3. Pradhan Mantri Fasal Bima Yojana (PMFBY) protects against natural yield losses. Inquire at your FPO hub.",
          actionHint: "Verify Aadhaar NPCI seeding for direct subsidy credit.",
        };
      }
    }

    // 7. Crop Quality Grading / Camera / Photos
    if (
      q.includes("ग्रेड") ||
      q.includes("प्रतवारी") ||
      q.includes("तपासणी") ||
      q.includes("फोटो") ||
      q.includes("कॅमेरा") ||
      q.includes("grading") ||
      q.includes("quality") ||
      q.includes("camera") ||
      q.includes("photo") ||
      q.includes("grade a") ||
      q.includes("grade b")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "कृषीसेतू AI व्हिजन प्रतवारी: 'पीक प्रतवारी' पृष्ठावर जाऊन तुमच्या पिकाचे ३ स्पष्ट फोटो काढा: १. वरून घेतलेला आकार तपासणी, २. बाजूचा पक्वता तपासणी, ३. क्रेटमधील भराव. आमचा AI कॅमेरा अल्गोरिदम आकार, एकसमानता व डागांची तपासणी करून त्वरित ग्रेड A, B किंवा C देतो आणि डिजिटल गेट-पास तयार करतो.",
          actionHint: "डाव्या बाजूच्या 'पीक प्रतवारी' मेनूवर क्लिक करा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "कृषिसेतु एआई विजन ग्रेडिंग: 'फसल ग्रेडिंग' पेज पर जाएं और 3 फोटो खींचें: 1. ऊपर से व्यास व आकार, 2. साइड से परिपक्वता, 3. क्रेट में भराव। हमारा एआई मॉडल तुरंत ग्रेड A, B या C निर्धारित करता है और डिजिटल गेट-पास जारी करता है।",
          actionHint: "मेनू में 'फसल ग्रेडिंग' पर क्लिक करें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "KrishiSetu AI Vision Grading: Navigate to the 'Grade Crop' page and capture 3 guided photos: 1. Top view for diameter uniformity, 2. Side view for ripeness stage, and 3. Bulk crate view for surface defect occupancy. Our OpenCV AI assigns Grade A, B, or C with verifiable telemetry.",
          actionHint: "Navigate to Grade Crop from the sidebar.",
        };
      }
    }

    // 8. Detect Commodity & Mandi
    let detectedCrop = "Tomato";
    if (q.includes("कांदा") || q.includes("कांद्या") || q.includes("प्याज") || q.includes("onion")) detectedCrop = "Onion";
    else if (q.includes("बटाटा") || q.includes("बटाट्या") || q.includes("आलू") || q.includes("potato")) detectedCrop = "Potato";
    else if (q.includes("डाळिंब") || q.includes("डाळिंबा") || q.includes("अनार") || q.includes("pomegranate")) detectedCrop = "Pomegranate";
    else if (q.includes("मिरची") || q.includes("मिरच्या") || q.includes("मिर्ची") || q.includes("chilli") || q.includes("chili")) detectedCrop = "Green Chilli";
    else if (q.includes("सोयाबीन") || q.includes("soyabean") || q.includes("soybean")) detectedCrop = "Soyabean";

    let detectedMandiName = "";
    if (q.includes("बारामती") || q.includes("baramati")) detectedMandiName = "Baramati APMC";
    else if (q.includes("सोलापूर") || q.includes("सोलापुर") || q.includes("solapur")) detectedMandiName = "Solapur APMC";
    else if (q.includes("मुंबई") || q.includes("वाशी") || q.includes("mumbai") || q.includes("vashi")) detectedMandiName = "Mumbai Vashi APMC";
    else if (q.includes("लासलगाव") || q.includes("lasalgaon")) detectedMandiName = "Lasalgaon APMC";
    else if (q.includes("नाशिक") || q.includes("nashik")) detectedMandiName = "Nashik APMC";
    else if (q.includes("कोल्हापूर") || q.includes("कोल्हापुर") || q.includes("kolhapur")) detectedMandiName = "Kolhapur APMC";
    else if (q.includes("सांगली") || q.includes("sangli")) detectedMandiName = "Sangli APMC";
    else if (q.includes("नागपूर") || q.includes("नागपुर") || q.includes("nagpur")) detectedMandiName = "Nagpur Cotton Market APMC";
    else if (q.includes("पुणे") || q.includes("pune") || q.includes("गुलटेकडी")) detectedMandiName = "Pune Gultekdi Market Yard";

    // 9. Intent: Sale Timing (Hold vs Sell)
    if (
      q.includes("सल्ला") ||
      q.includes("थांब") ||
      q.includes("विकू") ||
      q.includes("कधी विकू") ||
      q.includes("भाव वाढेल") ||
      q.includes("भाव वाढतील") ||
      q.includes("तेजी") ||
      q.includes("मंदी") ||
      q.includes("advice") ||
      q.includes("wait") ||
      q.includes("sell") ||
      q.includes("hold") ||
      q.includes("forecast") ||
      q.includes("सलाह") ||
      q.includes("बेचें") ||
      q.includes("रुकें")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: `AI विक्री सल्लागार (${detectedCrop}): पुढील ३ ते ५ दिवसांत आवक कमी राहण्याचा अंदाज असल्याने दर प्रति क्विंटल ₹१०० ते ₹१५० ने वाढू शकतात. तुमच्याकडे सुरक्षित सावलीची किंवा क्रेट साठवणूक असल्यास ३ दिवस थांबणे फायद्याचे ठरेल, किंवा आजच्या FPO सामूहिक पूलमध्ये सहभागी होऊन माल पाठवावा.`,
          actionHint: "विक्री सल्लागार पृष्ठावर जाऊन P10/P50/P90 आलेख पहा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `एआई बिक्री सलाहकार (${detectedCrop}): अगले 3-5 दिनों में आवक कम होने से भाव में ₹100-₹150/क्विंटल की तेजी आने का अनुमान है। सुरक्षित भंडारण होने पर 3 दिन रुकना सर्वोत्तम रहेगा, या आज के एफपीओ पूल में शामिल हों।`,
          actionHint: "बिक्री सलाहकार पेज पर 14-दिवसीय संभाव्यता चार्ट देखें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: `AI Sale Advisor (${detectedCrop}): Daily arrivals are projected to tighten over the next 3-5 days, unlocking potential upside of ₹100-₹150/qtl. If you possess proper storage, holding for 3 days or dispatching via an FPO consolidated pool is optimal.`,
          actionHint: "Visit the Sale Advisor tab to inspect the 14-day forecast curve.",
        };
      }
    }

    // 10. Intent: FPO Pooling & Freight Sharing
    if (
      q.includes("पूल") ||
      q.includes("वाहतूक") ||
      q.includes("भाडे") ||
      q.includes("गाडी") ||
      q.includes("एकत्रित") ||
      q.includes("pool") ||
      q.includes("freight") ||
      q.includes("logistics") ||
      q.includes("transport") ||
      q.includes("saving") ||
      q.includes("बचत")
    ) {
      const activePool = pools.find((p) => p.status === "Open" || p.status === "Reserved") || pools[0];
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: `होय! ${activePool.collectionHub} येथून ${activePool.destinationMandi} साठी ${activePool.crop} चा सामूहिक पूल सुरू आहे. सध्या यात ${activePool.currentKg} किग्रा माल जमा झाला असून ${activePool.targetKg} किग्राचे लक्ष्य आहे. यात सहभागी झाल्यास तुमच्या मालवाहतूक भाड्यात ${activePool.sharedFreightSavingsPct}% थेट बचत होईल!`,
          actionHint: "एकत्रित विक्री (पूल) टॅबमध्ये जाऊन तुमचा लॉट जोडा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `हाँ! ${activePool.collectionHub} से ${activePool.destinationMandi} के लिए ${activePool.crop} का सामूहिक पूल खुला है। अभी ${activePool.currentKg} किग्रा भरा है (लक्ष्य: ${activePool.targetKg} किग्रा)। इसमें शामिल होकर आपको ${activePool.sharedFreightSavingsPct}% मालभाड़ा बचत मिलेगी।`,
          actionHint: "पूलिंग टैब में जाकर तुरंत जुड़ें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: `Yes! An active ${activePool.crop} pool is open from ${activePool.collectionHub} to ${activePool.destinationMandi}. Currently filled at ${activePool.currentKg} kg of ${activePool.targetKg} kg target, unlocking ${activePool.sharedFreightSavingsPct}% freight savings.`,
          actionHint: "Visit FPO Pooling tab to assign your lot to this batch.",
        };
      }
    }

    // 11. Intent: Settlement / Payments
    if (
      q.includes("पैसे") ||
      q.includes("पेमेंट") ||
      q.includes("हिशोब") ||
      q.includes("बैलन्स") ||
      q.includes("रक्कम") ||
      q.includes("खाते") ||
      q.includes("पावती") ||
      q.includes("बँक") ||
      q.includes("payment") ||
      q.includes("payout") ||
      q.includes("settlement") ||
      q.includes("money") ||
      q.includes("disbursement") ||
      q.includes("receipt") ||
      q.includes("रुपये")
    ) {
      const latestSettlement = settlements[0];
      const verifiedLots = lots.filter((l) => l.status === "Verified" || l.status === "Delivered");
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: `शेतकरी रमेश पाटील: तुमच्या मागील मालाचे ₹${latestSettlement?.amount || 8420} अधिकृत RBI नोडल बँक खात्याद्वारे सुरक्षितपणे जमा झाले आहेत. चालू ${verifiedLots.length} पडताळणी झालेले लॉट खरेदीदाराच्या पोच पावतीनंतर २४ तासांत खात्यात वर्ग होतील.`,
          actionHint: "हिशोब व पावती टॅबमध्ये जाऊन डिजिटल वजन पावती पहा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `किसान रमेश पाटिल: आपके पिछले प्रेषण का ₹${latestSettlement?.amount || 8420} आरबीआई नोडल खाते से ट्रांसफर हो चुका है। वर्तमान ${verifiedLots.length} सत्यापित लॉट डिलीवरी स्वीकृति के 24 घंटे में क्रेडिट हो जाएंगे।`,
          actionHint: "भुगतान रसीद टैब में विस्तृत विवरण देखें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: `Farmer Ramesh Patil: ₹${latestSettlement?.amount || 8420} from your previous dispatch has been disbursed via the RBI-regulated nodal account. You have ${verifiedLots.length} verified lots awaiting delivery acceptance.`,
          actionHint: "Go to Settlement tab to review itemized deduction receipts.",
        };
      }
    }

    // 12. Intent: Mandi Price Discovery
    const matchedMandi =
      (detectedMandiName
        ? mandiPrices.find((m) => m.crop.toLowerCase().includes(detectedCrop.toLowerCase()) && m.mandi.toLowerCase().includes(detectedMandiName.toLowerCase()))
        : null) ||
      mandiPrices.find((m) => m.crop.toLowerCase().includes(detectedCrop.toLowerCase())) ||
      mandiPrices[0];

    if (
      q.includes("भाव") ||
      q.includes("दर") ||
      q.includes("बाजारभाव") ||
      q.includes("किंमत") ||
      q.includes("price") ||
      q.includes("rate") ||
      q.includes("mandi") ||
      q.includes("मंडी") ||
      q.includes("क्विंटल")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: `आज ${matchedMandi.mandi} येथे ${matchedMandi.crop} (${matchedMandi.variety}) चा सरासरी भाव ₹${matchedMandi.modalPrice}/क्विंटल आहे (किमान ₹${matchedMandi.minPrice} ते कमाल ₹${matchedMandi.maxPrice}). आजची एकूण दैनिक आवक ${matchedMandi.arrivalsQtl} क्विंटल नोंदवली गेली आहे.`,
          actionHint: "बाजारभाव पृष्ठावर जाऊन वाहतूक व कमिशन वजा जाता निव्वळ नफा तपासा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `आज ${matchedMandi.mandi} में ${matchedMandi.crop} (${matchedMandi.variety}) का मॉडल भाव ₹${matchedMandi.modalPrice}/क्विंटल है (न्यूनतम ₹${matchedMandi.minPrice} से अधिकतम ₹${matchedMandi.maxPrice})। कुल आवक ${matchedMandi.arrivalsQtl} क्विंटल दर्ज की गई है।`,
          actionHint: "मंडी भाव पेज पर जाकर शुद्ध आय की गणना करें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: `Today at ${matchedMandi.mandi}, the modal clearing price for ${matchedMandi.crop} (${matchedMandi.variety}) is ₹${matchedMandi.modalPrice}/quintal (range: ₹${matchedMandi.minPrice} - ₹${matchedMandi.maxPrice}). Daily market arrivals are ${matchedMandi.arrivalsQtl} quintals.`,
          actionHint: "Check Market Prices page to calculate net take-home realization.",
        };
      }
    }

    // 13. General Fallback for ANY OTHER QUESTION (Google Assistant style)
    if (isMarathi) {
      return {
        lang: "mr",
        question: query,
        response: `कृषीसेतू AI उत्तर: "${query}" या विषयावर: चांगल्या उत्पादनासाठी दर्जेदार प्रमाणित बियाणे, ठिबकद्वारे संतुलित अन्नद्रव्ये आणि वेळेवर कीड-रोग नियंत्रण करणे अत्यंत फायदेशीर ठरते. आपला शेतीमाल एफपीओ ग्रेडिंगद्वारे तपासल्यास थेट मोठ्या खरेदीदारांना विकून ३०% पर्यंत जास्त नफा मिळवता येतो. अधिक मदतीसाठी स्थानिक कृषी अधिकारी किंवा कृषीसेतू मंचाची मदत घ्या!`,
        actionHint: "डॅशबोर्डवरील विविध पर्याय वापरून अधिक माहिती मिळवा.",
      };
    } else if (isHindi) {
      return {
        lang: "hi",
        question: query,
        response: `कृषिसेतु एआई उत्तर: "${query}" के संबंध में: उत्तम पैदावार के लिए प्रमाणित बीज, ड्रिप से संतुलित पोषक तत्व और समय पर फसल सुरक्षा आवश्यक है। कृषिसेतु के जरिए अपनी फसल को ग्रेड कराकर एफपीओ पूल से बेचने पर आपको 25-30% तक अधिक शुद्ध मुनाफा मिलता है। किसी भी अन्य जानकारी के लिए मुझसे बेझिझक पूछें!`,
        actionHint: "डैशबोर्ड पर जाकर अपनी फसल का ग्रेडिंग कराएं।",
      };
    } else {
      return {
        lang: "en",
        question: query,
        response: `KrishiSetu AI Advisory: Regarding "${query}": For optimal agricultural productivity, adhere to balanced fertigation, certified seeds, and integrated pest management. By grading your harvest on KrishiSetu and dispatching through consolidated FPO pools, you bypass intermediary margins and unlock up to 30% higher take-home profit. Feel free to ask more!`,
        actionHint: "Explore the Dashboard tabs to manage lots and pools.",
      };
    }
  }, [mandiPrices, pools, lots, settlements]);

  const handleProcessQuery = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;
      setIsAiLoading(true);

      try {
        const res = await apiClient.ai.chat(
          queryText,
          selectedLang,
          []
        );

        if (res.data && res.data.reply) {
          const qaResult: QAItem = {
            lang: selectedLang.split("-")[0] as "mr" | "hi" | "en",
            question: queryText,
            response: res.data.reply,
            actionHint: res.data.actionHint,
          };
          setAiSource(res.data.source);
          setActiveQA(qaResult);
          speakText(qaResult.response, selectedLang);
          setIsAiLoading(false);
          return;
        }
      } catch {
        // Fall back to built-in agricultural NLU
      }

      setAiSource("fallback");
      const qaResult = parseAgriculturalIntent(queryText, selectedLang);
      setActiveQA(qaResult);
      speakText(qaResult.response, selectedLang);
      setIsAiLoading(false);
    },
    [parseAgriculturalIntent, selectedLang, speakText]
  );

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedQuery.trim()) return;
    const q = typedQuery.trim();
    setTypedQuery("");
    handleProcessQuery(q);
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    if (transcriptAccumulatorRef.current.trim()) {
      const captured = transcriptAccumulatorRef.current.trim();
      transcriptAccumulatorRef.current = "";
      setInterimTranscript("");
      handleProcessQuery(captured);
    }
  }, [handleProcessQuery]);

  const startListening = () => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition Not Supported", {
        description: "Your browser does not support SpeechRecognition. Please use Chrome, Edge, or Safari.",
      });
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      transcriptAccumulatorRef.current = "";
      setInterimTranscript("");

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        transcriptAccumulatorRef.current = "";
        toast.info(t.voice.listening, {
          description: `${LANGUAGES.find((l) => l.code === selectedLang)?.label}...`,
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        let hasFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            hasFinal = true;
          }
        }

        transcriptAccumulatorRef.current = fullTranscript;
        setInterimTranscript(fullTranscript);

        if (hasFinal && fullTranscript.trim()) {
          const finalQuery = fullTranscript.trim();
          transcriptAccumulatorRef.current = "";
          setIsListening(false);
          setInterimTranscript("");
          try {
            recognition.stop();
          } catch {
            // ignore
          }
          handleProcessQuery(finalQuery);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript("");
        if (event.error === "not-allowed") {
          toast.error("Microphone Access Denied", {
            description: "Please enable microphone permission in your browser URL bar.",
          });
        } else if (event.error === "no-speech") {
          toast.info("No speech detected. Please tap mic and speak again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcriptAccumulatorRef.current.trim()) {
          const captured = transcriptAccumulatorRef.current.trim();
          transcriptAccumulatorRef.current = "";
          setInterimTranscript("");
          handleProcessQuery(captured);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.error("Could not start microphone");
    }
  };

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      stopListening();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
    onOpenChange(newOpen);
  }, [onOpenChange, stopListening]);

  // Cleanup speech/recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSimulateClick = (qa: QAItem) => {
    stopListening();
    setActiveQA(qa);
    speakText(qa.response, selectedLang);
  };

  const sampleQueries = LOCALIZED_SAMPLE_QUERIES[language] || LOCALIZED_SAMPLE_QUERIES.en;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {t.voice.title}
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-semibold shadow-xs">
                    <Bot className="w-3 h-3" /> Gemini 1.5 Flash
                  </span>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  {t.voice.subtitle}
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Assistant AI</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Language Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-lg">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 px-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> {t.voice.languageLabel}
            </span>
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => {
                const isActive = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.simpleCode);
                      stopListening();
                      toast.info(`Language switched to ${lang.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                      isActive
                        ? "bg-white text-green-800 shadow-sm border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Mic / Waveform Visualizer */}
          <div className="bg-slate-950 rounded-xl p-5 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[180px] border border-slate-800 shadow-inner">
            {isAiLoading ? (
              <div className="space-y-3 flex flex-col items-center py-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-sm font-semibold text-blue-300">
                    {language === "mr"
                      ? "गुगल जेमिनी कृषी विश्लेषण करत आहे..."
                      : language === "hi"
                      ? "गूगल जेमिनी कृषि सलाह तैयार कर रहा है..."
                      : "Google Gemini is analyzing agricultural advisory..."}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === "mr"
                      ? "हवामान, खत व बाजारभाव तपासले जात आहेत"
                      : language === "hi"
                      ? "मौसम, खाद एवं मंडी भाव का विश्लेषण जारी"
                      : "Correlating weather, NPK fertigation & AGMARKNET rates"}
                  </p>
                </div>
              </div>
            ) : isListening ? (
              <div className="space-y-4 flex flex-col items-center">
                {/* Live Animated Waveform Bars */}
                <div className="flex items-center justify-center gap-1.5 h-12">
                  <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.05s]" />
                  <span className="w-1.5 h-12 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-8 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.25s]" />
                  <span className="w-1.5 h-14 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.35s]" />
                  <span className="w-1.5 h-10 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-300 animate-pulse">
                    {t.voice.listening}
                  </p>
                  {interimTranscript && (
                    <p className="text-xs text-slate-200 italic max-w-sm px-4">
                      &ldquo;{interimTranscript}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ) : activeQA ? (
              <div className="space-y-2.5 text-left w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" /> {t.voice.queryLabel} ({activeQA.lang.toUpperCase()})
                  </div>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" /> {t.voice.speakingIndicator}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-100">&ldquo;{activeQA.question}&rdquo;</p>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-400" /> {t.voice.advisoryLabel}:
                    </span>
                    {aiSource === "gemini" ? (
                      <span className="text-[10px] text-blue-300 font-normal bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800">
                        ⚡ Google Gemini 1.5
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-300 font-normal bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                        🌱 KrishiSetu NLU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeQA.response}</p>
                  {activeQA.actionHint && (
                    <p className="text-[11px] text-amber-300/90 mt-1 font-medium">
                      💡 {activeQA.actionHint}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <Mic className="w-8 h-8 opacity-40 text-emerald-400" />
                <p className="text-xs">{t.voice.tapMicOrType}</p>
              </div>
            )}
          </div>

          {/* Type Question Form */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
              placeholder={t.voice.typePlaceholder}
              className="text-xs h-9"
            />
            <Button type="submit" size="sm" className="bg-green-700 hover:bg-green-800 text-xs shrink-0 h-9">
              <Send className="w-3.5 h-3.5 mr-1" /> {t.voice.askButton}
            </Button>
          </form>

          {/* Live Microphone Action Toggle Button */}
          <div className="flex flex-col items-center gap-1.5">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              className={`rounded-full px-6 py-5 font-bold shadow-lg transition-all gap-2 text-sm ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" /> {t.voice.stopListening}
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" /> {t.voice.tapToSpeak} ({LANGUAGES.find((l) => l.code === selectedLang)?.label.split(" ")[0]})
                </>
              )}
            </Button>
            <span className="text-[11px] text-slate-500 font-medium">
              {isListening ? t.voice.tapStopEvaluate : t.voice.pressMicToSpeak}
            </span>
          </div>

          {!speechSupported && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Browser SpeechRecognition API not detected; you can type above or tap sample queries below.</span>
            </div>
          )}

          {/* Quick Prompts tailored to active language */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {t.voice.sampleHeader}
            </div>
            <div className="grid gap-2">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateClick(item)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-green-50 hover:border-green-300 transition-colors flex items-start gap-2.5 text-xs text-slate-700"
                >
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px] uppercase shrink-0 mt-0.5">
                    {item.lang}
                  </span>
                  <span className="font-medium flex-1">{item.question}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} className="text-xs">
            {t.voice.close}
          </Button>
          {activeQA && (
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-800 text-xs"
              onClick={() => speakText(activeQA.response, selectedLang)}
            >
              <Volume2 className="w-3.5 h-3.5 mr-1.5" /> {t.voice.repeatAudio}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
