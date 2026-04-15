"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Shield } from "lucide-react";

const DOCS = {
  terms: {
    icon: Scale,
    title_en: "Terms of Service",
    title_fr: "Conditions d’utilisation",
    title_ar: "شروط الخدمة",
    en: `
**1. Acceptance of Terms**

By accessing or using the B-EASY platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the service.

**2. Description of Service**

B-EASY provides a SaaS dashboard for managing employees, categories, and business contact requests. The service is provided "as is" and we reserve the right to modify or discontinue it at any time.

**3. User Obligations**

You agree to (a) provide accurate account information, (b) maintain the confidentiality of your login credentials, and (c) notify us immediately of any unauthorized use of your account.

**4. Intellectual Property**

All content, trademarks, and data on this platform are the property of B-EASY or its licensors. You may not copy, modify, or distribute any content without our prior written consent.

**5. Limitation of Liability**

To the fullest extent permitted by applicable law, B-EASY shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.

**6. Governing Law**

These Terms shall be governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law provisions.

**7. Changes to Terms**

We reserve the right to update these Terms at any time. Continued use of the service after changes constitutes your acceptance of the revised terms.
    `.trim(),
    fr: `
**1. Acceptation des conditions**

En accédant ou en utilisant la plateforme B-EASY, vous acceptez d’être lié par les présentes conditions d’utilisation. Si vous n’acceptez pas l’ensemble de ces conditions, vous ne devez pas utiliser le service.

**2. Description du service**

B-EASY fournit un tableau de bord SaaS pour gérer les employés, les catégories et les demandes de contact professionnel. Le service est fourni « tel quel » et nous nous réservons le droit de le modifier ou d’y mettre fin à tout moment.

**3. Obligations de l’utilisateur**

Vous vous engagez à : (a) fournir des informations de compte exactes ; (b) préserver la confidentialité de vos identifiants ; (c) nous informer immédiatement de toute utilisation non autorisée de votre compte.

**4. Propriété intellectuelle**

Tous les contenus, marques et données de cette plateforme sont la propriété de B-EASY ou de ses concédants de licence. Vous ne pouvez pas copier, modifier ou distribuer un contenu sans notre accord écrit préalable.

**5. Limitation de responsabilité**

Dans la mesure maximale permise par la loi applicable, B-EASY ne pourra être tenue responsable des dommages indirects, accessoires, spéciaux ou consécutifs résultant de votre utilisation du service.

**6. Droit applicable**

Les présentes conditions sont régies et interprétées conformément aux lois des Émirats arabes unis, sans égard aux principes de conflit de lois.

**7. Modifications des conditions**

Nous nous réservons le droit de mettre à jour ces conditions à tout moment. La poursuite de l’utilisation du service après modification vaut acceptation des conditions révisées.
    `.trim(),
    ar: `
**١. قبول الشروط**

باستخدامك لمنصة B-EASY، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، فلا يحق لك استخدام الخدمة.

**٢. وصف الخدمة**

توفّر B-EASY لوحة تحكم SaaS لإدارة الموظفين والفئات وطلبات التواصل التجارية. تُقدَّم الخدمة "كما هي"، ونحتفظ بحق تعديلها أو إيقافها في أي وقت.

**٣. التزامات المستخدم**

تلتزم بـ: (أ) تقديم معلومات حساب دقيقة، (ب) الحفاظ على سرية بيانات تسجيل الدخول، (ج) إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.

**٤. الملكية الفكرية**

جميع المحتويات والعلامات التجارية والبيانات الموجودة على هذه المنصة هي ملك لـ B-EASY أو المرخصين لها. لا يجوز نسخ أي محتوى أو تعديله أو توزيعه دون موافقة كتابية مسبقة منّا.

**٥. تحديد المسؤولية**

في أقصى الحدود التي يسمح بها القانون المعمول به، لن تكون B-EASY مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية.

**٦. القانون الحاكم**

تخضع هذه الشروط وتُفسَّر وفقاً لقوانين دولة الإمارات العربية المتحدة، بصرف النظر عن أحكام تعارض القوانين فيها.

**٧. التغييرات على الشروط**

نحتفظ بحق تحديث هذه الشروط في أي وقت. يُعدّ استمرارك في استخدام الخدمة بعد التغييرات موافقةً منك على الشروط المُعدَّلة.
    `.trim(),
  },
  privacy: {
    icon: Shield,
    title_en: "Privacy Policy",
    title_fr: "Politique de confidentialité",
    title_ar: "سياسة الخصوصية",
    en: `
**1. Information We Collect**

We collect information you provide directly to us, such as when you create an account, submit a contact request, or communicate with us. This includes name, email address, phone number, and company information.

**2. How We Use Your Information**

We use the information we collect to (a) provide and improve our services, (b) send you technical notices and support messages, and (c) respond to your comments and questions.

**3. Information Sharing**

We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our platform, subject to confidentiality agreements.

**4. Data Security**

We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.

**5. Data Retention**

We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting our support team.

**6. Cookies**

We use cookies and similar tracking technologies to track activity on our platform and hold certain information to improve your user experience.

**7. Contact Us**

If you have any questions about this Privacy Policy, please contact us at privacy@b-easy.com.
    `.trim(),
    fr: `
**1. Informations que nous collectons**

Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, envoyez une demande de contact ou communiquez avec nous. Cela inclut le nom, l’adresse e-mail, le numéro de téléphone et les informations sur l’entreprise.

**2. Utilisation de vos informations**

Nous utilisons les informations collectées pour : (a) fournir et améliorer nos services ; (b) vous envoyer des avis techniques et des messages d’assistance ; (c) répondre à vos commentaires et questions.

**3. Partage des informations**

Nous ne vendons, n’échangeons ni ne louons vos données personnelles à des tiers. Nous pouvons partager des informations avec des prestataires qui nous aident à exploiter notre plateforme, sous réserve d’accords de confidentialité.

**4. Sécurité des données**

Nous appliquons des mesures de sécurité conformes aux pratiques du secteur pour protéger vos données personnelles contre l’accès, la modification, la divulgation ou la destruction non autorisés. Toutefois, aucune transmission sur Internet n’est totalement sécurisée.

**5. Conservation des données**

Nous conservons vos données personnelles tant que votre compte est actif ou selon les besoins du service. Vous pouvez demander la suppression de vos données à tout moment en contactant notre équipe d’assistance.

**6. Cookies**

Nous utilisons des cookies et des technologies similaires pour suivre l’activité sur notre plateforme et conserver certaines informations afin d’améliorer votre expérience utilisateur.

**7. Nous contacter**

Pour toute question concernant cette politique de confidentialité, écrivez-nous à privacy@b-easy.com.
    `.trim(),
    ar: `
**١. المعلومات التي نجمعها**

نجمع المعلومات التي تزوّدنا بها مباشرةً، كإنشاء حساب أو تقديم طلب تواصل أو التواصل معنا. يشمل ذلك الاسم وعنوان البريد الإلكتروني ورقم الهاتف ومعلومات الشركة.

**٢. كيف نستخدم معلوماتك**

نستخدم المعلومات التي نجمعها من أجل: (أ) تقديم خدماتنا وتحسينها، (ب) إرسال إشعارات تقنية ورسائل دعم، (ج) الرد على تعليقاتك وأسئلتك.

**٣. مشاركة المعلومات**

لا نبيع معلوماتك الشخصية أو نتاجر بها أو نؤجّرها لأطراف ثالثة. قد نشارك المعلومات مع مزودي الخدمات الذين يساعدوننا في تشغيل منصتنا، وذلك وفق اتفاقيات سرية.

**٤. أمان البيانات**

نطبّق معايير أمان متوافقة مع المعايير الصناعية لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. غير أن أي طريقة نقل عبر الإنترنت ليست آمنة بنسبة 100%.

**٥. الاحتفاظ بالبيانات**

نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات. يمكنك طلب حذف بياناتك في أي وقت عبر التواصل مع فريق الدعم.

**٦. ملفات الارتباط (Cookies)**

نستخدم ملفات الارتباط وتقنيات تتبع مماثلة لرصد النشاط على منصتنا والاحتفاظ بمعلومات معينة لتحسين تجربة المستخدم.

**٧. تواصل معنا**

إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على: privacy@b-easy.com
    `.trim(),
  },
} as const;

