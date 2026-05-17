import { api } from "../api/http.js";
import { normalizeProjects, normalizeTasks, normalizeGoals } from "../api/normalizers.js";
import { renderProjectSelect } from "../tasks/render-task-list.js";
import { renderGoalStats, renderGoalsList } from "../goals/render-goals.js";
import { buildGoalViewModel, filterGoals, sortGoals } from "../goals/goal-utils.js";
import { showMessage, clearMessage } from "../utils/dom.js";
import { normalizeErrorMessage } from "../utils/errors.js";
import { isUuid } from "../utils/validation.js";
import { initNavigation } from "./common.js";

console.log("goals-page.js loaded");

const reloadGoalsBtn = document.getElementById("reloadGoalsBtn");

const createGoalForm = document.getElementById("createGoalForm");
const goalProjectInput = document.getElementById("goalProjectInput");
const goalTitleInput = document.getElementById("goalTitleInput");
const goalDeadlineInput = document.getElementById("goalDeadlineInput");
const createGoalBtn = document.getElementById("createGoalBtn");
const clearGoalFormBtn = document.getElementById("clearGoalFormBtn");
const createGoalMessage = document.getElementById("createGoalMessage");

const totalGoalsEl = document.getElementById("totalGoals");
const averageGoalProgressEl = document.getElementById("averageGoalProgress");
const completedGoalsEl = document.getElementById("completedGoals");
const goalTasksCountEl = document.getElementById("goalTasksCount");

const goalsStatusMessage = document.getElementById("goalsStatusMessage");
const goalSearchInput = document.getElementById("goalSearchInput");
const goalProgressFilter = document.getElementById("goalProgressFilter");
const goalsList = document.getElementById("goalsList");

let allProjects = [];
let allGoals = [];
let allTasks = [];

initNavigation("goals");
reloadGoalsBtn.addEventListener("click", loadGoalsPage);
const createdGoal = await api.createGoal(payload);
clearGoalFormBtn.addEventListener("click", resetGoalForm);
goalSearchInput.addEventListener("input", renderPage);
goalProgressFilter.addEventListener("change", renderPage);

document.addEventListener("DOMContentLoaded", loadGoalsPage);

async function loadGoalsPage() {
    setPageLoading(true);

    try {
        const [projects, goals, tasks] = await Promise.all([
            api.getProjects(),
            api.getGoals(),
            api.getTasks()
        ]);

        allProjects = projects;
        allGoals = normalizeGoals(goals);
        allTasks = normalizeTasks(tasks);

        renderProjectSelect(goalProjectInput, allProjects);
        renderPage();

        goalsStatusMessage.textContent = `Загружено целей: ${allGoals.length}.`;
    } catch (error) {
        console.error(error);

        allProjects = [];
        allGoals = [];
        allTasks = [];

        renderProjectSelect(goalProjectInput, []);
        renderPage();

        goalsStatusMessage.textContent = normalizeErrorMessage(error);
    } finally {
        setPageLoading(false);
    }
}

function renderPage() {
    const goalViewModels = allGoals.map(goal =>
        buildGoalViewModel(goal, allTasks, allProjects)
    );

    const query = goalSearchInput.value.trim().toLowerCase();
    const selectedFilter = goalProgressFilter.value;

    const visibleGoals = filterGoals(goalViewModels, query, selectedFilter)
        .sort(sortGoals);

    renderGoalStats({
        totalGoalsEl,
        averageGoalProgressEl,
        completedGoalsEl,
        goalTasksCountEl
    }, goalViewModels);

    renderGoalsList(goalsList, visibleGoals);
}

async function onCreateGoalSubmit(event) {
    event.preventDefault();
    clearMessage(createGoalMessage);

    const formData = getGoalFormData();
    const validationError = validateGoalFormData(formData);

    if (validationError) {
        showMessage(createGoalMessage, validationError, "error");
        return;
    }

    const payload = {
        projectId: formData.projectId,
        title: formData.title,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    setCreateGoalLoading(true);

    try {
        const createdGoal = await createGoal(payload);

        resetGoalForm();
        showMessage(createGoalMessage, `Цель создана: ${createdGoal.title}`, "success");

        await loadGoalsPage();
    } catch (error) {
        console.error(error);
        showMessage(createGoalMessage, normalizeErrorMessage(error), "error");
    } finally {
        setCreateGoalLoading(false);
    }
}

function getGoalFormData() {
    return {
        projectId: goalProjectInput?.value ?? "",
        title: goalTitleInput?.value.trim() ?? "",
        deadline: goalDeadlineInput?.value ?? ""
    };
}

function validateGoalFormData(data) {
    if (!isUuid(data.projectId)) {
        return "Нужно выбрать проект.";
    }

    if (!data.title) {
        return "Название цели обязательно.";
    }

    if (data.deadline) {
        const parsedDeadline = new Date(data.deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
            return "Некорректный deadline.";
        }
    }

    return null;
}

function setPageLoading(isLoading) {
    reloadGoalsBtn.disabled = isLoading;
    reloadGoalsBtn.textContent = isLoading ? "Загрузка..." : "Обновить цели";

    if (isLoading) {
        goalsStatusMessage.textContent = "Загружаю цели, проекты и задачи...";
    }
}

function setCreateGoalLoading(isLoading) {
    createGoalBtn.disabled = isLoading;
    createGoalBtn.textContent = isLoading ? "Создание..." : "Создать цель";

    goalProjectInput.disabled = isLoading;
    goalTitleInput.disabled = isLoading;
    goalDeadlineInput.disabled = isLoading;
    clearGoalFormBtn.disabled = isLoading;
}

function resetGoalForm() {
    createGoalForm.reset();
    clearMessage(createGoalMessage);
}