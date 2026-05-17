import { api } from "../api/http.js";
import { normalizeProjects } from "../api/normalizers.js";
import { clearMessage, showMessage } from "../utils/dom.js";
import { isValidLocalDateTime, toIsoOrNull } from "../utils/date.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { renderProjects } from "../projects/render-projects.js";
import { initNavigation } from "./common.js";

let projects = [];

const elements = {
    loadButton: document.getElementById("loadBtn"),
    statusMessage: document.getElementById("statusMessage"),
    list: document.getElementById("projectList"),
    form: document.getElementById("createProjectForm"),
    titleInput: document.getElementById("projectTitleInput"),
    statusInput: document.getElementById("projectStatusInput"),
    deadlineInput: document.getElementById("projectDeadlineInput"),
    submitButton: document.getElementById("createProjectBtn"),
    clearButton: document.getElementById("clearProjectFormBtn"),
    formMessage: document.getElementById("createProjectMessage")
};

initNavigation("projects");

bindEvents();
document.addEventListener("DOMContentLoaded", loadProjects);

function bindEvents() {
    elements.loadButton?.addEventListener("click", loadProjects);
    elements.form?.addEventListener("submit", onCreateProjectSubmit);
    elements.clearButton?.addEventListener("click", resetForm);
}

async function loadProjects() {
    setPageLoading(true);

    try {
        projects = normalizeProjects(await api.getProjects());
        renderProjects(elements.list, projects);
        elements.statusMessage.textContent = projects.length === 0
            ? "Проектов пока нет."
            : `Загружено проектов: ${projects.length}.`;
    } catch (error) {
        console.error(error);
        projects = [];
        renderProjects(elements.list, []);
        elements.statusMessage.textContent = normalizeErrorMessage(error);
    } finally {
        setPageLoading(false);
    }
}

async function onCreateProjectSubmit(event) {
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
        const createdProject = await api.createProject({
            title: formData.title,
            status: formData.status,
            deadline: toIsoOrNull(formData.deadline)
        });

        resetForm();
        showMessage(elements.formMessage, `Проект создан: ${createdProject.title}`, "success");
        await loadProjects();
    } catch (error) {
        console.error(error);
        showMessage(elements.formMessage, normalizeErrorMessage(error), "error");
    } finally {
        setFormLoading(false);
    }
}

function getFormData() {
    return {
        title: elements.titleInput?.value.trim() ?? "",
        status: elements.statusInput?.value ?? "NEW",
        deadline: elements.deadlineInput?.value ?? ""
    };
}

function validateFormData(data) {
    if (!data.title) return "Название проекта обязательно.";
    if (!data.status) return "Статус проекта обязателен.";
    if (!isValidLocalDateTime(data.deadline)) return "Некорректный deadline проекта.";
    return null;
}

function resetForm() {
    elements.form?.reset();

    if (elements.statusInput) {
        elements.statusInput.value = "NEW";
    }

    clearMessage(elements.formMessage);
}

function setPageLoading(isLoading) {
    if (!elements.loadButton) return;
    elements.loadButton.disabled = isLoading;
    elements.loadButton.textContent = isLoading ? "Загрузка..." : "Обновить проекты";
}

function setFormLoading(isLoading) {
    if (!elements.submitButton) return;

    elements.submitButton.disabled = isLoading;
    elements.submitButton.textContent = isLoading ? "Создание..." : "Создать проект";

    elements.titleInput.disabled = isLoading;
    elements.statusInput.disabled = isLoading;
    elements.deadlineInput.disabled = isLoading;
    elements.clearButton.disabled = isLoading;
}
