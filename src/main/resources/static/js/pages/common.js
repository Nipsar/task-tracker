export function initNavigation(activePage) {
    const nav = document.querySelector("#appNav");

    if (!nav) {
        return;
    }

    const items = [
        { page: "dashboard", title: "Дашборд", href: "/dashboard.html" },
        { page: "tasks", title: "Задачи", href: "/tasks.html" },
        { page: "projects", title: "Проекты", href: "/projects.html" },
        { page: "habits", title: "Привычки", href: "/habits.html" }
    ];

    nav.innerHTML = items.map(item => `
        <a class="nav-link ${item.page === activePage ? "active" : ""}" href="${item.href}">
            ${item.title}
        </a>
    `).join("");
}
