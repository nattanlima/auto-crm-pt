import { KANBAN_COLUMNS, UPDATE_TAG_ENDPOINT } from "../utils/constants.js";
import { formatRelativeDate, formatValue, formatPhone } from "../utils/formatters.js";
import { openLeadModal } from "./modal.js";

export function renderKanban(root, leads, { onStatusChange } = {}) {
  root.innerHTML = "";

  if (!leads.length) {
    root.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <p class="text-gray-500">Nenhum lead encontrado para os filtros selecionados.</p>
      </div>
    `;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "kanban-scroll-x flex gap-6 overflow-x-auto pb-4 h-full";
  const leadsById = new Map(leads.map((lead) => [String(lead.id), lead]));

  for (const column of KANBAN_COLUMNS) {
    const leadsInColumn = leads.filter((lead) => lead.statusTagId === column.id);
    const columnEl = document.createElement("section");
    columnEl.className = "kanban-column flex-shrink-0 w-80 bg-slate-100 rounded-xl p-3 flex flex-col transition-all duration-300 h-full";
    columnEl.dataset.columnId = column.id;

    columnEl.innerHTML = `
      <div class="column-header flex items-center justify-between mb-4 px-1 flex-shrink-0">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="w-3 h-3 rounded-full ${column.color} flex-shrink-0"></div>
          <h2 class="font-bold text-slate-700 truncate">${column.title}</h2>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold bg-slate-200 text-slate-600 rounded-full px-2 py-0.5" data-counter>${leadsInColumn.length}</span>
          <button class="collapse-btn text-slate-500 hover:bg-slate-200 p-1 rounded-md transition-colors" aria-label="Recolher coluna">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5 5-5m8 10l-5-5 5-5"></path></svg>
          </button>
        </div>
      </div>
      <div class="column-header-collapsed flex-col items-center justify-between h-full py-2">
        <h2 class="font-bold text-slate-700 rotate-180 writing-mode-vertical">${column.title}</h2>
        <span class="text-sm font-bold bg-slate-200 text-slate-600 rounded-full px-2 py-0.5" data-counter>${leadsInColumn.length}</span>
      </div>
    `;

    const cardsContainer = document.createElement("div");
    cardsContainer.className = "cards kanban-scroll-y space-y-3 pr-2 overflow-y-auto";
    cardsContainer.dataset.columnId = column.id;

    leadsInColumn.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    for (const lead of leadsInColumn) {
      cardsContainer.appendChild(createLeadCard(lead));
    }

    columnEl.appendChild(cardsContainer);
    prepareColumnCollapsible(columnEl);
    wrapper.appendChild(columnEl);
  }

  setupDragAndDrop(wrapper, { leadsById, onStatusChange });
  root.appendChild(wrapper);
  adjustColumnHeights();
  window.addEventListener("resize", adjustColumnHeights, { once: true });
}

function createLeadCard(lead) {
  const card = document.createElement("article");
  card.className = "bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between transition-all duration-200 cursor-grab active:cursor-grabbing";
  card.draggable = true;
  card.dataset.leadId = lead.id;
  card.dataset.ticketId = lead.latestTicketId;

  const timeAgo = formatRelativeDate(lead.createdAt);
  const temperaturePill = lead.temperature
    ? `<span class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${lead.temperature.classes}">${lead.temperature.icon} ${lead.temperature.label}</span>`
    : "";

  card.innerHTML = `
    <div>
      <div class="mb-2">
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-bold text-gray-800 truncate" title="${lead.name}">${lead.name}</h3>
          ${timeAgo ? `<span class="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">${timeAgo}</span>` : ""}
        </div>
        <p class="text-sm text-gray-500">${formatPhone(lead.number)}</p>
      </div>

      ${(lead.modeloCarro || lead.chassi)
        ? `<div class="mt-2 mb-3 space-y-1 border-t border-gray-100 pt-2">
            ${lead.modeloCarro ? `<div class="flex items-center text-xs"><span class="font-semibold text-gray-500 w-16 shrink-0">Veiculo:</span><span class="text-gray-700 truncate" title="${lead.modeloCarro}">${formatValue(lead.modeloCarro)}</span></div>` : ""}
            ${lead.chassi ? `<div class="flex items-center text-xs"><span class="font-semibold text-gray-500 w-16 shrink-0">Chassi:</span><span class="text-gray-700 truncate" title="${lead.chassi}">${lead.chassi}</span></div>` : ""}
          </div>`
        : ""}

      <div class="border-t border-gray-200 pt-3">
        <p class="text-xs text-gray-500 mb-1">Responsavel</p>
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 flex-shrink-0"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="font-semibold text-gray-700">${lead.responsibleName}</span>
        </div>
      </div>
    </div>
    <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
      <div class="flex-1 min-w-0">${temperaturePill}</div>
      <div class="flex items-center gap-3 text-xs flex-shrink-0">
        <button type="button" class="text-[#00ba70] font-semibold" data-modal="${lead.id}">Detalhes</button>
        ${lead.latestTicketUuid ? `<a href="https://bot4.prismeapp.com.br/tickets/${lead.latestTicketUuid}" target="_blank" rel="noopener" class="bg-[#00ba70] hover:bg-[#009a5d] text-white font-bold py-1 px-3 rounded-lg transition-colors">Ticket</a>` : ""}
      </div>
    </div>
  `;

  card.querySelector(`[data-modal="${lead.id}"]`)?.addEventListener("click", (event) => {
    event.stopPropagation();
    openLeadModal(lead);
  });

  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", String(lead.id));
    card.classList.add("card-dragging");
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("card-dragging");
  });

  return card;
}

