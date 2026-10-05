import { onBeforeUnmount, onMounted } from 'vue';

const EDITABLE = 'input, textarea, select, [contenteditable="true"]';

/**
 * Registers keyboard shortcuts while the calling component is mounted. Keys are written as
 * `event.key` in lower case, optionally prefixed with "mod+" for ⌘ on macOS or Ctrl elsewhere.
 * Plain keys are ignored while typing in a field; only Escape gets through there.
 */
export function useHotkeys(bindings) {
    const onKeydown = (event) => {
        if (event.defaultPrevented || event.isComposing || event.altKey) return;
        const modifier = event.metaKey || event.ctrlKey;
        const combo = `${modifier ? 'mod+' : ''}${event.key.toLowerCase()}`;
        const action = bindings[combo];
        if (!action) return;
        if (combo !== 'escape' && !modifier && event.target.closest?.(EDITABLE)) return;
        event.preventDefault();
        action(event);
    };

    onMounted(() => window.addEventListener('keydown', onKeydown));
    onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
}
