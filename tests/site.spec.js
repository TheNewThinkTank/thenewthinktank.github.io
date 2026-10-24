const { test, expect } = require("@playwright/test");

const catalog = "/html/catalog.html";
const inquiry = page => page.getByRole("textbox", { name: "Your inquiry" });
const courseLink = (page, course) => page.locator(`#${course} [data-course-inquiry]`);

test("publishes the confirmed course duration, languages and group sizes", async ({ page }) => {
    await page.goto(catalog);
    await expect(page.locator(".delivery-note")).toContainText("2\u20138 hours");
    await expect(page.locator(".delivery-note")).toContainText("Danish and/or English");
    await expect(page.locator(".delivery-note")).toContainText("Any group size");
    await page.getByText("What about timing and pricing?", { exact: true }).click();
    const answer = page.locator(".faq details[open]");
    await expect(answer).toContainText("2\u20138 hours");
    await expect(answer).toContainText("Danish and/or English");
    await expect(answer).toContainText("any group size");
});

test("retains separate course and general drafts through history navigation", async ({ page }) => {
    await page.goto(catalog);
    await inquiry(page).fill("My general inquiry.");
    await courseLink(page, "ai-for-everyone").click();
    await inquiry(page).fill("My edited AI inquiry.");
    await courseLink(page, "aws-solutions-architecture").click();
    await inquiry(page).fill("My edited AWS inquiry.");

    await page.goBack();
    await expect(inquiry(page)).toHaveValue("My edited AI inquiry.");
    await page.goForward();
    await expect(inquiry(page)).toHaveValue("My edited AWS inquiry.");
    await page.getByRole("link", { name: "General inquiry", exact: true }).click();
    await expect(inquiry(page)).toHaveValue("My general inquiry.");
    await page.goBack();
    await expect(inquiry(page)).toHaveValue("My edited AWS inquiry.");
    await courseLink(page, "ai-for-everyone").click();
    await expect(inquiry(page)).toHaveValue("My edited AI inquiry.");
});

test("keeps intentionally empty drafts instead of restoring a template", async ({ page }) => {
    await page.goto(`${catalog}?course=ai-for-everyone#contact`);
    await inquiry(page).fill("");
    await courseLink(page, "programming-with-python").click();
    await expect(inquiry(page)).toHaveValue(/Programming with Python/);
    await courseLink(page, "ai-for-everyone").click();
    await expect(inquiry(page)).toHaveValue("");
});

test("preserves edited drafts and other query parameters while filtering", async ({ page }) => {
    await page.goto(`${catalog}?source=smoke-test`);
    await courseLink(page, "aws-solutions-architecture").click();
    await inquiry(page).fill("An AWS inquiry that should survive filtering.");
    await page.locator(".course-filters").getByText("Python", { exact: true }).click();
    await expect(inquiry(page)).toHaveValue("An AWS inquiry that should survive filtering.");
    const url = new URL(page.url());
    expect(url.searchParams.get("course")).toBe("aws-solutions-architecture");
    expect(url.searchParams.get("topic")).toBe("python");
    expect(url.searchParams.get("source")).toBe("smoke-test");
});

test("filters every topic and supports keyboard radio navigation", async ({ page }) => {
    await page.goto(catalog);
    const filters = page.locator(".course-filters");
    const topics = [
        ["AI", "ai"],
        ["Python", "python"],
        ["Cloud", "cloud"],
        ["DevOps", "devops"],
        ["Kubernetes", "kubernetes"],
    ];
    for (const [label, topic] of topics) {
        await filters.getByText(label, { exact: true }).click();
        await expect(page.locator(".course-row:visible")).toHaveCount(1);
        await expect(page.locator(".course-row:visible")).toHaveAttribute("data-topic", topic);
        await expect(page.locator("[data-course-count]")).toHaveText("1 course");
        expect(new URL(page.url()).searchParams.get("topic")).toBe(topic);
    }
    await filters.getByText("All topics", { exact: true }).click();
    await expect(page.locator(".course-row:visible")).toHaveCount(5);
    await expect(page.locator("[data-course-count]")).toHaveText("5 courses");
    expect(new URL(page.url()).searchParams.has("topic")).toBe(false);
    await page.getByRole("radio", { name: "AI", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Python", exact: true })).toBeChecked();
    await expect(page.locator(".course-row:visible")).toHaveAttribute("data-topic", "python");
});

test("follows system themes until a manual preference is saved", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await expect(page.locator("#dark-mode-toggle")).toHaveAttribute("aria-pressed", "true");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await page.locator("#dark-mode-toggle").click();
    await page.goto(catalog);
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await expect(page.locator("#dark-mode-toggle")).toHaveAttribute("aria-label", "Use dark theme");
    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await page.locator("#dark-mode-toggle").click();
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/html/profile.html");
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
});

test("allows a stable manual theme when browser storage is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
            configurable: true,
            get() { throw new DOMException("Storage blocked", "SecurityError"); },
        });
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark-mode/);
    await page.locator("#dark-mode-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).not.toHaveClass(/dark-mode/);
    await expect(page.locator("#dark-mode-toggle")).toHaveAttribute("aria-pressed", "false");
});

