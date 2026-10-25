"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Sparkles, MessageSquare } from "lucide-react";

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

const SAMPLE_QUERIES: QAItem[] = [
  {
    lang: "mr",
    question: "आज बारामती आणि पुण्यात टोमॅटोचा काय भाव चालू आहे?",
    response: "आज बारामती बाजारात टोमॅटोचा सरासरी भाव ₹१,८५०/क्विंटल आहे आणि पुणे गुलटेकडी बाजारात ₹२,१५०/क्विंटल आहे. वाहतूक खर्च वजा जाता पुण्यातील निव्वळ नफा जास्त आहे.",
    actionHint: "बाजारभाव पृष्ठावर जाऊन सविस्तर खर्च तपासा.",
  },
  {
    lang: "mr",
    question: "मी आज टोमॅटो विकावा की ३ दिवस थांबावे?",
    response: "AI विक्री सल्लागारानुसार: पुढील ३-५ दिवसांत आवक कमी राहण्याचा अंदाज असल्याने भाव ₹११० वाढू शकतात. मात्र टोमॅटो नाशवंत असल्याने सुरक्षित साठवणूक असल्यास थांबावे, अथवा आजच्या FPO पूलमध्ये सामील व्हावे.",
    actionHint: "विक्री सल्लागार पृष्ठावर जाऊन P10/P50/P90 आलेख पहा.",
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
    response: "Farmer Ramesh Patil has ₹8,420 credited in settlement from the previous Solapur dispatch. Today's verified 450 kg lot is queued for buyer delivery acceptance.",
    actionHint: "Visit Settlement tab to view the itemized digital weigh-slip and receipt.",
  },
];

export default function VoiceAssistantModal({ open, onOpenChange }: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [activeQA, setActiveQA] = useState<QAItem | null>(SAMPLE_QUERIES[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSimulateListen = (qa: QAItem) => {
    setIsListening(true);
    setActiveQA(null);
    setTimeout(() => {
      setIsListening(false);
      setActiveQA(qa);
      speakText(qa.response);
    }, 1200);
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">KrishiSetu Voice Assistant</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Powered by Bhashini AI Speech Architecture (Multi-lingual Marathi / Hindi / English)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Waveform / Mic Visualizer */}
          <div className="bg-slate-900 rounded-xl p-6 text-center text-white relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
            {isListening ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-10">
                  <span className="w-1.5 h-6 bg-green-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-10 bg-green-300 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1.5 h-8 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-10 bg-green-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-1.5 h-5 bg-green-300 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                </div>
                <p className="text-sm text-green-300 font-medium">Listening to farmer voice input...</p>
              </div>
            ) : activeQA ? (
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" /> Farmer Query ({activeQA.lang.toUpperCase()})
                </div>
                <p className="text-sm font-medium text-slate-100 italic">&ldquo;{activeQA.question}&rdquo;</p>
                <div className="pt-2 border-t border-slate-700/80">
                  <div className="flex items-center justify-between text-xs text-green-400 font-semibold mb-1">
                    <span>KrishiSetu Advisory</span>
                    {isSpeaking && (
                      <span className="flex items-center gap-1 text-[10px] text-green-300 animate-pulse">
                        <Volume2 className="w-3 h-3" /> Speaking...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeQA.response}</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <Mic className="w-8 h-8 opacity-40" />
                Tap a sample farmer question below to test regional speech interaction.
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Try Sample Farmer Voice Prompts:
            </div>
            <div className="grid gap-2">
              {SAMPLE_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateListen(item)}
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

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 leading-normal">
            <strong>Architecture Note:</strong> In local sandbox mode, queries are routed through deterministic regional NLU matching and client-side speech synthesis. Production integrates directly with Government of India&apos;s Bhashini API for Indic ASR &amp; TTS.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {activeQA && (
            <Button
              size="sm"
              className="bg-green-700 hover:bg-green-800"
              onClick={() => speakText(activeQA.response)}
            >
              <Volume2 className="w-4 h-4 mr-1.5" /> Repeat Audio
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
