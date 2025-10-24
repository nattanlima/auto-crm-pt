import { PERIOD_OPTIONS, RESPONSIBLE_MAP } from "../utils/constants.js";
import { updateFilters, getState } from "../state/store.js";
import { debounce } from "../utils/debounce.js";

export function renderFilters(root, { onPeriodChange }) {
  const { filters } = getState();
  root.innerHTML = `
    <div class="relative">
      <input
        id="search-filter"
        type="text"
        value="${filters.search}"
        placeholder="Buscar por nome ou telefone..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ba70] focus:outline-none transition"
      />
      <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <div class="flex">
      <select
        id="period-filter"
        class="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ba70] focus:outline-none bg-white transition"
      >
        ${PERIOD_OPTIONS.map((option) => `
          <option value="${option.value}" ${option.value === filters.period ? "selected" : ""}>${option.label}</option>
        `).join("")}
      </select>
    </div>
    <div class="flex">
      <select
        id="seller-filter"
        class="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00ba70] focus:outline-none bg-white transition"
      >
        <option value="">Todos os Vendedores</option>
        ${Object.entries(RESPONSIBLE_MAP)
          .map(([id, name]) => `<option value="${id}" ${String(id) === filters.seller ? "selected" : ""}>${name}</option>`)
          .join("")}
        <option value="unassigned" ${filters.seller === "unassigned" ? "selected" : ""}>Nao atribuido</option>
      </select>
    </div>
  `;

  const searchInput = root.querySelector("#search-filter");
  const sellerSelect = root.querySelector("#seller-filter");
  const periodSelect = root.querySelector("#period-filter");

  if (searchInput) {
    const handler = debounce((event) => {
      updateFilters({ search: event.target.value.trim() });
    }, 250);
    searchInput.addEventListener("input", handler);
  }

  sellerSelect?.addEventListener("change", (event) => {
    updateFilters({ seller: event.target.value });
  });

  periodSelect?.addEventListener("change", (event) => {
    const period = event.target.value;
    updateFilters({ period });
    onPeriodChange?.(period);
  });
}
