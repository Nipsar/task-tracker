console.log("app.js loaded v3");

const loadBtn = document.getElementById("loadBtn");
const statusMessage = document.getElementById("statusMessage");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const totalTasksEl = document.getElementById("totalTasks");
const donePercentEl = document.getElementById("donePercent");
const doneDetailsEl = document.getElementById("doneDetails");
const overdueTasksEl = document.getElementById("overdueTasks");
const nearestDeadlineEl = document.getElementById("nearestDeadline");
const nearestDeadlineNoteEl = document.getElementById("nearestDeadlineNote");
const statusDonutEl = document.getElementById("statusDonut");
const donutTotalEl = document.getElementById("donutTotal");
const statusLegendEl = document.getElementById("statusLegend");
const deadlineBarsEl = document.getElementById("deadlineBars");
const activityChartEl = document.getElementById("activityChart");

const taskCreateForm = document.getElementById("createTaskForm");
const projectSelectInput = document.getElementById("projectSelectInput");
const titleInput = document.getElementById("titleInput");
const createStatusInput = document.getElementById("createStatusInput");
const deadlineInput = document.getElementById("deadlineInput");
const createTaskBtn = document.getElementById("createTaskBtn");
const resetTaskFormBtn = document.getElementById("clearTaskFormBtn");
const createTaskMessage = document.getElementById("createTaskMessage");

const createProjectForm = document.getElementById("createProjectForm");
const projectTitleInput = document.getElementById("projectTitleInput");
const projectStatusInput = document.getElementById("projectStatusInput");
const projectDeadlineInput = document.getElementById("projectDeadlineInput");
const createProjectBtn = document.getElementById("createProjectBtn");
const clearProjectFormBtn = document.getElementById("clearProjectFormBtn");
const createProjectMessage = document.getElementById("createProjectMessage");

const createHabitForm = document.getElementById("createHabitForm");
const habitTitleInput = document.getElementById("habitTitleInput");
const createHabitBtn = document.getElementById("createHabitBtn");
const clearHabitFormBtn = document.getElementById("clearHabitFormBtn");
const createHabitMessage = document.getElementById("createHabitMessage");
const reloadHabitsBtn = document.getElementById("reloadHabitsBtn");
const habitList = document.getElementById("habitList");


let allTasks = [];
let allProjects = [];
let allHabits = [];


const taskApi = {

    async getHabits() {
        const response = await fetch("/api/habits");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки привычек: HTTP ${response.status}`);
        }

        return response.json();
    },

    async createHabit(payload) {
        const response = await fetch("/api/habits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Ошибка создания привычки: HTTP ${response.status}`);
        }

        return response.json();
    },

    async completeHabit(habitId) {
        const response = await fetch(`/api/habits/${habitId}/complete`, {
            method: "POST"
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Ошибка выполнения привычки: HTTP ${response.status}`);
        }

        return response.json();
    },

    async createProject(payload) {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = `Ошибка создания проекта: HTTP ${response.status}`;

            try {
                const responseText = await response.text();
                if (responseText) {
                    errorText = responseText;
                }
            } catch (error) {
                console.error("Не удалось прочитать текст ошибки", error);
            }

            throw new Error(errorText);
        }

        return response.json();
    },

    async getProjects() {
        const response = await fetch("/api/projects");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки проектов: HTTP ${response.status}`);
        }

        return response.json();
    },

    async createProject(payload) {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Ошибка создания проекта: HTTP ${response.status}`);
        }

        return response.json();
    },

    async getTasks() {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки задач: HTTP ${response.status}`);
        }

        return response.json();
    },

    async createTask(payload) {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Ошибка создания задачи: HTTP ${response.status}`);
        }

        return response.json();
    },

    async updateTaskStatus(taskId, status) {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            let errorText = `Ошибка обновления статуса: HTTP ${response.status}`;

            try {
                const responseText = await response.text();
                if (responseText) {
                    errorText = responseText;
                }
            } catch (error) {
                console.error("Не удалось прочитать текст ошибки", error);
            }

            throw new Error(errorText);
        }

        return response.json();
    },

    async deleteTask(taskId) {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Ошибка удаления задачи: HTTP ${response.status}`);
        }
    }
};

