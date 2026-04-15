export type LegalDocType =
  | "privacy-policy"
  | "terms-conditions"
  | "delivery-terms"
  | "refund-terms";

export interface LegalSection {
  id: string;
  order: number;
  titleEn: string;
  titleAr: string;
  titleFr: string;
  contentEn: string;
  contentAr: string;
  contentFr: string;
}

/* ─── Per-document mock sections ────────────────────────────────── */
const privacyPolicySections: LegalSection[] = [
  {
    id: "pp-1",
    order: 1,
    titleEn: "Information We Collect",
    titleAr: "المعلومات التي نجمعها",
    titleFr: "Informations que nous collectons",
    contentEn:
      "We collect information you provide directly to us, such as when you create an account, submit a contact request, or communicate with us. This includes name, email address, phone number, and company information.",
    contentAr:
      "نجمع المعلومات التي تزوّدنا بها مباشرةً، كإنشاء حساب أو تقديم طلب تواصل أو التواصل معنا. يشمل ذلك الاسم وعنوان البريد الإلكتروني ورقم الهاتف ومعلومات الشركة.",
    contentFr:
      "Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, envoyez une demande de contact ou communiquez avec nous. Cela inclut le nom, l’adresse e-mail, le numéro de téléphone et les informations sur l’entreprise.",
  },
  {
    id: "pp-2",
    order: 2,
    titleEn: "How We Use Your Information",
    titleAr: "كيف نستخدم معلوماتك",
    titleFr: "Utilisation de vos informations",
    contentEn:
      "We use the information we collect to provide and improve our services, send you technical notices and support messages, and respond to your comments and questions.",
    contentAr:
      "نستخدم المعلومات التي نجمعها من أجل تقديم خدماتنا وتحسينها، وإرسال إشعارات تقنية ورسائل دعم، والرد على تعليقاتك وأسئلتك.",
    contentFr:
      "Nous utilisons les informations collectées pour fournir et améliorer nos services, vous envoyer des avis techniques et des messages d’assistance, et répondre à vos commentaires et questions.",
  },
  {
    id: "pp-3",
    order: 3,
    titleEn: "Information Sharing",
    titleAr: "مشاركة المعلومات",
    titleFr: "Partage des informations",
    contentEn:
      "We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our platform, subject to confidentiality agreements.",
    contentAr:
      "لا نبيع معلوماتك الشخصية أو نتاجر بها أو نؤجّرها لأطراف ثالثة. قد نشارك المعلومات مع مزودي الخدمات الذين يساعدوننا في تشغيل منصتنا وفق اتفاقيات سرية.",
    contentFr:
      "Nous ne vendons, n’échangeons ni ne louons vos données personnelles à des tiers. Nous pouvons partager des informations avec des prestataires qui nous aident à exploiter notre plateforme, sous réserve d’accords de confidentialité.",
  },
  {
    id: "pp-4",
    order: 4,
    titleEn: "Data Security",
    titleAr: "أمان البيانات",
    titleFr: "Sécurité des données",
    contentEn:
      "We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
    contentAr:
      "نطبّق معايير أمان متوافقة مع المعايير الصناعية لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. غير أن أي طريقة نقل عبر الإنترنت ليست آمنة بنسبة 100%.",
    contentFr:
      "Nous appliquons des mesures de sécurité conformes aux pratiques du secteur pour protéger vos données personnelles contre l’accès, la modification, la divulgation ou la destruction non autorisés. Toutefois, aucune transmission sur Internet n’est totalement sécurisée.",
  },
  {
    id: "pp-5",
    order: 5,
    titleEn: "Data Retention & Contact",
    titleAr: "الاحتفاظ بالبيانات والتواصل",
    titleFr: "Conservation des données et contact",
    contentEn:
      "We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting privacy@b-easy.com.",
    contentAr:
      "نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل على: privacy@b-easy.com",
    contentFr:
      "Nous conservons vos données personnelles tant que votre compte est actif ou selon les besoins du service. Vous pouvez demander la suppression de vos données à tout moment en écrivant à privacy@b-easy.com.",
  },
];

