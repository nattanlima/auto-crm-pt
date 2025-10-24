export const ENDPOINTS = {
  all: "https://prismen8n.prismeapp.com.br/webhook/semdata-auto",
  last15: "https://prismen8n.prismeapp.com.br/webhook/15dias-auto",
};

export const UPDATE_TAG_ENDPOINT = "https://prismen8n.prismeapp.com.br/webhook/troca-tag";

export const RESPONSIBLE_MAP = {
  250: "Renato",
  251: "Rosana",
  252: "Vinicius",
  249: "Marcio",
  253: "Pedro",
};

export const TEMPERATURE_MAP = {
  763: { label: "QUENTE", icon: "🔥", classes: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/20" },
  764: { label: "MORNO", icon: "🤔", classes: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20" },
  765: { label: "GELADO", icon: "🧊", classes: "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-600/20" },
};

export const KANBAN_COLUMNS = [
  { id: 741, title: "NOVO LEAD", color: "bg-sky-500" },
  { id: 742, title: "RECEPCAO", color: "bg-blue-500" },
  { id: 743, title: "ATENDER AGORA", color: "bg-teal-500" },
  { id: 744, title: "EM NEGOCIACAO", color: "bg-indigo-500" },
  { id: 745, title: "AGUARDANDO DOC", color: "bg-amber-500" },
  { id: 746, title: "RECEPCAO DOCUMENTO", color: "bg-orange-500" },
  { id: 747, title: "PROPOSTAS P/ENVIAR", color: "bg-purple-500" },
  { id: 748, title: "PROPOSTAS EM ANALISE", color: "bg-violet-500" },
  { id: 749, title: "PROPOSTAS PENDENTES", color: "bg-fuchsia-500" },
  { id: 750, title: "APROVADOS", color: "bg-green-500" },
  { id: 751, title: "CONTRATO ASSINADO", color: "bg-emerald-600" },
  { id: 752, title: "AGUARDANDO CARRO", color: "bg-lime-600" },
  { id: 753, title: "EM PAGAMENTO", color: "bg-yellow-500" },
  { id: 754, title: "PENDENTE ENTREGA", color: "bg-rose-500" },
];

export const PERIOD_OPTIONS = [
  { value: "last15", label: "Ultimos 15 dias" },
  { value: "all", label: "Todo o Periodo" },
];
