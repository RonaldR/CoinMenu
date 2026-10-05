// Geometry for the sparklines and the price chart, kept free of Vue so it can be unit tested.

const round = value => Math.round(value * 100) / 100;

/**
 * Maps a series onto SVG coordinates. `xs` are optional x values (timestamps); without them the
 * points are spread evenly. A flat series is drawn through the vertical middle.
 */
export function scalePoints(values, { width, height, insetX = 0, insetY = 0, xs = null }) {
    if (!values.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = xs ? xs[0] : 0;
    const last = xs ? xs[xs.length - 1] : values.length - 1;
    const plotWidth = width - insetX * 2;
    const plotHeight = height - insetY * 2;

    return values.map((value, index) => ({
        x: insetX + (last === first ? plotWidth / 2 : (((xs ? xs[index] : index) - first) / (last - first)) * plotWidth),
        y: max === min ? height / 2 : insetY + (1 - (value - min) / (max - min)) * plotHeight,
    }));
}

/**
 * A smooth line through the points using monotone cubic interpolation (Fritsch–Carlson), so the
 * curve never overshoots the data: a chart should not invent highs or lows that never happened.
 */
export function linePath(points) {
    if (!points.length) return '';
    const [start] = points;
    if (points.length < 3) {
        return points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${round(x)},${round(y)}`).join('');
    }

    const count = points.length;
    const widths = [];
    const slopes = [];
    for (let index = 0; index < count - 1; index += 1) {
        widths[index] = points[index + 1].x - points[index].x;
        slopes[index] = widths[index] ? (points[index + 1].y - points[index].y) / widths[index] : 0;
    }

    const tangents = [slopes[0]];
    for (let index = 1; index < count - 1; index += 1) {
        const before = slopes[index - 1];
        const after = slopes[index];
        if (before * after <= 0) {
            tangents[index] = 0;
        } else {
            const weightBefore = 2 * widths[index] + widths[index - 1];
            const weightAfter = widths[index] + 2 * widths[index - 1];
            tangents[index] = (weightBefore + weightAfter) / (weightBefore / before + weightAfter / after);
        }
    }
    tangents[count - 1] = slopes[count - 2];

    let path = `M${round(start.x)},${round(start.y)}`;
    for (let index = 0; index < count - 1; index += 1) {
        const from = points[index];
        const to = points[index + 1];
        const third = widths[index] / 3;
        path += `C${round(from.x + third)},${round(from.y + tangents[index] * third)} `
            + `${round(to.x - third)},${round(to.y - tangents[index + 1] * third)} `
            + `${round(to.x)},${round(to.y)}`;
    }
    return path;
}

/** The line closed down to `baseline`, for gradient fills under the curve. */
export function areaPath(points, baseline) {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath(points)}L${round(last.x)},${round(baseline)}L${round(first.x)},${round(baseline)}Z`;
}

/** Index of the point horizontally closest to `x`. Points must be sorted by x. */
export function nearestIndex(points, x) {
    let low = 0;
    let high = points.length - 1;
    while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (points[middle].x < x) low = middle;
        else high = middle;
    }
    return Math.abs(points[low].x - x) <= Math.abs(points[high].x - x) ? low : high;
}
