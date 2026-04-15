"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalSectionSheet, type LegalSectionFormData } from "./legal-section-sheet";
import {
  mockLegalData,
  saveLegalSection,
  deleteLegalSection,
  type LegalDocType,
  type LegalSection,
} from "@/features/legal/data/mock-legal";

/* ─── Doc metadata ───────────────────────────────────────────────── */
const DOC_META: Record<LegalDocType, { titleEn: string; titleFr: string; titleAr: string }> = {
  "privacy-policy": {
    titleEn: "Privacy Policy",
    titleFr: "Politique de confidentialité",
    titleAr: "سياسة الخصوصية",
  },
  "terms-conditions": {
    titleEn: "Terms & Conditions",
    titleFr: "Conditions générales",
    titleAr: "الشروط والأحكام",
  },
  "delivery-terms": {
    titleEn: "Delivery Terms",
    titleFr: "Conditions de livraison",
    titleAr: "شروط التوصيل",
  },
  "refund-terms": {
    titleEn: "Refund Terms",
    titleFr: "Conditions de remboursement",
    titleAr: "شروط الاسترداد",
  },
};

/* ─── Animation helpers ──────────────────────────────────────────── */
const cardAnim = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.28 },
});

/* ─── Delete confirmation mini-state ────────────────────────────── */
function DeleteButton({
  onConfirm,
}: {
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-red-500 font-medium">Confirm?</span>
        <button
          onClick={onConfirm}
          className="rounded px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Delete section"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
interface LegalPageViewProps {
  docType: LegalDocType;
}

export function LegalPageView({ docType }: LegalPageViewProps) {
  const meta = DOC_META[docType];

  /* Clone initial mock data into local state so edits are reactive */
  const [sections, setSections] = useState<LegalSection[]>(() =>
    [...mockLegalData[docType]]
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<LegalSection | undefined>(undefined);

  /* Open sheet for Add */
  const handleAdd = () => {
    setEditingSection(undefined);
    setSheetOpen(true);
  };

  /* Open sheet for Edit */
  const handleEdit = (section: LegalSection) => {
    setEditingSection(section);
    setSheetOpen(true);
  };

  /* Save (add or edit) */
  const handleSave = async (data: LegalSectionFormData) => {
    const saved = await saveLegalSection(docType, data, editingSection?.id);
    setSections((prev) => {
      if (editingSection) {
        return prev.map((s) => (s.id === saved.id ? saved : s));
      }
      return [...prev, saved];
    });
  };

  /* Delete */
  const handleDelete = async (sectionId: string) => {
    await deleteLegalSection(docType, sectionId);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF3FB]">
            <FileText className="h-5 w-5 text-[#0A3D62]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{meta.titleEn}</h2>
            <p className="text-sm text-slate-500" dir="ltr">
              {meta.titleFr}
            </p>
            <p
              className="text-sm text-slate-400"
              dir="rtl"
              style={{ fontFamily: "var(--font-tajawal)" }}
            >
              {meta.titleAr}
            </p>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          className="gap-2 bg-[#0A3D62] text-white hover:bg-[#0A3D62]/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </motion.div>

      {/* ── Section list ─────────────────────────────────────────── */}
      {sections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50"
        >
          <div className="text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No sections yet. Add your first section.</p>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                {...cardAnim(i)}
                layout
                exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
              >
                {/* Section card */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                  {/* Card header: section number + actions */}
                  <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Section {section.order}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(section)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#EBF3FB] hover:text-[#0A3D62] transition-colors"
                        title="Edit section"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <DeleteButton onConfirm={() => handleDelete(section.id)} />
                    </div>
                  </div>

                  {/* Trilingual split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                    {/* English */}
                    <div className="px-5 py-5" dir="ltr">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#EBF3FB] px-2 py-0.5 text-[10px] font-semibold text-[#0A3D62] uppercase tracking-wide">
                          EN
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {section.titleEn}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{section.contentEn}</p>
                    </div>

                    {/* French */}
                    <div className="px-5 py-5 bg-slate-50/40" dir="ltr">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
                          FR
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {section.titleFr}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{section.contentFr}</p>
                    </div>

                    {/* Arabic */}
                    <div
                      className="px-5 py-5 bg-slate-50/50 md:col-span-2 xl:col-span-1"
                      dir="rtl"
                      style={{ fontFamily: "var(--font-tajawal)" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-[#E6F7F7] px-2 py-0.5 text-[10px] font-semibold text-[#28B8B1] uppercase tracking-wide">
                          AR
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 leading-snug mb-2">
                        {section.titleAr}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{section.contentAr}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Sheet ────────────────────────────────────────────────── */}
      <LegalSectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        section={editingSection}
        onSave={handleSave}
      />
    </div>
  );
}
