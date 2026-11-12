import "./styles.css";
import {
  addFrequency,
  createDefaultState,
  formatDate,
  formatMoney,
  getMonthRange,
  loadState,
  makeId,
  periodTransactions,
  saveState,
  sumByType,
} from "./store.js";
import { categoryTranslations, languageLocale, translate, translateDOM } from "./i18n.js";

const state = loadState();
const currentLanguage = () => ["ar", "en", "tr"].includes(state.settings.language) ? state.settings.language : "ar";
const locale = () => languageLocale(currentLanguage());
const localDate = (value, options) => formatDate(value, options, locale());
const pageMeta = {
  home: ["نظرة عامة", "صورة واضحة عن دخلك ومصاريفك"],
  transactions: ["سجلّ العمليات", "كل حركة مالية بمكان واحد"],
  budgets: ["الميزانيات", "خطّط للشهر، وخلي الصرف تحت السيطرة"],
  reports: ["التقارير", "شوف وين عم تروح مصرياتك"],
  recurring: ["العمليات المتكررة", "رتّب الالتزامات اللي بترجع كل فترة"],
  settings: ["الإعدادات", "ضبط العملة والتصنيفات والخصوصية"],
};
const navItems = [
  { id: "home", label: "الرئيسية", icon: "home" },
  { id: "transactions", label: "العمليات", icon: "arrows" },
  { id: "budgets", label: "الميزانيات", icon: "target" },
  { id: "reports", label: "التقارير", icon: "chart" },
  { id: "recurring", label: "المتكررة", icon: "repeat" },
];
const glyphs = {
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  arrows: '<path d="M7 7h14l-4-4M17 17H3l4 4"/><path d="M17 3v4M7 17v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',
  repeat: '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.2.1a2 2 0 1 1-2.8-2.8l.2-.1a2 2 0 0 0-1.5-3.4h-.2a2 2 0 1 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.2a2 2 0 1 1 2.8-2.8l.1.2a2 2 0 0 0 3.4-1.5V1.7a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.3a2 2 0 1 1 0 4h-.3a2 2 0 0 0-1.3 1.5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  income: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  expense: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  edit: '<path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V6a2 2 0 0 1 2-2h12M16 14h.01"/><path d="M16 11h5v6h-5a3 3 0 1 1 0-6Z"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
};
const icon = (name, extra = "") => `<svg ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name] || glyphs.wallet}</svg>`;
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const money = (amount) => formatMoney(amount, state.settings.currency, locale());
const getCategory = (id) => state.categories.find((category) => category.id === id);
const categoryName = (id) => {
  const category = getCategory(id);
  if (!category) return translate("غير مصنّف", currentLanguage());
  const preset = categoryTranslations[id];
  if (preset && category.name === preset[0]) return preset[currentLanguage() === "en" ? 1 : currentLanguage() === "tr" ? 2 : 0];
  return category.name;
};
const currentPeriod = () => periodTransactions(state);
const monthExpenses = () => sumByType(currentPeriod(), "expense");
const monthIncome = () => sumByType(currentPeriod(), "income");
const allBalance = () => sumByType(state.transactions, "income") - sumByType(state.transactions, "expense");
function transactionCount(count) {
  if (currentLanguage() === "en") return `${count} ${count === 1 ? "transaction" : "transactions"}`;
  if (currentLanguage() === "tr") return `${count} işlem`;
  return `${count} ${count === 1 ? "عملية" : "عمليات"}`;
}
let currentPage = "home";
let installPrompt = null;
let toastTimer;

