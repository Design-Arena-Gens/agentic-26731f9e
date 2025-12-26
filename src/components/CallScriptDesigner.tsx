"use client";

import { ChangeEvent } from "react";
import { motion } from "framer-motion";

export interface CallScript {
  opener: string;
  discovery: string;
  pitch: string;
  closing: string;
}

interface CallScriptDesignerProps {
  product: string;
  onProductChange: (product: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  script: CallScript;
  onScriptChange: (partial: Partial<CallScript>) => void;
}

const tones = [
  { id: "consultative", label: "Consultative" },
  { id: "energetic", label: "Energetic" },
  { id: "concise", label: "Concise" }
];

const products = [
  { id: "home-loan", label: "Home Loan Advisory" },
  { id: "credit-card", label: "Credit Card Upsell" },
  { id: "mutual-funds", label: "Mutual Fund SIP" }
];

const cardStyle: React.CSSProperties = {
  background: "rgba(13, 30, 45, 0.78)",
  border: "1px solid rgba(0, 180, 216, 0.18)",
  borderRadius: "1.4rem",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.2rem",
  backdropFilter: "blur(22px)",
  boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35)"
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(226, 246, 255, 0.68)",
  fontWeight: 600
};

const textAreaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "115px",
  borderRadius: "1rem",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  background: "rgba(3, 12, 19, 0.65)",
  color: "#f5fbff",
  padding: "1rem",
  fontSize: "0.95rem",
  resize: "vertical",
  outline: "none",
  lineHeight: 1.5,
  transition: "border 0.2s ease, box-shadow 0.2s ease"
};

const selectStyle: React.CSSProperties = {
  ...textAreaStyle,
  minHeight: "unset",
  height: "52px",
  appearance: "none"
};

const ScriptField = ({
  label,
  name,
  value,
  onChange
}: {
  label: string;
  name: keyof CallScript;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
    <span style={labelStyle}>{label}</span>
    <textarea
      style={textAreaStyle}
      name={name}
      value={value}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
      onFocus={(event) => {
        event.currentTarget.style.border = "1px solid rgba(0, 180, 216, 0.65)";
        event.currentTarget.style.boxShadow = "0 0 0 4px rgba(0, 180, 216, 0.15)";
      }}
      onBlur={(event) => {
        event.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.08)";
        event.currentTarget.style.boxShadow = "none";
      }}
    />
  </label>
);

export default function CallScriptDesigner({
  product,
  tone,
  script,
  onProductChange,
  onToneChange,
  onScriptChange
}: CallScriptDesignerProps) {
  const handleDropDownChange = (
    event: ChangeEvent<HTMLSelectElement>,
    handler: (value: string) => void
  ) => handler(event.target.value);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={cardStyle}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.2rem",
          flexWrap: "wrap"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
          Script Designer
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            Product
            <select
              style={selectStyle}
              value={product}
              onChange={(event) => handleDropDownChange(event, onProductChange)}
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...labelStyle, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            Tone
            <select
              style={selectStyle}
              value={tone}
              onChange={(event) => handleDropDownChange(event, onToneChange)}
            >
              {tones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.1rem" }}>
        <ScriptField
          label="Opening Hook"
          name="opener"
          value={script.opener}
          onChange={(value) => onScriptChange({ opener: value })}
        />
        <ScriptField
          label="Discovery Questions"
          name="discovery"
          value={script.discovery}
          onChange={(value) => onScriptChange({ discovery: value })}
        />
        <ScriptField
          label="Pitch Narrative"
          name="pitch"
          value={script.pitch}
          onChange={(value) => onScriptChange({ pitch: value })}
        />
        <ScriptField
          label="Closing & Next Steps"
          name="closing"
          value={script.closing}
          onChange={(value) => onScriptChange({ closing: value })}
        />
      </div>
    </motion.section>
  );
}
