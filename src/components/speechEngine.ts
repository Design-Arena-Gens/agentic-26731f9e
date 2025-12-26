"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Minimal fallbacks to keep TypeScript happy when SpeechRecognition types are missing.
type SpeechRecognitionEvent = any;
type RecognitionInstance = any;
type RecognitionConstructor = new () => RecognitionInstance;

declare global {
  interface Window {
    webkitSpeechRecognition?: RecognitionConstructor;
    SpeechRecognition?: RecognitionConstructor;
  }
}

const tryGetRecognition = (): RecognitionInstance => {
  if (typeof window === "undefined") {
    return null;
  }

  const RecognitionCtor =
    (window as Window).SpeechRecognition || window.webkitSpeechRecognition;

  if (!RecognitionCtor) {
    return null;
  }

  try {
    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    return recognition as RecognitionInstance;
  } catch {
    return null;
  }
};

const prefersWishfinVoice = (voice: SpeechSynthesisVoice) =>
  voice.name.includes("Google") && voice.lang.startsWith("en-IN");

export function useSpeechEngine() {
  const recognitionRef = useRef<RecognitionInstance>(null);
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supportsListening, setSupportsListening] = useState(false);

  useEffect(() => {
    const recognition = tryGetRecognition();
    recognitionRef.current = recognition;
    setSupportsListening(Boolean(recognition));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      return;
    }

    const synth = window.speechSynthesis;

    const handleVoicesChanged = () => {
      const loadedVoices = synth.getVoices();
      setVoices(loadedVoices);
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);
    handleVoicesChanged();

    return () => {
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
    };
  }, []);

  const preferredVoice = useMemo(() => {
    if (!voices.length) return null;
    return (
      voices.find((voice) => prefersWishfinVoice(voice)) ??
      voices.find((voice) => voice.lang.startsWith("en")) ??
      voices[0]
    );
  }, [voices]);

  const speak = useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      if (!text.trim()) return;
      const utterance = new SpeechSynthesisUtterance(text);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.02;
      synth.speak(utterance);
    },
    [preferredVoice]
  );

  const listen = useCallback(() => {
    if (!recognitionRef.current) {
      return Promise.resolve<string>("");
    }

    const recognition = recognitionRef.current;
    return new Promise<string>((resolve) => {
      const handleResult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from((event as any).results as any[])
          .map((result: any) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();
        resolve(transcript);
        cleanup();
      };

      const handleError = () => {
        resolve("");
        cleanup();
      };

      const handleEnd = () => {
        cleanup();
      };

      const cleanup = () => {
        recognition.removeEventListener("result", handleResult);
        recognition.removeEventListener("error", handleError);
        recognition.removeEventListener("end", handleEnd);
        setListening(false);
      };

      recognition.addEventListener("result", handleResult);
      recognition.addEventListener("error", handleError);
      recognition.addEventListener("end", handleEnd);
      recognition.start();
      setListening(true);
    });
  }, []);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  return {
    speak,
    listen,
    stop,
    listening,
    supportsListening,
    supportsSpeaking:
      typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined"
  };
}
