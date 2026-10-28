import { test, expect } from "@playwright/test";

test.describe("OS Flow E2E: Boot -> Lock -> Welcome -> Desktop -> Window Manager & Dock", () => {
  test("walks through complete OS lifecycle and window management", async ({
    page,
  }) => {
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
    page.on("console", (msg) =>
      console.log("PAGE LOG:", msg.type(), msg.text())
    );

    // 1. Visit root -> Boot Screen
    await page.goto("/");
    await expect(page.getByTestId("os-root")).toBeVisible({ timeout: 15000 });

    // 2. Boot finishes -> Lock Screen
    const lockScreen = page.getByTestId("lock-screen");
    await expect(lockScreen).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("lock-user-name")).toContainText(
      "Satria Ramadhan"
    );

    // 3. Press Enter on Lock Screen (no password needed) -> Welcome Screen
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("welcome-screen")).toBeVisible({
      timeout: 5000,
    });

    // 5. Welcome screen finishes -> Desktop
    await expect(page.getByTestId("desktop-screen")).toBeVisible({
      timeout: 6000,
    });
    await expect(page.getByTestId("dock-container")).toBeVisible();

    // 6. Dock interaction: Open Terminal App
    const terminalDockIcon = page.getByTestId("dock-icon-terminal");
    await terminalDockIcon.click();
    await expect(page.getByTestId("window-terminal")).toBeVisible();
    await expect(page.getByTestId("dock-running-dot-terminal")).toBeVisible();

    // 7. Minimize Terminal from Dock
    await terminalDockIcon.click();
    await expect(page.getByTestId("window-terminal")).not.toBeVisible();
    await expect(page.getByTestId("dock-running-dot-terminal")).toBeVisible();

    // 8. Restore Terminal from Dock
    await terminalDockIcon.click();
    await expect(page.getByTestId("window-terminal")).toBeVisible();

    // 9. Close Terminal via Window traffic light button
    const closeBtn = page.getByTestId("window-close-terminal");
    await closeBtn.click();
    await expect(page.getByTestId("window-terminal")).not.toBeVisible();
    await expect(
      page.getByTestId("dock-running-dot-terminal")
    ).not.toBeVisible();

    // 10. Test Lock button -> back to Lock screen
    const lockButton = page.getByTestId("desktop-lock-button");
    await lockButton.click();
    await expect(page.getByTestId("lock-screen")).toBeVisible();
  });
});
