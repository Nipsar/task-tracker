const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function parseDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoOrNull(localDateTimeValue) {
    if (!localDateTimeValue) {
        return null;
    }

    const date = new Date(localDateTimeValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

export function isValidLocalDateTime(value) {
    if (!value) {
        return true;
    }

    return !Number.isNaN(new Date(value).getTime());
}

export function formatDate(value) {
    const date = value instanceof Date ? value : parseDate(value);

    if (!date) {
        return "—";
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function toLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatRelativeDays(value) {
    const date = value instanceof Date ? value : parseDate(value);

    if (!date) {
        return "—";
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfTarget - startOfToday) / MS_IN_DAY);

    if (diffDays < 0) return `просрочено на ${Math.abs(diffDays)} дн.`;
    if (diffDays === 0) return "сегодня";
    if (diffDays === 1) return "завтра";
    return `через ${diffDays} дн.`;
}