const termsConditionsSections: LegalSection[] = [
  {
    id: "tc-1",
    order: 1,
    titleEn: "Acceptance of Terms",
    titleAr: "قبول الشروط",
    titleFr: "Acceptation des conditions",
    contentEn:
      "By accessing or using the B-EASY platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the service.",
    contentAr:
      "باستخدامك لمنصة B-EASY، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، فلا يحق لك استخدام الخدمة.",
    contentFr:
      "En accédant ou en utilisant la plateforme B-EASY, vous acceptez d’être lié par les présentes conditions d’utilisation. Si vous n’acceptez pas l’ensemble de ces conditions, vous ne devez pas utiliser le service.",
  },
  {
    id: "tc-2",
    order: 2,
    titleEn: "Description of Service",
    titleAr: "وصف الخدمة",
    titleFr: "Description du service",
    contentEn:
      "B-EASY provides a SaaS dashboard for managing employees, categories, and business contact requests. The service is provided as-is and we reserve the right to modify or discontinue it at any time.",
    contentAr:
      "توفّر B-EASY لوحة تحكم SaaS لإدارة الموظفين والفئات وطلبات التواصل التجارية. تُقدَّم الخدمة كما هي، ونحتفظ بحق تعديلها أو إيقافها في أي وقت.",
    contentFr:
      "B-EASY fournit un tableau de bord SaaS pour gérer les employés, les catégories et les demandes de contact professionnel. Le service est fourni tel quel et nous nous réservons le droit de le modifier ou d’y mettre fin à tout moment.",
  },
  {
    id: "tc-3",
    order: 3,
    titleEn: "User Obligations",
    titleAr: "التزامات المستخدم",
    titleFr: "Obligations de l’utilisateur",
    contentEn:
      "You agree to provide accurate account information, maintain the confidentiality of your login credentials, and notify us immediately of any unauthorized use of your account.",
    contentAr:
      "تلتزم بتقديم معلومات حساب دقيقة، والحفاظ على سرية بيانات تسجيل الدخول، وإخطارنا فوراً بأي استخدام غير مصرح به لحسابك.",
    contentFr:
      "Vous vous engagez à fournir des informations de compte exactes, à préserver la confidentialité de vos identifiants et à nous informer immédiatement de toute utilisation non autorisée de votre compte.",
  },
  {
    id: "tc-4",
    order: 4,
    titleEn: "Intellectual Property",
    titleAr: "الملكية الفكرية",
    titleFr: "Propriété intellectuelle",
    contentEn:
      "All content, trademarks, and data on this platform are the property of B-EASY or its licensors. You may not copy, modify, or distribute any content without our prior written consent.",
    contentAr:
      "جميع المحتويات والعلامات التجارية والبيانات الموجودة على هذه المنصة هي ملك لـ B-EASY أو المرخصين لها. لا يجوز نسخ أي محتوى أو تعديله أو توزيعه دون موافقة كتابية مسبقة منّا.",
    contentFr:
      "Tous les contenus, marques et données de cette plateforme sont la propriété de B-EASY ou de ses concédants de licence. Vous ne pouvez pas copier, modifier ou distribuer un contenu sans notre accord écrit préalable.",
  },
  {
    id: "tc-5",
    order: 5,
    titleEn: "Limitation of Liability & Governing Law",
    titleAr: "تحديد المسؤولية والقانون الحاكم",
    titleFr: "Limitation de responsabilité et droit applicable",
    contentEn:
      "To the fullest extent permitted by law, B-EASY shall not be liable for any indirect or consequential damages. These Terms are governed by the laws of the United Arab Emirates.",
    contentAr:
      "في أقصى الحدود التي يسمح بها القانون، لن تكون B-EASY مسؤولة عن أي أضرار غير مباشرة أو تبعية. تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة.",
    contentFr:
      "Dans la mesure maximale permise par la loi, B-EASY ne pourra être tenue responsable des dommages indirects ou consécutifs. Les présentes conditions sont régies par les lois des Émirats arabes unis.",
  },
];

