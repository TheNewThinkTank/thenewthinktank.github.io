(() => {
    const root = document.documentElement;
    const toggle = document.getElementById("dark-mode-toggle");
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("darkMode");
    } catch {}

    root.classList.toggle("dark-mode", savedTheme === "enabled");

    if (toggle) {
        const updateToggle = () => {
            const enabled = root.classList.contains("dark-mode");
            const label = enabled ? "Use light theme" : "Use dark theme";
            toggle.setAttribute("aria-pressed", String(enabled));
            toggle.setAttribute("aria-label", label);
            toggle.title = label;
        };

        toggle.hidden = false;
        updateToggle();

        toggle.addEventListener("click", () => {
            const enabled = root.classList.toggle("dark-mode");
            updateToggle();

            try {
                localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
            } catch {}
        });
    }

    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = String(new Date().getFullYear());
    });

    const filters = document.querySelector("[data-course-filters]");

    if (filters) {
        const inputs = [...filters.querySelectorAll("input")];
        const courses = [...document.querySelectorAll("[data-topic]")];
        const count = document.querySelector("[data-course-count]");
        const topics = new Set(inputs.map(input => input.value));

        const applyFilter = (topic, updateUrl = false) => {
            let visibleCount = 0;

            courses.forEach(course => {
                const visible = topic === "all" || course.dataset.topic === topic;
                course.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            inputs.forEach(input => {
                input.checked = input.value === topic;
            });

            count.textContent = `${visibleCount} ${visibleCount === 1 ? "course" : "courses"}`;

            if (updateUrl) {
                const url = new URL(window.location.href);
                if (topic === "all") url.searchParams.delete("topic");
                else url.searchParams.set("topic", topic);

                try {
                    history.replaceState(null, "", url);
                } catch {}
            }
        };

        const restoreFilter = () => {
            const topic = new URL(window.location.href).searchParams.get("topic");
            applyFilter(topics.has(topic) ? topic : "all");
        };

        filters.addEventListener("change", event => {
            if (event.target instanceof HTMLInputElement && topics.has(event.target.value)) {
                applyFilter(event.target.value, true);
            }
        });

        window.addEventListener("popstate", restoreFilter);
        restoreFilter();
        filters.hidden = false;
    }
})();
