import "server-only";

import { cookies } from "next/headers";

export const LOCALES = ["en", "nl", "de", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇬🇧",
  nl: "🇳🇱",
  de: "🇩🇪",
  es: "🇪🇸",
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
  loads: {
    approximateRoute: string;
    list: string;
    map: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    countersTitle: string;
    recentActivityTitle: string;
    noRecentActivity: string;
    pendingApplications: string;
    inTransit: string;
    completedLoads: string;
    attentionTitle: string;
    attentionSubtitle: string;
    awaitingCarrier: string;
    awaitingCompletion: string;
    emptyAttention: string;
    viewLoad: string;
    viewAllLoads: string;
    viewAllNotifications: string;
    compatibleTitle: string;
    compatibleSubtitle: string;
    compatibleEmpty: string;
    applicationsTitle: string;
    inTransitTitle: string;
    historyTitle: string;
    pendingActionsTitle: string;
    noPendingActions: string;
    awaitingAccept: string;
    awaitingPickup: string;
    awaitingDelivery: string;
  };
  actionCenter: {
    title: string;
    subtitle: string;
    empty: string;
    bookingRequest: string;
    pickupNeeds: string;
    deliveryNeeds: string;
    transporterSelected: string;
    deliveryCompleted: string;
    accept: string;
    decline: string;
    confirmPickup: string;
    confirmDelivery: string;
    confirmBooking: string;
    markCompleted: string;
  };
  journey: {
    title: string;
    stepInterest: string;
    stepSelected: string;
    stepConfirmed: string;
    stepPickedUp: string;
    stepDelivered: string;
    stepCompleted: string;
    nextUp: string;
    pickupAt: string;
    deliverTo: string;
    confirmPickupHint: string;
    pickupOpensAt: string;
    earlyPickup: string;
    pickedUpHint: string;
    deliveredHint: string;
  };
  history: {
    title: string;
    carrierHistory: string;
    carrierHistorySub: string;
    relevance: string;
    avgRating: string;
    ratings: string;
    completedLoads: string;
    noRatingsYet: string;
    route: string;
    delivered: string;
    score: string;
    comment: string;
    company: string;
    viewHistory: string;
    viewProfile: string;
    yourReputation: string;
    yourReputationSub: string;
    empty: string;
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
  loads: {
    approximateRoute: "Approximate route",
    list: "List",
    map: "Map",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of your operations",
    countersTitle: "Loads by status",
    recentActivityTitle: "Recent activity",
    noRecentActivity: "No recent activity",
    pendingApplications: "Pending applications",
    inTransit: "In transit",
    completedLoads: "Completed loads",
    attentionTitle: "Loads needing attention",
    attentionSubtitle: "These loads are waiting for your action",
    awaitingCarrier: "Awaiting carrier acceptance",
    awaitingCompletion: "Awaiting completion",
    emptyAttention: "No loads need attention at the moment",
    viewLoad: "View load",
    viewAllLoads: "View all loads",
    viewAllNotifications: "View all notifications",
    compatibleTitle: "Available loads for you",
    compatibleSubtitle: "Loads matching your vehicle and regions",
    compatibleEmpty: "No compatible loads right now",
    applicationsTitle: "Your applications",
    inTransitTitle: "In transit",
    historyTitle: "History",
    pendingActionsTitle: "Pending actions",
    noPendingActions: "No pending actions",
    awaitingAccept: "Awaiting your acceptance",
    awaitingPickup: "Awaiting pickup confirmation",
    awaitingDelivery: "Awaiting delivery confirmation",
  },
  actionCenter: {
    title: "Action Center",
    subtitle: "Actions requiring your attention",
    empty: "You're all caught up",
    accept: "Accept",
    decline: "Decline",
    confirmPickup: "Confirm pickup",
    confirmDelivery: "Confirm delivery",
    confirmBooking: "Confirm booking",
    markCompleted: "Mark as completed",
    transporterSelected: "You were selected for",
    bookingRequest: "Carrier accepted the offer for",
    pickupNeeds: "Pending pickup",
    deliveryNeeds: "Pending delivery",
    deliveryCompleted: "Delivery completed",
  },
  journey: {
    title: "Load journey",
    stepInterest: "Interest shown",
    stepSelected: "Carrier selected",
    stepConfirmed: "Booking confirmed",
    stepPickedUp: "Picked up",
    stepDelivered: "Delivered",
    stepCompleted: "Completed",
    nextUp: "Next up",
    pickupAt: "Pickup",
    deliverTo: "Delivery",
    confirmPickupHint: "Confirm pickup when you have the load.",
    pickedUpHint: "In transit — confirm delivery on arrival.",
    deliveredHint: "Delivered. The company will mark the booking as complete.",
    pickupOpensAt: "Pickup opens at",
    earlyPickup: "Pickup isn't available before the scheduled time. Loading delays are fine, but an early pickup can't be confirmed.",
  },
  history: {
    title: "History",
    carrierHistory: "Carrier history",
    carrierHistorySub: "Track record of loads completed and ratings from companies.",
    relevance: "Relevance",
    avgRating: "Avg. rating",
    ratings: "ratings",
    completedLoads: "Completed loads",
    noRatingsYet: "No ratings yet",
    route: "Route",
    delivered: "Delivered",
    score: "Score",
    comment: "Comment",
    company: "Company",
    viewHistory: "View history",
    viewProfile: "View profile",
    yourReputation: "Your reputation",
    yourReputationSub: "How companies see your track record.",
    empty: "Nothing to show yet.",
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
  loads: {
    approximateRoute: "Geschatte route",
    list: "Lijst",
    map: "Kaart",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Overzicht van je operaties",
    countersTitle: "Ladingen per status",
    recentActivityTitle: "Recente activiteit",
    noRecentActivity: "Geen recente activiteit",
    pendingApplications: "Wachtende sollicitaties",
    inTransit: "Onderweg",
    completedLoads: "Voltooide ladingen",
    attentionTitle: "Ladingen die aandacht nodig hebben",
    attentionSubtitle: "Deze ladingen wachten op jouw actie",
    awaitingCarrier: "Wachten op acceptatie vervoerder",
    awaitingCompletion: "Wachten op afronding",
    emptyAttention: "Geen ladingen hebben aandacht nodig",
    viewLoad: "Bekijk lading",
    viewAllLoads: "Bekijk alle ladingen",
    viewAllNotifications: "Bekijk alle meldingen",
    compatibleTitle: "Beschikbare ladingen voor jou",
    compatibleSubtitle: "Ladingen die passen bij je voertuig en regio's",
    compatibleEmpty: "Geen compatibele ladingen op dit moment",
    applicationsTitle: "Jouw sollicitaties",
    inTransitTitle: "Onderweg",
    historyTitle: "Geschiedenis",
    pendingActionsTitle: "Acties in afwachting",
    noPendingActions: "Geen acties in afwachting",
    awaitingAccept: "Wachten op jouw acceptatie",
    awaitingPickup: "Wachten op bevestiging ophalen",
    awaitingDelivery: "Wachten op bevestiging aflevering",
  },
  actionCenter: {
    title: "Actiecentrum",
    subtitle: "Acties die om uw aandacht vragen",
    empty: "Je bent bijgewerkt",
    accept: "Accepteren",
    decline: "Weigeren",
    confirmPickup: "Ophalen bevestigen",
    confirmDelivery: "Aflevering bevestigen",
    confirmBooking: "Boeking bevestigen",
    markCompleted: "Voltooien als gemerkt",
    transporterSelected: "Geselecteerd voor",
    bookingRequest: "Vervoerder heeft aangeboden voor",
    pickupNeeds: "Wacht op ophalen",
    deliveryNeeds: "Wacht op aflevering",
    deliveryCompleted: "Aflevering voltooid",
  },
  journey: {
    title: "Lading-traject",
    stepInterest: "Interesse getoond",
    stepSelected: "Vervoerder geselecteerd",
    stepConfirmed: "Boeking bevestigd",
    stepPickedUp: "Opgehaald",
    stepDelivered: "Afgeleverd",
    stepCompleted: "Voltooid",
    nextUp: "Volgende stap",
    pickupAt: "Ophalen",
    deliverTo: "Afleveren",
    confirmPickupHint: "Bevestig ophalen zodra je de lading hebt.",
    pickedUpHint: "Onderweg — bevestig aflevering bij aankomst.",
    deliveredHint: "Afgeleverd. Het bedrijf markeert de boeking als voltooid.",
    pickupOpensAt: "Ophalen wordt mogelijk om",
    earlyPickup: "Ophalen is pas mogelijk vanaf het geplande tijdstip. Laadvertragingen zijn prima, maar eerder ophalen kan niet worden bevestigd.",
  },
  history: {
    title: "Geschiedenis",
    carrierHistory: "Geschiedenis van de vervoerder",
    carrierHistorySub: "Resultaat van voltooide ladingen en beoordelingen van bedrijven.",
    relevance: "Relevantie",
    avgRating: "Gemiddelde beoordeling",
    ratings: "beoordelingen",
    completedLoads: "Voltooide ladingen",
    noRatingsYet: "Nog geen beoordelingen",
    route: "Route",
    delivered: "Afgeleverd",
    score: "Score",
    comment: "Opmerking",
    company: "Bedrijf",
    viewHistory: "Geschiedenis bekijken",
    viewProfile: "Profiel bekijken",
    yourReputation: "Jouw reputatie",
    yourReputationSub: "Zo zien bedrijven jouw staat van dienst.",
    empty: "Nog niets om te tonen.",
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
  loads: {
    approximateRoute: "Ungefähre Route",
    list: "Liste",
    map: "Karte",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Überblick deiner Operationen",
    countersTitle: "Ladungen nach Status",
    recentActivityTitle: "Letzte Aktivitäten",
    noRecentActivity: "Keine aktuellen Aktivitäten",
    pendingApplications: "Ausstehende Bewerbungen",
    inTransit: "Unterwegs",
    completedLoads: "Abgeschlossene Ladungen",
    attentionTitle: "Ladungen erfordern Aufmerksamkeit",
    attentionSubtitle: "Diese Ladungen warten auf deine Aktion",
    awaitingCarrier: "Warten auf Spediteurannahme",
    awaitingCompletion: "Warten auf Abschluss",
    emptyAttention: "Keine Ladungen benötigen Aufmerksamkeit",
    viewLoad: "Ladung ansehen",
    viewAllLoads: "Alle Ladungen ansehen",
    viewAllNotifications: "Alle Benachrichtigungen ansehen",
    compatibleTitle: "Verfügbare Ladungen für dich",
    compatibleSubtitle: "Ladungen passend zu deinem Fahrzeug und Regionen",
    compatibleEmpty: "Keine passenden Ladungen im Moment",
    applicationsTitle: "Deine Bewerbungen",
    inTransitTitle: "Unterwegs",
    historyTitle: "Verlauf",
    pendingActionsTitle: "Ausstehende Aktionen",
    noPendingActions: "Keine ausstehenden Aktionen",
    awaitingAccept: "Warten auf deine Annahme",
    awaitingPickup: "Warten auf Abholbestätigung",
    awaitingDelivery: "Warten auf Lieferbestätigung",
  },
  actionCenter: {
    title: "Aktionszentrum",
    subtitle: "Aktionen, die Aufmerksamkeit erfordern",
    empty: "Sie sind auf dem Laufenden",
    accept: "Akzeptieren",
    decline: "Ablehnen",
    confirmPickup: "Abholung bestätigen",
    confirmDelivery: "Lieferung bestätigen",
    confirmBooking: "Buchung bestätigen",
    markCompleted: "Als abgeschlossen markieren",
    transporterSelected: "Für ausgewählt",
    bookingRequest: "Spediteur hat Angebot angenommen für",
    pickupNeeds: "Warte auf Abholung",
    deliveryNeeds: "Warte auf Lieferung",
    deliveryCompleted: "Lieferung abgeschlossen",
  },
  journey: {
    title: "Ladungsverlauf",
    stepInterest: "Interesse gezeigt",
    stepSelected: "Spediteur ausgewählt",
    stepConfirmed: "Buchung bestätigt",
    stepPickedUp: "Abgeholt",
    stepDelivered: "Zugestellt",
    stepCompleted: "Abgeschlossen",
    nextUp: "Als Nächstes",
    pickupAt: "Abholung",
    deliverTo: "Zustellung",
    confirmPickupHint: "Bestätige die Abholung, sobald du die Ladung hast.",
    pickedUpHint: "Unterwegs — bestätige die Zustellung bei Ankunft.",
    deliveredHint: "Zugestellt. Das Unternehmen markiert die Buchung als abgeschlossen.",
    pickupOpensAt: "Abholung möglich ab",
    earlyPickup: "Die Abholung ist erst ab dem geplanten Zeitpunkt möglich. Verzögerungen sind in Ordnung, aber eine frühere Abholung kann nicht bestätigt werden.",
  },
  history: {
    title: "Verlauf",
    carrierHistory: "Geschichte des Transporteurs",
    carrierHistorySub: "Nachweis abgeschlossener Ladungen und Bewertungen von Unternehmen.",
    relevance: "Relevanz",
    avgRating: "Durchschnittsbewertung",
    ratings: "Bewertungen",
    completedLoads: "Abgeschlossene Ladungen",
    noRatingsYet: "Noch keine Bewertungen",
    route: "Route",
    delivered: "Zugestellt",
    score: "Bewertung",
    comment: "Kommentar",
    company: "Unternehmen",
    viewHistory: "Verlauf ansehen",
    viewProfile: "Profil ansehen",
    yourReputation: "Dein Ruf",
    yourReputationSub: "So sehen Unternehmen deine Erfolgsbilanz.",
    empty: "Noch nichts zu zeigen.",
  },
};

const es: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Cargas",
    applications: "Solicitudes",
    profile: "Perfil",
    business: "Empresa",
    logout: "Cerrar sesión",
    dashboard: "Panel",
    login: "Iniciar sesión",
    signup: "Regístrate",
    notifications: "Notificaciones",
  },
  auth: {
    joinTitle: "Únete a MOVR",
    joinSubtitle: "Elige cómo quieres usar MOVR.",
    carrierRole: "Soy transportista",
    carrierRoleSub: "Transportista independiente en ruta: encuentra cargas de retorno.",
    companyRole: "Soy una empresa",
    companyRoleSub: "Mueve mercancía de forma fiable con socios locales de confianza.",
    alreadyAccount: "¿Ya tienes una cuenta?",
    newToMovr: "¿Nuevo en MOVR?",
    createTitle: "Crea tu cuenta",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    createAccount: "Crear cuenta",
    creatingAccount: "Creando cuenta…",
    welcomeBack: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión en tu cuenta MOVR.",
    loginAction: "Iniciar sesión",
    loggingIn: "Iniciando sesión…",
    backHome: "Ir a la página principal",
  },
  landing: {
    title: "Cargas de retorno, socios reales.",
    subtitle:
      "MOVR conecta transportistas independientes con empresas locales en Venlo y Limburgo, convirtiendo viajes de retorno vacíos en cargas remuneradas.",
    carrierCta: "Soy transportista",
    companyCta: "Soy una empresa",
    featureCarrierTitle: "Para transportistas",
    featureCarrierBody:
      "Consulta cargas que se ajustan a tu camión, región y ruta; y muestra interés solo en las que de verdad puedes hacer.",
    featureCompanyTitle: "Para empresas",
    featureCompanyBody:
      "Publica una carga una sola vez, recibe interés honesto de transportistas independientes y elige quién mueve tu mercancía.",
    featureEmptyTitle: "Menos kilómetros vacíos",
    featureEmptyBody: "Diseñado para cargas de retorno en la región de carga de Venlo y Limburgo.",
    howTitle: "Cómo funciona MOVR",
    step1Title: "Configura tu perfil",
    step1Body: "Los transportistas eligen su vehículo y región. Las empresas añaden sus datos comerciales.",
    step2Title: "Empareja y muestra interés",
    step2Body: "Los transportistas ven cargas compatibles y solicitan. Nunca una reserva automática.",
    step3Title: "Tú eliges",
    step3Body: "La empresa siempre selecciona al transportista de su confianza. Luego los mantienes al día.",
  },
  common: {
    backToLoads: "← Volver a las cargas",
    loading: "Cargando...",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
  },
  loads: {
    approximateRoute: "Ruta aproximada",
    list: "Lista",
    map: "Mapa",
  },
  dashboard: {
    title: "Panel",
    subtitle: "Resumen de tus operaciones",
    countersTitle: "Cargas por estado",
    recentActivityTitle: "Actividad reciente",
    noRecentActivity: "Sin actividad reciente",
    pendingApplications: "Solicitudes pendientes",
    inTransit: "En tránsito",
    completedLoads: "Cargas completadas",
    attentionTitle: "Cargas que necesitan atención",
    attentionSubtitle: "Estas cargas esperan tu acción",
    awaitingCarrier: "Esperando aceptación del transportista",
    awaitingCompletion: "Esperando finalización",
    emptyAttention: "Ninguna carga necesita atención en este momento",
    viewLoad: "Ver carga",
    viewAllLoads: "Ver todas las cargas",
    viewAllNotifications: "Ver todas las notificaciones",
    compatibleTitle: "Cargas disponibles para ti",
    compatibleSubtitle: "Cargas que coinciden con tu vehículo y regiones",
    compatibleEmpty: "No hay cargas compatibles en este momento",
    applicationsTitle: "Tus solicitudes",
    inTransitTitle: "En tránsito",
    historyTitle: "Historial",
    pendingActionsTitle: "Acciones pendientes",
    noPendingActions: "Sin acciones pendientes",
    awaitingAccept: "Esperando tu aceptación",
    awaitingPickup: "Esperando confirmación de recogida",
    awaitingDelivery: "Esperando confirmación de entrega",
  },
  actionCenter: {
    title: "Centro de acciones",
    subtitle: "Acciones que requieren tu atención",
    empty: "Estás al día",
    accept: "Aceptar",
    decline: "Rechazar",
    confirmPickup: "Confirmar recogida",
    confirmDelivery: "Confirmar entrega",
    confirmBooking: "Confirmar reserva",
    markCompleted: "Marcar como completado",
    transporterSelected: "Fuiste seleccionado para",
    bookingRequest: "El transportista aceptó la oferta para",
    pickupNeeds: "Pendiente de recogida",
    deliveryNeeds: "Pendiente de entrega",
    deliveryCompleted: "Entrega completada",
  },
  journey: {
    title: "Recorrido de la carga",
    stepInterest: "Interés mostrado",
    stepSelected: "Transportista seleccionado",
    stepConfirmed: "Reserva confirmada",
    stepPickedUp: "Recogida",
    stepDelivered: "Entregada",
    stepCompleted: "Completada",
    nextUp: "Siguiente paso",
    pickupAt: "Recogida",
    deliverTo: "Entrega",
    confirmPickupHint: "Confirma la recogida cuando tengas la carga.",
    pickedUpHint: "En tránsito: confirma la entrega al llegar.",
    deliveredHint: "Entregada. La empresa marcará la reserva como completada.",
    pickupOpensAt: "Recogida disponible a las",
    earlyPickup: "La recogida no está disponible antes de la hora programada. Los retrasos de carga son normales, pero no se puede confirmar una recogida anticipada.",
  },
  history: {
    title: "Historial",
    carrierHistory: "Historial del transportista",
    carrierHistorySub: "Récord de cargas completadas y valoraciones de empresas.",
    relevance: "Relevancia",
    avgRating: "Valoración media",
    ratings: "valoraciones",
    completedLoads: "Cargas completadas",
    noRatingsYet: "Aún sin valoraciones",
    route: "Ruta",
    delivered: "Entregada",
    score: "Puntuación",
    comment: "Comentario",
    company: "Empresa",
    viewHistory: "Ver historial",
    viewProfile: "Ver perfil",
    yourReputation: "Tu reputación",
    yourReputationSub: "Así ven las empresas tu trayectoria.",
    empty: "Nada que mostrar aún.",
  },
};

const dictionaries: Record<Locale, Messages> = {
  en,
  nl,
  de,
  es,
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
