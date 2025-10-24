import { ENDPOINTS } from "../utils/constants.js";

const DEFAULT_TIMEOUT_MS = 20000;

function buildTimeoutSignal({ signal, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const abortFromParent = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      abortFromParent();
    } else {
      signal.addEventListener("abort", abortFromParent, { once: true });
    }
  }

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener("abort", abortFromParent);
      }
    },
  };
}

async function requestJson(url, options = {}) {
  const { signal } = options;
  const { signal: timeoutSignal, dispose } = buildTimeoutSignal({ signal });

  try {
    const response = await fetch(url, { signal: timeoutSignal });
    if (!response.ok) {
      throw new Error(`Falha ao consultar webhook (${response.status})`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("Formato inesperado recebido do N8N");
    }
    return payload;
  } finally {
    dispose();
  }
}

export async function fetchRawKanbanData(period, options = {}) {
  const endpoint = period === "all" ? ENDPOINTS.all : ENDPOINTS.last15;
  return requestJson(endpoint, options);
}