const deliveryTermsSections: LegalSection[] = [
  {
    id: "dt-1",
    order: 1,
    titleEn: "Delivery Scope",
    titleAr: "نطاق التوصيل",
    titleFr: "Portée de la livraison",
    contentEn:
      "B-EASY delivers software services and platform access digitally. Physical delivery of goods is handled exclusively by third-party partners whose own delivery terms apply.",
    contentAr:
      "تُقدّم B-EASY خدماتها البرمجية والوصول إلى المنصة رقمياً. يتولى التوصيل المادي للبضائع شركاء من أطراف ثالثة تسري عليهم شروط توصيلهم الخاصة.",
    contentFr:
      "B-EASY fournit ses services logiciels et l’accès à la plateforme de manière numérique. La livraison physique de biens est assurée exclusivement par des partenaires tiers soumis à leurs propres conditions de livraison.",
  },
  {
    id: "dt-2",
    order: 2,
    titleEn: "Service Activation Timelines",
    titleAr: "مواعيد تفعيل الخدمة",
    titleFr: "Délais d’activation du service",
    contentEn:
      "Upon successful payment, platform access is granted within 24 hours. Enterprise onboarding packages may require up to 5 business days for full configuration and setup.",
    contentAr:
      "عند إتمام الدفع بنجاح، يُمنح الوصول إلى المنصة خلال 24 ساعة. قد تستغرق حزم الإعداد المؤسسية ما يصل إلى 5 أيام عمل للتهيئة الكاملة.",
    contentFr:
      "Après paiement réussi, l’accès à la plateforme est accordé sous 24 heures. Les offres d’intégration entreprise peuvent nécessiter jusqu’à 5 jours ouvrés pour une configuration complète.",
  },
  {
    id: "dt-3",
    order: 3,
    titleEn: "Delays & Force Majeure",
    titleAr: "التأخير والقوة القاهرة",
    titleFr: "Retards et force majeure",
    contentEn:
      "B-EASY is not liable for delays caused by factors beyond our reasonable control, including but not limited to internet outages, natural disasters, or regulatory actions.",
    contentAr:
      "لا تتحمل B-EASY المسؤولية عن التأخير الناجم عن عوامل خارجة عن سيطرتنا المعقولة، بما في ذلك انقطاع الإنترنت والكوارث الطبيعية والإجراءات التنظيمية.",
    contentFr:
      "B-EASY ne saurait être tenue responsable des retards dus à des circonstances indépendantes de notre volonté raisonnable, notamment les pannes Internet, catastrophes naturelles ou mesures réglementaires.",
  },
  {
    id: "dt-4",
    order: 4,
    titleEn: "Support & Escalation",
    titleAr: "الدعم والتصعيد",
    titleFr: "Assistance et escalade",
    contentEn:
      "For any delivery-related issues, contact support@b-easy.com. Critical issues are escalated within 2 business hours during standard operating hours (09:00–18:00 GST).",
    contentAr:
      "لأي مشكلات تتعلق بالتوصيل، تواصل مع support@b-easy.com. يتم تصعيد المشكلات الحرجة خلال ساعتي عمل خلال أوقات العمل الرسمية (09:00–18:00 بتوقيت الخليج).",
    contentFr:
      "Pour toute question liée à la livraison, contactez support@b-easy.com. Les incidents critiques sont escaladés dans les 2 heures ouvrées pendant les heures d’ouverture (09:00–18:00 GST).",
  },
];

