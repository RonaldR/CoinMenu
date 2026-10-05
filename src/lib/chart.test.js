import { describe, expect, it } from 'vitest';

import { areaPath, linePath, nearestIndex, scalePoints } from './chart';

const numbersIn = path => path.match(/-?\d+(\.\d+)?/g).map(Number);

describe('scalePoints', () => {
    it('maps the lowest value to the bottom and the highest to the top', () => {
        const points = scalePoints([10, 30, 20], { width: 100, height: 50, insetY: 5 });
        expect(points).toEqual([{ x: 0, y: 45 }, { x: 50, y: 5 }, { x: 100, y: 25 }]);
    });

    it('spaces points by their x values when given', () => {
        const points = scalePoints([1, 2, 3], { width: 100, height: 10, xs: [0, 90, 100] });
        expect(points.map(point => point.x)).toEqual([0, 90, 100]);
    });

    it('draws a flat series through the middle', () => {
        expect(scalePoints([5, 5, 5], { width: 10, height: 20 }).every(point => point.y === 10)).toBe(true);
    });
});

describe('linePath', () => {
    it('never overshoots the data between points', () => {
        const points = scalePoints([1, 2, 10, 10.5, 3, 2.9, 8], { width: 300, height: 100 });
        const ys = numbersIn(linePath(points)).filter((_value, index) => index % 2 === 1);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...ys)).toBeLessThanOrEqual(100);
    });

    it('falls back to straight lines for one or two points', () => {
        expect(linePath([{ x: 0, y: 1 }, { x: 5, y: 2 }])).toBe('M0,1L5,2');
        expect(linePath([])).toBe('');
    });

    it('closes the area down to the baseline', () => {
        expect(areaPath([{ x: 0, y: 1 }, { x: 5, y: 2 }], 10)).toBe('M0,1L5,2L5,10L0,10Z');
    });
});

describe('nearestIndex', () => {
    const points = [{ x: 0 }, { x: 10 }, { x: 20 }, { x: 40 }];

    it.each([[-5, 0], [4, 0], [6, 1], [29, 2], [31, 3], [99, 3]])('finds the point closest to x=%s', (x, index) => {
        expect(nearestIndex(points, x)).toBe(index);
    });
});
