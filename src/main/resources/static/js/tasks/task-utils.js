export function getProjectTitleById(projects, projectId) {
    const project = projects.find(item => item.id === projectId);
    return project ? project.title : "Проект не найден";
}

export function sortTasks(a, b) {
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

export function filterTasks(tasks, query, selectedStatus) {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks
        .filter(task => {
            if (selectedStatus === "ALL") {
                return task.status !== "DONE";
            }

            return task.status === selectedStatus;
        })
        .filter(task => !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery))
        .sort(sortTasks);
}
