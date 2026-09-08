"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Volume2, Sparkles, MessageSquare, Globe, AlertCircle, Send } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { translations } from "@/lib/i18n";
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

const SAMPLE_QUERIES: QAItem[] = [
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
    question: "मी पिकाची प्रतवारी (Grading) कॅमेऱ्याने कशी करू?",
    response: "पीक प्रतवारी पृष्ठावर जाऊन ३ फोटो काढा: १. वरून घेतलेला आकार तपासणी, २. बाजूचा पक्वता तपासणी, ३. क्रेटमधील भराव. आमचे AI मॉडेल त्वरित ग्रेड A, B किंवा C निश्चित करेल.",
    actionHint: "पीक प्रतवारी पृष्ठावर जाऊन फोटो अपलोड करा.",
  },
  {
    lang: "hi",
    question: "क्या पुणे जाने वाले एफपीओ पूल में जगह खाली है?",
    response: "हाँ! बारामती एफपीओ का १,००० किग्रा का पुणे पूल चालू है जिसमें अभी ६५० किग्रा भरा है। इसमें जुड़ने पर आपको २८.५% मालभाड़ा बचत मिलेगी।",
    actionHint: "पूलिंग टैब में जाकर तुरंत जुड़ें।",
  },
  {
    lang: "en",
    question: "What is my pending payout for verified Tomato lots?",
    response: "Farmer Ramesh Patil has ₹8,420 credited in settlement from the previous dispatch via RBI nodal escrow account. Today's verified lot is queued for buyer delivery acceptance.",
    actionHint: "Visit Settlement tab to view the itemized digital weigh-slip and receipt.",
  },
];

