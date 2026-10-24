(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("darkMode");
    } catch {}

    const applyPreferredTheme = () => {
        const enabled = savedTheme === "enabled" || (savedTheme !== "disabled" && systemTheme.matches);
        root.classList.toggle("dark-mode", enabled);
    };

    applyPreferredTheme();

    const initialize = () => {
        const toggle = document.getElementById("dark-mode-toggle");

        if (toggle) {
            const updateToggle = () => {
                const enabled = root.classList.contains("dark-mode");
                const label = enabled ? "Use light theme" : "Use dark theme";
                toggle.setAttribute("aria-pressed", String(enabled));
                toggle.setAttribute("aria-label", label);
                toggle.title = label;
            };

            toggle.hidden = false;
            applyPreferredTheme();
            updateToggle();

            toggle.addEventListener("click", () => {
                const enabled = root.classList.toggle("dark-mode");
                savedTheme = enabled ? "enabled" : "disabled";
                updateToggle();

                try {
                    localStorage.setItem("darkMode", savedTheme);
                } catch {}
            });

            systemTheme.addEventListener("change", () => {
                if (savedTheme !== "enabled" && savedTheme !== "disabled") {
                    applyPreferredTheme();
                    updateToggle();
                }
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

        const inquiryTitle = document.querySelector("[data-inquiry-title]");

        if (inquiryTitle) {
            const description = document.querySelector("[data-inquiry-description]");
            const clear = document.querySelector("[data-inquiry-clear]");
            const message = document.getElementById("inquiry-message");
            const copy = document.querySelector("[data-inquiry-copy]");
            const status = document.querySelector("[data-inquiry-status]");
            const contact = document.getElementById("contact");
            const defaultTitle = inquiryTitle.textContent;
            const defaultDescription = description.textContent;
            const defaultMessage = message.value;
            const drafts = new Map();
            let activeCourse;
            const courseTitles = new Map([...document.querySelectorAll(".course-row")].map(course => [
                course.id,
                course.querySelector("h3").textContent.trim(),
            ]));

            const restoreInquiry = () => {
                const url = new URL(window.location.href);
                const course = url.searchParams.get("course");
                const title = courseTitles.get(course);
                const selection = title ? course : null;
                inquiryTitle.textContent = title ? `Let's discuss ${title}.` : defaultTitle;
                description.textContent = title ? "Let's discuss your audience, goals, and preferred format for this course." : defaultDescription;
                if (activeCourse !== selection) {
                    if (activeCourse !== undefined) drafts.set(activeCourse, message.value);
                    message.value = drafts.has(selection) ? drafts.get(selection) : title ? `Hi Gustav,\n\nI'm interested in ${title}. Could we discuss the audience, format, and availability?\n\nThanks!` : defaultMessage;
                    activeCourse = selection;
                    status.textContent = "";
                }
                clear.hidden = !title;
                url.searchParams.delete("course");
                url.hash = "contact";
                clear.href = url.href;
            };

            document.querySelectorAll("[data-course-inquiry], [data-inquiry-clear]").forEach(link => {
                link.addEventListener("click", event => {
                    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                    const url = new URL(window.location.href);
                    const course = new URL(link.href).searchParams.get("course");
                    if (courseTitles.has(course)) url.searchParams.set("course", course);
                    else url.searchParams.delete("course");
                    url.hash = "contact";

                    try {
                        history.pushState(null, "", url);
                    } catch {
                        return;
                    }

                    event.preventDefault();
                    restoreInquiry();
                    contact.scrollIntoView({ block: "start" });
                    inquiryTitle.focus({ preventScroll: true });
                });
            });

            copy.hidden = false;
            copy.addEventListener("click", async () => {
                if (!message.value.trim()) {
                    message.focus();
                    status.textContent = "Inquiry message is empty.";
                    return;
                }

                copy.disabled = true;
                try {
                    await navigator.clipboard.writeText(message.value);
                    status.textContent = "Inquiry copied.";
                } catch {
                    message.focus();
                    message.select();
                    status.textContent = "Clipboard unavailable. Inquiry selected.";
                } finally {
                    copy.disabled = false;
                }
            });

            message.addEventListener("input", () => {
                status.textContent = "";
            });

            window.addEventListener("popstate", restoreInquiry);
            restoreInquiry();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