type DocKey = keyof typeof DOCS;

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="font-semibold text-slate-800 mt-5 mb-1.5 first:mt-0">
          {line.slice(2, -2)}
        </p>
      );
    }
    return line ? (
      <p key={i} className="text-slate-600 leading-relaxed">
        {line}
      </p>
    ) : null;
  });
}

export function LegalPageView() {
  const [activeDoc, setActiveDoc] = useState<DocKey>("terms");
  const doc = DOCS[activeDoc];
  const Icon = doc.icon;

  return (
    <div className="space-y-4">
      {/* Doc type tabs */}
      <div className="flex gap-2">
        {(Object.keys(DOCS) as DocKey[]).map((key) => {
          const d = DOCS[key];
          return (
            <button
              key={key}
              onClick={() => setActiveDoc(key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${
                activeDoc === key
                  ? "bg-[#0A3D62] text-white border-[#0A3D62] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#0A3D62] hover:text-[#0A3D62]"
              }`}
            >
              <d.icon className="h-4 w-4" />
              {d.title_en}
            </button>
          );
        })}
      </div>

      {/* Trilingual layout */}
      <motion.div
        key={activeDoc}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* English */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" dir="ltr">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EBF3FB]">
              <Icon className="h-4 w-4 text-[#0A3D62]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 leading-tight">{doc.title_en}</h2>
              <p className="text-xs text-slate-400">English</p>
            </div>
          </div>
          <div className="px-5 py-5 text-sm space-y-1 overflow-y-auto max-h-[60vh]">
            {renderMarkdown(doc.en)}
          </div>
        </div>

        {/* French */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" dir="ltr">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Icon className="h-4 w-4 text-violet-700" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 leading-tight">{doc.title_fr}</h2>
              <p className="text-xs text-slate-400">Français</p>
            </div>
          </div>
          <div className="px-5 py-5 text-sm space-y-1 overflow-y-auto max-h-[60vh]">
            {renderMarkdown(doc.fr)}
          </div>
        </div>

        {/* Arabic */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" dir="rtl">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F7F7]">
              <Icon className="h-4 w-4 text-[#28B8B1]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 leading-tight">{doc.title_ar}</h2>
              <p className="text-xs text-slate-400">العربية</p>
            </div>
          </div>
          <div className="px-5 py-5 text-sm space-y-1 overflow-y-auto max-h-[60vh]">
            {renderMarkdown(doc.ar)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
