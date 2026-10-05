import { describe, expect, it } from 'vitest';

import { formatBtc, formatInput, formatPercent, formatPrice, formatRelativeTime, parseDecimal } from './format';

describe('parseDecimal', () => {
    it.each([
        ['0.5', 0.5],
        ['0,5', 0.5],
        ['1 000.25', 1000.25],
        ['1,000.25', 1000.25],
        ['1.000,25', 1000.25],
        ['1.000.000', 1000000],
        ['.5', 0.5],
        ['12.', 12],
        [3, 3],
    ])('reads %j as %s', (input, expected) => {
        expect(parseDecimal(input)).toBe(expected);
    });

    it('lets the locale settle a lone separator before three digits', () => {
        expect(parseDecimal('1,500', '.')).toBe(1500);
        expect(parseDecimal('1,500', ',')).toBe(1.5);
        expect(parseDecimal('1.500', '.')).toBe(1.5);
        expect(parseDecimal('1.500', ',')).toBe(1500);
        expect(parseDecimal('1500,125', '.')).toBe(1500.125);
    });

    it('reads back what formatInput writes', () => {
        for (const value of [1500, 1500.125, 0.0000005, 0.0000000015, 21000000]) {
            expect(parseDecimal(formatInput(value))).toBe(value);
        }
    });

    it('treats an empty field as no amount', () => {
        expect(parseDecimal('')).toBeNull();
        expect(parseDecimal('   ')).toBeNull();
        expect(parseDecimal(null)).toBeNull();
    });

    it.each(['abc', '-1', '1e5', '1.2.3,4,5', '$5'])('rejects %j', (input) => {
        expect(parseDecimal(input)).toBeNaN();
    });
});

describe('formatInput', () => {
    it('never uses grouping or exponents', () => {
        expect(formatInput(1500)).toBe('1500');
        expect(formatInput(5e-7)).toBe('0.0000005');
        expect(formatInput(null)).toBe('');
        expect(formatInput(2770.051494, { maximumFractionDigits: 2 })).toBe('2770.05');
    });
});

describe('formatPrice', () => {
    it('uses cents above one unit and significant digits below it', () => {
        expect(formatPrice(86215.873, 'USD')).toBe('$86,215.87');
        expect(formatPrice(0.999709, 'USD')).toBe('$0.9997');
        expect(formatPrice(0.5, 'USD')).toBe('$0.50');
        expect(formatPrice(0.0000123456, 'USD')).toBe('$0.00001235');
        expect(formatPrice(0.99998, 'USD')).toBe('$1.00');
    });

    it('shows a dash for missing values', () => {
        expect(formatPrice(undefined, 'USD')).toBe('—');
        expect(formatPrice(Number.NaN, 'USD')).toBe('—');
    });
});

describe('formatBtc', () => {
    it('switches to satoshis for small amounts', () => {
        expect(formatBtc(1)).toBe('1 BTC');
        expect(formatBtc(0.0315946)).toBe('0.03159 BTC');
        expect(formatBtc(0.000003174)).toBe('317 sats');
        expect(formatBtc(0.0000000000614)).toBe('0.00614 sats');
    });
});

describe('formatPercent', () => {
    it('signs changes but not shares', () => {
        expect(formatPercent(1.374)).toBe('+1.37%');
        expect(formatPercent(-0.06)).toBe('-0.06%');
        expect(formatPercent(0)).toBe('0.00%');
        expect(formatPercent(56.48, { signed: false })).toBe('56.48%');
    });
});

describe('formatRelativeTime', () => {
    const now = Date.UTC(2026, 9, 5, 12);

    it('describes recent updates in words', () => {
        expect(formatRelativeTime(now - 10_000, now)).toBe('just now');
        expect(formatRelativeTime(now - 3 * 60_000, now)).toBe('3 minutes ago');
        expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe('2 hours ago');
    });
});