const app = document.querySelector("#app");
function renderShell() {
  app.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><img class="brand-mark" src="/icon.svg" alt="" /><div><p class="brand-name">مصروفي</p><p class="brand-caption">مالك، بوضوح</p></div></div>
      <p class="nav-section-label">قائمتك</p>
      <nav class="nav-list" aria-label="التنقل الرئيسي" data-nav="desktop"></nav>
      <div class="sidebar-foot"><div class="privacy-chip"><span class="privacy-dot"></span><span>بياناتك محفوظة على جهازك</span></div></div>
    </aside>
    <main class="main-area">
      <header class="topbar">
        <div class="topbar-greeting"><span class="topbar-icon">${icon("wallet")}</span><div><div>أهلاً في مصروفي</div><div class="topbar-caption">دفتر مالك الشخصي</div></div></div>
        <div class="topbar-actions">
          <select class="language-switch" data-language-picker aria-label="لغة التطبيق"><option value="ar">العربية</option><option value="en">English</option><option value="tr">Türkçe</option></select>
          <button class="icon-button install-button" type="button" data-action="install" aria-label="ثبّت مصروفي" title="ثبّت مصروفي">${icon("download")}</button>
          <button class="icon-button" type="button" data-page="settings" aria-label="الإعدادات" title="الإعدادات">${icon("settings")}</button>
        </div>
      </header>
      <div class="page-wrap">
        <div id="page-heading"></div>
        <div id="page-content"></div>
      </div>
    </main>
    <nav class="bottom-nav" aria-label="التنقل" data-nav="mobile"></nav>
  </div>
  <div id="modal-root"></div>
  <div id="toast-root" aria-live="assertive"></div>
`;
}

renderShell();

function renderNav() {
  for (const nav of document.querySelectorAll("[data-nav]")) {
    nav.innerHTML = navItems.map((item) => `<button type="button" class="nav-item ${currentPage === item.id ? "active" : ""}" data-page="${item.id}" aria-current="${currentPage === item.id ? "page" : "false"}"><span class="nav-icon">${icon(item.icon)}</span><span>${item.label}</span></button>`).join("");
  }
}

function applyLanguage(root = app) {
  const language = currentLanguage();
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const picker = document.querySelector("[data-language-picker]");
  if (picker) picker.value = language;
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.href = language === "en" ? "/manifest-en.webmanifest" : language === "tr" ? "/manifest-tr.webmanifest" : "/manifest.webmanifest";
  const titles = { ar: "مصروفي — مالك، بوضوح", en: "Masroofi — Your money, clearly", tr: "Masroofi — Paranız, net bir şekilde" };
  const descriptions = {
    ar: "مصروفي — طريقة أهدأ وأوضح لمتابعة دخلك ومصاريفك وميزانيتك، مع الاحتفاظ ببياناتك على جهازك.",
    en: "Masroofi — a clear, private way to track income, expenses, and budgets on your device.",
    tr: "Masroofi — gelir, gider ve bütçenizi cihazınızda özel olarak takip etmenin kolay yolu.",
  };
  document.title = titles[language];
  document.querySelector('meta[name="description"]')?.setAttribute("content", descriptions[language]);
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute("content", language === "ar" ? "مصروفي" : "Masroofi");
  if (root === app && currentPage === "settings") {
    root.querySelectorAll(".category-manage-name").forEach((element, index) => {
      const category = state.categories[index];
      if (category) {
        element.textContent = categoryName(category.id);
        element.dataset.noTranslate = "true";
      }
    });
  }
  const categorySelects = [...(root.matches?.('select[name="categoryId"]') ? [root] : []), ...root.querySelectorAll('select[name="categoryId"]')];
  for (const select of categorySelects) {
    for (const option of select.options) {
      if (!option.value) continue;
      option.textContent = categoryName(option.value);
      option.dataset.noTranslate = "true";
    }
  }
  translateDOM(root, language);
}

function pageAction(page) {
  const actions = {
    home: `<button class="button button-primary" data-action="new-transaction">${icon("plus", 'class="button-icon"')}<span class="button-label">عملية جديدة</span></button>`,
    transactions: `<button class="button button-primary" data-action="new-transaction">${icon("plus", 'class="button-icon"')}<span class="button-label">إضافة عملية</span></button>`,
    budgets: `<button class="button button-primary" data-action="new-budget">${icon("plus", 'class="button-icon"')}<span class="button-label">ميزانية جديدة</span></button>`,
    recurring: `<button class="button button-primary" data-action="new-recurring">${icon("plus", 'class="button-icon"')}<span class="button-label">إضافة متكررة</span></button>`,
    settings: `<button class="button button-soft" data-action="new-category">${icon("plus", 'class="button-icon"')}<span class="button-label">تصنيف جديد</span></button>`,
  };
  return actions[page] || "";
}

function render() {
  renderNav();
  const greeting = document.querySelector(".topbar-greeting div > div");
  if (greeting) greeting.textContent = state.settings.name
    ? currentLanguage() === "en" ? `Hello, ${state.settings.name}` : currentLanguage() === "tr" ? `Merhaba, ${state.settings.name}` : `أهلاً، ${state.settings.name}`
    : translate("أهلاً في مصروفي", currentLanguage());
  const [title, subtitle] = pageMeta[currentPage] || pageMeta.home;
  document.querySelector("#page-heading").innerHTML = `<div class="page-heading"><div><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${pageAction(currentPage)}</div>`;
  const pages = {
    home: renderDashboard,
    transactions: renderTransactions,
    budgets: renderBudgets,
    reports: renderReports,
    recurring: renderRecurring,
    settings: renderSettings,
  };
  document.querySelector("#page-content").innerHTML = pages[currentPage]();
  if (currentPage === "transactions") {
    const items = filteredTransactions();
    document.querySelector("#transaction-list").innerHTML = transactionRows(items);
    document.querySelector("[data-filter-count]").textContent = transactionCount(items.length);
  }
  applyLanguage(app);
}

function sectionTitle(title, subtitle, link = "") {
  return `<div class="section-row"><div><h2 class="section-title">${title}</h2>${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ""}</div>${link}</div>`;
}

function statCard(label, amount, type, note) {
  const sign = type === "income" ? "+" : "−";
  return `<article class="card metric-card"><div class="metric-head"><span class="metric-label">${label}</span><span class="metric-icon ${type}">${icon(type)}</span></div><div><div class="metric-amount">${sign}${esc(money(amount))}</div><div class="metric-note">${note}</div></div></article>`;
}

function monthLabel() {
  const { start } = getMonthRange(state.settings.monthStart);
  return new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric" }).format(start);
}

function renderDashboard() {
  const expenses = monthExpenses();
  const incomes = monthIncome();
  const balance = allBalance();
  const transactions = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const categories = expenseCategoryTotals(currentPeriod()).slice(0, 4);
  const incomeExpense = buildMonthSeries();
  const recentRows = transactions.length ? renderCompactTransactions(transactions) : emptyState("wallet", "دفترك لسه فاضي", "سجّل أول دخل أو مصروف، ومنبلّش نبني صورتك المالية خطوة بخطوة.", "new-transaction", "سجّل أول عملية");
  const budgetContent = state.budgets.length ? renderBudgetItems(state.budgets.slice(0, 3)) : emptyState("target", "ما في ميزانية محددة", "حطّ حدّ لمصاريف الشهر، وتابع قديش ضلّ معك.", "new-budget", "أنشئ ميزانية");
  return `
    <div class="grid stats-grid">
      <article class="card balance-card"><div class="balance-label"><span class="balance-dot"></span> رصيد كل العمليات</div><strong class="balance-amount">${esc(money(balance))}</strong><div class="balance-foot">الإجمالي المسجّل في دفترك</div></article>
      ${statCard("الدخل هذا الشهر", incomes, "income", esc(monthLabel()))}
      ${statCard("المصروف هذا الشهر", expenses, "expense", esc(monthLabel()))}
    </div>
    ${sectionTitle("حركة الشهر", `${translate("الدخل والمصروف خلال", currentLanguage())} ${esc(monthLabel())}`)}
    <div class="grid dashboard-grid">
      <section class="card panel"><div class="panel-head"><div><h2 class="section-title">الدخل مقابل المصروف</h2><p class="section-subtitle">آخر 6 أشهر</p></div><div class="chart-legend"><span class="legend-key"><i class="legend-dot"></i>دخل</span><span class="legend-key"><i class="legend-dot expense"></i>مصروف</span></div></div><div class="chart-wrap">${renderBarChart(incomeExpense)}</div></section>
      <section class="card panel"><div class="panel-head"><div><h2 class="section-title">وين عم تصرف؟</h2><p class="section-subtitle">توزيع المصروفات حسب التصنيف</p></div></div>${categories.length ? renderCategoryList(categories) : emptyState("chart", "ما في مصروفات لسه", "بعد ما تسجّل مصروفات، بيظهر توزيعها هون.", "new-transaction", "أضف مصروف")}</section>
    </div>
    ${sectionTitle("ميزانياتك", "مجموعاتك المحددة للشهر", `<button class="text-link" data-page="budgets">عرض الكل ←</button>`)}
    <section class="card panel panel-inset">${budgetContent}</section>
    ${sectionTitle("آخر العمليات", "أحدث الحركات المسجّلة", `<button class="text-link" data-page="transactions">السجل كاملًا ←</button>`)}
    <section class="card panel panel-inset">${recentRows}</section>
  `;
}

function expenseCategoryTotals(transactions) {
  const totals = new Map();
  transactions.filter((transaction) => transaction.type === "expense").forEach((transaction) => {
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) || 0) + Number(transaction.amount));
  });
  return [...totals.entries()].map(([id, amount]) => ({ category: getCategory(id), id, amount })).sort((a, b) => b.amount - a.amount);
}

function renderCategoryList(items) {
  const max = Math.max(1, ...items.map((item) => item.amount));
  return `<div class="category-list">${items.map((item) => `<div><div class="category-line-head"><span class="category-name"><i class="category-dot" style="background:${esc(item.category?.color || "#8ba696")}"></i>${esc(categoryName(item.id))}</span><strong class="category-sum">${esc(money(item.amount))}</strong></div><div class="progress-track"><div class="progress-bar" style="width:${Math.max(3, item.amount / max * 100)}%;background:${esc(item.category?.color || "#8ba696")}"></div></div></div>`).join("")}</div>`;
}

function renderCompactTransactions(transactions) {
  return `<div class="tx-table-wrap"><table class="tx-table"><thead><tr><th>العملية</th><th>التاريخ</th><th>المبلغ</th></tr></thead><tbody>${transactions.map((tx) => `<tr><td><div class="tx-name-wrap"><span class="tx-bullet">${icon(tx.type === "income" ? "income" : "expense")}</span><span><span class="tx-title">${esc(tx.note || categoryName(tx.categoryId))}</span><span class="tx-category">${esc(categoryName(tx.categoryId))}</span></span></div></td><td class="tx-date">${esc(localDate(tx.date, { day: "numeric", month: "short" }))}</td><td class="tx-value ${tx.type}">${tx.type === "income" ? "+" : "−"}${esc(money(tx.amount))}</td></tr>`).join("")}</tbody></table></div>`;
}

function emptyState(glyph, title, copy, action, label) {
  return `<div class="empty-state"><div class="empty-icon">${icon(glyph)}</div><h3 class="empty-title">${title}</h3><p class="empty-copy">${copy}</p>${action ? `<button class="button button-soft button-sm empty-action" data-action="${action}">${icon("plus", 'class="button-icon"')}${label}</button>` : ""}</div>`;
}

function renderTransactions() {
  const categoryOptions = state.categories.map((cat) => `<option value="${esc(cat.id)}">${esc(cat.name)}</option>`).join("");
  return `<section class="card panel panel-inset">
    <div class="filter-bar">
      <label class="search-field"><input class="field-control" data-filter-search type="search" placeholder="ابحث عن عملية أو ملاحظة" aria-label="ابحث عن عملية" /></label>
      <select class="field-control filter-select" data-filter-type aria-label="نوع العملية"><option value="all">كل الأنواع</option><option value="expense">المصاريف</option><option value="income">الدخل</option></select>
      <select class="field-control filter-select" data-filter-category aria-label="التصنيف"><option value="all">كل التصنيفات</option>${categoryOptions}</select>
      <select class="field-control filter-select" data-filter-period aria-label="الفترة الزمنية"><option value="all">كل الفترات</option><option value="month">هالشهر</option><option value="quarter">آخر 3 أشهر</option><option value="year">هالسنة</option></select>
      <span class="filter-count" data-filter-count></span>
    </div>
    <div id="transaction-list"></div>
  </section>`;
}

function filteredTransactions() {
  const query = document.querySelector("[data-filter-search]")?.value.trim().toLocaleLowerCase(locale()) || "";
  const type = document.querySelector("[data-filter-type]")?.value || "all";
  const category = document.querySelector("[data-filter-category]")?.value || "all";
  const period = document.querySelector("[data-filter-period]")?.value || "all";
  const monthIds = new Set(currentPeriod().map((tx) => tx.id));
  const now = new Date();
  const periodStart = period === "quarter" ? new Date(now.getFullYear(), now.getMonth() - 2, 1) : period === "year" ? new Date(now.getFullYear(), 0, 1) : null;
  return [...state.transactions].filter((tx) => {
    const matchText = !query || `${tx.note || ""} ${categoryName(tx.categoryId)}`.toLocaleLowerCase(locale()).includes(query);
    const txDate = new Date(`${tx.date}T12:00:00`);
    const matchPeriod = period === "all" || (period === "month" ? monthIds.has(tx.id) : Boolean(periodStart && txDate >= periodStart));
    return matchText && matchPeriod && (type === "all" || tx.type === type) && (category === "all" || tx.categoryId === category);
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function transactionRows(items) {
  if (!items.length) return emptyState("search", state.transactions.length ? "ما لقينا عمليات مطابقة" : "ما في عمليات مسجّلة", state.transactions.length ? "جرّب تعدّل البحث أو الفلاتر." : "لما تسجّل عملية، بتلاقي كل التفاصيل هون.", state.transactions.length ? "" : "new-transaction", state.transactions.length ? "" : "أضف أول عملية");
  return `<div class="tx-list">${items.map((tx) => `<div class="tx-row"><div class="tx-name-wrap"><span class="tx-bullet">${icon(tx.type === "income" ? "income" : "expense")}</span><span><span class="tx-title">${esc(tx.note || categoryName(tx.categoryId))}</span><span class="tx-category">${esc(categoryName(tx.categoryId))}</span></span></div><span class="tx-category-cell tx-category">${esc(categoryName(tx.categoryId))}</span><span class="tx-date">${esc(localDate(tx.date))}</span><div class="tx-actions"><strong class="tx-value ${tx.type}">${tx.type === "income" ? "+" : "−"}${esc(money(tx.amount))}</strong><button class="row-action" data-action="edit-transaction" data-id="${esc(tx.id)}" aria-label="تعديل العملية">${icon("edit")}</button><button class="row-action delete" data-action="delete-transaction" data-id="${esc(tx.id)}" aria-label="حذف العملية">${icon("trash")}</button></div></div>`).join("")}</div>`;
}

function renderBudgetItems(budgets) {
  return `<div class="budget-list">${budgets.map((budget) => {
    const spent = currentPeriod().filter((tx) => tx.type === "expense" && (budget.categoryId ? tx.categoryId === budget.categoryId : true)).reduce((sum, tx) => sum + Number(tx.amount), 0);
    const total = Number(budget.amount) || 0;
    const ratio = total > 0 ? spent / total : 0;
    const clamped = Math.min(100, ratio * 100);
    const klass = ratio >= 1 ? "over" : ratio >= .75 ? "warn" : "";
    return `<div class="budget-item"><div class="budget-head"><div class="budget-title-wrap"><div class="budget-name">${esc(budget.categoryId ? categoryName(budget.categoryId) : translate("الميزانية الإجمالية", currentLanguage()))}</div><div class="budget-remaining">باقي ${esc(money(Math.max(0, total - spent)))}</div></div><div class="budget-row-actions"><button class="row-action" data-action="edit-budget" data-id="${esc(budget.id)}" aria-label="تعديل الميزانية">${icon("edit")}</button><button class="row-action delete" data-action="delete-budget" data-id="${esc(budget.id)}" aria-label="حذف الميزانية">${icon("trash")}</button></div></div><div class="progress-track"><div class="progress-bar ${klass}" style="width:${clamped}%"></div></div><div class="budget-numbers"><span>المصروف <strong>${esc(money(spent))}</strong></span><span><strong>${Math.round(ratio * 100)}%</strong> من ${esc(money(total))}</span></div></div>`;
  }).join("")}</div>`;
}

function renderBudgets() {
  const budgets = state.budgets;
  return `<div class="grid page-grid"><section class="card panel">${budgets.length ? `<div class="panel-head"><div><h2 class="section-title">خطة ${esc(monthLabel())}</h2><p class="section-subtitle">تتحدّث تلقائيًا مع كل مصروف تسجّله</p></div></div>${renderBudgetItems(budgets)}` : emptyState("target", "ابدأ بأول ميزانية", "حدد مبلغًا للشهر كله أو لتصنيف معيّن، وشوف المتبقي بوضوح.", "new-budget", "أنشئ ميزانية")}</section><aside class="grid"><div class="card panel"><h2 class="section-title">كيف بتشتغل الميزانية؟</h2><p class="section-subtitle" style="line-height:1.9;margin-top:9px">كل مصروف جديد بينحسب تلقائيًا على ميزانيته. بتقدر تتابع المبلغ المصروف، النسبة المستخدمة، والمبلغ اللي بعده متاح.</p></div><div class="insight-card"><span class="insight-mark">${icon("sparkle")}</span><p class="insight-text">ابدأ بتصنيف واحد أو ميزانية إجمالية. عدّل الحدود متى ما احتجت، وخلّينا نحسب الباقي.</p></div></aside></div>`;
}

function buildMonthSeries() {
  const latestStart = getMonthRange(state.settings.monthStart).start;
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(latestStart.getFullYear(), latestStart.getMonth() - offset, latestStart.getDate());
    const end = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const key = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    const startKey = key(date);
    const endKey = key(end);
    const tx = state.transactions.filter((item) => item.date >= startKey && item.date < endKey);
    months.push({ label: new Intl.DateTimeFormat(locale(), { month: "short" }).format(date), income: sumByType(tx, "income"), expense: sumByType(tx, "expense") });
  }
  return months;
}

function renderBarChart(data) {
  const width = 520;
  const height = 174;
  const max = Math.max(1, ...data.flatMap((month) => [month.income, month.expense]));
  const chartTop = 14;
  const chartHeight = 124;
  const groupWidth = 75;
  const left = 30;
  const bars = data.map((month, i) => {
    const center = left + groupWidth * i + groupWidth / 2;
    const incHeight = Math.max(0, month.income / max * chartHeight);
    const expHeight = Math.max(0, month.expense / max * chartHeight);
    return `<rect class="chart-bar-income" x="${center - 13}" y="${chartTop + chartHeight - incHeight}" width="12" height="${incHeight}" rx="5"/><rect class="chart-bar-expense" x="${center + 3}" y="${chartTop + chartHeight - expHeight}" width="12" height="${expHeight}" rx="5"/><text class="chart-label" x="${center}" y="${height - 7}" text-anchor="middle">${esc(month.label)}</text>`;
  }).join("");
  const grid = [0, .5, 1].map((ratio) => `<line class="chart-grid-line" x1="9" y1="${chartTop + chartHeight * ratio}" x2="${width - 7}" y2="${chartTop + chartHeight * ratio}"/>`).join("");
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="رسم بياني للدخل والمصروف آخر ستة أشهر">${grid}${bars}</svg>`;
}

