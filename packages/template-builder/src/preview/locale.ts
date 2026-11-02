/**
 * Texts WhatsApp writes itself: authentication messages, the overflow button
 * and default button labels. Keyed by language; `en` is the fallback.
 */
export type PreviewLocale = {
  /** Authentication body. `*{code}*` is replaced by the sample code. */
  authenticationBody: string;
  securityRecommendation: string;
  /** `{minutes}` is replaced by `footer.codeExpirationMinutes`. */
  codeExpiration: string;
  copyCode: string;
  copyOfferCode: string;
  seeAllOptions: string;
};

const LOCALES: Record<string, PreviewLocale> = {
  en: {
    authenticationBody: "*{code}* is your verification code.",
    securityRecommendation: "For your security, do not share this code.",
    codeExpiration: "This code expires in {minutes} minutes.",
    copyCode: "Copy code",
    copyOfferCode: "Copy offer code",
    seeAllOptions: "See all options",
  },
  pt: {
    authenticationBody: "*{code}* é seu código de verificação.",
    securityRecommendation: "Para sua segurança, não compartilhe este código.",
    codeExpiration: "Este código expira em {minutes} minutos.",
    copyCode: "Copiar código",
    copyOfferCode: "Copiar código da oferta",
    seeAllOptions: "Ver todas as opções",
  },
};

/** Picks the locale for a template language such as `pt_BR`. */
export const localeFor = (language: string): PreviewLocale =>
  LOCALES[language.split("_")[0]!.toLowerCase()] ?? LOCALES.en!;