async function onCreateProjectSubmit(event) {
    event.preventDefault();
    clearCreateProjectMessage();

    const formData = getCreateProjectFormData();
    const validationError = validateCreateProjectFormData(formData);

    if (validationError) {
        showCreateProjectMessage(validationError, "error");
        return;
    }

    const payload = {
        title: formData.title,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    setCreateProjectLoading(true);

    try {
        const createdProject = await taskApi.createProject(payload);

        resetCreateProjectForm();
        showCreateProjectMessage(`Проект создан: ${createdProject.title}`, "success");

        await loadProjects();

        if (projectSelectInput) {
            projectSelectInput.value = createdProject.id;
        }
    } catch (error) {
        console.error(error);
        showCreateProjectMessage(normalizeErrorMessage(error), "error");
    } finally {
        setCreateProjectLoading(false);
    }
}

function getCreateProjectFormData() {
    return {
        title: projectTitleInput?.value.trim() ?? "",
        status: projectStatusInput?.value ?? "NEW",
        deadline: projectDeadlineInput?.value ?? ""
    };
}

function validateCreateProjectFormData(data) {
    if (!data.title) {
        return "Название проекта обязательно.";
    }

    if (!data.status) {
        return "Статус проекта обязателен.";
    }

    if (data.deadline) {
        const parsedDeadline = new Date(data.deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
            return "Некорректный deadline проекта.";
        }
    }

    return null;
}

function setCreateProjectLoading(isLoading) {
    if (!createProjectBtn) {
        return;
    }

    createProjectBtn.disabled = isLoading;
    createProjectBtn.textContent = isLoading ? "Создание..." : "Создать проект";

    if (projectTitleInput) projectTitleInput.disabled = isLoading;
    if (projectStatusInput) projectStatusInput.disabled = isLoading;
    if (projectDeadlineInput) projectDeadlineInput.disabled = isLoading;
    if (clearProjectFormBtn) clearProjectFormBtn.disabled = isLoading;
}

function resetCreateProjectForm() {
    if (!createProjectForm) {
        return;
    }

    createProjectForm.reset();

    if (projectStatusInput) {
        projectStatusInput.value = "NEW";
    }

    clearCreateProjectMessage();
}

function showCreateProjectMessage(message, type) {
    if (!createProjectMessage) {
        return;
    }

    createProjectMessage.textContent = message;
    createProjectMessage.className = `form-message ${type}`;
}

function clearCreateProjectMessage() {
    if (!createProjectMessage) {
        return;
    }

    createProjectMessage.textContent = "";
    createProjectMessage.className = "form-message";
}

async function onTaskStatusSave(taskId, nextStatus, button, select) {
    const previousButtonText = button.textContent;

    button.disabled = true;
    select.disabled = true;
    button.textContent = "Сохраняю...";

    try {
        const updatedTask = await taskApi.updateTaskStatus(taskId, nextStatus);
        const normalizedUpdatedTask = normalizeTasks([updatedTask])[0];

        allTasks = allTasks.map(task =>
            task.id === taskId ? normalizedUpdatedTask : task
        );

        renderDashboard(allTasks);
        renderVisibleTasks();

        statusMessage.textContent = `Статус задачи обновлён: ${normalizedUpdatedTask.title} → ${normalizedUpdatedTask.status}`;
    } catch (error) {
        console.error(error);
        statusMessage.textContent = normalizeErrorMessage(error);

        button.disabled = false;
        select.disabled = false;
        button.textContent = previousButtonText;
    }
}

async function onTaskDelete(taskId, button) {
    button.disabled = true;
    button.textContent = "Удаляю...";

    try {
        await taskApi.deleteTask(taskId);

        allTasks = allTasks.filter(task => task.id !== taskId);

        renderDashboard(allTasks);
        renderVisibleTasks();

        statusMessage.textContent = "Задача удалена.";
    } catch (error) {
        console.error(error);
        statusMessage.textContent = normalizeErrorMessage(error);
        button.disabled = false;
        button.textContent = "Удалить";
    }
}


loadBtn.addEventListener("click", loadTasks);
searchInput.addEventListener("input", renderVisibleTasks);
statusFilter.addEventListener("change", renderVisibleTasks);

if (createProjectForm) {
    createProjectForm.addEventListener("submit", onCreateProjectSubmit);
}

if (clearProjectFormBtn) {
    clearProjectFormBtn.addEventListener("click", resetCreateProjectForm);
}

if (taskCreateForm) {
    taskCreateForm.addEventListener("submit", onCreateTaskSubmit);
}

if (resetTaskFormBtn) {
    resetTaskFormBtn.addEventListener("click", resetCreateTaskForm);
}

if (createHabitForm) {
    createHabitForm.addEventListener("submit", onCreateHabitSubmit);
}

if (clearHabitFormBtn) {
    clearHabitFormBtn.addEventListener("click", resetCreateHabitForm);
}

if (reloadHabitsBtn) {
    reloadHabitsBtn.addEventListener("click", loadHabits);
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadProjects();
    await loadTasks();
    loadHabits();
});