function renderReports() {
  const totals = expenseCategoryTotals(currentPeriod()).filter((item) => item.amount > 0);
  const total = totals.reduce((sum, item) => sum + item.amount, 0);
  const colors = totals.map((item) => item.category?.color || "#8ba696");
  let acc = 0;
  const circumference = 2 * Math.PI * 63;
  const arcs = total > 0 ? totals.map((item, i) => {
    const ratio = item.amount / total;
    const part = `<circle cx="90" cy="90" r="63" fill="none" stroke="${esc(colors[i])}" stroke-width="20" stroke-dasharray="${ratio * circumference} ${circumference}" stroke-dashoffset="${-acc}"/>`;
    acc += ratio * circumference;
    return part;
  }).join("") : `<circle cx="90" cy="90" r="63" fill="none" stroke="#e8ece4" stroke-width="20"/>`;
  const currentIncome = monthIncome();
  const currentExpense = monthExpenses();
  const net = currentIncome - currentExpense;
  const largest = totals[0];
  const insight = total === 0
    ? translate("ما في مصروفات مسجّلة هالشهر بعد. سجّل عملياتك، وبتصير صورتك أوضح يوم ورا يوم.", currentLanguage())
    : currentLanguage() === "en"
      ? `Top spending category this month: ${categoryName(largest.id)} (${money(largest.amount)}). Total expenses: ${money(total)}.`
      : currentLanguage() === "tr"
        ? `Bu ay en çok harcama yapılan kategori: ${categoryName(largest.id)} (${money(largest.amount)}). Toplam gider: ${money(total)}.`
        : `أعلى تصنيف صرف هالشهر هو ${categoryName(largest.id)} بمبلغ ${money(largest.amount)}. إجمالي مصروفاتك ${money(total)}.`;
  return `<div class="grid report-panels"><section class="card panel"><div class="panel-head"><div><h2 class="section-title">توزيع المصاريف</h2><p class="section-subtitle">حسب التصنيف — ${esc(monthLabel())}</p></div></div><div class="grid" style="grid-template-columns:minmax(190px,.8fr) 1.2fr;align-items:center"><div class="donut-area"><svg class="donut" viewBox="0 0 180 180" aria-label="دائرة توزيع المصاريف">${arcs}</svg><div class="donut-total"><strong>${esc(money(total))}</strong><span>إجمالي الصرف</span></div></div><div>${totals.length ? renderCategoryList(totals.slice(0, 6)) : emptyState("chart", "لسه ما في بيانات", "سجّل مصروفاتك لتظهر هنا.", "new-transaction", "أضف مصروف")}</div></div></section><section class="card panel"><div class="panel-head"><div><h2 class="section-title">صافي الشهر</h2><p class="section-subtitle">دخل ناقص مصروف</p></div></div><div class="grid" style="gap:12px"><div class="budget-item"><div class="budget-name">إجمالي الدخل</div><div class="metric-amount" style="color:#347c63;font-size:19px">${esc(money(currentIncome))}</div></div><div class="budget-item"><div class="budget-name">إجمالي المصروف</div><div class="metric-amount" style="color:#b66350;font-size:19px">${esc(money(currentExpense))}</div></div><div class="budget-item"><div class="budget-name">الصافي</div><div class="metric-amount" style="font-size:19px">${esc(money(net))}</div></div></div></section></div>${sectionTitle("الاتجاه عبر الوقت", "مقارنة الدخل والمصاريف لآخر 6 أشهر")}<section class="card panel"><div class="panel-head"><div><h2 class="section-title">الحركة الشهرية</h2><p class="section-subtitle">${esc(state.settings.currency)}</p></div><div class="chart-legend"><span class="legend-key"><i class="legend-dot"></i>دخل</span><span class="legend-key"><i class="legend-dot expense"></i>مصروف</span></div></div><div class="chart-wrap">${renderBarChart(buildMonthSeries())}</div></section><div style="margin-top:16px" class="insight-card"><span class="insight-mark">${icon("sparkle")}</span><p class="insight-text">${esc(insight)}</p></div>`;
}

