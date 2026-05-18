import { api } from "../api/http.js";
import { clearMessage, showMessage } from "../utils/dom.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { isValidLocalDateTime, toIsoOrNull } from "../utils/date.js";
import { isUuid } from "../utils/validation.js";
import { filterTasks } from "../tasks/task-utils.js";
import { renderProjectSelect, renderTaskList } from "../tasks/render-task-list.js";
import { initNavigation } from "./common.js";
import { normalizeGoals, normalizeProjects, normalizeTasks } from "../api/normalizers.js";

const state = {
    tasks: [],
    projects: [],
    goals: []
};

const elements = {
    loadButton: document.getElementById("loadBtn"),
    statusMessage: document.getElementById("statusMessage"),
    taskList: document.getElementById("taskList"),
    searchInput: document.getElementById("searchInput"),
    statusFilter: document.getElementById("statusFilter"),
    form: document.getElementById("createTaskForm"),
    projectSelect: document.getElementById("projectSelectInput"),
    goalSelect: document.getElementById("goalSelectInput"),
    titleInput: document.getElementById("titleInput"),
    statusInput: document.getElementById("createStatusInput"),
    deadlineInput: document.getElementById("deadlineInput"),
    submitButton: document.getElementById("createTaskBtn"),
    clearButton: document.getElementById("clearTaskFormBtn"),
    formMessage: document.getElementById("createTaskMessage")
};

initNavigation("tasks");

bindEvents();
document.addEventListener("DOMContentLoaded", initPage);

function bindEvents() {
    elements.loadButton?.addEventListener("click", loadTasks);
    elements.searchInput?.addEventListener("input", renderVisibleTasks);
    elements.statusFilter?.addEventListener("change", renderVisibleTasks);
    elements.form?.addEventListener("submit", onCreateTaskSubmit);
    elements.clearButton?.addEventListener("click", resetForm);
    elements.projectSelect?.addEventListener("change", renderGoalSelectForSelectedProject);
}

async function initPage() {
    await loadProjectsAndGoals();
    await loadTasks();
}

async function loadProjectsAndGoals() {
    try {
        const [projects, goals] = await Promise.all([
            api.getProjects(),
            api.getGoals()
        ]);

        state.projects = normalizeProjects(projects);
        state.goals = normalizeGoals(goals);

        renderProjectSelect(elements.projectSelect, state.projects);
        renderGoalSelectForSelectedProject();
    } catch (error) {
        console.error(error);

        state.projects = [];
        state.goals = [];

        renderProjectSelect(elements.projectSelect, []);
        renderGoalSelectForSelectedProject();

        showMessage(elements.formMessage, "Не удалось загрузить проекты или цели.", "error");
    }
}

async function loadTasks() {
    setPageLoading(true);

    try {
        state.tasks = normalizeTasks(await api.getTasks());
        renderVisibleTasks();

        elements.statusMessage.textContent = state.tasks.length === 0
            ? "Список задач пуст. Добавь первую задачу через форму выше."
            : `Загружено задач: ${state.tasks.length}.`;
    } catch (error) {
        console.error(error);
        state.tasks = [];
        renderVisibleTasks();
        elements.statusMessage.textContent = normalizeErrorMessage(error);
    } finally {
        setPageLoading(false);
    }
}

function renderVisibleTasks() {
    const visibleTasks = filterTasks(
        state.tasks,
        elements.searchInput?.value ?? "",
        elements.statusFilter?.value ?? "ALL"
    );

    renderTaskList({
        container: elements.taskList,
        tasks: visibleTasks,
        projects: state.projects,
        onStatusSave: onTaskStatusSave,
        onDelete: onTaskDelete
    });
}

async function onCreateTaskSubmit(event) {
    event.preventDefault();
    clearMessage(elements.formMessage);

    const formData = getFormData();
    const validationError = validateFormData(formData);

    if (validationError) {
        showMessage(elements.formMessage, validationError, "error");
        return;
    }

    setFormLoading(true);

    try {
        const createdTask = await api.createTask({
            projectId: formData.projectId,
            goalId: formData.goalId || null,
            title: formData.title,
            status: formData.status,
            deadline: toIsoOrNull(formData.deadline)
        });

        resetForm();
        showMessage(elements.formMessage, `Задача создана: ${createdTask.title}`, "success");
        await loadTasks();
    } catch (error) {
        console.error(error);
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
    } finally {
        setFormLoading(false);
    }
}

