import { fetchRawKanbanData } from "./api/n8nClient.js";
import { renderFilters } from "./components/filters.js";
import { renderKanban } from "./components/kanban.js";
import { buildLeadModel } from "./utils/transformers.js";
import { getFilteredLeads, getState, setError, setLeads, setLoading, subscribe } from "./state/store.js";

const filtersRoot = document.getElementById("filters");
const kanbanRoot = document.getElementById("kanban-root");
const spinnerTemplate = document.getElementById("spinner-template");

let activeController;

renderFilters(filtersRoot, {
  onPeriodChange: (period) => {
    loadData(period);
  },
});

subscribe((state) => {
  if (state.loading) {
    showSpinner();
    return;
  }

  if (state.error) {
    showError(state.error);
    return;
  }

  const leads = getFilteredLeads();
  renderKanban(kanbanRoot, leads, {
    onStatusChange: (leadId, statusTagId) => persistLeadStatus(leadId, statusTagId),
  });
});

loadData(getState().filters.period);

async function loadData(period) {
  if (activeController) {
    activeController.abort();
  }
  const controller = new AbortController();
  activeController = controller;

  try {
    setLoading(true);
    showSpinner();
    const rawItems = await fetchRawKanbanData(period, { signal: controller.signal });
    const { leads } = buildLeadModel(rawItems);
    if (controller.signal.aborted) return;
    setLeads(leads);
    setError(null);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    console.error("Erro ao carregar dados do N8N", error);
    setError(error.message || "Falha ao carregar dados do N8N");
  } finally {
    if (activeController === controller) {
      activeController = null;
      setLoading(false);
    }
  }
}

function persistLeadStatus(leadId, statusTagId) {
  const { leads } = getState();
  const updated = leads.map((lead) =>
    lead.id === leadId ? { ...lead, statusTagId, updatedAt: new Date().toISOString() } : lead
  );
  setLeads(updated);
}

function showSpinner() {
  kanbanRoot.innerHTML = "";
  const clone = spinnerTemplate.content.cloneNode(true);
  kanbanRoot.appendChild(clone);
}

function showError(message) {
  kanbanRoot.innerHTML = `
    <div class="flex items-center justify-center h-full">
      <div class="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-center space-y-2 max-w-lg">
        <p class="font-semibold">Erro ao carregar o Kanban</p>
        <p>${message}</p>
        <button class="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#00ba70] text-white rounded-md" id="retry-button">Tentar novamente</button>
      </div>
    </div>
  `;

  kanbanRoot.querySelector("#retry-button")?.addEventListener("click", () => {
    setError(null);
    loadData(getState().filters.period);
  });
}