async function loadTasks() {
    setLoadingState(true);

    try {
        const tasks = await taskApi.getTasks();
        console.log("tasks from backend", tasks);
        allTasks = normalizeTasks(tasks);

        renderDashboard(allTasks);
        renderVisibleTasks();

        if (allTasks.length === 0) {
            statusMessage.textContent = "Список задач пуст. Добавь первую задачу через форму выше.";
        } else {
            statusMessage.textContent = `Загружено задач: ${allTasks.length}. Графики пересчитаны.`;
        }
    } catch (error) {
        console.error(error);
        allTasks = [];
        renderDashboard([]);
        renderVisibleTasks();
        statusMessage.textContent = "Не удалось загрузить данные с backend. Проверь /api/tasks, console и Network.";
    } finally {
        setLoadingState(false);
    }
}

async function loadProjects() {
    try {
        allProjects = await taskApi.getProjects();
        renderProjectSelect(allProjects);
    } catch (error) {
        console.error(error);
        allProjects = [];
        renderProjectSelect([]);
        showCreateTaskMessage("Не удалось загрузить проекты. Проверь /api/projects.", "error");
    }
}

function getProjectTitleById(projectId) {
    const project = allProjects.find(project => project.id === projectId);
    return project ? project.title : "Проект не найден";
}

function renderProjectSelect(projects) {
    if (!projectSelectInput) {
        return;
    }

    if (projects.length === 0) {
        projectSelectInput.innerHTML = `
            <option value="">Нет проектов. Сначала создай проект через API.</option>
        `;
        projectSelectInput.disabled = true;
        return;
    }

    projectSelectInput.disabled = false;

    projectSelectInput.innerHTML = `
        <option value="">Выбери проект</option>
        ${projects.map(project => `
            <option value="${escapeHtml(project.id)}">
                ${escapeHtml(project.title)} — ${escapeHtml(project.status)}
            </option>
        `).join("")}
    `;
}

function setLoadingState(isLoading) {
    loadBtn.disabled = isLoading;
    loadBtn.textContent = isLoading ? "Загрузка..." : "Обновить данные";

    if (isLoading) {
        statusMessage.textContent = "Загружаю данные и пересчитываю диаграммы...";
    }
}

function normalizeTasks(tasks) {
    return tasks.map(task => ({
        id: task.id,
        title: String(task.title ?? "Без названия").trim(),
        status: String(task.status ?? "NEW"),
        deadline: task.deadline ? new Date(task.deadline) : null,
        createdAt: task.createdAt ? new Date(task.createdAt) : null,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
        projectId: task.projectId ?? null
    }));
}

