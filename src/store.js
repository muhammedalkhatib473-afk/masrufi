const STORAGE_KEY = "masroof-local-v1";

export const DEFAULT_CATEGORIES = [
  { id: "salary", name: "راتب", type: "income", color: "#27856b" },
  { id: "extra-income", name: "دخل إضافي", type: "income", color: "#73a892" },
  { id: "home", name: "المنزل", type: "expense", color: "#d39058" },
  { id: "food", name: "طعام ومقاهي", type: "expense", color: "#cb7458" },
  { id: "transport", name: "مواصلات", type: "expense", color: "#7285b0" },
  { id: "health", name: "صحة", type: "expense", color: "#bd737a" },
  { id: "shopping", name: "تسوّق", type: "expense", color: "#ad83a5" },
  { id: "bills", name: "فواتير", type: "expense", color: "#688f9a" },
  { id: "leisure", name: "ترفيه", type: "expense", color: "#bc9951" },
];

export function createDefaultState() {
  return {
    transactions: [],
    budgets: [],
    recurring: [],
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    settings: { currency: "USD", monthStart: 1, name: "", language: "ar" },
  };
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createDefaultState();
    const parsed = JSON.parse(saved);
    const defaults = createDefaultState();
    const settings = { ...defaults.settings, ...(parsed.settings || {}) };
    if (!["ar", "en", "tr"].includes(settings.language)) settings.language = "ar";
    return {
      ...defaults,
      ...parsed,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
      categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : defaults.categories,
      settings,
    };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getMonthRange(monthStart = 1, referenceDate = new Date()) {
  const day = Math.max(1, Math.min(28, Number(monthStart) || 1));
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), day);
  if (referenceDate.getDate() < day) start.setMonth(start.getMonth() - 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, day);
  return { start, end };
}

export function inCurrentPeriod(dateValue, monthStart = 1, now = new Date()) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return false;
  const { start, end } = getMonthRange(monthStart, now);
  return date >= start && date < end;
}

export function periodTransactions(state, monthStart = state.settings.monthStart) {
  return state.transactions.filter((transaction) => inCurrentPeriod(transaction.date, monthStart));
}

export function sumByType(transactions, type) {
  return transactions.reduce((sum, transaction) => sum + (transaction.type === type ? Number(transaction.amount) || 0 : 0), 0);
}

export function formatMoney(value, currency = "USD", locale = "ar") {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
  }
}

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }, locale = "ar") {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return "—";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function addFrequency(dateValue, frequency) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return dateValue;
  if (frequency === "weekly") date.setDate(date.getDate() + 7);
  else if (frequency === "yearly") date.setFullYear(date.getFullYear() + 1);
  else {
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