function renderRecurring() {
  const items = [...state.recurring].sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  if (!items.length) return `<section class="card panel">${emptyState("repeat", "ما في عمليات متكررة", "أضف راتبك أو الإيجار أو أي اشتراك، وسجّل موعده بكبسة واحدة لما يحين.", "new-recurring", "أضف معاملة متكررة")}</section>`;
  const labels = { weekly: translate("كل أسبوع", currentLanguage()), monthly: translate("كل شهر", currentLanguage()), yearly: translate("كل سنة", currentLanguage()) };
  return `<section class="card panel panel-inset"><div class="panel-head"><div><h2 class="section-title">دفعاتك القادمة</h2><p class="section-subtitle">سجّل العملية عند حلول موعدها، وتنتقل تلقائيًا للموعد التالي</p></div></div>${items.map((item) => `<div class="repeat-row"><div class="tx-name-wrap"><span class="tx-bullet">${icon(item.type === "income" ? "income" : "expense")}</span><span><span class="tx-title">${esc(item.note || categoryName(item.categoryId))}</span><span class="tx-category">${esc(categoryName(item.categoryId))} · ${labels[item.frequency] || "كل شهر"}</span></span></div><strong class="tx-value repeat-amount ${item.type}">${item.type === "income" ? "+" : "−"}${esc(money(item.amount))}</strong><div class="repeat-due">الموعد القادم<br><span class="repeat-frequency">${esc(localDate(item.nextDate))}</span></div><div class="tx-actions"><button class="button button-soft button-sm" data-action="record-recurring" data-id="${esc(item.id)}">سجّلها</button><button class="row-action" data-action="edit-recurring" data-id="${esc(item.id)}" aria-label="تعديل">${icon("edit")}</button><button class="row-action delete" data-action="delete-recurring" data-id="${esc(item.id)}" aria-label="حذف">${icon("trash")}</button></div></div>`).join("")}</section>`;
}

