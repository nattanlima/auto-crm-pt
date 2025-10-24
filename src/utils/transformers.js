import { KANBAN_COLUMNS, RESPONSIBLE_MAP, TEMPERATURE_MAP } from "./constants.js";

const COLUMN_IDS = new Set(KANBAN_COLUMNS.map(({ id }) => id));

export function splitTables(items = []) {
  const tables = new Map();
  for (const entry of items) {
    const tableName = entry?.json?.tableName;
    if (!tableName) continue;
    if (!tables.has(tableName)) {
      tables.set(tableName, []);
    }
    tables.get(tableName).push(entry.json.data);
  }
  return tables;
}

const temperatureByTag = new Map(Object.entries(TEMPERATURE_MAP).map(([tagId, value]) => [Number(tagId), value]));

function pickTemperature(tags) {
  for (const tag of tags) {
    const match = temperatureByTag.get(tag?.tagId);
    if (match) return match;
  }
  return null;
}

function pickStatusTag(tags) {
  return tags
    .map((tag) => tag?.tagId)
    .filter((tagId) => COLUMN_IDS.has(tagId))
    .sort((a, b) => b - a)[0];
}

function extractContactFields(customFields = []) {
  const modelo = customFields.find((field) => field?.name === "Modelo do Carro");
  const chassi = customFields.find((field) => field?.name === "Chassi");

  return {
    modeloCarro: sanitizeCustomValue(modelo?.value),
    chassi: sanitizeCustomValue(chassi?.value),
  };
}

function sanitizeCustomValue(value) {
  if (!value || value === "0") return null;
  return value;
}

export function buildLeadModel(items = []) {
  const tables = splitTables(items);
  const contacts = tables.get("contacts") || [];
  const tickets = tables.get("tickets") || [];
  const ticketTags = tables.get("ticketTags") || [];
  const contactCustomFields = tables.get("contactCustomFields") || [];

  const ticketsByContact = groupBy(tickets, (ticket) => ticket?.contactId);
  const customByContact = groupBy(contactCustomFields, (custom) => custom?.contactId);
  const tagsByTicket = groupBy(ticketTags, (tag) => tag?.ticketId);

  const leads = contacts
    .filter((contact) => contact?.companyId === 29)
    .map((contact) => {
      const contactTickets = ticketsByContact.get(contact.id) || [];
      if (contactTickets.length === 0) return null;

      const latestTicket = [...contactTickets].sort((a, b) => b.id - a.id)[0];
      if (!latestTicket) return null;

      const allTags = contactTickets.flatMap((ticket) => tagsByTicket.get(ticket.id) || []);
      const statusTagId = pickStatusTag(allTags);
      if (!statusTagId) return null;

      const temperature = pickTemperature(allTags);
      const customFields = customByContact.get(contact.id) || [];
      const { modeloCarro, chassi } = extractContactFields(customFields);

      return {
        ...contact,
        latestTicketId: latestTicket.id,
        latestTicketUuid: latestTicket.uuid,
        statusTagId,
        temperature,
        modeloCarro,
        chassi,
        responsibleName: RESPONSIBLE_MAP[contact.carteiraId] || "Vendedor nao atribuido",
        customFields,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return {
    leads,
    contacts,
    tables,
  };
}

function groupBy(collection, extractor) {
  const map = new Map();
  for (const item of collection) {
    const key = extractor(item);
    if (key == null) continue;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  }
  return map;
}
