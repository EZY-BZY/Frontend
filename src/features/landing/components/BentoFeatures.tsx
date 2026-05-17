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
    bg: "from-[#0A3D62]/20 to-[#0A3D62]/5",
    wide: true,
  },
  { key: "item2", icon: CreditCard, color: "#28B8B1", bg: "from-[#28B8B1]/20 to-[#28B8B1]/5" },
  { key: "item3", icon: Users, color: "#6366f1", bg: "from-[#6366f1]/20 to-[#6366f1]/5" },
  { key: "item4", icon: BarChart3, color: "#f59e0b", bg: "from-[#f59e0b]/20 to-[#f59e0b]/5" },
  { key: "item5", icon: Globe2, color: "#10b981", bg: "from-[#10b981]/20 to-[#10b981]/5" },
  {
    key: "item6",
    icon: HeadphonesIcon,
    color: "#ec4899",
    bg: "from-[#ec4899]/20 to-[#ec4899]/5",
  },
] as const;

function BentoCard({
  icon: Icon,
  color,
  bg,
  title,
  desc,
  wide,
  index,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bg: string;
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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br p-6 backdrop-blur-sm",
        bg,
        wide ? "lg:col-span-2" : ""
      )}
    >
      {/* Corner glow */}
      <div
        className="pointer-events-none absolute -top-10 -inset-s-10 h-32 w-32 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-70"
        style={{ backgroundColor: color }}
      />

      <div
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}25` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{desc}</p>
    </motion.div>
  );
}

export function BentoFeatures() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-[#28B8B1]/30 bg-[#28B8B1]/10 px-3.5 py-1 text-xs font-semibold text-[#28B8B1]">
            {t("badge")}
          </span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-xl text-base text-white/50">{t("subtitle")}</p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <BentoCard
              key={item.key}
              icon={item.icon}
              color={item.color}
              bg={item.bg}
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
