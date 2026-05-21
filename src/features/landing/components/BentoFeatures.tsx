"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Package,
  CreditCard,
  Users,
  BarChart3,
  Globe2,
  HeadphonesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    key: "item1",
    icon: Package,
    color: "#0A3D62",
    wide: true,
  },
  { key: "item2", icon: CreditCard, color: "#28B8B1" },
  { key: "item3", icon: Users, color: "#6366f1" },
  { key: "item4", icon: BarChart3, color: "#f59e0b" },
  { key: "item5", icon: Globe2, color: "#10b981" },
  { key: "item6", icon: HeadphonesIcon, color: "#ec4899" },
] as const;

function BentoCard({
  icon: Icon,
  color,
  title,
  desc,
  wide,
  index,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  title: string;
  desc: string;
  wide?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.10)] transition-shadow duration-300",
        wide ? "lg:col-span-2" : ""
      )}
    >
      {/* Corner glow — very subtle on white */}
      <div
        className="pointer-events-none absolute -top-10 -inset-s-10 h-40 w-40 rounded-full blur-2xl opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.18]"
        style={{ backgroundColor: color }}
      />

      <div
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
    </motion.div>
  );
}

export function BentoFeatures() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
            {t("badge")}
          </span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-xl text-base text-gray-500">{t("subtitle")}</p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <BentoCard
              key={item.key}
              icon={item.icon}
              color={item.color}
              title={t(`${item.key}Title` as "item1Title")}
              desc={t(`${item.key}Desc` as "item1Desc")}
              wide={"wide" in item ? item.wide : false}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
