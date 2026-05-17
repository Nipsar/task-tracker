async function requestJson(path, options = {}) {
    const { method = "GET", body } = options;

    const response = await fetch(path, {
        method,
        headers: body === undefined
            ? undefined
            : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const api = {
    getTasks() {
        return requestJson("/api/tasks");
    },

    createTask(payload) {
        return requestJson("/api/tasks", {
            method: "POST",
            body: payload
        });
    },

    updateTaskStatus(taskId, status) {
        return requestJson(`/api/tasks/${taskId}/status`, {
            method: "PATCH",
            body: { status }
        });
    },

    deleteTask(taskId) {
        return requestJson(`/api/tasks/${taskId}`, {
            method: "DELETE"
        });
    },

    getProjects() {
        return requestJson("/api/projects");
    },

    createProject(payload) {
        return requestJson("/api/projects", {
            method: "POST",
            body: payload
        });
    },

    getHabits() {
        return requestJson("/api/habits");
    },

    createHabit(payload) {
        return requestJson("/api/habits", {
            method: "POST",
            body: payload
        });
    },

    completeHabit(habitId) {
        return requestJson(`/api/habits/${habitId}/complete`, {
            method: "POST"
        });
    }

    export async function getGoals() {
        const response = await fetch("/api/goals");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки целей: HTTP ${response.status}`);
        }

        return response.json();
    }

    export async function createGoal(payload) {
        const response = await fetch("/api/goals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(responseText || `Ошибка создания цели: HTTP ${response.status}`);
        }

        return response.json();
    }
};
