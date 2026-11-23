import React, { useState } from "react";
import { Mic, X, RefreshCw, ArrowRight } from "lucide-react";
import { authFetch } from "../lib/authSession";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (query: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onApplyQuery,
}) => {
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "mr">("en");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    english_translation?: string;
    extracted_intent?: string;
    suggested_query?: string;
  } | null>(null);

  if (!isOpen) return null;

  const presets = {
    en: [
      "Show my latest blood sugar and HbA1c test results",
      "Book an appointment with Dr. Rajesh Sharma",
      "What medications are currently active for my blood pressure?",
      "Do I have any documented drug allergies?",
    ],
    hi: [
      "मेरी पिछली ब्लड टेस्ट और शुगर रिपोर्ट दिखाओ",
      "डॉक्टर राजेश शर्मा के साथ अपॉइंटमेंट बुक करना है",
      "मुझे ब्लड प्रेशर की कौन सी दवाई लेनी है?",
      "मेरे सीने में हल्का दर्द और सांस लेने में तकलीफ है",
    ],
    mr: [
      "माझे मागच्या महिन्याचे रक्ताचे रिपोर्ट आणि शुगर तपासा",
      "डॉक्टर राजेश शर्मा यांच्याकडे अपॉइंटमेंट हवी आहे",
      "मला रक्तदाबाची औषध सकाळी कधी घ्यायची आहे?",
      "मला पेनिसिलिनची ॲलर्जी आहे का ते दाखवा",
    ],
  };

  const handleSelectPreset = async (text: string) => {
    setTranscript(text);
    await processVoiceText(text, selectedLang);
  };

  const processVoiceText = async (text: string, lang: string) => {
    setIsProcessing(true);
    try {
      const res = await authFetch("/api/voice-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, language: lang }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateMic = () => {
    setIsRecording(true);
    const sample = presets[selectedLang][0];
    setTimeout(() => {
      setTranscript(sample);
      setIsRecording(false);
      processVoiceText(sample, selectedLang);
    }, 1200);
  };

  const handleApply = () => {
    const finalQuery = result?.suggested_query || result?.english_translation || transcript;
    onApplyQuery(finalQuery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              Voice Clinical Query
            </h2>
            <p className="text-xs text-slate-400">
              Query records in English, Hindi, or Marathi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Language Selector */}
          <div>
            <span className="text-slate-400 text-[11px] block uppercase mb-1.5">Language:</span>
            <div className="flex gap-2">
              {[
                { id: "en", label: "English" },
                { id: "hi", label: "हिन्दी" },
                { id: "mr", label: "मराठी" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLang(lang.id as any);
                    setResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                    selectedLang === lang.id
                      ? "bg-slate-900 text-white border-slate-900 font-medium"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Voice Phrases */}
          <div>
            <span className="text-slate-400 text-[11px] block uppercase mb-1.5">Suggested Queries:</span>
            <div className="space-y-1.5">
              {presets[selectedLang].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="w-full p-2 text-left border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Mic Simulation Button */}
          <div className="p-4 border border-slate-200 rounded-md flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-900 block">Voice Input</span>
              <span className="text-slate-400 text-[11px]">
                {isRecording ? "Listening..." : "Click to speak"}
              </span>
            </div>
            <button
              onClick={handleSimulateMic}
              disabled={isRecording || isProcessing}
              className={`p-2.5 rounded-md transition-colors cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-2xs"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Result */}
          {transcript && (
            <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-md space-y-1">
              <span className="text-teal-700 text-[11px] font-medium block">Recognized Query:</span>
              <p className="text-slate-900 font-semibold">{transcript}</p>
              {result?.suggested_query && (
                <div className="pt-2 border-t border-teal-200 mt-2">
                  <span className="text-teal-700 text-[11px] font-medium block">Extracted Clinical Intent:</span>
                  <p className="text-teal-950 font-medium">{result.suggested_query}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          {transcript && (
            <button
              onClick={handleApply}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-2xs cursor-pointer"
            >
              Apply to Patient Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
