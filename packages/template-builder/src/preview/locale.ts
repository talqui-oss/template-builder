/**
 * Texts WhatsApp writes itself. Most follow the template's language; the
 * overflow row ("See all options") follows the phone's language instead.
 * Keyed by language; `en` is the fallback.
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
  // Checked against messages received on an iPhone.
  pt: {
    authenticationBody: "Seu código de verificação é *{code}*.",
    securityRecommendation: "Para sua segurança, não o compartilhe.",
    codeExpiration: "Expira em {minutes} minutos.",
    copyCode: "Copiar código",
    copyOfferCode: "Copiar código da oferta",
    seeAllOptions: "Ver todas as opções",
  },
};

/** Picks the locale for a template language such as `pt_BR`. */
export const localeFor = (language: string): PreviewLocale =>
  LOCALES[language.split("_")[0]!.toLowerCase()] ?? LOCALES.en!;
