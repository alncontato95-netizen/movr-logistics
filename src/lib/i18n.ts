import "server-only";

import { cookies } from "next/headers";

export const LOCALES = ["pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_FLAGS: Record<Locale, string> = {
  pt: "🇧🇷",
};

export const LOCALE_COOKIE = "movr_locale";
export const DEFAULT_LOCALE: Locale = "pt";

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
  profile: {
    rntrcLabel: string;
    rntrcDescription: string;
    rntrcPlaceholder: string;
    cnpjLabel: string;
    cnpjDescription: string;
    cnpjPlaceholder: string;
  };
  guide: {
    title: string;
    subtitle: string;
    doCta: string;
    doneCta: string;
    closeLabel: string;
    carrierStepsTitle: string[];
    carrierStepsBody: string[];
    companyStepsTitle: string[];
    companyStepsBody: string[];
  };
};

const pt: Messages = {
  brand: { name: "MOVR" },
  nav: {
    loads: "Cargas",
    applications: "Candidaturas",
    profile: "Perfil",
    business: "Empresa",
    logout: "Sair",
    dashboard: "Painel",
    login: "Entrar",
    signup: "Criar conta",
    notifications: "Notificações",
  },
  auth: {
    joinTitle: "Junte-se à MOVR",
    joinSubtitle: "Escolha como você quer usar a MOVR.",
    carrierRole: "Sou transportador",
    carrierRoleSub: "Transportador independente na estrada — encontre cargas de retorno.",
    companyRole: "Sou empresa",
    companyRoleSub: "Transporte suas cargas com parceiros locais confiáveis.",
    alreadyAccount: "Já tem uma conta?",
    newToMovr: "Novo na MOVR?",
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
    backHome: "Voltar ao início",
  },
  landing: {
    title: "Cargas de retorno, parceiros de verdade.",
    subtitle:
      "A MOVR conecta transportadores independentes a empresas locais no Sudeste do Brasil, transformando viagens de retorno vazias em cargas pagas. São mais de 5.000 operações já realizadas na Europa — o modelo europeu que agora chega ao Brasil, com a mesma eficiência comprovada.",
    carrierCta: "Sou transportador",
    companyCta: "Sou empresa",
    featureCarrierTitle: "Para transportadores",
    featureCarrierBody:
      "Veja as cargas que cabem no seu caminhão, na sua região e na sua rota — e demonstre interesse naquelas que você realmente pode fazer.",
    featureCompanyTitle: "Para empresas",
    featureCompanyBody:
      "Publique uma carga uma vez, receba interesse real de transportadores independentes e escolha quem transporta a sua mercadoria.",
    featureEmptyTitle: "Menos quilômetros vazios",
    featureEmptyBody: "Feito sob medida para cargas de retorno no Sudeste do Brasil (SP, RJ, MG).",
    howTitle: "Como a MOVR funciona",
    step1Title: "Configure seu perfil",
    step1Body: "Transportadores escolhem o veículo e as regiões. Empresas adicionam os dados do negócio.",
    step2Title: "Encontre e demonstre interesse",
    step2Body: "Transportadores veem cargas compatíveis e se candidatam. Nunca reserva automática.",
    step3Title: "Você escolhe",
    step3Body: "A empresa sempre escolhe o transportador em quem confia. Depois, você mantém todos atualizados.",
  },
  common: {
    backToLoads: "← Voltar para as cargas",
    loading: "Carregando...",
    cancel: "Cancelar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
  },
  loads: {
    approximateRoute: "Rota aproximada",
    list: "Lista",
    map: "Mapa",
  },
  dashboard: {
    title: "Painel",
    subtitle: "Visão geral das suas operações",
    countersTitle: "Cargas por status",
    recentActivityTitle: "Atividade recente",
    noRecentActivity: "Sem atividade recente",
    pendingApplications: "Candidaturas pendentes",
    inTransit: "Em trânsito",
    completedLoads: "Cargas concluídas",
    attentionTitle: "Cargas que precisam de atenção",
    attentionSubtitle: "Estas cargas estão aguardando sua ação",
    awaitingCarrier: "Aguardando aceite do transportador",
    awaitingCompletion: "Aguardando conclusão",
    emptyAttention: "Nenhuma carga precisa de atenção no momento",
    viewLoad: "Ver carga",
    viewAllLoads: "Ver todas as cargas",
    viewAllNotifications: "Ver todas as notificações",
    compatibleTitle: "Cargas disponíveis para você",
    compatibleSubtitle: "Cargas compatíveis com seu veículo e regiões",
    compatibleEmpty: "Nenhuma carga compatível no momento",
    applicationsTitle: "Suas candidaturas",
    inTransitTitle: "Em trânsito",
    historyTitle: "Histórico",
    pendingActionsTitle: "Ações pendentes",
    noPendingActions: "Nenhuma ação pendente",
    awaitingAccept: "Aguardando seu aceite",
    awaitingPickup: "Aguardando confirmação de coleta",
    awaitingDelivery: "Aguardando confirmação de entrega",
  },
  actionCenter: {
    title: "Central de ações",
    subtitle: "Ações que exigem sua atenção",
    empty: "Tudo em dia",
    accept: "Aceitar",
    decline: "Recusar",
    confirmPickup: "Confirmar coleta",
    confirmDelivery: "Confirmar entrega",
    confirmBooking: "Confirmar reserva",
    markCompleted: "Marcar como concluída",
    transporterSelected: "Você foi selecionado para",
    bookingRequest: "O transportador aceitou a oferta para",
    pickupNeeds: "Coleta pendente",
    deliveryNeeds: "Entrega pendente",
    deliveryCompleted: "Entrega concluída",
  },
  journey: {
    title: "Jornada da carga",
    stepInterest: "Interesse demonstrado",
    stepSelected: "Transportador selecionado",
    stepConfirmed: "Reserva confirmada",
    stepPickedUp: "Coletada",
    stepDelivered: "Entregue",
    stepCompleted: "Concluída",
    nextUp: "Próximo passo",
    pickupAt: "Coleta",
    deliverTo: "Entrega",
    confirmPickupHint: "Confirme a coleta quando estiver com a carga.",
    pickedUpHint: "Em trânsito — confirme a entrega na chegada.",
    deliveredHint: "Entregue. A empresa vai marcar a reserva como concluída.",
    pickupOpensAt: "A coleta abre às",
    earlyPickup: "A coleta não está disponível antes do horário programado. Atrasos no carregamento são aceitáveis, mas coleta antecipada não pode ser confirmada.",
  },
  history: {
    title: "Histórico",
    carrierHistory: "Histórico do transportador",
    carrierHistorySub: "Desempenho das cargas concluídas e avaliações das empresas.",
    relevance: "Relevância",
    avgRating: "Avaliação média",
    ratings: "avaliações",
    completedLoads: "Cargas concluídas",
    noRatingsYet: "Ainda sem avaliações",
    route: "Rota",
    delivered: "Entregue",
    score: "Nota",
    comment: "Comentário",
    company: "Empresa",
    viewHistory: "Ver histórico",
    viewProfile: "Ver perfil",
    yourReputation: "Sua reputação",
    yourReputationSub: "Como as empresas enxergam seu histórico.",
    empty: "Nada para mostrar ainda.",
  },
  profile: {
    rntrcLabel: "RNTRC",
    rntrcDescription:
      "Número do seu registro de transportador rodoviário de cargas, associado à ANTT. Informar o número não é o mesmo que verificação — a verificação pode ser exigida antes de operar na MOVR.",
    rntrcPlaceholder: "Somente números, até 14 dígitos",
    cnpjLabel: "CNPJ",
    cnpjDescription:
      "CNPJ da sua empresa de transporte. Desde agora a MOVR trabalha apenas com transportadores registrados (pessoa jurídica). Informar o CNPJ não é o mesmo que verificação — a verificação pode ser exigida antes de operar na MOVR.",
    cnpjPlaceholder: "00.000.000/0000-00",
  },
  guide: {
    title: "Seja bem-vindo(a) à MOVR",
    subtitle:
      "Você está a alguns passos de fazer sua primeira carga. Este guia mostra o caminho — comece pelo que fizer sentido para você.",
    doCta: "Fazer",
    doneCta: "Entendi, começar",
    closeLabel: "Fechar",
    carrierStepsTitle: [
      "Complete seu perfil",
      "Veja cargas compatíveis",
      "Demonstre interesse",
      "Conclua quando selecionado",
    ],
    carrierStepsBody: [
      "Cadastre seu veículo, placa, habilitação/RNTRC e as regiões que você atende.",
      "Apenas cargas que cabem no seu veículo e nas suas regiões aparecem para você.",
      "Candidatar-se não reserva nada: a empresa sempre escolhe o transportador em quem confia.",
      "Aceite a proposta, confirme a coleta e registre o comprovante de entrega.",
    ],
    companyStepsTitle: [
      "Configure a empresa",
      "Publique sua 1ª carga",
      "Escolha o transportador",
      "Acompanhe e avalie",
    ],
    companyStepsBody: [
      "Preencha CNPJ, endereço e telefone. A verificação é manual pelo fundador.",
      "Informe origem, destino, data, peso e preço. Em minutos a carga fica visível.",
      "Receba o interesse, selecione o transportador e só então o contato é revelado.",
      "Acompanhe do OPEN ao COMPLETED, com comprovante de entrega antes de concluir. Avalie ao final.",
    ],
  },
};

const dictionaries: Record<Locale, Messages> = {
  pt,
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
  return dictionaries[locale] ?? pt;
}