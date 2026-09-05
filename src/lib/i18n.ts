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
  common: {
    backToLoads: string;
    loading: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
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
  common: {
    backToLoads: "← Back to loads",
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
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
  common: {
    backToLoads: "← Terug naar ladingen",
    loading: "Laden...",
    cancel: "Annuleren",
    save: "Opslaan",
    edit: "Bewerken",
    delete: "Verwijderen",
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
  common: {
    backToLoads: "← Voltar às cargas",
    loading: "Carregando...",
    cancel: "Cancelar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
  },
};

const de: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Ladungen",
    applications: "Bewerbungen",
    profile: "Profil",
    business: "Unternehmen",
    logout: "Abmelden",
    dashboard: "Dashboard",
    login: "Anmelden",
    signup: "Registrieren",
    notifications: "Benachrichtigungen",
  },
  auth: {
    joinTitle: "Tritt MOVR bei",
    joinSubtitle: "Wähle, wie du MOVR nutzen möchtest.",
    carrierRole: "Ich bin Spediteur",
    carrierRoleSub: "Unabhängiger Transporteur unterwegs — finde Rückladungen.",
    companyRole: "Ich bin Unternehmen",
    companyRoleSub: "Bewege Fracht zuverlässig mit vertrauenswürdigen Partnern.",
    alreadyAccount: "Schon ein Konto?",
    newToMovr: "Neu bei MOVR?",
    createTitle: "Konto erstellen",
    fullName: "Vollständiger Name",
    email: "E-Mail",
    password: "Passwort",
    createAccount: "Konto erstellen",
    creatingAccount: "Konto wird erstellt…",
    welcomeBack: "Willkommen zurück",
    loginSubtitle: "Melde dich bei deinem MOVR-Konto an.",
    loginAction: "Anmelden",
    loggingIn: "Anmeldung läuft…",
    backHome: "Zur Startseite",
  },
  landing: {
    title: "Rückladungen, echte Partner.",
    subtitle:
      "MOVR verbindet unabhängige Spediteure mit lokalen Unternehmen in Venlo und Limburg und verwandelt leere Rückfahrten in bezahlte Ladungen.",
    carrierCta: "Ich bin Spediteur",
    companyCta: "Ich bin Unternehmen",
    featureCarrierTitle: "Für Spediteure",
    featureCarrierBody:
      "Sieh Ladungen, die zu deinem LKW, deiner Heimatregion und Route passen — und bekunde Interesse nur an machbaren Aufträgen.",
    featureCompanyTitle: "Für Unternehmen",
    featureCompanyBody:
      "Veröffentliche eine Ladung einmal, erhalte ehrliches Interesse von unabhängigen Spediteuren und wähle, wer deine Fracht fährt.",
    featureEmptyTitle: "Weniger Leerfahrten",
    featureEmptyBody: "Entwickelt für Rückladungen in der Region Venlo und Limburg.",
    howTitle: "Wie MOVR funktioniert",
    step1Title: "Profil einrichten",
    step1Body: "Spediteure wählen Fahrzeug und Regionen. Unternehmen ergänzen Firmendaten.",
    step2Title: "Matchen und Interesse zeigen",
    step2Body: "Spediteure sehen passende Ladungen und bewerben sich. Keine automatische Buchung.",
    step3Title: "Du wählst",
    step3Body: "Das Unternehmen wählt immer den Spediteur, dem es vertraut. Danach bleibt ihr auf dem Laufenden.",
  },
  common: {
    backToLoads: "← Zurück zu Ladungen",
    loading: "Lädt...",
    cancel: "Abbrechen",
    save: "Speichern",
    edit: "Bearbeiten",
    delete: "Löschen",
  },
};

const pl: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Ładunki",
    applications: "Zgłoszenia",
    profile: "Profil",
    business: "Firma",
    logout: "Wyloguj",
    dashboard: "Panel",
    login: "Zaloguj się",
    signup: "Zarejestruj się",
    notifications: "Powiadomienia",
  },
  auth: {
    joinTitle: "Dołącz do MOVR",
    joinSubtitle: "Wybierz, jak chcesz korzystać z MOVR.",
    carrierRole: "Jestem przewoźnikiem",
    carrierRoleSub: "Niezależny przewoźnik w trasie — znajdź ładunki powrotne.",
    companyRole: "Jestem firmą",
    companyRoleSub: "Przewoź ładunki niezawodnie z zaufanymi partnerami.",
    alreadyAccount: "Masz już konto?",
    newToMovr: "Nowy w MOVR?",
    createTitle: "Utwórz konto",
    fullName: "Imię i nazwisko",
    email: "E-mail",
    password: "Hasło",
    createAccount: "Utwórz konto",
    creatingAccount: "Tworzenie konta…",
    welcomeBack: "Witaj ponownie",
    loginSubtitle: "Zaloguj się na swoje konto MOVR.",
    loginAction: "Zaloguj się",
    loggingIn: "Logowanie…",
    backHome: "Strona główna",
  },
  landing: {
    title: "Ładunki powrotne, prawdziwi partnerzy.",
    subtitle:
      "MOVR łączy niezależnych przewoźników z lokalnymi firmami w Venlo i Limburgii, zamieniając puste powroty w płatne ładunki.",
    carrierCta: "Jestem przewoźnikiem",
    companyCta: "Jestem firmą",
    featureCarrierTitle: "Dla przewoźników",
    featureCarrierBody:
      "Zobacz ładunki pasujące do twojej ciężarówki, regionu i trasy — i zgłoś zainteresowanie tylko tymi, które możesz zrealizować.",
    featureCompanyTitle: "Dla firm",
    featureCompanyBody:
      "Opublikuj ładunek raz, otrzymaj szczere zainteresowanie od niezależnych przewoźników i wybierz, kto przewiezie twój ładunek.",
    featureEmptyTitle: "Mniej pustych kilometrów",
    featureEmptyBody: "Stworzone dla ładunków powrotnych w regionie Venlo i Limburgii.",
    howTitle: "Jak działa MOVR",
    step1Title: "Skonfiguruj profil",
    step1Body: "Przewoźnicy wybierają pojazd i regiony. Firmy dodają dane firmy.",
    step2Title: "Dopasuj i okaż zainteresowanie",
    step2Body: "Przewoźnicy widzą pasujące ładunki i aplikują. Nigdy automatycznej rezerwacji.",
    step3Title: "Ty wybierasz",
    step3Body: "Firma zawsze wybiera przewoźnika, któremu ufa. Potem bądźcie na bieżąco.",
  },
  common: {
    backToLoads: "← Wróć do ładunków",
    loading: "Ładowanie...",
    cancel: "Anuluj",
    save: "Zapisz",
    edit: "Edytuj",
    delete: "Usuń",
  },
};

const dictionaries: Record<Locale, Messages> = {
  en,
  nl,
  pt,
  de,
  pl,
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
