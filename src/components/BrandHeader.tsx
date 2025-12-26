"use client";

import { motion } from "framer-motion";

interface BrandHeaderProps {
  subtitle: string;
}

export default function BrandHeader({ subtitle }: BrandHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: "1.75rem 0",
        alignItems: "center",
        textAlign: "center"
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.65rem"
        }}
      >
        <span
          style={{
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            background: "linear-gradient(120deg, #74f2ce 0%, #0ed2f7 50%, #007cf0 100%)",
            WebkitTextFillColor: "transparent",
            WebkitBackgroundClip: "text"
          }}
        >
          Wishfin
        </span>
        <span
          style={{
            fontSize: "0.95rem",
            padding: "0.28rem 0.65rem",
            borderRadius: "999px",
            background: "rgba(0, 180, 216, 0.18)",
            color: "#b8f1ff",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600
          }}
        >
          Voice Sales Studio
        </span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        style={{
          color: "var(--muted)",
          maxWidth: "38rem",
          fontSize: "1.05rem",
          lineHeight: 1.5,
          margin: 0
        }}
      >
        {subtitle}
      </motion.p>
    </motion.header>
  );
}
