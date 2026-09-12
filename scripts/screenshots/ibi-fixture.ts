/**
 * An entirely invented IBI portfolio for the screenshot harness, in the exact shape the dashboard's
 * embed mode reads (window.__EMBED__ = { data, news, events, hist, tase, quotes, built }).
 *
 * Built from scratch — invented securities, invented tickers, round deposits, seeded random-walk
 * prices. Nothing here is derived from, scaled from, or shaped like Guy's real portfolio. The ledger
 * is turned into the payload with the same rules as the dashboard's build_data.py (FIFO lots,
 * running cash in two currencies, compact cash events).
 */

type Currency = "ILS" | "USD";
type Sec = { key: string; he: string; yahoo: string; currency: Currency; kind: "stock" | "fund"; group: string; start: number; drift: number; vol: number };

/** Invented names and tickers; the harness verifies none of them exists in the real symbols file. */
export const SECURITIES: Sec[] = [
  { key: "7700101", he: "אורן גלובל 500", yahoo: "DMO-GLB", currency: "USD", kind: "fund", group: "broad", start: 100, drift: 0.14, vol: 0.009 },
  { key: "7700102", he: "צפון טכנולוגיה", yahoo: "DMO-TEC", currency: "USD", kind: "fund", group: "tech", start: 200, drift: 0.22, vol: 0.014 },
  { key: "7700103", he: "תמר דיבידנד", yahoo: "DMO-DIV", currency: "USD", kind: "fund", group: "dividend", start: 50, drift: 0.06, vol: 0.007 },
  { key: "7700104", he: "שמש אנרגיה ירוקה", yahoo: "DMO-SUN", currency: "USD", kind: "stock", group: "energy", start: 20, drift: -0.12, vol: 0.02 },
  { key: "7700105", he: "רוח ים אנרגיה", yahoo: "DMO-WND", currency: "USD", kind: "stock", group: "energy", start: 35, drift: 0.1, vol: 0.017 },
  { key: "7700106", he: "שבבי הכרמל", yahoo: "DMO-CHP", currency: "USD", kind: "stock", group: "chips", start: 80, drift: 0.18, vol: 0.018 },
  { key: "7700107", he: "קרן אופיר זהב", yahoo: "DMO-GLD", currency: "USD", kind: "fund", group: "gold", start: 180, drift: 0.09, vol: 0.008 },
  { key: "7700108", he: "מגן אג\"ח שקלי", yahoo: "DMO-BND.TA", currency: "ILS", kind: "fund", group: "bonds", start: 100, drift: 0.035, vol: 0.002 },
  { key: "7700109", he: "בנק הגליל העליון", yahoo: "DMO-BNK.TA", currency: "ILS", kind: "stock", group: "banks", start: 25, drift: 0.2, vol: 0.013 },
];
export const BENCHMARKS = { sp500: "DMO-IDX-US", ta125: "DMO-IDX-IL" };
const FX = "ILS=X";
const START = "2025-08-01";
export const LAST_TRADING_DAY = "2026-06-26";
const PACHAK = "9999905";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function businessDays(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (d <= end) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/** Geometric random walk hitting roughly `drift` annual return; seeded so every run is identical. */
function walk(start: number, drift: number, vol: number, days: string[], seed: number): number[] {
  const r = rng(seed);
  const perDay = Math.log(1 + drift) / 252;
  let p = start;
  return days.map((_, i) => {
    if (i > 0) {
      const z = (r() + r() + r() + r() - 2) * 1.7; // ~N(0,1)
      p *= Math.exp(perDay + vol * z);
    }
    return Math.round(p * 100) / 100;
  });
}

type Row = { date: string; action: string; symbol: string; quantity: number; price: number; fee: number; total: number; currency: Currency };

export function buildIbiFixture() {
  const days = businessDays(START, LAST_TRADING_DAY);
  const hist: Record<string, { dates: string[]; closes: number[]; currency: string }> = {};
  SECURITIES.forEach((s, i) => (hist[s.yahoo] = { dates: days, closes: walk(s.start, s.drift, s.vol, days, 1000 + i), currency: s.currency }));
  hist[FX] = { dates: days, closes: walk(3.62, -0.02, 0.004, days, 77).map((v) => Math.round(v * 1000) / 1000), currency: "ILS" };
  hist[BENCHMARKS.sp500] = { dates: days, closes: walk(5600, 0.12, 0.009, days, 88), currency: "USD" };
  hist[BENCHMARKS.ta125] = { dates: days, closes: walk(2500, 0.15, 0.009, days, 99), currency: "ILS" };

  const priceOn = (yahoo: string, date: string) => {
    const h = hist[yahoo]!;
    let i = h.dates.findIndex((d) => d >= date);
    if (i < 0) i = h.dates.length - 1;
    return h.closes[i]!;
  };
  const sec = (short: string) => SECURITIES.find((s) => s.yahoo === `DMO-${short}` || s.yahoo === `DMO-${short}.TA`)!;

  const rows: Row[] = [];
  const deposit = (date: string, ils: number) => rows.push({ date, action: "DEPOSIT", symbol: "", quantity: 0, price: 0, fee: 0, total: ils, currency: "ILS" });
  const fx = (date: string, ils: number) => {
    const rate = priceOn(FX, date);
    rows.push({ date, action: "FX", symbol: "", quantity: Math.round((ils / rate) * 100) / 100, price: rate, fee: 0, total: -ils, currency: "ILS" });
  };
  const trade = (date: string, action: "BUY" | "SELL", short: string, qty: number) => {
    const s = sec(short);
    const price = priceOn(s.yahoo, date);
    const fee = s.currency === "USD" ? 1.5 : 7;
    const gross = qty * price;
    rows.push({ date, action, symbol: s.key, quantity: qty, price, fee, total: action === "BUY" ? -(gross + fee) : gross - fee, currency: s.currency });
  };
  const dividend = (date: string, short: string, perUnit: number, qty: number, taxRate: number) => {
    const s = sec(short);
    const gross = Math.round(perUnit * qty * 100) / 100;
    rows.push({ date, action: "DIVIDEND", symbol: s.key, quantity: 0, price: 0, fee: 0, total: gross, currency: s.currency });
    rows.push({ date, action: "TAX", symbol: s.key, quantity: 0, price: 0, fee: 0, total: -Math.round(gross * taxRate * 100) / 100, currency: s.currency });
  };
  const interest = (date: string, ils: number) => rows.push({ date, action: "INTEREST", symbol: PACHAK, quantity: 0, price: 0, fee: 0, total: ils, currency: "ILS" });

  // --- the invented story: a round opening deposit, monthly top-ups, a few decisions ---
  deposit("2025-09-01", 150_000);
  fx("2025-09-02", 90_000);
  trade("2025-09-03", "BUY", "GLB", 60);
  trade("2025-09-03", "BUY", "TEC", 30);
  trade("2025-09-04", "BUY", "BND", 400);
  trade("2025-09-10", "BUY", "DIV", 50);
  const months = ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  for (const m of months) {
    deposit(`${m}-01`, 3_000);
    interest(`${m}-02`, 25 + (months.indexOf(m) % 3) * 6);
  }
  trade("2025-10-06", "BUY", "SUN", 80);
  trade("2025-10-20", "BUY", "CHP", 20);
  trade("2025-11-03", "BUY", "BNK", 300);
  dividend("2025-12-15", "DIV", 0.45, 50, 0.25);
  dividend("2025-12-18", "GLB", 0.8, 60, 0.25);
  fx("2026-01-05", 18_000);
  trade("2026-01-06", "BUY", "GLD", 20);
  trade("2026-02-09", "SELL", "CHP", 20); // a closed position, sold with a gain
  trade("2026-03-16", "SELL", "SUN", 80); // exits energy at a loss…
  trade("2026-03-20", "BUY", "WND", 40); // …and rotates into another energy name
  dividend("2026-03-16", "DIV", 0.45, 50, 0.25);
  dividend("2026-03-19", "GLB", 0.8, 60, 0.25);
  dividend("2026-04-12", "BNK", 0.6, 300, 0.25);
  trade("2026-05-11", "SELL", "TEC", 10); // partial take-profit
  dividend("2026-06-15", "DIV", 0.47, 50, 0.25);
  dividend("2026-06-18", "GLB", 0.82, 60, 0.25);
  rows.sort((a, b) => a.date.localeCompare(b.date));

  // --- same rules as build_data.py ---
  type Inst = { key: string; lots: [number, number, string][]; trades: object[]; realized: number; dividends: number; tax: number; fees: number; sales: object[] };
  const inst = new Map<string, Inst>();
  const get = (key: string) => {
    if (!inst.has(key)) inst.set(key, { key, lots: [], trades: [], realized: 0, dividends: 0, tax: 0, fees: 0, sales: [] });
    return inst.get(key)!;
  };
  let cashIls = 0;
  let cashUsd = 0;
  const cashEvents: [string, number, number][] = [];
  const extFlows: [string, number][] = [];
  const interestRows: [string, number, string, string][] = [];
  const dividendRows: [string, string, number, string][] = [];
  const taxRows: [string, string, number, string][] = [];
  const feesByYear: Record<string, number> = {};
  const add = (cur: Currency, v: number) => (cur === "ILS" ? (cashIls += v) : (cashUsd += v));

  for (const r of rows) {
    if (r.fee) feesByYear[r.date.slice(0, 4)] = (feesByYear[r.date.slice(0, 4)] ?? 0) + r.fee * (r.currency === "ILS" ? 1 : 3.5);
    if (r.action === "FX") {
      cashIls += r.total;
      cashUsd += r.quantity;
    } else if (r.action === "BUY" || r.action === "SELL") {
      const it = get(r.symbol);
      it.fees += r.fee;
      it.trades.push({ date: r.date, action: r.action, qty: r.quantity, price: r.price, fee: r.fee });
      add(r.currency, r.total);
      if (r.action === "BUY") it.lots.push([r.quantity, r.price, r.date]);
      else {
        let remaining = r.quantity;
        let pl = 0;
        while (remaining > 1e-9 && it.lots.length) {
          const lot = it.lots[0]!;
          const take = Math.min(lot[0], remaining);
          pl += take * (r.price - lot[1]);
          lot[0] -= take;
          remaining -= take;
          if (lot[0] <= 1e-9) it.lots.shift();
        }
        it.realized += pl;
        it.sales.push({ date: r.date, qty: r.quantity, exit_price: r.price, realized: Math.round(pl * 100) / 100 });
      }
    } else if (r.action === "DIVIDEND") {
      get(r.symbol).dividends += Math.abs(r.total);
      add(r.currency, r.total);
      dividendRows.push([r.date, r.symbol, Math.round(Math.abs(r.total) * 100) / 100, r.currency]);
    } else if (r.action === "TAX") {
      get(r.symbol).tax += Math.abs(r.total);
      add(r.currency, r.total);
      taxRows.push([r.date, r.symbol, Math.round(Math.abs(r.total) * 100) / 100, r.currency]);
    } else if (r.action === "INTEREST") {
      add(r.currency, r.total);
      interestRows.push([r.date, Math.round(r.total * 100) / 100, r.currency, r.symbol]);
    } else if (r.action === "DEPOSIT") {
      cashIls += r.total;
      extFlows.push([r.date, r.total]);
    }
    cashEvents.push([r.date, Math.round(cashIls * 100) / 100, Math.round(cashUsd * 100) / 100]);
  }
  const compact = cashEvents.filter((e, i) => i === 0 || e[1] !== cashEvents[i - 1]![1] || e[2] !== cashEvents[i - 1]![2]);

  const instruments = SECURITIES.filter((s) => inst.has(s.key)).map((s) => {
    const it = inst.get(s.key)!;
    const openQty = it.lots.reduce((a, l) => a + l[0], 0);
    const invested = it.lots.reduce((a, l) => a + l[0] * l[1], 0);
    return {
      key: s.key,
      he: s.he,
      yahoo: s.yahoo,
      currency: s.currency,
      kind: s.kind,
      group: s.group,
      mode: "yahoo",
      proxy_note: null,
      qty: Math.round(openQty * 1e4) / 1e4,
      avg_cost: openQty > 1e-9 ? Math.round((invested / openQty) * 1e4) / 1e4 : 0,
      invested: Math.round(invested * 100) / 100,
      realized: Math.round(it.realized * 100) / 100,
      dividends: Math.round(it.dividends * 100) / 100,
      tax: Math.round(it.tax * 100) / 100,
      fees: Math.round(it.fees * 100) / 100,
      trades: it.trades,
      sales: it.sales,
      anchors: (it.trades as { date: string; price: number }[]).map((t) => [t.date, t.price]),
    };
  });

  const data = {
    built_at: `${LAST_TRADING_DAY}T18:00:00`,
    snapshot_date: LAST_TRADING_DAY,
    start_date: rows[0]!.date,
    cash: { ils: Math.round(cashIls * 100) / 100, usd: Math.round(cashUsd * 100) / 100 },
    cash_events: compact,
    ext_flows: extFlows,
    interest_rows: interestRows,
    dividend_rows: dividendRows,
    tax_rows: taxRows,
    fees_by_year: Object.fromEntries(Object.entries(feesByYear).map(([k, v]) => [k, Math.round(v * 100) / 100])),
    instruments,
    benchmarks: BENCHMARKS,
  };

  const last = (yahoo: string) => hist[yahoo]!.closes.at(-1)!;
  const prev = (yahoo: string) => hist[yahoo]!.closes.at(-2)!;
  const quotes = {
    date: LAST_TRADING_DAY,
    quotes: Object.fromEntries(SECURITIES.map((s) => [s.key, { price: last(s.yahoo), prevClose: prev(s.yahoo), currency: s.currency, source: "demo" }])),
    fx: { price: last(FX) },
  };

  return { data, news: null, events: [], hist, tase: {}, quotes, built: LAST_TRADING_DAY };
}