test("copies the edited inquiry and clears stale copy feedback", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {
                async writeText(value) { window.__copiedInquiry = value; },
            },
        });
    });
    await page.goto(`${catalog}?course=ai-for-everyone#contact`);
    const message = "Hi Gustav,\n\nMy edited inquiry, with <literal> text.";
    await inquiry(page).fill(message);
    await page.getByRole("button", { name: "Copy inquiry" }).click();
    await expect(page.locator("[data-inquiry-status]")).toHaveText("Inquiry copied.");
    expect(await page.evaluate(() => window.__copiedInquiry)).toBe(message);
    await expect(page.getByRole("button", { name: "Copy inquiry" })).toBeEnabled();
    await inquiry(page).fill("An updated draft.");
    await expect(page.locator("[data-inquiry-status]")).toBeEmpty();
});

test("selects the message when copying fails and rejects blank drafts", async ({ page }) => {
    await page.addInitScript(() => {
        window.__clipboardAttempts = 0;
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: {
                async writeText() {
                    window.__clipboardAttempts += 1;
                    throw new DOMException("Clipboard blocked", "NotAllowedError");
                },
            },
        });
    });
    await page.goto(`${catalog}?course=ai-for-everyone#contact`);
    await page.getByRole("button", { name: "Copy inquiry" }).click();
    await expect(page.locator("[data-inquiry-status]")).toHaveText("Clipboard unavailable. Inquiry selected.");
    await expect(inquiry(page)).toBeFocused();
    expect(await inquiry(page).evaluate(message => message.selectionStart === 0 && message.selectionEnd === message.value.length)).toBe(true);
    await expect(page.getByRole("button", { name: "Copy inquiry" })).toBeEnabled();
    await inquiry(page).fill(" \n ");
    await page.getByRole("button", { name: "Copy inquiry" }).click();
    await expect(page.locator("[data-inquiry-status]")).toHaveText("Inquiry message is empty.");
    expect(await page.evaluate(() => window.__clipboardAttempts)).toBe(1);
});

test("rejects unknown course identifiers without rendering URL content", async ({ page }) => {
    for (const course of ["unknown", "__proto__", '<img src=x onerror="window.__inquiryInjected=true">']) {
        await page.goto(`${catalog}?course=${encodeURIComponent(course)}#contact`);
        await expect(page.locator("[data-inquiry-title]")).toHaveText("Let's shape the right session.");
        await expect(page.locator("[data-inquiry-clear]")).toBeHidden();
        expect(await page.evaluate(() => Boolean(window.__inquiryInjected))).toBe(false);
        expect(await inquiry(page).inputValue()).not.toContain(course);
    }
});

for (const width of [320, 375, 1440]) {
    test(`shows every complete default inquiry at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(catalog);
        await page.evaluate(async () => { await document.fonts.ready; });
        const courses = await page.locator(".course-row").evaluateAll(rows => rows.map(row => row.id));
        for (const course of courses) {
            await courseLink(page, course).click();
            await expect(inquiry(page)).toHaveValue(/Thanks!$/);
            const dimensions = await inquiry(page).evaluate(message => ({
                scrollHeight: message.scrollHeight,
                clientHeight: message.clientHeight,
            }));
            expect(dimensions.scrollHeight, course).toBeLessThanOrEqual(dimensions.clientHeight + 1);
            expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
        }
    });
}

test("has consistent page-specific sharing metadata and a valid preview image", async ({ page, request }) => {
    for (const path of ["/", catalog, "/html/profile.html"]) {
        await page.goto(path);
        const title = await page.title();
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
        await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
        await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://thenewthinktank.github.io${path}`);
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://thenewthinktank.github.io${path}`);
        for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
            await expect(page.locator(selector)).toHaveAttribute("content", "https://thenewthinktank.github.io/img/social-preview.jpg");
        }
    }
    const image = await request.get("/img/social-preview.jpg");
    expect(image.ok()).toBe(true);
    expect(image.headers()["content-type"]).toMatch(/^image\/jpeg/);
    expect(await page.evaluate(async () => {
        const image = new Image();
        image.src = "/img/social-preview.jpg";
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
    })).toEqual({ width: 1200, height: 630 });
});

test.describe("Without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("retains course content, native disclosures and contact links", async ({ page }) => {
        await page.goto(catalog);
        await expect(page.locator(".course-row:visible")).toHaveCount(5);
        await expect(page.locator("[data-course-filters]")).toBeHidden();
        await expect(page.getByRole("button", { name: "Copy inquiry" })).toBeHidden();
        await expect(inquiry(page)).toBeEditable();
        await page.locator("#programming-with-python summary").click();
        await expect(page.locator("#programming-with-python details")).toHaveAttribute("open", "");
        await courseLink(page, "programming-with-python").click();
        expect(new URL(page.url()).searchParams.get("course")).toBe("programming-with-python");
        await expect(page.getByRole("link", { name: "Open LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/gustav-collin-rasmussen/");
    });
});
