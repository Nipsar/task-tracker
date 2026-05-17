import { buildMetrics } from "./metrics.js";

export function renderDashboard(tasks) {
    const metrics = buildMetrics(tasks);

    setText("totalTasks", metrics.total);
    setText("donePercent", `${metrics.donePercent}%`);
    setText("doneDetails", `${metrics.done} из ${metrics.total || 0} задач завершены`);
    setText("overdueTasks", metrics.overdue);
    setText("nearestDeadline", metrics.nearestDeadlineLabel);
    setText("nearestDeadlineNote", metrics.nearestDeadlineNote);

    renderStatusDonut(metrics.statusCounts, metrics.total);
    renderDeadlineBars(metrics.deadlineBuckets);
    renderActivityChart(metrics.activityLast7Days);
}

function renderStatusDonut(statusCounts, total) {
    const donut = document.getElementById("statusDonut");
    const donutTotal = document.getElementById("donutTotal");
    const legend = document.getElementById("statusLegend");

    if (!donut || !donutTotal || !legend) {
        return;
    }

    donutTotal.textContent = total;

    if (total === 0) {
        donut.style.background = "conic-gradient(#e5e7eb 0 100%)";
        legend.innerHTML = buildLegendItem("NEW", 0) + buildLegendItem("IN_PROGRESS", 0) + buildLegendItem("DONE", 0);
        return;
    }

    const newCount = statusCounts.NEW || 0;
    const progressCount = statusCounts.IN_PROGRESS || 0;
    const doneCount = statusCounts.DONE || 0;

    const newPart = (newCount / total) * 100;
    const progressPart = (progressCount / total) * 100;

    donut.style.background = `conic-gradient(
        var(--accent-blue) 0 ${newPart}%,
        var(--accent-orange) ${newPart}% ${newPart + progressPart}%,
        var(--accent-green) ${newPart + progressPart}% 100%
    )`;

    legend.innerHTML = [
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
    const container = document.getElementById("deadlineBars");

    if (!container) {
        return;
    }

    const max = Math.max(1, ...buckets.map(item => item.value));

    container.innerHTML = buckets.map(bucket => {
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
    const container = document.getElementById("activityChart");

    if (!container) {
        return;
    }

    const max = Math.max(1, ...days.map(day => day.value));

    container.innerHTML = `
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

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}
