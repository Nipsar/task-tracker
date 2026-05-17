export function normalizeErrorMessage(error) {
    if (!error) {
        return "Неизвестная ошибка.";
    }

    const message = String(error.message ?? error ?? "").trim();

    if (!message) {
        return "Неизвестная ошибка.";
    }

    if (message.startsWith("{") || message.startsWith("<!DOCTYPE")) {
        return "Backend вернул ошибку. Проверь данные формы и лог Spring Boot.";
    }

    return message;
}