export default function VoiceAssistantModal({ open, onOpenChange }: VoiceAssistantModalProps) {
  const { mandiPrices, pools, lots, settlements, language, setLanguage } = useAppStore();
  const t = translations[language] || translations.en;

  const selectedLang: SupportedLanguage =
    language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

  const [typedQuery, setTypedQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [activeQA, setActiveQA] = useState<QAItem | null>(SAMPLE_QUERIES[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechSupported = useSyncExternalStore(
    () => () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    () => true
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

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

  const speakText = (text: string, langCode: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.95;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // High-accuracy Agricultural NLU query parser
  const parseAgriculturalIntent = (query: string, lang: SupportedLanguage): QAItem => {
    const q = query.toLowerCase().trim();
    const isMarathi = lang === "mr-IN";
    const isHindi = lang === "hi-IN";

    // 1. Intent: Greetings / Identity / Help
    if (
      q.includes("नमस्कार") ||
      q.includes("hello") ||
      q.includes("hi") ||
      q.includes("hey") ||
      q.includes("namaste") ||
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
          response: "नमस्कार शेतकरी बंधूंनो! मी कृषीसेतू AI सहाय्यक आहे. मी तुम्हाला आजचे थेट बाजारभाव (टोमॅटो, कांदा, बटाटा इ.), विक्री सल्ला (थांबावे की विकावे), FPO पूलमधील मोफत वाहतूक जागा, पीक प्रतवारी आणि पेमेंट हिशोब याविषयी अचूक माहिती देऊ शकतो. तुमचा प्रश्न विचारा किंवा बोला!",
          actionHint: "खालील मायक्रोफोन बटण दाबून थेट प्रश्न विचारू शकता.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "नमस्ते किसान भाई! मैं कृषिसेतु एआई सहायक हूँ। मैं आपको आज के ताजा मंडी भाव, फसल बिक्री सलाह, एफपीओ पूलिंग और भुगतान संबंधी जानकारी दे सकता हूँ। अपना सवाल पूछें या बोलें!",
          actionHint: "नीचे दिए गए माइक बटन को दबाकर पूछें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "Namaste Farmer! I am your KrishiSetu AI Assistant. I provide real-time AGMARKNET mandi prices, holding vs selling recommendations, FPO freight pooling spots, visual crop grading guidance, and payment disbursement status. Ask me anything!",
          actionHint: "Tap the microphone below or type your question.",
        };
      }
    }

    // 2. Intent: Crop Quality Grading / Camera / Photos
    if (
      q.includes("ग्रेड") ||
      q.includes("प्रतवारी") ||
      q.includes("तपासणी") ||
      q.includes("फोटो") ||
      q.includes("कॅमेरा") ||
      q.includes("कॅमेरा कसा") ||
      q.includes("grading") ||
      q.includes("quality") ||
      q.includes("camera") ||
      q.includes("photo") ||
      q.includes("grade a") ||
      q.includes("grade b") ||
      q.includes("grade c") ||
      q.includes("प्रत")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "कृषीसेतू AI व्हिजन प्रतवारी: तुम्ही 'पीक प्रतवारी' पृष्ठावर जाऊन तुमच्या शेतीमालाचे ३ फोटो (१. वरून आकार तपासणी, २. बाजूचा पक्वता तपासणी, ३. क्रेटमधील भराव) कॅमेऱ्याने थेट अपलोड करा. आमचे AI मॉडेल त्वरित आकार, एकसमानता व पक्वतेनुसार ग्रेड A, B किंवा C निश्चित करते.",
          actionHint: "डाव्या मेनूतील 'पीक प्रतवारी' पर्यायावर क्लिक करा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "कृषिसेतु एआई विजन ग्रेडिंग: आप 'फसल ग्रेडिंग' पेज पर जाकर 3 फोटो (ऊपर से, साइड से, और क्रेट से) अपलोड करें। हमारा एआई मॉडल तुरंत आकार, एकरूपता और परिपक्वता के आधार पर ग्रेड A, B या C निर्धारित करता है।",
          actionHint: "बाएं मेनू में 'फसल ग्रेडिंग' विकल्प पर जाएं।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "KrishiSetu AI Vision Grading: Go to the 'Grade Crop' page and upload 3 guided photos (Top view for diameter, Side view for ripeness, and Crate view for surface occupancy). The AI quality gate inspects blur and exposure and assigns Grade A, B, or C.",
          actionHint: "Navigate to Grade Crop from the sidebar.",
        };
      }
    }

    // 3. Detect Commodity for Contextual Intent
    let detectedCrop = "Tomato";
    if (q.includes("कांदा") || q.includes("कांद्या") || q.includes("प्याज") || q.includes("onion")) detectedCrop = "Onion";
    else if (q.includes("बटाटा") || q.includes("बटाट्या") || q.includes("आलू") || q.includes("potato")) detectedCrop = "Potato";
    else if (q.includes("डाळिंब") || q.includes("डाळिंबा") || q.includes("अनार") || q.includes("pomegranate")) detectedCrop = "Pomegranate";
    else if (q.includes("मिरची") || q.includes("मिरच्या") || q.includes("मिर्ची") || q.includes("chilli") || q.includes("chili")) detectedCrop = "Green Chilli";
    else if (q.includes("सोयाबीन") || q.includes("soyabean") || q.includes("soybean")) detectedCrop = "Soyabean";

    // 4. Detect Mandi / City
    let detectedMandiName = "";
    if (q.includes("बारामती") || q.includes("baramati")) detectedMandiName = "Baramati APMC";
    else if (q.includes("सोलापूर") || q.includes("सोलापुर") || q.includes("solapur")) detectedMandiName = "Solapur APMC";
    else if (q.includes("मुंबई") || q.includes("वाशी") || q.includes("mumbai") || q.includes("vashi")) detectedMandiName = "Mumbai Vashi APMC";
    else if (q.includes("लासलगाव") || q.includes("lasalgaon")) detectedMandiName = "Lasalgaon APMC";
    else if (q.includes("नाशिक") || q.includes("nashik")) detectedMandiName = "Nashik APMC";
    else if (q.includes("कोल्हापूर") || q.includes("कोल्हापुर") || q.includes("kolhapur")) detectedMandiName = "Kolhapur APMC";
    else if (q.includes("सांगली") || q.includes("sangli")) detectedMandiName = "Sangli APMC";
    else if (q.includes("नागपूर") || q.includes("नागपुर") || q.includes("nagpur")) detectedMandiName = "Nagpur Cotton Market APMC";
    else if (q.includes("अहमदनगर") || q.includes("ahmednagar")) detectedMandiName = "Ahmednagar APMC";
    else if (q.includes("पुणे") || q.includes("pune") || q.includes("गुलटेकडी")) detectedMandiName = "Pune Gultekdi Market Yard";

    // 5. Intent: Sale Timing (Hold vs Sell)
    if (
      q.includes("सल्ला") ||
      q.includes("थांब") ||
      q.includes("विकू") ||
      q.includes("कधी विकू") ||
      q.includes("भाव वाढेल") ||
      q.includes("भाव वाढतील") ||
      q.includes("भाव पडतील") ||
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
          response: `AI विक्री सल्लागार (${detectedCrop}): पुढील ३ ते ५ दिवसांत आवक घटण्याचा अंदाज असल्याने दर प्रति क्विंटल ₹१०० ते ₹१५० ने वाढू शकतात. तुमच्याकडे सुरक्षित सावली किंवा क्रेट साठवणूक असल्यास ३ दिवस थांबणे फायद्याचे ठरेल, अथवा नजीकच्या FPO एकत्रित पूलमधे सहभागी होऊन माल पाठवावा.`,
          actionHint: "विक्री सल्लागार पृष्ठावर जाऊन P10/P50/P90 आलेख व जोखीम तपासा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `एआई बिक्री सलाहकार (${detectedCrop}): अगले 3-5 दिनों में आवक कम होने की संभावना है, जिससे भाव ₹100-₹150/क्विंटल बढ़ सकते हैं। सुरक्षित भंडारण उपलब्ध होने पर 3 दिन रुकना सर्वोत्तम रहेगा, या आज के एफपीओ पूल में शामिल हों।`,
          actionHint: "बिक्री सलाहकार पेज पर 14-दिवसीय संभाव्यता चार्ट देखें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: `AI Sale Advisor (${detectedCrop}): Daily arrivals are projected to tighten over the next 3-5 days, creating potential upside of ₹100-₹150/qtl. If you have proper storage, holding for 3 days or dispatching via an FPO consolidated pool is optimal.`,
          actionHint: "Visit the Sale Advisor tab to inspect the 14-day forecast curve.",
        };
      }
    }

    // 6. Intent: FPO Pooling & Freight Sharing
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
          response: `होय! ${activePool.collectionHub} येथून ${activePool.destinationMandi} साठी ${activePool.crop} चा पूल सुरू आहे. सध्या यात ${activePool.currentKg} किग्रा माल जमा झाला असून ${activePool.targetKg} किग्राचे लक्ष्य आहे. यात सहभागी झाल्यास तुमच्या मालवाहतूक भाड्यात ${activePool.sharedFreightSavingsPct}% थेट बचत होईल!`,
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

    // 7. Intent: Settlement / Payments / Weigh-slips
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
      q.includes("slip") ||
      q.includes("receipt") ||
      q.includes("रुपये")
    ) {
      const latestSettlement = settlements[0];
      const verifiedLots = lots.filter((l) => l.status === "Verified" || l.status === "Delivered");
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: `शेतकरी रमेश पाटील: तुमच्या मागील मालाचे ₹${latestSettlement?.amount || 8420} अधिकृत RBI नोडल बँक खात्याद्वारे सुरक्षितपणे जमा झाले आहेत. चालू ${verifiedLots.length} पडताळणी झालेले लॉट खरेदीदाराच्या पोच पावतीसाठी प्रक्रियेत आहेत.`,
          actionHint: "हिशोब व पावती टॅबमध्ये जाऊन डिजिटल वजन पावती पहा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: `किसान रमेश पाटिल: आपके पिछले प्रेषण का ₹${latestSettlement?.amount || 8420} आरबीआई नोडल खाते से ट्रांसफर हो चुका है। वर्तमान ${verifiedLots.length} सत्यापित लॉट डिलीवरी स्वीकृति प्रक्रिया में हैं।`,
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

    // 8. Intent: Buyers & Institutional Market
    if (
      q.includes("खरेदीदार") ||
      q.includes("व्यापारी") ||
      q.includes("मागणी") ||
      q.includes("buyer") ||
      q.includes("merchant") ||
      q.includes("demand") ||
      q.includes("order") ||
      q.includes("खरीदार")
    ) {
      if (isMarathi) {
        return {
          lang: "mr",
          question: query,
          response: "कृषीसेतू मंचावर रिलायन्स फ्रेश, बिगबास्केट आणि स्थानिक कृषी व्यापारी थेट FPO प्रमाणित ग्रेड A/B शेतीमाल खरेदी करतात. FPO गुणवत्ता पडताळणीनंतर तुमचा लॉट थेट खरेदीदारांना उत्तम दरात ऑफर केला जातो.",
          actionHint: "माझे ऑर्डर्स टॅबमध्ये खरेदीदारांच्या ऑफर्स तपासा.",
        };
      } else if (isHindi) {
        return {
          lang: "hi",
          question: query,
          response: "कृषिसेतु प्लेटफॉर्म पर रिलायंस फ्रेश, बिगबास्केट और प्रमुख व्यापारी सीधे एफपीओ-सत्यापित ग्रेड A/B फसल खरीदते हैं। गुणवत्ता सत्यापन के बाद आपका लॉट सीधे खरीदारों को पेश किया जाता है।",
          actionHint: "मेरे ऑर्डर्स टैब में खरीदार प्रस्ताव देखें।",
        };
      } else {
        return {
          lang: "en",
          question: query,
          response: "On KrishiSetu, institutional buyers like Reliance Fresh, BigBasket, and registered APMC merchants procure verified Grade A & B lots directly from FPOs with guaranteed escrow payment.",
          actionHint: "Check My Orders tab for active buyer requests.",
        };
      }
    }

    // 9. Intent: Mandi Price Discovery
    const matchedMandi =
      (detectedMandiName
        ? mandiPrices.find((m) => m.crop.toLowerCase().includes(detectedCrop.toLowerCase()) && m.mandi.toLowerCase().includes(detectedMandiName.toLowerCase()))
        : null) ||
      mandiPrices.find((m) => m.crop.toLowerCase().includes(detectedCrop.toLowerCase())) ||
      mandiPrices[0];

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
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedQuery.trim()) return;
    const qaResult = parseAgriculturalIntent(typedQuery, selectedLang);
    setActiveQA(qaResult);
    speakText(qaResult.response, selectedLang);
    setTypedQuery("");
  };

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

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        toast.info("Microphone Active", {
          description: `Listening in ${LANGUAGES.find((l) => l.code === selectedLang)?.label}...`,
        });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInterimTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          const finalQuery = event.results[0][0].transcript;
          setIsListening(false);
          setInterimTranscript("");
          const qaResult = parseAgriculturalIntent(finalQuery, selectedLang);
          setActiveQA(qaResult);
          speakText(qaResult.response, selectedLang);
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
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.error("Could not start microphone");
    }
  };

  const handleSimulateClick = (qa: QAItem) => {
    stopListening();
    setActiveQA(qa);
    speakText(qa.response, selectedLang);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-amber-100 text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {t.voice.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {t.voice.subtitle}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Language Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-lg">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 px-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> Language:
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
            {isListening ? (
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
                      <Volume2 className="w-3.5 h-3.5" /> Speaking...
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-100">&ldquo;{activeQA.question}&rdquo;</p>
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t.voice.advisoryLabel}:
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
                <p className="text-xs">Tap the mic button or type your question below.</p>
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
              {isListening ? "Tap to stop & evaluate" : "Press mic button and speak into your microphone"}
            </span>
          </div>

          {!speechSupported && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Browser SpeechRecognition API not detected; you can type above or tap sample queries below.</span>
            </div>
          )}

          {/* Quick Prompts */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {t.voice.sampleHeader}
            </div>
            <div className="grid gap-2">
              {SAMPLE_QUERIES.map((item, idx) => (
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
