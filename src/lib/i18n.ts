import "server-only";

import { cookies } from "next/headers";

export const LOCALES = ["en", "nl", "de", "pl", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  nl: "🇳🇱",
  de: "🇩🇪",
  pl: "🇵🇱",
  pt: "🇧🇷",
};

export const LOCALE_COOKIE = "movr_locale";
export const DEFAULT_LOCALE: Locale = "en";

export type Messages = {
  brand: { name: string };
  nav: {
    loads: string;
    applications: string;
    profile: string;
    business: string;
    logout: string;
    dashboard: string;
    login: string;
    signup: string;
    notifications: string;
  };
  auth: {
    joinTitle: string;
    joinSubtitle: string;
    carrierRole: string;
    carrierRoleSub: string;
    companyRole: string;
    companyRoleSub: string;
    alreadyAccount: string;
    newToMovr: string;
    createTitle: string;
    fullName: string;
    email: string;
    password: string;
    createAccount: string;
    creatingAccount: string;
    welcomeBack: string;
    loginSubtitle: string;
    loginAction: string;
    loggingIn: string;
    backHome: string;
  };
  landing: {
    title: string;
    subtitle: string;
    carrierCta: string;
    companyCta: string;
    featureCarrierTitle: string;
    featureCarrierBody: string;
    featureCompanyTitle: string;
    featureCompanyBody: string;
    featureEmptyTitle: string;
    featureEmptyBody: string;
    howTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
  };
};

const en: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Loads",
    applications: "Applications",
    profile: "Profile",
    business: "Business",
    logout: "Log out",
    dashboard: "Dashboard",
    login: "Log in",
    signup: "Sign up",
    notifications: "Notifications",
  },
  auth: {
    joinTitle: "Join MOVR",
    joinSubtitle: "Choose how you want to use MOVR.",
    carrierRole: "I'm a carrier",
    carrierRoleSub: "Independent transporter on the road — find return loads.",
    companyRole: "I'm a company",
    companyRoleSub: "Move freight reliably with trusted local partners.",
    alreadyAccount: "Already have an account?",
    newToMovr: "New to MOVR?",
    createTitle: "Create your account",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    welcomeBack: "Welcome back",
    loginSubtitle: "Log in to your MOVR account.",
    loginAction: "Log in",
    loggingIn: "Logging in…",
    backHome: "Go home",
  },
  landing: {
    title: "Return loads, real partners.",
    subtitle:
      "MOVR connects independent carriers with local companies in Venlo and Limburg, turning empty return trips into paid loads.",
    carrierCta: "I'm a carrier",
    companyCta: "I'm a company",
    featureCarrierTitle: "For carriers",
    featureCarrierBody:
      "See loads that fit your truck, home region and route — and show interest in the ones you can actually do.",
    featureCompanyTitle: "For companies",
    featureCompanyBody:
      "Publish a load once, get honest interest from independent carriers, and choose who moves your freight.",
    featureEmptyTitle: "Fewer empty miles",
    featureEmptyBody: "Purpose-built for return loads in the Venlo and Limburg freight region.",
    howTitle: "How MOVR works",
    step1Title: "Set up your profile",
    step1Body: "Carriers pick their vehicle and regions. Companies add their business details.",
    step2Title: "Match and show interest",
    step2Body: "Carriers see compatible loads and apply. No automatic booking, ever.",
    step3Title: "You choose",
    step3Body: "The company always selects the transporter they trust. Then you keep them updated.",
  },
};

