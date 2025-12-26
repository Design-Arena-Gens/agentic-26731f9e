"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import BrandHeader from "./BrandHeader";
import CallScriptDesigner, { CallScript } from "./CallScriptDesigner";
import CallSimulator, { CallMessage } from "./CallSimulator";
import CallAnalyticsPanel, { CompletedCall } from "./CallAnalyticsPanel";

type ToneId = "consultative" | "energetic" | "concise";
type ProductId = "home-loan" | "credit-card" | "mutual-funds";

const toneLabels: Record<ToneId, string> = {
  consultative: "Consultative",
  energetic: "Energetic",
  concise: "Concise"
};

const productLabels: Record<ProductId, string> = {
  "home-loan": "Wishfin Home Loan Concierge",
  "credit-card": "Wishfin Credit Card Upgrade",
  "mutual-funds": "Wishfin SIP Booster"
};

const scripts: Record<ProductId, CallScript> = {
  "home-loan": {
    opener:
      "Hi, I am Priya calling from Wishfin. Thank you for showing interest in optimising your home loan. Is this a good time to speak?",
    discovery:
      "Great! May I confirm the loan amount you are targeting and whether this is for a new purchase, a balance transfer, or a top-up? How far along are you in selecting a property? What are the key criteria you have in mind when choosing a lender?",
    pitch:
      "Based on what you shared, we can line up three curated offers with pre-approved rates in the next 24 hours. Wishfin works with 75+ lenders and handles documentation end-to-end so you do not lose momentum. Our AI engine analyses your profile to highlight the lowest rate plus hidden charges others often miss.",
    closing:
      "I will drop a secure link on WhatsApp and email where you can upload documents in minutes. Shall we schedule a quick callback tomorrow at your preferred time to walk through the offers together?"
  },
  "credit-card": {
    opener:
      "Hello! This is Arjun from Wishfin. I noticed you recently explored premium credit card upgrades. I can help you unlock a card that rewards your spends better — is now a good time?",
    discovery:
      "Perfect. What kind of spends dominate your monthly usage — travel, online shopping, dining? Do you prefer milestone benefits like fee reversals or direct cashback? Are you currently paying an annual fee on your existing card?",
    pitch:
      "With your profile, I see two cards that elevate your benefits by 3x. One offers airport lounge access plus concierge, the other gives 5% assured cashback on digital spends. Wishfin handles the instant approval journey so you avoid bank branch visits.",
    closing:
      "I can have a curated comparison table delivered to you in five minutes. Which perk appeals more — travel privileges or high cashback? I'll line up the e-sign journey accordingly."
  },
  "mutual-funds": {
    opener:
      "Hi, calling from Wishfin investments. Thanks for engaging with our SIP booster planner. Are you available for a quick conversation?",
    discovery:
      "Wonderful. What monthly investment amount are you comfortable setting aside right now? Do you have any specific goals — maybe a home upgrade, children's education, or building a retirement corpus? How long have you already been investing in mutual funds?",
    pitch:
      "Our planner identifies funds aligned with your goals and risk appetite, adjusting allocations dynamically. Clients using this see up to 22% better SIP performance because we rebalance proactively and eliminate underperformers.",
    closing:
      "I'll email a personalised blueprint with recommended funds and monthly schedule. Shall we book a 15-minute session this week to walk you through and set up the SIP automation?"
  }
};

const toneModifiers: Record<ToneId, Partial<CallScript>> = {
  consultative: {
    opener:
      "Hi, this is Priya from Wishfin. I wanted to personally help you evaluate the best option. Have you got a moment right now?",
    pitch:
      "After understanding your priorities, I'll shortlist a couple of tailored solutions and highlight the trade-offs so you can make a confident call."
  },
  energetic: {
    opener:
      "Hey there! Priya from Wishfin. I am excited to share a quick win for you — can I grab your attention for a minute?",
    pitch:
      "Here is the exciting part — we can get you a decision within hours, so you're moving faster than the market."
  },
  concise: {
    opener:
      "Hi, Priya from Wishfin. I can help you wrap this up quickly — have a minute?",
    discovery: "Let me confirm your requirement and timeline.",
    pitch: "I’ll send a short list of top-fit options today itself.",
    closing: "Can I schedule the next action right away?"
  }
};

const pageContainer: React.CSSProperties = {
  width: "min(1200px, 92vw)",
  margin: "2.5rem auto 4rem",
  display: "grid",
  gap: "1.6rem"
};

const gridLayout: React.CSSProperties = {
  display: "grid",
  gap: "1.4rem",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
  alignItems: "start"
};