async function onCreateTaskSubmit(event) {
    event.preventDefault();
    clearCreateTaskMessage();

    const formData = getCreateTaskFormData();
    const validationError = validateCreateTaskFormData(formData);

    if (validationError) {
        showCreateTaskMessage(validationError, "error");
        return;
    }

    const payload = {
        projectId: formData.projectId,
        title: formData.title,
        status: formData.status,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    setCreateTaskLoading(true);

    try {
        const createdTask = await taskApi.createTask(payload);

        resetCreateTaskForm();

        showCreateTaskMessage(`Задача успешно создана: ${createdTask.title}`, "success");
        await loadTasks();
    } catch (error) {
        console.error(error);
        showCreateTaskMessage(normalizeErrorMessage(error), "error");
    } finally {
        setCreateTaskLoading(false);
    }
}

function getCreateTaskFormData() {
    return {
        projectId: projectSelectInput?.value ?? "",
        title: titleInput?.value.trim() ?? "",
        status: createStatusInput?.value ?? "NEW",
        deadline: deadlineInput?.value ?? ""
    };
}

function validateCreateTaskFormData(data) {

    if (!isUuid(data.projectId)) {
        return "Project ID должен быть валидным UUID.";
    }

    if (!data.title) {
        return "Название задачи обязательно.";
    }

    if (!data.status) {
        return "Статус обязателен.";
    }

    if (data.deadline) {
        const parsedDeadline = new Date(data.deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
            return "Некорректный deadline.";
        }
    }

    return null;
}

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function setCreateTaskLoading(isLoading) {
    if (!createTaskBtn) {
        return;
    }

    createTaskBtn.disabled = isLoading;
    createTaskBtn.textContent = isLoading ? "Создание..." : "Добавить задачу";

    if (projectSelectInput) projectSelectInput.disabled = isLoading;
    if (titleInput) titleInput.disabled = isLoading;
    if (createStatusInput) createStatusInput.disabled = isLoading;
    if (deadlineInput) deadlineInput.disabled = isLoading;
    if (resetTaskFormBtn) resetTaskFormBtn.disabled = isLoading;
}

function resetCreateTaskForm() {
    if (!taskCreateForm) {
        return;
    }

    taskCreateForm.reset();

    if (createStatusInput) {
        createStatusInput.value = "NEW";
    }

    clearCreateTaskMessage();
}



function showCreateTaskMessage(message, type) {
    if (!createTaskMessage) {
        return;
    }

    createTaskMessage.textContent = message;
    createTaskMessage.className = `form-message ${type}`;
}

function clearCreateTaskMessage() {
    if (!createTaskMessage) {
        return;
    }

    createTaskMessage.textContent = "";
    createTaskMessage.className = "form-message";
}

function normalizeErrorMessage(error) {
    if (!error) {
        return "Неизвестная ошибка.";
    }

    const message = String(error.message ?? "").trim();

    if (!message) {
        return "Неизвестная ошибка.";
    }

    if (message.startsWith("{") || message.startsWith("<!DOCTYPE")) {
        return "Backend вернул ошибку. Проверь данные формы и лог Spring Boot.";
    }

    return message;
}

function renderDashboard(tasks) {
    const metrics = buildMetrics(tasks);

    totalTasksEl.textContent = metrics.total;
    donePercentEl.textContent = `${metrics.donePercent}%`;
    doneDetailsEl.textContent = `${metrics.done} из ${metrics.total || 0} задач завершены`;
    overdueTasksEl.textContent = metrics.overdue;
    nearestDeadlineEl.textContent = metrics.nearestDeadlineLabel;
    nearestDeadlineNoteEl.textContent = metrics.nearestDeadlineNote;

    renderStatusDonut(metrics.statusCounts, metrics.total);
    renderDeadlineBars(metrics.deadlineBuckets);
    renderActivityChart(metrics.activityLast7Days);
}

function buildMetrics(tasks) {
    const now = new Date();
    const statusCounts = { NEW: 0, IN_PROGRESS: 0, DONE: 0 };

    for (const task of tasks) {
        if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status] += 1;
        }
    }

    const total = tasks.length;
    const done = statusCounts.DONE;
    const overdue = tasks.filter(task => task.deadline && task.deadline < now && task.status !== "DONE").length;
    const donePercent = total === 0 ? 0 : Math.round((done / total) * 100);

    const nearestActiveTask = tasks
        .filter(task => task.deadline && task.status !== "DONE" && task.deadline >= now)
        .sort((a, b) => a.deadline - b.deadline)[0];

    const nearestDeadlineLabel = nearestActiveTask ? formatDate(nearestActiveTask.deadline) : "Нет активных дедлайнов";
    const nearestDeadlineNote = nearestActiveTask
        ? `${nearestActiveTask.title} · ${formatRelativeDays(nearestActiveTask.deadline)}`
        : "Все активные задачи без дедлайна или уже завершены";

    const deadlineBuckets = buildDeadlineBuckets(tasks, now);
    const activityLast7Days = buildLast7DaysActivity(tasks, now);

    return {
        total,
        done,
        overdue,
        donePercent,
        statusCounts,
        nearestDeadlineLabel,
        nearestDeadlineNote,
        deadlineBuckets,
        activityLast7Days
    };
}

