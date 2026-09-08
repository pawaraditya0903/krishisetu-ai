"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";
import { AssistantMessage, ChatActionCard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Loader2,
  Bot,
  User,
  ChevronDown,
  Layers,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import LocationSelectorModal from "./LocationSelectorModal";

// Check speech recognition support safely
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export default function WhatsAppVoiceAssistant() {
  const {
    currentUser,
    farmLocation,
    mandiPrices,
    lots,
    pools,
    settlements,
    chatMessages,
    addChatMessage,
    updateActionCardStatus,
    clearChat,
    deleteConversation,
    joinPool,
    language,
    setLanguage,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check client hydration safely with useSyncExternalStore
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isMr = language === "mr";
  const isHi = language === "hi";

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen, isLoading]);

  // Listen for open event from header Voice button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-krishisetu-chat", handleOpen);
    return () => window.removeEventListener("open-krishisetu-chat", handleOpen);
  }, []);

  // Initial greeting if chat is empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      const greeting = isMr
        ? `नमस्कार! मी कृषीसेतू AI शेतकरी सहाय्यक आहे. ${
            farmLocation ? `${farmLocation.label} जवळील` : ""
          } आजचे थेट बाजारभाव, वाहतूक खर्च, पिकाची प्रतवारी किंवा FPO पूलबद्दल काहीही विचारा.`
        : isHi
        ? `नमस्ते! मैं कृषिसेतु AI किसान सहायक हूँ। आज के मंडी भाव, ढुलाई खर्च या एफपीओ पूल के बारे में पूछें।`
        : `Hello! I am your KrishiSetu AI Assistant. Ask me about nearby mandi prices, net transport outcomes, quality grading, or FPO pooling.`;

      addChatMessage({
        id: `MSG-INIT-${Date.now()}`,
        sender: "bot",
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dataStatus: "Live",
        source: "KrishiSetu AI Engine",
      });
    }
  }, [farmLocation, language, chatMessages.length, addChatMessage, isMr, isHi]);

  // Speak text using browser SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isMr ? "mr-IN" : isHi ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Start Voice Recognition
  const startListening = () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      toast.error(
        isMr
          ? "आपल्या ब्राउझरमध्ये व्हॉइस ओळख समर्थित नाही. कृपया टाईप करा."
          : "Voice recognition is not supported in this browser. Please type your message."
      );
      setIsOpen(true);
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isMr ? "mr-IN" : isHi ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptPreview("");
        setIsOpen(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setTranscriptPreview(transcript);
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Send message to backend Gemini AI route
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    stopListening();

    const userMsg: AssistantMessage = {
      id: `MSG-USR-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language: language as "mr" | "hi" | "en",
    };

    addChatMessage(userMsg);
    setInputText("");
    setTranscriptPreview("");
    setIsLoading(true);

    try {
      // Build real app context
      const context = {
        farmerLocation: farmLocation
          ? {
              label: farmLocation.label,
              district: farmLocation.district,
              state: farmLocation.state,
              lat: farmLocation.lat,
              lng: farmLocation.lng,
            }
          : undefined,
        nearbyMandis: mandiPrices.slice(0, 5).map((m) => ({
          id: m.id,
          mandi: m.mandi,
          district: m.district,
          crop: m.crop,
          modalPrice: m.modalPrice,
          distanceKm: m.distanceKm,
          source: m.source,
          dataStatus: m.dataStatus,
          travelTimeHours: m.travelTimeHours,
        })),
        activeLots: lots.filter((l) => l.farmerId === currentUser?.id).map((l) => ({
          id: l.id,
          crop: l.crop,
          variety: l.variety,
          quantityKg: l.quantityKg,
          grade: l.grade,
          status: l.status,
        })),
        activePools: pools.slice(0, 3).map((p) => ({
          id: p.id,
          crop: p.crop,
          targetKg: p.targetKg,
          currentKg: p.currentKg,
          destinationMandi: p.destinationMandi,
          sharedFreightSavingsPct: p.sharedFreightSavingsPct,
          collectionHub: p.collectionHub,
        })),
        settlements: settlements.slice(0, 2).map((s) => ({
          id: s.id,
          amount: s.amount,
          status: s.status,
          date: s.date,
        })),
      };

      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language: isMr ? "mr-IN" : isHi ? "hi-IN" : "en-IN",
          history: chatMessages.slice(-4).map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: AssistantMessage = {
          id: `MSG-BOT-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          language: language as "mr" | "hi" | "en",
          actionCard: data.actionCard,
          dataStatus: data.dataStatus || "Live",
          source: data.source === "gemini" ? "Google Gemini 3.6 Flash" : "KrishiSetu Indic Engine",
        };

        addChatMessage(botMsg);
        // Automatically read answer aloud
        speakText(data.reply);
      } else {
        throw new Error("Failed response");
      }
    } catch {
      const errorMsg: AssistantMessage = {
        id: `MSG-ERR-${Date.now()}`,
        sender: "bot",
        text: isMr
          ? "मला सध्या कनेक्ट करता आले नाही. कृपया आपला प्रश्न टाईप करा किंवा पुन्हा प्रयत्न करा."
          : "I could not connect right now. Please type your question or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dataStatus: "Live",
      };
      addChatMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Action Confirmation Card decisions
  const handleActionConfirm = (card: ChatActionCard) => {
    updateActionCardStatus(card.id, "confirmed");

    if (card.type === "JOIN_POOL") {
      const { lotId, poolId } = card.payload as { lotId: string; poolId: string };
      if (lotId && poolId) {
        joinPool(lotId, poolId);
        toast.success(
          isMr
            ? "लॉट यशस्वीरित्या FPO पूलमध्ये जोडला गेला!"
            : "Lot successfully joined to FPO pool!"
        );
        addChatMessage({
          id: `MSG-ACT-CONF-${Date.now()}`,
          sender: "bot",
          text: isMr
            ? `अभिनंदन! आपला लॉट (${lotId}) FPO पूलमध्ये जोडला गेला आहे. डॅशबोर्डवर आपली वाहतूक बचत व प्रगती अद्यतन झाली आहे.`
            : `Success! Your lot (${lotId}) has been pooled. Group freight savings applied.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dataStatus: "Live",
        });
      }
    } else if (card.type === "CHANGE_LOCATION") {
      setShowLocationModal(true);
    }
  };

  const handleActionCancel = (card: ChatActionCard) => {
    updateActionCardStatus(card.id, "cancelled");
    addChatMessage({
      id: `MSG-ACT-CANC-${Date.now()}`,
      sender: "bot",
      text: isMr ? "कृती विनंती रद्द केली." : "Action cancelled as requested.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      dataStatus: "Live",
    });
  };

  // Suggested questions based on context
  const SUGGESTED_QUESTIONS = isMr
    ? [
        "आज टोमॅटो कुठे विकू?",
        "माझ्या जवळची मंडी कोणती आहे?",
        "पुणे आणि परभणी भावात काय फरक आहे?",
        "माझा लॉट पूलमध्ये जोडा.",
        "माझ्या लॉटची स्थिती काय आहे?",
        "माझे पैसे कधी मिळतील?",
      ]
    : isHi
    ? [
        "आज टमाटर कहाँ बेचूं?",
        "मेरे सबसे नजदीकी मंडी कौन सी है?",
        "मेरा लॉट पूल में जोड़ें।",
        "मेरे लॉट की स्थिति क्या है?",
        "मेरा भुगतान कब मिलेगा?",
      ]
    : [
        "What is today's tomato price near me?",
        "Which mandi gives me the best estimated profit?",
        "Add my lot to the FPO pool.",
        "What is the status of my crop lot?",
        "When will I receive my payout?",
      ];

  if (!isHydrated) return null;

  return (
    <>
      {/* 1. FLOATING CHATBOT & MICROPHONE BUTTONS (WhatsApp Style) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {/* Floating Microphone Button */}
          <button
            type="button"
            onClick={startListening}
            aria-label="Speak Question"
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative group border-2 border-emerald-400"
          >
            <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-40 group-hover:opacity-75" />
            <Mic className="w-5 h-5 relative z-10" />
            <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isMr ? "बोला (Speak)" : "Speak"}
            </span>
          </button>

          {/* Floating WhatsApp Green Chatbot Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Agriculture Assistant"
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative group border-2 border-white"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-950">
              AI
            </span>
            <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isMr ? "कृषी सहाय्यक (Chat)" : "KrishiSetu Chat"}
            </span>
          </button>
        </div>
      )}

      {/* 2. CHAT DRAWER (Desktop: bottom-right sheet; Mobile: responsive full screen) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 w-full sm:w-[420px] h-full sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-emerald-300">
          {/* WhatsApp Style Emerald Header */}
          <div className="bg-emerald-700 text-white p-3.5 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center border-2 border-emerald-300">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <span>{isMr ? "कृषीसेतू AI सहाय्यक" : "KrishiSetu AI Assistant"}</span>
                  <Badge className="bg-emerald-900 text-emerald-200 border-none text-[9px] px-1 py-0">
                    Online
                  </Badge>
                </div>
                <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[170px]">
                    {farmLocation ? farmLocation.label.split(",")[0] : "Parbhani, MH"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="flex bg-emerald-800/80 rounded-md p-0.5 text-[10px] font-semibold border border-emerald-600">
                <button
                  type="button"
                  onClick={() => setLanguage("mr")}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    language === "mr" ? "bg-white text-emerald-900" : "text-emerald-100"
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    language === "hi" ? "bg-white text-emerald-900" : "text-emerald-100"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    language === "en" ? "bg-white text-emerald-900" : "text-emerald-100"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Clear Chat */}
              <button
                type="button"
                onClick={clearChat}
                title={isMr ? "चॅट साफ करा" : "Clear Chat"}
                className="p-1.5 hover:bg-emerald-800 rounded-md text-emerald-100 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close Drawer */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-emerald-800 rounded-md text-emerald-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice Waveform Overlay when listening */}
          {isListening && (
            <div className="bg-emerald-50 border-b border-emerald-200 p-3 flex flex-col items-center justify-center gap-2 animate-pulse">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-7 bg-emerald-600 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-10 bg-emerald-600 rounded-full animate-bounce delay-200" />
                <span className="w-1.5 h-6 bg-emerald-600 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-3 bg-emerald-600 rounded-full animate-bounce" />
              </div>
              <p className="text-xs font-semibold text-emerald-900">
                {isMr ? "ऐकत आहे... बोला" : isHi ? "सुन रहा हूँ... बोलिए" : "Listening... speak now"}
              </p>
              {transcriptPreview && (
                <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-slate-800 font-medium max-w-xs text-center">
                  “{transcriptPreview}”
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={stopListening}
                className="text-[10px] h-6 px-2 text-red-600 border-red-200"
              >
                <MicOff className="w-3 h-3 mr-1" /> {isMr ? "थांबवा" : "Stop"}
              </Button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#eae6df]/40">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs text-sm ${
                      isUser
                        ? "bg-emerald-600 text-white rounded-tr-none font-medium"
                        : "bg-white text-slate-900 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {/* Bot Message Header */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> KrishiSetu AI
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[9px] text-emerald-700 border-emerald-300 bg-emerald-50 py-0 flex items-center gap-0.5 font-medium"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            {msg.dataStatus === "Cached" || msg.dataStatus === "Stale"
                              ? msg.dataStatus
                              : "Live APMC"}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            title="Listen aloud"
                            className="text-slate-400 hover:text-emerald-700 p-0.5 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Text Body */}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* ACTION CONFIRMATION CARD (Cancel | Confirm) */}
                    {msg.actionCard && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-700" />
                          {msg.actionCard.title}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {msg.actionCard.description}
                        </p>

                        {msg.actionCard.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionCancel(msg.actionCard!)}
                              className="text-xs h-7 px-2.5 text-slate-600 border-slate-300"
                            >
                              {msg.actionCard.cancelText}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleActionConfirm(msg.actionCard!)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-3 font-semibold shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {msg.actionCard.confirmText}
                            </Button>
                          </div>
                        ) : (
                          <div className="pt-1 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            {msg.actionCard.status === "confirmed"
                              ? isMr
                                ? "पुष्टी केली (Confirmed)"
                                : "Confirmed & Action Executed"
                              : isMr
                              ? "रद्द केले (Cancelled)"
                              : "Cancelled"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp & Source */}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-xl w-fit shadow-xs border border-slate-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>
                  {isMr
                    ? "थेट बाजार माहिती तपासत आहे..."
                    : "Checking live market information..."}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <Input
              placeholder={
                isMr
                  ? "प्रश्न विचारा किंवा बोला (उदा. आज टोमॅटो कुठे विकू?)..."
                  : isHi
                  ? "प्रश्न पूछें या बोलें..."
                  : "Type or speak your question..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="text-xs h-9 bg-slate-50 border-slate-200"
            />

            <Button
              size="sm"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="h-9 px-3 bg-emerald-700 hover:bg-emerald-800 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Location Selector Modal for change location action */}
      <LocationSelectorModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
      />
    </>
  );
}
