import { Metadata } from "next";
import VoiceAssistantStudio from "@/components/VoiceAssistantStudio";

export const metadata: Metadata = {
  title: "Wishfin Voice Sales Studio",
  description:
    "Design, rehearse, and launch AI-powered sales call assistants for Wishfin.com."
};

export default function Home() {
  return <VoiceAssistantStudio />;
}