function buildDeadlineBuckets(tasks, now) {
    const msInDay = 24 * 60 * 60 * 1000;
    const buckets = [
        { key: "overdue", label: "Просрочено", value: 0 },
        { key: "week", label: "До 7 дней", value: 0 },
        { key: "month", label: "8–30 дней", value: 0 },
        { key: "later", label: "Позже", value: 0 },
        { key: "none", label: "Без дедлайна", value: 0 }
    ];

    for (const task of tasks) {
        if (!task.deadline) {
            buckets[4].value += 1;
            continue;
        }

        if (task.status === "DONE") {
            continue;
        }

        const diffDays = Math.ceil((task.deadline - now) / msInDay);

        if (diffDays < 0) {
            buckets[0].value += 1;
        } else if (diffDays <= 7) {
            buckets[1].value += 1;
        } else if (diffDays <= 30) {
            buckets[2].value += 1;
        } else {
            buckets[3].value += 1;
        }
    }

    return buckets;
}

function buildLast7DaysActivity(tasks, now) {
    const days = [];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push({
            key: toLocalDateKey(date),
            shortLabel: date.toLocaleDateString("ru-RU", { weekday: "short" }),
            fullLabel: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
            value: 0
        });
    }

    for (const task of tasks) {
        if (task.status !== "DONE") {
            continue;
        }

        if (!task.completedAt || Number.isNaN(task.completedAt.getTime())) {
            continue;
        }

        const key = toLocalDateKey(task.completedAt);
        const day = days.find(item => item.key === key);
        if (day) {
            day.value += 1;
        }
    }

    return days;
}

function renderStatusDonut(statusCounts, total) {
    donutTotalEl.textContent = total;

    if (total === 0) {
        statusDonutEl.style.background = "conic-gradient(#e5e7eb 0 100%)";
        statusLegendEl.innerHTML =
            buildLegendItem("NEW", 0) +
            buildLegendItem("IN_PROGRESS", 0) +
            buildLegendItem("DONE", 0);
        return;
    }

    const newCount = statusCounts.NEW || 0;
    const progressCount = statusCounts.IN_PROGRESS || 0;
    const doneCount = statusCounts.DONE || 0;

    const newPart = (newCount / total) * 100;
    const progressPart = (progressCount / total) * 100;

    statusDonutEl.style.background = `conic-gradient(
        var(--accent-blue) 0 ${newPart}%,
        var(--accent-orange) ${newPart}% ${newPart + progressPart}%,
        var(--accent-green) ${newPart + progressPart}% 100%
    )`;

    statusLegendEl.innerHTML = [
        buildLegendItem("NEW", newCount),
        buildLegendItem("IN_PROGRESS", progressCount),
        buildLegendItem("DONE", doneCount)
    ].join("");
}

