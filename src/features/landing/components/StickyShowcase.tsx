"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

/* ── screen slides inside the sticky phone ──────────────────────── */
const SCREENS = [
  /* Step 0: onboarding */
  () => (
    <div className="flex flex-col gap-3 p-4 pt-10">
      <div className="rounded-xl bg-white/6 p-3">
        <p className="mb-1 text-[9px] text-white/40">Business Name</p>
        <div className="h-5 w-3/4 rounded-md bg-white/10" />
      </div>
      <div className="rounded-xl bg-white/6 p-3">
        <p className="mb-1 text-[9px] text-white/40">Industry</p>
        <div className="h-5 w-1/2 rounded-md bg-white/10" />
      </div>
      <div className="rounded-xl bg-white/6 p-3">
        <p className="mb-1 text-[9px] text-white/40">Team size</p>
        <div className="flex gap-1.5">
          {["1-5", "6-20", "21+"].map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${
                i === 1
                  ? "bg-[#28B8B1] text-white"
                  : "bg-white/8 text-white/40"
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="mt-1 rounded-xl bg-[#28B8B1] py-2 text-[10px] font-bold text-white"
      >
        Complete Setup →
      </button>
    </div>
  ),

  /* Step 1: dashboard overview */
  () => (
    <div className="p-4 pt-10">
      <p className="mb-3 text-[9px] font-semibold text-white/40">OVERVIEW</p>
      <div className="mb-2 rounded-xl bg-linear-to-br from-[#0A3D62] to-[#0D4E7A] p-3">
        <p className="text-[8px] text-white/50">Revenue</p>
        <p className="text-sm font-bold text-white">SAR 24,500</p>
        <p className="mt-0.5 text-[8px] text-[#28B8B1]">↑ 12.3% this month</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: "Orders", v: "142" },
          { l: "Clients", v: "38" },
          { l: "Products", v: "210" },
          { l: "Revenue", v: "↑12%" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white/5 p-2">
            <p className="text-[7px] text-white/40">{s.l}</p>
            <p className="text-xs font-bold text-white">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  ),

  /* Step 2: plans / scale */
  () => (
    <div className="p-4 pt-10">
      <p className="mb-3 text-[9px] font-semibold text-white/40">PLANS</p>
      {[
        { name: "Starter", price: "Free", active: false },
        { name: "Pro", price: "SAR 99", active: true },
        { name: "Enterprise", price: "Custom", active: false },
      ].map((plan) => (
        <div
          key={plan.name}
          className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2.5 ${
            plan.active
              ? "border border-[#28B8B1]/40 bg-[#28B8B1]/10"
              : "bg-white/5"
          }`}
        >
          <div>
            <p className="text-[9px] font-semibold text-white">{plan.name}</p>
            <p className="text-[8px] text-white/40">{plan.price}/mo</p>
          </div>
          {plan.active && (
            <span className="rounded-full bg-[#28B8B1] px-2 py-0.5 text-[7px] font-bold text-white">
              ACTIVE
            </span>
          )}
        </div>
      ))}
    </div>
  ),
] as const;

/* ── step section (triggers active step) ───────────────────────── */
function StepSection({
  index,
  title,
  desc,
  onVisible,
}: {
  index: number;
  title: string;
  desc: string;
  onVisible: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible(index);
      },
      { rootMargin: "-35% 0px -35% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

  return (
    <div ref={ref} className="flex gap-5 py-16">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#28B8B1]/30 bg-[#28B8B1]/10 text-xs font-bold text-[#28B8B1]">
        {index + 1}
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-white/50">{desc}</p>
      </div>
    </div>
  );
}

/* ── StickyShowcase ─────────────────────────────────────────────── */
export function StickyShowcase() {
  const t = useTranslations("landing.showcase");
  const [active, setActive] = useState(0);

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  const Screen = SCREENS[active];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="mb-4 inline-block rounded-full border border-[#28B8B1]/30 bg-[#28B8B1]/10 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
            {t("badge")}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
          {/* Left: scrollable steps */}
          <div className="flex-1">
            {steps.map((step, i) => (
              <StepSection
                key={i}
                index={i}
                title={step.title}
                desc={step.desc}
                onVisible={setActive}
              />
            ))}
          </div>

          {/* Right: sticky phone */}
          <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:items-start">
            <div className="sticky top-28 w-full">
              <div className="relative h-[440px] w-full rounded-[2.5rem] border-2 border-[#1E3A5F] bg-[#080F1D] shadow-[0_0_60px_rgba(40,184,177,0.1)]">
                {/* Pill notch */}
                <div className="absolute left-1/2 top-2.5 h-1.5 w-14 -translate-x-1/2 rounded-full bg-[#0A1628]" />

                {/* App header */}
                <div className="flex items-center justify-between border-b border-white/5 px-4 pt-8 pb-3">
                  <span className="text-[10px] font-bold text-white/60">B-EASY</span>
                  <div className="h-5 w-5 rounded-full bg-[#0A3D62]" />
                </div>

                {/* Screen content transitions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <Screen />
                  </motion.div>
                </AnimatePresence>

                {/* Step dots */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === active ? "w-4 bg-[#28B8B1]" : "w-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
