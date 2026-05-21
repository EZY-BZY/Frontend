"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

/* ── floating action cards ─────────────────────────────────────── */
const CARDS = [
  {
    id: "card1",
    icon: "📦",
    color: "#0A3D62",
    style: { top: "8%", insetInlineStart: "0" },
    delay: 0,
  },
  {
    id: "card2",
    icon: "✅",
    color: "#28B8B1",
    style: { top: "36%", insetInlineEnd: "0" },
    delay: 0.45,
  },
  {
    id: "card3",
    icon: "👤",
    color: "#6366f1",
    style: { bottom: "28%", insetInlineStart: "0" },
    delay: 0.9,
  },
  {
    id: "card4",
    icon: "🚀",
    color: "#f59e0b",
    style: { bottom: "6%", insetInlineEnd: "0" },
    delay: 1.35,
  },
] as const;

function FloatingCard({
  icon,
  color,
  title,
  sub,
  style,
  delay,
}: {
  icon: string;
  color: string;
  title: string;
  sub: string;
  style: React.CSSProperties;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.5, delay },
        y: { duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{ position: "absolute", ...style }}
      className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] w-44"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: `${color}18` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-gray-800">{title}</p>
        <p className="truncate text-[10px] text-gray-400">{sub}</p>
      </div>
    </motion.div>
  );
}

/* ── mini phone mockup ─────────────────────────────────────────── */
function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[460px] w-[220px] rounded-[2.5rem] border-2 border-[#1E3A5F] bg-linear-to-b from-[#0D1F3C] to-[#050E1A] shadow-[0_0_80px_rgba(40,184,177,0.15),0_40px_60px_rgba(0,0,0,0.2)]">
      {/* Side buttons */}
      <div className="absolute inset-s-[-3px] top-20 h-7 w-[3px] rounded-s-full bg-[#1E3A5F]" />
      <div className="absolute inset-s-[-3px] top-32 h-10 w-[3px] rounded-s-full bg-[#1E3A5F]" />
      <div className="absolute inset-e-[-3px] top-28 h-12 w-[3px] rounded-e-full bg-[#1E3A5F]" />
      {/* Pill notch */}
      <div className="absolute left-1/2 top-2.5 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#0A1628]" />

      {/* Screen */}
      <div className="absolute inset-[3px] overflow-hidden rounded-[calc(2.5rem-3px)] bg-[#080F1D]">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 pt-8 pb-2">
          <span className="text-[10px] font-semibold text-white/40">9:41</span>
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#28B8B1]" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <p className="text-[10px] text-white/40">B-EASY</p>
            <p className="text-xs font-bold text-white">Overview</p>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A3D62] text-[10px] font-bold text-white">
            A
          </div>
        </div>

        {/* Revenue card */}
        <div className="mx-3 mt-1 rounded-xl bg-linear-to-br from-[#0A3D62] to-[#0D4E7A] p-3">
          <p className="text-[9px] text-white/50">Total Revenue</p>
          <p className="mt-0.5 text-base font-bold text-white">SAR 24,500</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-full bg-[#28B8B1]/20 px-1.5 py-0.5 text-[8px] font-medium text-[#28B8B1]">
              ↑ 12.3%
            </span>
            <span className="text-[8px] text-white/30">vs last month</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-3 mt-2 grid grid-cols-2 gap-2">
          {[
            { label: "Orders", value: "142" },
            { label: "Clients", value: "38" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 p-2.5">
              <p className="text-[8px] text-white/40">{s.label}</p>
              <p className="mt-0.5 text-sm font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="mx-3 mt-2">
          <p className="mb-1.5 text-[9px] font-semibold text-white/40">RECENT</p>
          {[
            { emoji: "📦", text: "Order #442", sub: "Delivered" },
            { emoji: "✅", text: "Payment", sub: "Cleared" },
          ].map((item) => (
            <div
              key={item.text}
              className="mb-1.5 flex items-center gap-2 rounded-lg bg-white/4 px-2.5 py-2"
            >
              <span className="text-sm">{item.emoji}</span>
              <div>
                <p className="text-[9px] font-medium text-white/80">{item.text}</p>
                <p className="text-[8px] text-white/40">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom nav bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-white/5 bg-[#080F1D] px-4 py-3">
          {["⊞", "📋", "👥", "⚙️"].map((icon, i) => (
            <span
              key={i}
              className={`text-base ${i === 0 ? "text-[#28B8B1]" : "text-white/30"}`}
            >
              {icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────── */
export function Hero() {
  const t = useTranslations("landing.hero");
  const locale = useLocale();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16 bg-linear-to-b from-slate-50/60 to-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 inset-s-1/4 h-[700px] w-[700px] rounded-full bg-[#28B8B1]/8 blur-[140px]" />
        <div className="absolute bottom-0 inset-e-1/4 h-[600px] w-[600px] rounded-full bg-[#0A3D62]/6 blur-[120px]" />
        {/* Large teal mesh blob anchored to the phone side */}
        <div className="absolute top-1/4 inset-e-0 h-[800px] w-[60%] rounded-full bg-linear-to-bl from-[#28B8B1]/10 via-[#28B8B1]/4 to-transparent blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(10,61,98,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(10,61,98,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Badge */}
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#28B8B1] animate-pulse" />
              {t("badge")}
            </span>

            {/* Headline */}
            <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t("title")}
              <br />
              <span className="bg-linear-to-r from-[#28B8B1] to-[#0A3D62] bg-clip-text text-transparent">
                {t("titleAccent")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 rounded-full bg-[#28B8B1] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(40,184,177,0.25)] hover:bg-[#22A69F] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(40,184,177,0.35)] transition-all duration-200"
              >
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {t("ctaSecondary")}
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#0A3D62", "#28B8B1", "#6366f1", "#f59e0b"].map((c) => (
                  <div
                    key={c}
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-700">500+</span> businesses trust B-EASY
              </p>
            </div>
          </motion.div>

          {/* Phone + floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto flex items-center justify-center"
            style={{ width: 540, height: 520 }}
          >
            {/* Glow behind phone — layered for depth */}
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#28B8B1]/14 blur-[70px]" />
            <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0A3D62]/10 blur-[60px]" />

            <PhoneMockup />

            {CARDS.map((card) => (
              <FloatingCard
                key={card.id}
                icon={card.icon}
                color={card.color}
                title={t(card.id as "card1")}
                sub={t(`${card.id}Sub` as "card1Sub")}
                style={card.style}
                delay={card.delay}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