const nl: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Ladingen",
    applications: "Sollicitaties",
    profile: "Profiel",
    business: "Bedrijf",
    logout: "Uitloggen",
    dashboard: "Dashboard",
    login: "Inloggen",
    signup: "Aanmelden",
    notifications: "Meldingen",
  },
  auth: {
    joinTitle: "Word lid van MOVR",
    joinSubtitle: "Kies hoe je MOVR wilt gebruiken.",
    carrierRole: "Ik ben een vervoerder",
    carrierRoleSub: "Onafhankelijke chauffeur onderweg — vind retourladingen.",
    companyRole: "Ik ben een bedrijf",
    companyRoleSub: "Verplaats vracht betrouwbaar met vertrouwde lokale partners.",
    alreadyAccount: "Heb je al een account?",
    newToMovr: "Nieuw bij MOVR?",
    createTitle: "Maak je account aan",
    fullName: "Volledige naam",
    email: "E-mailadres",
    password: "Wachtwoord",
    createAccount: "Account aanmaken",
    creatingAccount: "Account wordt aangemaakt…",
    welcomeBack: "Welkom terug",
    loginSubtitle: "Log in op je MOVR-account.",
    loginAction: "Inloggen",
    loggingIn: "Inloggen…",
    backHome: "Naar home",
  },
  landing: {
    title: "Retourladingen, echte partners.",
    subtitle:
      "MOVR verbindt onafhankelijke vervoerders met lokale bedrijven in Venlo en Limburg en maakt van lege retourritten betaalde ladingen.",
    carrierCta: "Ik ben een vervoerder",
    companyCta: "Ik ben een bedrijf",
    featureCarrierTitle: "Voor vervoerders",
    featureCarrierBody:
      "Zie ladingen die passen bij je vrachtwagen, thuisregio en route — en toon interesse in wat je echt kunt doen.",
    featureCompanyTitle: "Voor bedrijven",
    featureCompanyBody:
      "Publiceer een lading, ontvang eerlijke interesse van onafhankelijke vervoerders en kies wie jouw vracht vervoert.",
    featureEmptyTitle: "Minder lege kilometers",
    featureEmptyBody: "Gemaakt voor retourladingen in de vervoersregio Venlo en Limburg.",
    howTitle: "Hoe MOVR werkt",
    step1Title: "Stel je profiel in",
    step1Body: "Vervoerders kiezen hun voertuig en regio's. Bedrijven voegen hun bedrijfsgegevens toe.",
    step2Title: "Match en toon interesse",
    step2Body: "Vervoerders zien passende ladingen en solliciteren. Nooit automatisch boeken.",
    step3Title: "Jij kiest",
    step3Body: "Het bedrijf kiest altijd de vervoerder die zij vertrouwen. Daarna houd je hen op de hoogte.",
  },
};

const pt: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Cargas",
    applications: "Propostas",
    profile: "Perfil",
    business: "Empresa",
    logout: "Sair",
    dashboard: "Painel",
    login: "Entrar",
    signup: "Criar conta",
    notifications: "Notificações",
  },
  auth: {
    joinTitle: "Junte-se ao MOVR",
    joinSubtitle: "Escolha como você quer usar o MOVR.",
    carrierRole: "Sou transportador",
    carrierRoleSub: "Transportador independente na estrada — encontre cargas de retorno.",
    companyRole: "Sou empresa",
    companyRoleSub: "Movimente cargas com parceiros locais confiáveis.",
    alreadyAccount: "Já tem uma conta?",
    newToMovr: "Novo no MOVR?",
    createTitle: "Crie sua conta",
    fullName: "Nome completo",
    email: "E-mail",
    password: "Senha",
    createAccount: "Criar conta",
    creatingAccount: "Criando conta…",
    welcomeBack: "Bem-vindo de volta",
    loginSubtitle: "Entre na sua conta MOVR.",
    loginAction: "Entrar",
    loggingIn: "Entrando…",
    backHome: "Ir para início",
  },
  landing: {
    title: "Cargas de retorno, parceiros reais.",
    subtitle:
      "A MOVR conecta transportadores independentes a empresas locais em Venlo e Limburg, transformando viagens de retorno vazias em cargas pagas.",
    carrierCta: "Sou transportador",
    companyCta: "Sou empresa",
    featureCarrierTitle: "Para transportadores",
    featureCarrierBody:
      "Veja cargas compatíveis com seu caminhão, região e rota — e demonstre interesse apenas nas que você realmente pode fazer.",
    featureCompanyTitle: "Para empresas",
    featureCompanyBody:
      "Publique uma carga uma vez, receba interesse real de transportadores independentes e escolha quem movimenta sua carga.",
    featureEmptyTitle: "Menos quilômetros vazios",
    featureEmptyBody: "Feito para cargas de retorno na região de Venlo e Limburg.",
    howTitle: "Como a MOVR funciona",
    step1Title: "Configure seu perfil",
    step1Body: "Transportadores escolhem veículo e regiões. Empresas informam dados do negócio.",
    step2Title: "Combine e demonstre interesse",
    step2Body: "Transportadores veem cargas compatíveis e se candidatam. Nunca há reserva automática.",
    step3Title: "Você escolhe",
    step3Body: "A empresa sempre escolhe o transportador em quem confia. Depois mantenha todos atualizados.",
  },
};

const dictionaries: Record<Locale, Messages> = {
  en,
  nl,
  pt,
  de: en,
  pl: en,
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    return resolveLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale] ?? en;
}