const sideColumn: React.CSSProperties = {
  display: "grid",
  gap: "1.4rem"
};

const highlightCard: React.CSSProperties = {
  padding: "1.5rem",
  borderRadius: "1.4rem",
  background: "rgba(3, 16, 24, 0.65)",
  border: "1px solid rgba(0, 180, 216, 0.25)",
  backdropFilter: "blur(20px)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const personaTagStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "0.45rem 0.85rem",
  borderRadius: "999px",
  background: "rgba(0, 180, 216, 0.16)",
  color: "#c2f2ff",
  fontSize: "0.8rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase"
};

export default function VoiceAssistantStudio() {
  const [product, setProduct] = useState<ProductId>("home-loan");
  const [tone, setTone] = useState<ToneId>("consultative");
  const [script, setScript] = useState<CallScript>(() => scripts["home-loan"]);
  const [callHistory, setCallHistory] = useState<CompletedCall[]>([]);

  useEffect(() => {
    const baseScript = scripts[product];
    const modifier = toneModifiers[tone];
    setScript({
      opener: modifier?.opener ?? baseScript.opener,
      discovery: modifier?.discovery ?? baseScript.discovery,
      pitch: modifier?.pitch ?? baseScript.pitch,
      closing: modifier?.closing ?? baseScript.closing
    });
  }, [product, tone]);

  const persona = useMemo(
    () => ({
      name: tone === "energetic" ? "Arjun" : "Priya",
      role: "Wishfin Growth Advisor",
      product: productLabels[product],
      tone: toneLabels[tone]
    }),
    [product, tone]
  );

  const handleScriptChange = (partial: Partial<CallScript>) => {
    setScript((previous) => ({ ...previous, ...partial }));
  };

  const handleCallReview = (transcript: CallMessage[], outcome: "success" | "follow-up" | "lost") => {
    setCallHistory((previous) => [
      ...previous,
      {
        transcript,
        outcome,
        completedAt: Date.now()
      }
    ]);
  };

  const quickPrompts = [
    "Highlight 0% processing fee campaign",
    "Position instant approval with documentation concierge",
    "Address rate comparison and trust Wishfin's partner network"
  ];

  return (
    <main style={pageContainer}>
      <BrandHeader subtitle="Build, rehearse, and iterate on AI-driven sales calls crafted for Wishfin.com. Craft scripts, simulate real conversations, and capture insights to train your voice agent." />
      <motion.div layout style={gridLayout}>
        <motion.div layout style={sideColumn}>
          <motion.section
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={highlightCard}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem" }}>Agent Persona</h2>
                <p style={{ margin: "0.5rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                  Preview the attributes driving the AI voice for this campaign.
                </p>
              </div>
              <span style={personaTagStyle}>{persona.tone}</span>
            </div>
            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                borderRadius: "1.1rem",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "1rem",
                background: "rgba(1, 10, 16, 0.55)"
              }}
            >
              <PersonaRow title="Voice Identity" value={`${persona.name}, ${persona.role}`} />
              <PersonaRow title="Campaign Focus" value={persona.product} />
              <PersonaRow
                title="Talk Track"
                value={
                  tone === "energetic"
                    ? "High-energy, optimistic, drives urgency"
                    : tone === "concise"
                    ? "Straight to the point, respects time"
                    : "Guided advisor, nurtures trust"
                }
              />
            </div>
            <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
              {quickPrompts.map((prompt) => (
                <span
                  key={prompt}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.9rem",
                    background: "rgba(0, 180, 216, 0.12)",
                    border: "1px solid rgba(0, 180, 216, 0.25)",
                    fontSize: "0.8rem",
                    color: "#bff3ff"
                  }}
                >
                  {prompt}
                </span>
              ))}
            </div>
          </motion.section>
          <CallScriptDesigner
            product={product}
            tone={tone}
            script={script}
            onProductChange={(value) => setProduct(value as ProductId)}
            onToneChange={(value) => setTone(value as ToneId)}
            onScriptChange={handleScriptChange}
          />
        </motion.div>
        <div style={{ display: "grid", gap: "1.4rem" }}>
          <CallSimulator
            script={script}
            productLabel={productLabels[product]}
            toneLabel={toneLabels[tone]}
            onCallReview={handleCallReview}
          />
          <CallAnalyticsPanel calls={callHistory} />
        </div>
      </motion.div>
    </main>
  );
}

function PersonaRow({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span
        style={{
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "rgba(210,240,255,0.65)"
        }}
      >
        {title}
      </span>
      <span style={{ fontWeight: 600, letterSpacing: "0.02em" }}>{value}</span>
    </div>
  );
}