function buildLegendItem(status, value) {
    return `
        <div class="legend-item">
            <span class="legend-dot ${status}"></span>
            <span class="legend-text">${status}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function renderDeadlineBars(buckets) {
    const max = Math.max(1, ...buckets.map(item => item.value));

    deadlineBarsEl.innerHTML = buckets.map(bucket => {
        const width = Math.max(8, Math.round((bucket.value / max) * 100));
        return `
            <div class="bar-row">
                <div class="bar-label-wrap">
                    <span class="bar-label">${bucket.label}</span>
                    <strong>${bucket.value}</strong>
                </div>
                <div class="bar-track">
                    <div class="bar-fill ${bucket.key}" style="width: ${bucket.value === 0 ? 0 : width}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

function renderActivityChart(days) {
    const max = Math.max(1, ...days.map(day => day.value));

    activityChartEl.innerHTML = `
        <div class="activity-bars">
            ${days.map(day => {
                const height = Math.max(10, Math.round((day.value / max) * 100));
                return `
                    <div class="activity-col">
                        <div class="activity-value">${day.value}</div>
                        <div class="activity-bar-wrap">
                            <div class="activity-bar" style="height: ${day.value === 0 ? 8 : height}%"></div>
                        </div>
                        <div class="activity-day">${day.shortLabel}</div>
                        <div class="activity-date">${day.fullLabel}</div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function renderVisibleTasks() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const visibleTasks = allTasks
        .filter(task => {
            if (selectedStatus === "ALL") {
                return task.status !== "DONE";
            }

            return task.status === selectedStatus;
        })
        .filter(task => !query || task.title.toLowerCase().includes(query))
        .sort(sortTasks);

    taskList.innerHTML = "";

    if (visibleTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Ничего не найдено</div>
                <div class="empty-text">Попробуй изменить фильтр или добавить задачи через форму выше.</div>
            </div>
        `;
        return;
    }

    visibleTasks.forEach(task => {
        const card = document.createElement("article");
        card.className = "task-card";

        const deadlineMeta = task.deadline
            ? `${formatDate(task.deadline)} · ${formatRelativeDays(task.deadline)}`
            : "Без дедлайна";

        const createdMeta = task.createdAt
            ? formatDate(task.createdAt)
            : "Нет createdAt";

        card.innerHTML = `
            <div class="task-top">
                <div>
                    <h3>${escapeHtml(task.title)}</h3>
                    <div class="task-id">${escapeHtml(task.id)}</div>
                </div>
                <div class="badge ${escapeHtml(task.status)}">${escapeHtml(task.status)}</div>
            </div>

            <div class="task-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Проект</span>
                    <strong>${escapeHtml(getProjectTitleById(task.projectId))}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Deadline</span>
                    <strong>${escapeHtml(deadlineMeta)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Created</span>
                    <strong>${escapeHtml(createdMeta)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Status</span>
                    <strong>${escapeHtml(task.status)}</strong>
                </div>
            </div>

            <div class="task-actions">
                <select class="filter-select task-status-select">
                    <option value="NEW" ${task.status === "NEW" ? "selected" : ""}>NEW</option>
                    <option value="IN_PROGRESS" ${task.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                    <option value="DONE" ${task.status === "DONE" ? "selected" : ""}>DONE</option>
                </select>

                <button type="button" class="secondary-btn task-status-save">
                    Сохранить статус
                </button>

                <button type="button" class="secondary-btn task-delete-btn">
                    Удалить
                </button>
            </div>
        `;

        const statusSelectEl = card.querySelector(".task-status-select");
        const saveStatusBtnEl = card.querySelector(".task-status-save");

        const deleteBtnEl = card.querySelector(".task-delete-btn");

        deleteBtnEl.addEventListener("click", () => {
            onTaskDelete(task.id, deleteBtnEl);
        });

        saveStatusBtnEl.addEventListener("click", () => {
            const nextStatus = statusSelectEl.value;
            onTaskStatusSave(task.id, nextStatus, saveStatusBtnEl, statusSelectEl);
        });

        taskList.appendChild(card);
    });
}

function sortTasks(a, b) {
    if (a.deadline && b.deadline) {
        return a.deadline - b.deadline;
    }
    if (a.deadline) {
        return -1;
    }
    if (b.deadline) {
        return 1;
    }
    return a.title.localeCompare(b.title, "ru");
}

function formatDate(value) {
    if (!value || Number.isNaN(value.getTime())) {
        return "—";
    }

    return value.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function toLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatRelativeDays(date) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfTarget - startOfToday) / (24 * 60 * 60 * 1000));

    if (diffDays < 0) return `просрочено на ${Math.abs(diffDays)} дн.`;
    if (diffDays === 0) return "сегодня";
    if (diffDays === 1) return "завтра";
    return `через ${diffDays} дн.`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadHabits() {
    if (!habitList) {
        return;
    }

    try {
        allHabits = await taskApi.getHabits();
        renderHabits(allHabits);

        if (allHabits.length === 0) {
            showCreateHabitMessage("Привычек пока нет. Добавь первую.", "success");
        } else {
            clearCreateHabitMessage();
        }
    } catch (error) {
        console.error(error);
        allHabits = [];
        renderHabits([]);
        showCreateHabitMessage(normalizeErrorMessage(error), "error");
    }
}

async function onCreateHabitSubmit(event) {
    event.preventDefault();
    clearCreateHabitMessage();

    const title = habitTitleInput?.value.trim() ?? "";

    if (!title) {
        showCreateHabitMessage("Название привычки обязательно.", "error");
        return;
    }

    const payload = {
        title
    };

    setCreateHabitLoading(true);

    try {
        const createdHabit = await taskApi.createHabit(payload);

        resetCreateHabitForm();
        showCreateHabitMessage(`Привычка создана: ${createdHabit.title}`, "success");

        await loadHabits();
    } catch (error) {
        console.error(error);
        showCreateHabitMessage(normalizeErrorMessage(error), "error");
    } finally {
        setCreateHabitLoading(false);
    }
}

async function onHabitComplete(habitId, button) {
    const previousText = button.textContent;

    button.disabled = true;
    button.textContent = "Сохраняю...";

    try {
        const updatedHabit = await taskApi.completeHabit(habitId);

        allHabits = allHabits.map(habit =>
            habit.id === habitId ? updatedHabit : habit
        );

        renderHabits(allHabits);
        showCreateHabitMessage(`Готово: ${updatedHabit.title}`, "success");
    } catch (error) {
        console.error(error);
        showCreateHabitMessage(normalizeErrorMessage(error), "error");

        button.disabled = false;
        button.textContent = previousText;
    }
}

function renderHabits(habits) {
    if (!habitList) {
        return;
    }

    habitList.innerHTML = "";

    if (!habits || habits.length === 0) {
        habitList.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Привычек пока нет</div>
                <div class="empty-text">Добавь привычку выше и отмечай её каждый день.</div>
            </div>
        `;
        return;
    }

    const todayKey = toLocalDateKey(new Date());

    const sortedHabits = [...habits].sort((a, b) => {
        const streakDiff = Number(b.streakDays ?? 0) - Number(a.streakDays ?? 0);

        if (streakDiff !== 0) {
            return streakDiff;
        }

        return String(a.title ?? "").localeCompare(String(b.title ?? ""), "ru");
    });

    sortedHabits.forEach(habit => {
        const card = document.createElement("article");
        card.className = "habit-card";

        const lastCompletedDate = habit.lastCompletedDate ?? null;
        const isCompletedToday = lastCompletedDate === todayKey;

        card.innerHTML = `
            <div class="habit-top">
                <div>
                    <h3>${escapeHtml(habit.title)}</h3>
                    <div class="task-id">${escapeHtml(habit.id)}</div>
                </div>
                <div class="habit-streak-badge">
                    🔥 ${Number(habit.streakDays ?? 0)} дн.
                </div>
            </div>

            <div class="habit-meta-grid">
                <div class="task-meta-item">
                    <span class="task-meta-label">Серия</span>
                    <strong>${Number(habit.streakDays ?? 0)} дней подряд</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Лучший результат</span>
                    <strong>${Number(habit.bestStreakDays ?? 0)} дней</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Всего выполнено</span>
                    <strong>${Number(habit.totalCompletions ?? 0)}</strong>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Последнее выполнение</span>
                    <strong>${escapeHtml(lastCompletedDate ?? "—")}</strong>
                </div>
            </div>

            <div class="task-actions">
                <button
                        type="button"
                        class="primary-btn habit-complete-btn"
                        ${isCompletedToday ? "disabled" : ""}
                >
                    ${isCompletedToday ? "Сегодня выполнено" : "Выполнено сегодня"}
                </button>
            </div>
        `;

        const completeBtn = card.querySelector(".habit-complete-btn");

        completeBtn.addEventListener("click", () => {
            onHabitComplete(habit.id, completeBtn);
        });

        habitList.appendChild(card);
    });
}

function setCreateHabitLoading(isLoading) {
    if (!createHabitBtn) {
        return;
    }

    createHabitBtn.disabled = isLoading;
    createHabitBtn.textContent = isLoading ? "Создание..." : "Добавить привычку";

    if (habitTitleInput) {
        habitTitleInput.disabled = isLoading;
    }

    if (clearHabitFormBtn) {
        clearHabitFormBtn.disabled = isLoading;
    }
}

function resetCreateHabitForm() {
    if (!createHabitForm) {
        return;
    }

    createHabitForm.reset();
    clearCreateHabitMessage();
}

function showCreateHabitMessage(message, type) {
    if (!createHabitMessage) {
        return;
    }

    createHabitMessage.textContent = message;
    createHabitMessage.className = `form-message ${type}`;
}

function clearCreateHabitMessage() {
    if (!createHabitMessage) {
        return;
    }

    createHabitMessage.textContent = "";
    createHabitMessage.className = "form-message";
}

