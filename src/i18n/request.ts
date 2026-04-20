import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type MessageTree = Record<string, unknown>;

/** Fill keys present in `defaults` but missing from `localeMessages` (recursively). */
function mergeMissingMessages(
  localeMessages: MessageTree,
  defaults: MessageTree
): MessageTree {
  const out: MessageTree = { ...localeMessages };

  for (const key of Object.keys(defaults)) {
    const defVal = defaults[key];
    const locVal = out[key];

    if (locVal === undefined) {
      out[key] = defVal;
      continue;
    }

    if (
      defVal &&
      typeof defVal === "object" &&
      !Array.isArray(defVal) &&
      locVal &&
      typeof locVal === "object" &&
      !Array.isArray(locVal)
    ) {
      out[key] = mergeMissingMessages(
        locVal as MessageTree,
        defVal as MessageTree
      );
    }
  }

  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "ar" | "fr")) {
    locale = routing.defaultLocale;
  }

  const localeMessages = (await import(`../messages/${locale}.json`))
    .default as MessageTree;

  if (locale === routing.defaultLocale) {
    return { locale, messages: localeMessages };
  }

  const defaultMessages = (
    await import(`../messages/${routing.defaultLocale}.json`)
  ).default as MessageTree;

  return {
    locale,
    messages: mergeMissingMessages(localeMessages, defaultMessages),
  };
});