function renderSettings() {
  const currencyOptions = ["USD", "EUR", "GBP", "SAR", "AED", "JOD", "LBP", "EGP", "KWD", "QAR", "TRY"].map((currency) => `<option value="${currency}" ${state.settings.currency === currency ? "selected" : ""}>${currency}</option>`).join("");
  const categoryRows = state.categories.map((category) => `<div class="category-manage-row"><i class="category-dot" style="background:${esc(category.color)}"></i><span class="category-manage-name">${esc(category.name)}</span><span class="category-type-chip">${category.type === "income" ? "دخل" : "مصروف"}</span><button class="row-action" data-action="edit-category" data-id="${esc(category.id)}" aria-label="تعديل ${esc(category.name)}">${icon("edit")}</button><button class="row-action delete" data-action="delete-category" data-id="${esc(category.id)}" aria-label="حذف ${esc(category.name)}">${icon("trash")}</button></div>`).join("");
  return `<div class="grid settings-layout"><div><section class="card settings-card"><div class="panel-head"><div><h2 class="section-title">تفضيلاتك</h2><p class="section-subtitle">كل المبالغ والتواريخ بتنعرض حسب اختياراتك</p></div></div><form id="settings-form" class="form-grid"><label class="form-field"><span class="form-label">الاسم (اختياري)</span><input class="field-control" name="name" maxlength="50" value="${esc(state.settings.name)}" placeholder="شو منناديك؟" /></label><label class="form-field"><span class="form-label">العملة</span><select class="field-control" name="currency">${currencyOptions}</select></label><label class="form-field"><span class="form-label">بداية الشهر المالي</span><select class="field-control" name="monthStart">${Array.from({ length: 28 }, (_, index) => index + 1).map((day) => `<option value="${day}" ${Number(state.settings.monthStart) === day ? "selected" : ""}>يوم ${day} من كل شهر</option>`).join("")}</select></label><div class="form-field"><span class="form-label">دورتك المالية</span><span class="form-hint">اختَر اليوم الذي تبدأ فيه دورتك المالية الشهرية.</span></div><div class="form-field full"><button class="button button-primary" type="submit">حفظ التفضيلات</button></div></form></section><section class="card settings-card"><div class="panel-head"><div><h2 class="section-title">تصنيفاتك</h2><p class="section-subtitle">عدّل الموجود أو أنشئ تصنيفًا جديدًا يناسبك</p></div><button class="button button-soft button-sm" data-action="new-category">${icon("plus", 'class="button-icon"')}إضافة</button></div><div class="categories-manage">${categoryRows}</div></section></div><aside class="grid"><section class="card privacy-card"><h2 class="privacy-title"><span class="privacy-dot"></span> خصوصيتك أولًا</h2><p class="privacy-copy">عملياتك وإعداداتك محفوظة محليًا على هالجهاز، وما عم نرسلها لأي خادم أو بنك. إذا مسحت بيانات الموقع من المتصفح، ممكن تنحذف معها بياناتك؛ ما في مزامنة أو نسخة احتياطية تلقائية.</p></section><button class="button button-danger" data-action="reset-data">${icon("trash", 'class="button-icon"')}مسح كل البيانات على هذا الجهاز</button></aside></div>`;
}

