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
    },

    getGoals() {
        return requestJson("/api/goals");
    },

    createGoal(payload) {
        return requestJson("/api/goals", {
            method: "POST",
            body: payload
        });
    }
};