async function onTaskStatusSave(taskId, nextStatus, button, select) {
    const previousButtonText = button.textContent;

    button.disabled = true;
    select.disabled = true;
    button.textContent = "Сохраняю...";

    try {
        const updatedTask = normalizeTasks([await api.updateTaskStatus(taskId, nextStatus)])[0];
        state.tasks = state.tasks.map(task => task.id === taskId ? updatedTask : task);
        renderVisibleTasks();
        elements.statusMessage.textContent = `Статус обновлён: ${updatedTask.title} → ${updatedTask.status}`;
    } catch (error) {
        console.error(error);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
        button.disabled = false;
        select.disabled = false;
        button.textContent = previousButtonText;
    }
}

async function onTaskDelete(taskId, button) {
    button.disabled = true;
    button.textContent = "Удаляю...";

    try {
        await api.deleteTask(taskId);
        state.tasks = state.tasks.filter(task => task.id !== taskId);
        renderVisibleTasks();
        elements.statusMessage.textContent = "Задача удалена.";
    } catch (error) {
        console.error(error);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
        button.disabled = false;
        button.textContent = "Удалить";
    }
}

function getFormData() {
    return {
        projectId: elements.projectSelect?.value ?? "",
        goalId: elements.goalSelect?.value ?? "",
        title: elements.titleInput?.value.trim() ?? "",
        status: elements.statusInput?.value ?? "NEW",
        deadline: elements.deadlineInput?.value ?? ""
    };
}

function validateFormData(data) {
    if (!isUuid(data.projectId)) return "Выбери проект из списка.";
    if (data.goalId && !isUuid(data.goalId)) { return "Некорректная цель."; }
    if (!data.title) return "Название задачи обязательно.";
    if (!data.status) return "Статус обязателен.";
    if (!isValidLocalDateTime(data.deadline)) return "Некорректный deadline.";
    return null;
}

function resetForm() {
    elements.form?.reset();

    if (elements.statusInput) {
        elements.statusInput.value = "NEW";
    }

    renderGoalSelectForSelectedProject();
    clearMessage(elements.formMessage);
}

function setPageLoading(isLoading) {
    if (!elements.loadButton) return;
    elements.loadButton.disabled = isLoading;
    elements.loadButton.textContent = isLoading ? "Загрузка..." : "Обновить задачи";

    if (isLoading && elements.statusMessage) {
        elements.statusMessage.textContent = "Загружаю задачи...";
    }
}

function setFormLoading(isLoading) {
    if (!elements.submitButton) return;

    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? "Создание..." : "Добавить задачу";

    elements.projectSelect.disabled = isLoading || state.projects.length === 0;
    elements.titleInput.disabled = isLoading;
    elements.statusInput.disabled = isLoading;
    elements.deadlineInput.disabled = isLoading;
    elements.clearButton.disabled = isLoading;

    if (elements.goalSelect) {
        elements.goalSelect.disabled = isLoading || !isUuid(elements.projectSelect?.value ?? "");
    }
}

function renderGoalSelectForSelectedProject() {
    if (!elements.goalSelect) return;

    const selectedProjectId = elements.projectSelect?.value ?? "";

    if (!isUuid(selectedProjectId)) {
        elements.goalSelect.innerHTML = `<option value="">Сначала выбери проект</option>`;
        elements.goalSelect.disabled = true;
        return;
    }

    const projectGoals = state.goals.filter(goal => goal.projectId === selectedProjectId);

    if (projectGoals.length === 0) {
        elements.goalSelect.innerHTML = `<option value="">У проекта пока нет целей</option>`;
        elements.goalSelect.disabled = false;
        return;
    }

    elements.goalSelect.disabled = false;
    elements.goalSelect.innerHTML = `
        <option value="">Без цели</option>
        ${projectGoals.map(goal => `
            <option value="${goal.id}">${goal.title}</option>
        `).join("")}
    `;
}