function categoryOptions(type, selected = "") {
  const categories = state.categories.filter((category) => category.type === type);
  if (!categories.length) return `<option value="">أنشئ تصنيفًا أولًا</option>`;
  return categories.map((category) => `<option value="${esc(category.id)}" ${selected === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("");
}

function showModal(kind, id = "") {
  const existing = kind === "transaction" ? state.transactions.find((item) => item.id === id) : kind === "recurring" ? state.recurring.find((item) => item.id === id) : kind === "budget" ? state.budgets.find((item) => item.id === id) : null;
  const isEdit = Boolean(existing);
  const modalRoot = document.querySelector("#modal-root");
  const titleMap = { transaction: isEdit ? "تعديل العملية" : "عملية جديدة", recurring: isEdit ? "تعديل المتكررة" : "متكررة جديدة", budget: isEdit ? "تعديل الميزانية" : "ميزانية جديدة", category: id ? "تعديل التصنيف" : "تصنيف جديد" };
  if (kind === "category") {
    const category = state.categories.find((item) => item.id === id);
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title" class="modal-title">${titleMap[kind]}</h2><p class="modal-subtitle">خلي تصنيفاتك قريبة من طريقة صرفك</p></div><button class="close-button" data-action="close-modal" aria-label="إغلاق">${icon("close")}</button></div><form id="category-form" data-id="${esc(id)}"><div class="form-grid"><label class="form-field full"><span class="form-label">اسم التصنيف</span><input class="field-control" name="name" maxlength="32" required value="${esc(category?.name || "")}" placeholder="مثل: سفر، حيوانات أليفة" /></label><label class="form-field full"><span class="form-label">نوعه</span><select class="field-control" name="type" ${category ? "disabled" : ""}><option value="expense" ${category?.type !== "income" ? "selected" : ""}>مصروف</option><option value="income" ${category?.type === "income" ? "selected" : ""}>دخل</option></select>${category ? `<input type="hidden" name="type" value="${category.type}" />` : ""}</label></div><div class="form-submit-row"><button class="button button-primary" type="submit">حفظ التصنيف</button><button class="button button-quiet" type="button" data-action="close-modal">إلغاء</button></div></form></section></div>`;
    if (category) modalRoot.querySelector('input[name="name"]').value = categoryName(category.id);
    applyLanguage(modalRoot);
    modalRoot.querySelector('input[name="name"]')?.focus();
    return;
  }
  const transactionType = existing?.type || "expense";
  const date = existing?.date || todayISO();
  const categoryId = existing?.categoryId || state.categories.find((category) => category.type === transactionType)?.id || "";
  if (kind === "budget") {
    const budgetCategoryOptions = `<option value="">إجمالي المصروفات</option>${state.categories.filter((category) => category.type === "expense").map((category) => `<option value="${esc(category.id)}" ${existing?.categoryId === category.id ? "selected" : ""}>${esc(category.name)}</option>`).join("")}`;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title" class="modal-title">${titleMap[kind]}</h2><p class="modal-subtitle">ميزانية شهرية واحدة لكل اختيار</p></div><button class="close-button" data-action="close-modal" aria-label="إغلاق">${icon("close")}</button></div><form id="budget-form" data-id="${esc(id)}"><div class="form-grid"><label class="form-field full"><span class="form-label">التصنيف</span><select class="field-control" name="categoryId">${budgetCategoryOptions}</select></label><label class="form-field full"><span class="form-label">الحد الشهري (${esc(state.settings.currency)})</span><input class="field-control" name="amount" type="number" min="0.01" step="0.01" required value="${existing ? esc(existing.amount) : ""}" placeholder="0.00" inputmode="decimal" /></label></div><p class="modal-notice">المصروف المحسوب يبدأ من تاريخ بداية الشهر المالي المحدّد في الإعدادات.</p><div class="form-submit-row"><button class="button button-primary" type="submit">حفظ الميزانية</button><button class="button button-quiet" type="button" data-action="close-modal">إلغاء</button></div></form></section></div>`;
    applyLanguage(modalRoot);
    modalRoot.querySelector('input[name="amount"]')?.focus();
    return;
  }
  const isRecurring = kind === "recurring";
  const frequencyField = isRecurring ? `<label class="form-field"><span class="form-label">التكرار</span><select class="field-control" name="frequency"><option value="monthly" ${existing?.frequency !== "weekly" && existing?.frequency !== "yearly" ? "selected" : ""}>شهريًا</option><option value="weekly" ${existing?.frequency === "weekly" ? "selected" : ""}>أسبوعيًا</option><option value="yearly" ${existing?.frequency === "yearly" ? "selected" : ""}>سنويًا</option></select></label>` : "";
  const currentCategory = isRecurring ? (existing?.categoryId || state.categories.find((category) => category.type === transactionType)?.id || "") : categoryId;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop-close"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title" class="modal-title">${titleMap[kind]}</h2><p class="modal-subtitle">${isRecurring ? "تابع راتبك أو الإيجار أو أي موعد مالي" : "سجّلها ببساطة، وتضلّ محفوظة على جهازك"}</p></div><button class="close-button" data-action="close-modal" aria-label="إغلاق">${icon("close")}</button></div><form id="${isRecurring ? "recurring-form" : "transaction-form"}" data-id="${esc(id)}"><div class="type-switch"><button type="button" class="type-option ${transactionType === "expense" ? "active expense" : ""}" data-type="expense">مصروف</button><button type="button" class="type-option ${transactionType === "income" ? "active income" : ""}" data-type="income">دخل</button><input type="hidden" name="type" value="${transactionType}" /></div><div class="form-grid"><label class="form-field full"><span class="form-label">المبلغ (${esc(state.settings.currency)})</span><input class="field-control" name="amount" type="number" min="0.01" step="0.01" required value="${existing ? esc(existing.amount) : ""}" placeholder="0.00" inputmode="decimal" /></label><label class="form-field"><span class="form-label">التصنيف</span><select class="field-control" name="categoryId" required>${categoryOptions(transactionType, currentCategory)}</select></label><label class="form-field"><span class="form-label">${isRecurring ? "الموعد القادم" : "التاريخ"}</span><input class="field-control" name="date" type="date" required value="${esc(isRecurring ? existing?.nextDate || todayISO() : date)}" /></label>${frequencyField}<label class="form-field full"><span class="form-label">ملاحظة (اختياري)</span><input class="field-control" name="note" maxlength="100" value="${esc(existing?.note || "")}" placeholder="مثل: غداء مع الأصدقاء" /></label></div>${isRecurring ? `<p class="modal-notice">لما يحين الموعد، اضغط «سجّلها» لإضافتها إلى سجلّك وتحديث الموعد تلقائيًا.</p>` : ""}<div class="form-submit-row"><button class="button button-primary" type="submit">${isEdit ? "حفظ التعديل" : isRecurring ? "حفظ المتكررة" : "حفظ العملية"}</button><button class="button button-quiet" type="button" data-action="close-modal">إلغاء</button></div></form></section></div>`;
  applyLanguage(modalRoot);
  modalRoot.querySelector('input[name="amount"]')?.focus();
}

function showToast(message, isError = false) {
  const root = document.querySelector("#toast-root");
  root.innerHTML = `<div class="toast ${isError ? "error" : ""}" role="status">${esc(translate(message, currentLanguage()))}</div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { root.innerHTML = ""; }, 2800);
}

