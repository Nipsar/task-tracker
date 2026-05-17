export function $(selector, root = document) {
    return root.querySelector(selector);
}

export function setText(selectorOrElement, value) {
    const element = typeof selectorOrElement === "string"
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;

    if (element) {
        element.textContent = value;
    }
}

export function showMessage(element, message, type = "info") {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `form-message ${type}`;
}

export function clearMessage(element) {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "form-message";
}

export function renderEmptyState(title, text) {
    return `
        <div class="empty-state">
            <div class="empty-title">${escapeHtml(title)}</div>
            <div class="empty-text">${escapeHtml(text)}</div>
        </div>
    `;
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
