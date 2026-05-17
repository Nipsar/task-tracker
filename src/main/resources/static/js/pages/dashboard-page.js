import { api } from "../api/http.js";
import { normalizeTasks } from "../api/normalizers.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { renderDashboard } from "../dashboard/render-dashboard.js";
import { initNavigation } from "./common.js";

const loadButton = document.getElementById("loadBtn");
const statusMessage = document.getElementById("statusMessage");

initNavigation("dashboard");

loadButton?.addEventListener("click", loadDashboard);
document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
    setLoading(true);

    try {
        const tasks = normalizeTasks(await api.getTasks());
        renderDashboard(tasks);
        statusMessage.textContent = tasks.length === 0
            ? "Список задач пуст. Добавь первую задачу на странице задач."
            : `Загружено задач: ${tasks.length}. Графики пересчитаны.`;
    } catch (error) {
        console.error(error);
        renderDashboard([]);
        statusMessage.textContent = normalizeErrorMessage(error);
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    if (!loadButton) return;
    loadButton.disabled = isLoading;
    loadButton.textContent = isLoading ? "Загрузка..." : "Обновить данные";

    if (isLoading && statusMessage) {
        statusMessage.textContent = "Загружаю задачи и пересчитываю графики...";
    }
}