const refundTermsSections: LegalSection[] = [
  {
    id: "rt-1",
    order: 1,
    titleEn: "Eligibility for Refund",
    titleAr: "الأهلية لاسترداد المبلغ",
    titleFr: "Éligibilité au remboursement",
    contentEn:
      "Refunds are available for subscription cancellations requested within 3 days of the subscription start date. Requests made after this window are not eligible for a refund.",
    contentAr:
      "يحق الاسترداد لطلبات إلغاء الاشتراك المقدّمة خلال 3 أيام من تاريخ بدء الاشتراك. الطلبات المقدّمة بعد هذه الفترة غير مؤهلة للاسترداد.",
    contentFr:
      "Un remboursement est possible pour les annulations d’abonnement demandées dans les 3 jours suivant la date de début. Les demandes dépassant ce délai ne sont pas éligibles.",
  },
  {
    id: "rt-2",
    order: 2,
    titleEn: "Refund Process",
    titleAr: "إجراءات الاسترداد",
    titleFr: "Procédure de remboursement",
    contentEn:
      "To initiate a refund, contact billing@b-easy.com with your account ID and reason for cancellation. Approved refunds are processed within 7–10 business days to the original payment method.",
    contentAr:
      "لبدء الاسترداد، تواصل مع billing@b-easy.com مع معرّف حسابك وسبب الإلغاء. تُعالَج المبالغ المستردة المعتمدة خلال 7–10 أيام عمل عبر وسيلة الدفع الأصلية.",
    contentFr:
      "Pour demander un remboursement, écrivez à billing@b-easy.com avec l’identifiant de votre compte et le motif d’annulation. Les remboursements approuvés sont traités sous 7 à 10 jours ouvrés sur le moyen de paiement initial.",
  },
  {
    id: "rt-3",
    order: 3,
    titleEn: "Non-Refundable Items",
    titleAr: "البنود غير القابلة للاسترداد",
    titleFr: "Éléments non remboursables",
    contentEn:
      "Setup fees, onboarding costs, and any add-on services already rendered are non-refundable. Partial-month subscriptions are prorated and not subject to refund.",
    contentAr:
      "رسوم الإعداد وتكاليف الإعداد الأولي وأي خدمات إضافية مُقدَّمة بالفعل غير قابلة للاسترداد. اشتراكات الشهر الجزئي تُحسب بالتناسب ولا تخضع للاسترداد.",
    contentFr:
      "Les frais d’installation, d’intégration et les services additionnels déjà fournis ne sont pas remboursables. Les abonnements sur une partie du mois sont calculés au prorata et ne donnent pas lieu à remboursement.",
  },
  {
    id: "rt-4",
    order: 4,
    titleEn: "Disputes",
    titleAr: "النزاعات",
    titleFr: "Litiges",
    contentEn:
      "If you believe a refund was incorrectly denied, you may escalate the dispute to legal@b-easy.com. All disputes are subject to UAE jurisdiction and arbitration procedures.",
    contentAr:
      "إذا اعتقدت أن طلب الاسترداد رُفض بشكل غير صحيح، يمكنك تصعيد النزاع إلى legal@b-easy.com. تخضع جميع النزاعات لاختصاص الإمارات العربية المتحدة وإجراءات التحكيم.",
    contentFr:
      "Si vous estimez qu’un remboursement a été refusé à tort, vous pouvez porter le litige devant legal@b-easy.com. Tout litige relève de la compétence des Émirats arabes unis et des règles d’arbitrage applicables.",
  },
];

export const mockLegalData: Record<LegalDocType, LegalSection[]> = {
  "privacy-policy": privacyPolicySections,
  "terms-conditions": termsConditionsSections,
  "delivery-terms": deliveryTermsSections,
  "refund-terms": refundTermsSections,
};

/* ─── Mock server action ─────────────────────────────────────────── */
export async function saveLegalSection(
  docType: LegalDocType,
  data: Omit<LegalSection, "id" | "order">,
  existingId?: string
): Promise<LegalSection> {
  await new Promise((r) => setTimeout(r, 600));
  const sections = mockLegalData[docType];
  if (existingId) {
    const idx = sections.findIndex((s) => s.id === existingId);
    if (idx !== -1) {
      sections[idx] = { ...sections[idx], ...data };
      return sections[idx];
    }
  }
  const newSection: LegalSection = {
    id: `${docType}-${Date.now()}`,
    order: sections.length + 1,
    ...data,
  };
  sections.push(newSection);
  return newSection;
}

export async function deleteLegalSection(
  docType: LegalDocType,
  sectionId: string
): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  const sections = mockLegalData[docType];
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx !== -1) sections.splice(idx, 1);
}
