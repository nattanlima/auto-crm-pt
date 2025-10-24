import { RESPONSIBLE_MAP } from "../utils/constants.js";

const subscribers = new Set();

const state = {
  leads: [],
  loading: false,
  error: null,
  filters: {
    search: "",
    seller: "",
    period: "last15",
  },
};

export function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function getState() {
  return { ...state };
}

export function setState(partial) {
  Object.assign(state, partial);
  notify();
}

export function setLeads(leads) {
  state.leads = leads;
  notify();
}

export function setLoading(loading) {
  state.loading = loading;
  notify();
}

export function setError(error) {
  state.error = error;
  notify();
}

export function updateFilters(partialFilters) {
  state.filters = { ...state.filters, ...partialFilters };
  notify();
}

export function getFilteredLeads() {
  const { search, seller } = state.filters;
  let scoped = [...state.leads];

  if (search) {
    const term = search.toLowerCase();
    scoped = scoped.filter((lead) => {
      const matchesName = lead.name?.toLowerCase().includes(term);
      const matchesNumber = lead.number?.includes(term);
      return matchesName || matchesNumber;
    });
  }

  if (seller) {
    if (seller === "unassigned") {
      scoped = scoped.filter((lead) => !RESPONSIBLE_MAP[lead.carteiraId]);
    } else {
      scoped = scoped.filter((lead) => String(lead.carteiraId) === seller);
    }
  }

  return scoped;
}

function notify() {
  const snapshot = getState();
  for (const listener of subscribers) {
    listener(snapshot);
  }
}
