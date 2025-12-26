"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CallScript } from "./CallScriptDesigner";
import { useSpeechEngine } from "./speechEngine";

export type CallMessageRole = "agent" | "prospect" | "note";

export interface CallMessage {
  id: string;
  role: CallMessageRole;
  content: string;
  timestamp: number;
}

interface CallSimulatorProps {
  script: CallScript;
  productLabel: string;
  toneLabel: string;
  onCallReview: (transcript: CallMessage[], outcome: "success" | "follow-up" | "lost") => void;
}

const cardStyle: React.CSSProperties = {
  background: "rgba(9, 20, 32, 0.76)",
  border: "1px solid rgba(116, 242, 206, 0.18)",
  borderRadius: "1.4rem",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  backdropFilter: "blur(18px)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.35)"
};

const buttonBase: React.CSSProperties = {
  borderRadius: "999px",
  border: "none",
  padding: "0.85rem 1.6rem",
  fontWeight: 600,
  letterSpacing: "0.03em",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem"
};

const agentBubble: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "linear-gradient(135deg, rgba(0, 180, 216, 0.75), rgba(0, 91, 150, 0.75))",
  borderRadius: "1rem 1rem 1rem 0.35rem",
  padding: "1rem",
  lineHeight: 1.5,
  fontSize: "0.95rem",
  color: "#f3fdff",
  maxWidth: "80%"
};

const prospectBubble: React.CSSProperties = {
  alignSelf: "flex-end",
  background: "rgba(255, 255, 255, 0.08)",
  borderRadius: "1rem 1rem 0.35rem 1rem",
  padding: "1rem",
  lineHeight: 1.5,
  fontSize: "0.95rem",
  color: "#e8f7ff",
  maxWidth: "80%"
};

const noteBadge: React.CSSProperties = {
  alignSelf: "center",
  background: "rgba(116, 242, 206, 0.12)",
  borderRadius: "999px",
  padding: "0.35rem 0.9rem",
  fontSize: "0.75rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(184, 255, 235, 0.85)"
};

const synthesizeSegments = (text: string) =>
  text
    .split(/[.\n]/)
    .map((segment) => segment.trim())
    .filter(Boolean);