function persist(message = "انحفظت التغييرات") {
  try {
    saveState(state);
    render();
    showToast(message);
  } catch {
    showToast("مساحة التخزين غير متاحة. جرّب فتح التطبيق في متصفح عادي.", true);
  }
}

function closeModal() {
  document.querySelector("#modal-root").innerHTML = "";
}

function deleteItem(collection, id, label) {
  const language = currentLanguage();
  const itemLabel = translate(label, language);
  const prompt = language === "en" ? `Are you sure you want to delete this ${itemLabel}?`
    : language === "tr" ? `${itemLabel} kaydını silmek istediğinizden emin misiniz?`
      : `متأكد إنك بدك تحذف ${label}؟`;
  if (!window.confirm(prompt)) return;
  const index = collection.findIndex((item) => item.id === id);
  if (index < 0) return;
  collection.splice(index, 1);
  persist("انحذف العنصر");
}

function updateTypeChoices(form, type) {
  const typeField = form.querySelector('input[name="type"]');
  if (!typeField) return;
  typeField.value = type;
  form.querySelectorAll("[data-type]").forEach((button) => {
    button.className = `type-option ${button.dataset.type === type ? `active ${type}` : ""}`;
  });
  const select = form.querySelector('select[name="categoryId"]');
  if (select) {
    select.innerHTML = categoryOptions(type);
    applyLanguage(select);
  }
}

