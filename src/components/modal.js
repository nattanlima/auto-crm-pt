import { formatValue } from "../utils/formatters.js";

const modalRoot = document.getElementById("modal-root");

export function closeModal() {
  modalRoot.innerHTML = "";
  modalRoot.className = "";
}

export function openLeadModal(lead) {
  if (!lead) return;

  modalRoot.innerHTML = `
    <div class="modal-mask bg-black/50 flex items-center justify-center p-4 z-50" data-overlay role="dialog" aria-modal="true">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">${lead.name}</h2>
            <p class="text-gray-500">${lead.email || "N/A"}</p>
            <p class="text-gray-500">${lead.number || "N/A"}</p>
          </div>
          <button type="button" class="text-3xl leading-none font-bold text-gray-400 hover:text-gray-600" data-close-modal>&times;</button>
        </div>
        <div class="px-6 py-5 space-y-6">
          <section>
            <h3 class="font-semibold text-lg text-gray-700 mb-3">Detalhes Adicionais</h3>
            ${lead.customFields?.length ? "" : '<p class="text-gray-500">Nenhum campo adicional encontrado.</p>'}
            <div class="grid gap-3 md:grid-cols-2">
              ${(lead.customFields || [])
                .map(
                  (field) => `
                    <div class="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                      <p class="text-sm text-gray-500 font-medium">${field.name}</p>
                      <p class="font-semibold text-gray-700">${formatValue(field.value)}</p>
                    </div>
                  `
                )
                .join("")}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  modalRoot.className = "fixed inset-0";
  modalRoot.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);
  modalRoot.querySelector("[data-overlay]")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  });
}