const agentFlowFromScript = (script: CallScript) => ({
  opener: synthesizeSegments(script.opener),
  discovery: synthesizeSegments(script.discovery),
  pitch: synthesizeSegments(script.pitch),
  closing: synthesizeSegments(script.closing)
});

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export default function CallSimulator({
  script,
  productLabel,
  toneLabel,
  onCallReview
}: CallSimulatorProps) {
  const [callActive, setCallActive] = useState(false);
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [userDraft, setUserDraft] = useState("");
  const [outcome, setOutcome] = useState<"success" | "follow-up" | "lost" | null>(null);
  const flow = useMemo(() => agentFlowFromScript(script), [script]);
  const agentTurns = useMemo(() => flow.opener.length + flow.discovery.length + flow.pitch.length + flow.closing.length, [flow]);
  const { speak, listen, listening, stop, supportsListening, supportsSpeaking } = useSpeechEngine();

  useEffect(() => {
    if (!callActive) return;
    if (!messages.length) {
      const opener = flow.opener[0] ?? "Hello, this is your Wishfin advisor. How can I help today?";
      pushAgentMessage(opener);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callActive]);

  const resetCall = () => {
    stop();
    setCallActive(false);
    setMessages([]);
    setOutcome(null);
    setUserDraft("");
  };

  const appendMessage = (message: CallMessage) => {
    let snapshot: CallMessage[] = [];
    setMessages((previous) => {
      snapshot = [...previous, message];
      return snapshot;
    });
    return snapshot;
  };

  const pushAgentMessage = (content: string) => {
    const message: CallMessage = {
      id: generateId(),
      role: "agent",
      content,
      timestamp: Date.now()
    };
    appendMessage(message);
    if (supportsSpeaking) {
      speak(content);
    }
  };

  const pushProspectMessage = (content: string) => {
    const message: CallMessage = {
      id: generateId(),
      role: "prospect",
      content,
      timestamp: Date.now()
    };
    return appendMessage(message);
  };

  const pushNote = (content: string) => {
    appendMessage({
      id: generateId(),
      role: "note",
      content,
      timestamp: Date.now()
    });
  };

  const resolveAgentTurn = (conversation: CallMessage[] = messages) => {
    const agentMessages = conversation.filter((message) => message.role === "agent");
    const stageIndex = agentMessages.length;
    const getSegment = (segments: string[], index: number) =>
      index >= 0 && index < segments.length ? segments[index] : null;

    if (stageIndex < flow.opener.length) {
      return getSegment(flow.opener, stageIndex);
    }
    const discoveryIndex = stageIndex - flow.opener.length;
    if (discoveryIndex < flow.discovery.length) {
      return getSegment(flow.discovery, discoveryIndex);
    }
    const pitchIndex = discoveryIndex - flow.discovery.length;
    if (pitchIndex < flow.pitch.length) {
      return getSegment(flow.pitch, pitchIndex);
    }
    const closingIndex = pitchIndex - flow.pitch.length;
    if (closingIndex < flow.closing.length) {
      return getSegment(flow.closing, closingIndex);
    }
    return null;
  };

  const handleProspectResponse = (content: string) => {
    if (!content.trim()) return;
    const snapshot = pushProspectMessage(content.trim());
    setUserDraft("");
    const nextAgentTurn = resolveAgentTurn(snapshot);
    if (nextAgentTurn) {
      setTimeout(() => pushAgentMessage(nextAgentTurn), 600);
    } else {
      pushNote("Script complete — wrap the call.");
    }
  };

  const handleVoiceCapture = async () => {
    if (!supportsListening) {
      return;
    }
    const transcript = await listen();
    if (transcript) {
      handleProspectResponse(transcript);
    }
  };

  const handleOutcome = (result: "success" | "follow-up" | "lost") => {
    setOutcome(result);
    setCallActive(false);
    stop();
    onCallReview([...messages], result);
  };

  const agentSummary = `${productLabel} • ${toneLabel} tone`;
  const callCompletion = Math.min(
    100,
    Math.round((messages.filter((m) => m.role === "agent").length / Math.max(agentTurns, 1)) * 100)
  );

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={cardStyle}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Call Simulator</h2>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {agentSummary} · Completion {callCompletion}%
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              ...buttonBase,
              background: callActive ? "rgba(255, 99, 132, 0.2)" : "rgba(0, 180, 216, 0.25)",
              color: callActive ? "#ffd6dd" : "#c9f6ff",
              border: callActive ? "1px solid rgba(255, 99, 132, 0.4)" : "1px solid rgba(0, 180, 216, 0.35)"
            }}
            onClick={() => {
              if (callActive) {
                resetCall();
              } else {
                setCallActive(true);
                pushNote("Outbound call dialed...");
              }
            }}
          >
            {callActive ? "End Call" : "Start Call"}
          </button>
          <button
            type="button"
            style={{
              ...buttonBase,
              background: "rgba(116, 242, 206, 0.2)",
              color: "#bfffe9",
              border: "1px solid rgba(116, 242, 206, 0.35)",
              opacity: supportsListening ? 1 : 0.4,
              pointerEvents: supportsListening ? "auto" : "none"
            }}
            onClick={handleVoiceCapture}
          >
            {listening ? "Listening…" : "Capture Voice"}
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: "1.2rem",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(2, 12, 19, 0.3)",
          padding: "1.1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          maxHeight: "360px",
          overflowY: "auto"
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>
            Start the call to hear the agent deliver your Wishfin pitch. Speak or type to play
            the role of the customer.
          </p>
        )}
        {messages.map((message) => {
          if (message.role === "note") {
            return (
              <span key={message.id} style={noteBadge}>
                {message.content}
              </span>
            );
          }
          const style = message.role === "agent" ? agentBubble : prospectBubble;
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={style}
            >
              {message.content}
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gap: "0.75rem"
        }}
      >
        <textarea
          placeholder="Type the customer's response..."
          value={userDraft}
          onChange={(event) => setUserDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleProspectResponse(userDraft);
            }
          }}
          style={{
            width: "100%",
            minHeight: "96px",
            borderRadius: "1rem",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0, 15, 28, 0.6)",
            color: "#e7faff",
            padding: "1rem",
            fontSize: "0.95rem",
            resize: "vertical",
            outline: "none"
          }}
        />
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            style={{
              ...buttonBase,
              background: "rgba(0, 180, 216, 0.85)",
              color: "#04121c"
            }}
            onClick={() => handleProspectResponse(userDraft)}
          >
            Send Reply
          </button>
          <button
            type="button"
            style={{
              ...buttonBase,
              background: "transparent",
              color: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(255,255,255,0.15)"
            }}
            onClick={() => setUserDraft("")}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
        <OutcomeButton
          label="Won"
          variant="success"
          active={outcome === "success"}
          onClick={() => handleOutcome("success")}
        />
        <OutcomeButton
          label="Follow Up"
          variant="follow-up"
          active={outcome === "follow-up"}
          onClick={() => handleOutcome("follow-up")}
        />
        <OutcomeButton
          label="Lost"
          variant="lost"
          active={outcome === "lost"}
          onClick={() => handleOutcome("lost")}
        />
      </div>
    </motion.section>
  );
}

function OutcomeButton({
  label,
  variant,
  active,
  onClick
}: {
  label: string;
  variant: "success" | "follow-up" | "lost";
  active: boolean;
  onClick: () => void;
}) {
  const palette: Record<typeof variant, { bg: string; border: string; color: string }> = {
    success: {
      bg: "rgba(116, 242, 206, 0.2)",
      border: "1px solid rgba(116, 242, 206, 0.45)",
      color: "#9cfadf"
    },
    "follow-up": {
      bg: "rgba(255, 205, 86, 0.22)",
      border: "1px solid rgba(255, 205, 86, 0.42)",
      color: "#fde9b5"
    },
    lost: {
      bg: "rgba(255, 99, 132, 0.22)",
      border: "1px solid rgba(255, 99, 132, 0.45)",
      color: "#ffd7df"
    }
  };
  const styles = palette[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: "999px",
        padding: "0.6rem 1.1rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        background: active ? styles.bg : "transparent",
        border: active ? styles.border : "1px solid rgba(255,255,255,0.1)",
        color: active ? styles.color : "rgba(255,255,255,0.7)",
        cursor: "pointer",
        transition: "transform 0.2s ease"
      }}
    >
      {label}
    </button>
  );
}