function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const data = new FormData(form);
  if (form.id === "transaction-form" || form.id === "recurring-form") {
    event.preventDefault();
    const amount = Number(data.get("amount"));
    const type = data.get("type");
    const categoryId = data.get("categoryId");
    const date = data.get("date");
    if (!(amount > 0) || !Number.isFinite(amount) || !date || !getCategory(categoryId)) {
      showToast("تأكد من المبلغ والتاريخ والتصنيف", true);
      return;
    }
    const isRepeat = form.id === "recurring-form";
    const collection = isRepeat ? state.recurring : state.transactions;
    const existingId = form.dataset.id;
    const previous = existingId ? collection.find((item) => item.id === existingId) : null;
    const entry = {
      id: existingId || makeId(), type, amount: Math.round(amount * 100) / 100,
      categoryId, note: String(data.get("note") || "").trim(),
      ...(isRepeat ? { frequency: data.get("frequency"), nextDate: date } : { date }),
      createdAt: previous?.createdAt || new Date().toISOString(),
    };
    if (previous) Object.assign(previous, entry); else collection.unshift(entry);
    closeModal();
    persist(isRepeat ? "انحفظت العملية المتكررة" : previous ? "تعدّلت العملية" : "انحفظت العملية");
    return;
  }
  if (form.id === "budget-form") {
    event.preventDefault();
    const amount = Number(data.get("amount"));
    if (!(amount > 0) || !Number.isFinite(amount)) {
      showToast("اكتب مبلغًا صحيحًا للميزانية", true);
      return;
    }
    const categoryId = String(data.get("categoryId") || "");
    const existingId = form.dataset.id;
    const existing = existingId ? state.budgets.find((item) => item.id === existingId) : null;
    const duplicate = !existing && state.budgets.find((item) => (item.categoryId || "") === categoryId);
    if (existing) Object.assign(existing, { categoryId, amount: Math.round(amount * 100) / 100 });
    else if (duplicate) Object.assign(duplicate, { amount: Math.round(amount * 100) / 100 });
    else state.budgets.unshift({ id: makeId(), categoryId, amount: Math.round(amount * 100) / 100 });
    closeModal();
    persist(duplicate ? "تحدّثت الميزانية الموجودة" : "انحفظت الميزانية");
    return;
  }
  if (form.id === "category-form") {
    event.preventDefault();
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    const id = form.dataset.id;
    const existing = state.categories.find((item) => item.id === id);
    if (existing) {
      const preset = categoryTranslations[id];
      const localizedDefault = preset?.[currentLanguage() === "en" ? 1 : currentLanguage() === "tr" ? 2 : 0];
      existing.name = preset && existing.name === preset[0] && name === localizedDefault ? preset[0] : name;
    }
    else {
      const type = data.get("type") === "income" ? "income" : "expense";
      const palette = ["#d39058", "#cb7458", "#7285b0", "#bd737a", "#ad83a5", "#688f9a", "#bc9951", "#69a080"];
      state.categories.push({ id: makeId(), name, type, color: palette[state.categories.length % palette.length] });
    }
    closeModal();
    persist("انحفظ التصنيف");
    return;
  }
  if (form.id === "settings-form") {
    event.preventDefault();
    state.settings.name = String(data.get("name") || "").trim();
    state.settings.currency = String(data.get("currency") || "USD");
    state.settings.monthStart = Math.max(1, Math.min(28, Number(data.get("monthStart")) || 1));
    persist("انحفظت تفضيلاتك");
  }
}

async function installApp() {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    document.querySelector(".install-button")?.classList.remove("visible");
    return;
  }
  showToast("من قائمة المتصفح اختَر «إضافة إلى الشاشة الرئيسية»");
}

app.addEventListener("click", async (event) => {
  const typeButton = event.target.closest("[data-type]");
  if (typeButton) {
    const form = typeButton.closest("form");
    if (form) updateTypeChoices(form, typeButton.dataset.type);
    return;
  }
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    currentPage = pageButton.dataset.page;
    render();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "new-transaction") showModal("transaction");
  else if (action === "new-recurring") showModal("recurring");
  else if (action === "new-budget") showModal("budget");
  else if (action === "new-category") showModal("category");
  else if (action === "close-modal" || (action === "backdrop-close" && event.target === button)) closeModal();
  else if (action === "install") await installApp();
  else if (action === "edit-transaction") showModal("transaction", id);
  else if (action === "edit-recurring") showModal("recurring", id);
  else if (action === "edit-budget") showModal("budget", id);
  else if (action === "edit-category") showModal("category", id);
  else if (action === "delete-transaction") deleteItem(state.transactions, id, "العملية");
  else if (action === "delete-budget") deleteItem(state.budgets, id, "الميزانية");
  else if (action === "delete-recurring") deleteItem(state.recurring, id, "العملية المتكررة");
  else if (action === "delete-category") {
    const referenced = state.transactions.some((tx) => tx.categoryId === id) || state.recurring.some((tx) => tx.categoryId === id) || state.budgets.some((budget) => budget.categoryId === id);
    const category = getCategory(id);
    const lastOfType = category && state.categories.filter((item) => item.type === category.type).length <= 1;
    if (referenced) showToast("ما فينا نحذف تصنيف مرتبط بعمليات أو ميزانيات", true);
    else if (lastOfType) showToast("خلي تصنيفًا واحدًا على الأقل لكل نوع من العمليات", true);
    else deleteItem(state.categories, id, "التصنيف");
  } else if (action === "record-recurring") {
    const item = state.recurring.find((entry) => entry.id === id);
    if (item) {
      state.transactions.unshift({ id: makeId(), type: item.type, amount: item.amount, categoryId: item.categoryId, note: item.note, date: item.nextDate, createdAt: new Date().toISOString(), recurringId: item.id });
      item.nextDate = addFrequency(item.nextDate, item.frequency);
      persist("انضافت العملية وتحدّث موعدها القادم");
    }
  } else if (action === "reset-data") {
    if (window.confirm(translate("رح ينمسح كل الدخل والمصاريف والميزانيات والإعدادات من هذا الجهاز. ما في تراجع. متأكد؟", currentLanguage()))) {
      const fresh = createDefaultState();
      Object.assign(state, fresh);
      persist("تم مسح البيانات وإعادة ضبط التطبيق");
    }
  }
});

app.addEventListener("submit", onSubmit);
app.addEventListener("input", (event) => {
  if (event.target.matches("[data-filter-search]")) {
    const list = document.querySelector("#transaction-list");
    if (list) {
      const items = filteredTransactions();
      list.innerHTML = transactionRows(items);
      translateDOM(list, currentLanguage());
      const count = document.querySelector("[data-filter-count]");
      if (count) count.textContent = transactionCount(items.length);
    }
  }
});
app.addEventListener("change", (event) => {
  if (event.target.matches("[data-language-picker]")) {
    state.settings.language = ["ar", "en", "tr"].includes(event.target.value) ? event.target.value : "ar";
    renderShell();
    persist("انحفظت التغييرات");
    return;
  }
  if (event.target.matches("[data-filter-type], [data-filter-category], [data-filter-period]")) {
    const items = filteredTransactions();
    const list = document.querySelector("#transaction-list");
    list.innerHTML = transactionRows(items);
    translateDOM(list, currentLanguage());
    document.querySelector("[data-filter-count]").textContent = transactionCount(items.length);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  document.querySelector(".install-button")?.classList.add("visible");
});
window.addEventListener("appinstalled", () => showToast("صار مصروفي على جهازك"));
if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
  document.querySelector(".install-button")?.classList.remove("visible");
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}

render();
