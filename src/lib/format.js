export const MASK = '••••••';
const DASH = '—';

const formatters = new Map();

// Intl formatters are expensive to construct and these run for every row on every render.
function numberFormat(options) {
    const key = JSON.stringify(options);
    if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(undefined, options));
    return formatters.get(key);
}

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

// "$" rather than "US$" in locales that would otherwise disambiguate: the currency is always
// visible in the UI, and the menu bar has no room to spare.
const money = (currency, options) => ({ style: 'currency', currency, currencyDisplay: 'narrowSymbol', ...options });

/** Coin prices: cents from 1 up, four significant digits for fractions of a unit. */
export function formatPrice(value, currency) {
    if (!isNumber(value)) return DASH;
    // 0.99996 would round up to "1.000" with four significant digits, so it gets cents too.
    const options = value !== 0 && Math.abs(value) < 0.99995
        ? money(currency, { minimumSignificantDigits: 2, maximumSignificantDigits: 4 })
        : money(currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return numberFormat(options).format(value);
}

/** Portfolio values and totals, always in cents. */
export function formatMoney(value, currency, { signed = false } = {}) {
    if (!isNumber(value)) return DASH;
    return numberFormat(money(currency, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: signed ? 'exceptZero' : 'auto',
    })).format(value);
}

/** Large figures such as market caps: "$3.07T". */
export function formatCompactMoney(value, currency) {
    if (!isNumber(value)) return DASH;
    return numberFormat(money(currency, { notation: 'compact', maximumFractionDigits: 2 })).format(value);
}

/** Short prices for the menu bar, where every character counts. */
export function formatTrayPrice(value, currency) {
    if (!isNumber(value)) return DASH;
    if (Math.abs(value) >= 1000) {
        return numberFormat(money(currency, { maximumFractionDigits: 0 })).format(value);
    }
    return formatPrice(value, currency);
}

export function formatPercent(value, { signed = true } = {}) {
    if (!isNumber(value)) return DASH;
    return numberFormat({
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: signed ? 'exceptZero' : 'auto',
    }).format(value / 100);
}

export function formatAmount(value) {
    if (!isNumber(value)) return DASH;
    return numberFormat({ maximumFractionDigits: 8 }).format(value);
}

export function formatCompactNumber(value) {
    if (!isNumber(value)) return DASH;
    return numberFormat({ notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

/** Prices in bitcoin; anything under 0.001 BTC reads better in satoshis (1 BTC = 100M sats). */
export function formatBtc(value) {
    if (!isNumber(value)) return DASH;
    const abs = Math.abs(value);
    if (abs > 0 && abs < 0.001) {
        const sats = value * 1e8;
        const options = Math.abs(sats) >= 100 ? { maximumFractionDigits: 0 } : { maximumSignificantDigits: 3 };
        return `${numberFormat(options).format(sats)} sats`;
    }
    const options = abs < 1 ? { maximumSignificantDigits: 4 } : { maximumFractionDigits: 4 };
    return `${numberFormat(options).format(value)} BTC`;
}

export function formatDate(value, options = { dateStyle: 'medium' }) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return DASH;
    return new Intl.DateTimeFormat(undefined, options).format(date);
}

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatRelativeTime(timestamp, now = Date.now()) {
    const seconds = Math.round((timestamp - now) / 1000);
    if (Math.abs(seconds) < 45) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (Math.abs(minutes) < 60) return relativeTime.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return relativeTime.format(hours, 'hour');
    return relativeTime.format(Math.round(hours / 24), 'day');
}

const LOCALE_DECIMAL = new Intl.NumberFormat().formatToParts(1.5).find(part => part.type === 'decimal')?.value ?? '.';

/**
 * Parses what people type into amount fields: "0.5", "0,5", "1 000.25", "1,000.25", "1.000,25".
 * A lone separator followed by exactly three digits ("1,500") is ambiguous, so the locale's
 * decimal separator decides. Returns null for an empty field and NaN for anything that is not
 * a non-negative number.
 */
export function parseDecimal(input, decimalSeparator = LOCALE_DECIMAL) {
    if (typeof input === 'number') return Number.isFinite(input) && input >= 0 ? input : Number.NaN;
    const text = String(input ?? '').trim().replace(/[\s_']/g, '');
    if (!text) return null;

    const separators = text.match(/[.,]/g) ?? [];
    let decimal = null;
    if (new Set(separators).size === 2) {
        // Whichever separator comes last is the decimal one; the other groups thousands.
        decimal = text.lastIndexOf(',') > text.lastIndexOf('.') ? ',' : '.';
    } else if (separators.length === 1) {
        const ambiguous = /^\d{1,3}[.,]\d{3}$/.test(text);
        decimal = !ambiguous || separators[0] === decimalSeparator ? separators[0] : null;
    }

    const grouping = decimal === ',' ? '.' : decimal === '.' ? ',' : /[.,]/g;
    const normalized = text.replaceAll(grouping, '').replace(',', '.');
    if (!/^\d*\.?\d+$|^\d+\.$/.test(normalized)) return Number.NaN;
    return Number(normalized);
}

/** A number as an editable field value: no grouping, no exponent, the locale's decimal sign. */
export function formatInput(value, options = { maximumSignificantDigits: 12 }) {
    if (!isNumber(value)) return '';
    return numberFormat({ useGrouping: false, ...options }).format(value);
}
