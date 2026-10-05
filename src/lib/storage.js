// localStorage can be unavailable (private windows, blocked site data) or full, so every access
// is guarded and callers always get a usable value back.

export function hasStoredValue(key) {
    try {
        return localStorage.getItem(key) !== null;
    } catch {
        return false;
    }
}

export function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) ?? fallback);
    } catch {
        return fallback;
    }
}

export function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Nothing useful to do: the app keeps working with in-memory state.
    }
}

export function removeStoredValue(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        // See writeJson.
    }
}
