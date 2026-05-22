export function initNavigation(activePage) {
    const nav = document.querySelector("#appNav");

    if (!nav) {
        return;
    }

    const items = [
        { page: "dashboard", title: "Дашборд", href: "/dashboard.html" },
        { page: "today", title: "Сегодня", href: "/today.html" },
        { page: "tasks", title: "Задачи", href: "/tasks.html" },
        { page: "projects", title: "Проекты", href: "/projects.html" },
        { page: "habits", title: "Привычки", href: "/habits.html" },
        { page: "goals", title: "Цели", href: "/goals.html" },
        { page: "recipes", title: "Рецепты", href: "/recipes.html" },
        { id: "food-weekly-menu", label: "Меню недели", href: "/food-weekly-menu.html" }

    ];

    nav.innerHTML = items
        .map(item => `
            <a
                class="nav-link ${item.page === activePage ? "active" : ""}"
                href="${item.href}"
            >
                ${item.title}
            </a>
        `)
        .join("");
}