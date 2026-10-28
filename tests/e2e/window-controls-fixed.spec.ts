import { test, expect } from "@playwright/test";

test.describe("Window Controls Fixed Position E2E", () => {
  test("ensures window titlebar controls (close, minimize, maximize) stay fixed and accessible when application content is scrolled", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("lock-screen")).toBeVisible({
      timeout: 15000,
    });
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("desktop-screen")).toBeVisible({
      timeout: 8000,
    });

    // 1. Open Settings app
    await page.getByTestId("dock-icon-settings").click();
    const windowSettings = page.getByTestId("window-settings");
    await expect(windowSettings).toBeVisible();

    const titlebar = page.getByTestId("window-titlebar-settings");
    const closeBtn = page.getByTestId("window-close-settings");
    const minimizeBtn = page.getByTestId("window-minimize-settings");
    const maximizeBtn = page.getByTestId("window-maximize-settings");

    await expect(titlebar).toBeVisible();
    await expect(closeBtn).toBeVisible();
    await expect(minimizeBtn).toBeVisible();
    await expect(maximizeBtn).toBeVisible();

    const titlebarBoxBefore = await titlebar.boundingBox();
    expect(titlebarBoxBefore).not.toBeNull();

    // 2. Perform deep scroll inside Settings app content
    const settingsApp = page.getByTestId("settings-app");
    await settingsApp.hover();
    await page.mouse.wheel(0, 800);

    // 3. Verify titlebar and controls retain exact vertical position
    const titlebarBoxAfter = await titlebar.boundingBox();
    expect(titlebarBoxAfter).not.toBeNull();
    expect(titlebarBoxAfter!.y).toBe(titlebarBoxBefore!.y);
    expect(titlebarBoxAfter!.x).toBe(titlebarBoxBefore!.x);

    await expect(closeBtn).toBeVisible();
    await expect(minimizeBtn).toBeVisible();

    // 4. Test minimize works after scrolling
    await minimizeBtn.click();
    await expect(windowSettings).not.toBeVisible();

    // 5. Restore Settings from dock
    await page.getByTestId("dock-icon-settings").click();
    await expect(windowSettings).toBeVisible();

    // 6. Test close works after scrolling
    await closeBtn.click();
    await expect(windowSettings).not.toBeVisible();
  });
});