function prepareColumnCollapsible(columnEl) {
  const toggle = () => columnEl.classList.toggle("column-collapsed");
  columnEl.querySelector(".collapse-btn")?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggle();
  });
  columnEl.querySelector(".column-header-collapsed")?.addEventListener("click", toggle);
}

function setupDragAndDrop(board, { leadsById, onStatusChange }) {
  board.addEventListener("dragover", (event) => {
    const dropZone = event.target.closest?.(".cards");
    if (!dropZone) return;
    event.preventDefault();
    if (dropZone.closest(".column-collapsed")) return;
    dropZone.classList.add("drop-zone");
  });

  board.addEventListener("dragleave", (event) => {
    const dropZone = event.target.closest?.(".cards");
    dropZone?.classList.remove("drop-zone");
  });

  board.addEventListener("drop", async (event) => {
    const dropZone = event.target.closest?.(".cards");
    document.querySelectorAll(".cards.drop-zone").forEach((el) => el.classList.remove("drop-zone"));
    if (!dropZone) return;
    event.preventDefault();

    const leadId = event.dataTransfer.getData("text/plain");
    const lead = leadsById.get(leadId);
    if (!lead) return;

    const newColumnId = Number(dropZone.dataset.columnId);
    if (lead.statusTagId === newColumnId) return;

    const card = board.querySelector(`[data-lead-id="${leadId}"]`);
    if (!card) return;

    const previousColumn = card.closest("[data-column-id]");
    const previousColumnContainer = previousColumn?.querySelector(".cards");

    dropZone.appendChild(card);
    updateCounters();

    const revert = () => {
      previousColumnContainer?.appendChild(card);
      updateCounters();
    };

    try {
      await updateLeadStatus(lead.latestTicketId, newColumnId);
      lead.statusTagId = newColumnId;
      onStatusChange?.(lead.id, newColumnId);
    } catch (error) {
      console.error("Erro ao atualizar tag", error);
      revert();
      alert("Nao foi possivel atualizar o status do lead. Tente novamente.");
    }
  });
}

async function updateLeadStatus(ticketId, newTagId) {
  if (!ticketId) {
    throw new Error("Ticket ID ausente no lead");
  }

  const response = await fetch(UPDATE_TAG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticketId, tagId: newTagId }),
  });

  if (!response.ok) {
    throw new Error(`Webhook troca-tag retornou status ${response.status}`);
  }
}

function updateCounters() {
  document.querySelectorAll("[data-column-id]").forEach((column) => {
    const count = column.querySelectorAll("[data-lead-id]").length;
    column.querySelectorAll("[data-counter]").forEach((counter) => {
      counter.textContent = String(count);
    });
  });
}

function adjustColumnHeights() {
  const header = document.querySelector("main > header");
  const filters = document.getElementById("filters");
  if (!header || !filters) return;
  const offset = header.offsetHeight + filters.offsetHeight + 80;

  document.querySelectorAll(".cards").forEach((container) => {
    container.style.maxHeight = `calc(100vh - ${offset}px)`;
  });
}
