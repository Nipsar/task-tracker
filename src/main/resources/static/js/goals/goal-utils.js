export function calculateGoalProgress(doneTasks, totalTasks) {
    if (totalTasks === 0) {
        return 0;
    }

    return Math.round((doneTasks / totalTasks) * 100);
}

export function buildGoalViewModel(goal, tasks, projects) {
    const goalTasks = tasks.filter(task => task.goalId === goal.id);

    const totalTasks = goal.totalTasks ?? goalTasks.length;
    const doneTasks = goal.doneTasks ?? goalTasks.filter(task => task.status === "DONE").length;

    const progressPercent = goal.progressPercent ?? calculateGoalProgress(doneTasks, totalTasks);

    return {
        ...goal,
        projectTitle: getProjectTitleById(projects, goal.projectId),
        totalTasks,
        doneTasks,
        progressPercent,
        tasks: goalTasks
    };
}

export function getProjectTitleById(projects, projectId) {
    const project = projects.find(project => project.id === projectId);
    return project ? project.title : "Проект не найден";
}

export function filterGoals(goals, query, selectedFilter) {
    return goals
        .filter(goal => !query || goal.title.toLowerCase().includes(query))
        .filter(goal => {
            if (selectedFilter === "ALL") return true;
            if (selectedFilter === "ACTIVE") return goal.totalTasks > 0 && goal.progressPercent < 100;
            if (selectedFilter === "DONE") return goal.progressPercent === 100;
            if (selectedFilter === "EMPTY") return goal.totalTasks === 0;

            return true;
        });
}

export function sortGoals(a, b) {
    if (a.progressPercent !== b.progressPercent) {
        return a.progressPercent - b.progressPercent;
    }

    return a.title.localeCompare(b.title, "ru");
}