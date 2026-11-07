"use client";

import { useEffect } from "react";
import { setVoiceRate } from "@/lib/speech/tts";

/** Aplica la velocidad de voz del perfil a toda la app (Explorar, palabras, repaso). */
export function VoiceRateSync({ rate }: { rate: number }) {
  useEffect(() => {
    setVoiceRate(rate);
  }, [rate]);
  return null;
}
