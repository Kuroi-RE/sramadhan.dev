import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  defaultBrowserType: "chromium",
});

test.describe("Mobile iOS Layout E2E", () => {
  test("unlocks lockscreen, opens terminal, runs help, closes via home indicator, and tests banner persistence", async ({
    page,
  }) => {
    // 1. Visit root -> Boot Screen
    await page.goto("/");
    await expect(page.getByTestId("os-root")).toBeVisible({ timeout: 15000 });

    // 2. Lock screen appears
    const lockScreen = page.getByTestId("lock-screen");
    await expect(lockScreen).toBeVisible({ timeout: 10000 });

    // 3. Unlock by clicking unlock button
    const unlockBtn = page.getByTestId("lock-submit-button");
    await unlockBtn.click();

    // 4. Welcome screen finishes -> Mobile root
    await expect(page.getByTestId("mobile-root")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId("mobile-status-bar")).toBeVisible();
    await expect(page.getByTestId("mobile-dock")).toBeVisible();

    // 5. Check desktop advisory banner is present
    const banner = page.getByTestId("desktop-banner");
    await expect(banner).toBeVisible();

    // 6. Dismiss banner
    const dismissBtn = page.getByTestId("dismiss-banner-btn");
    await dismissBtn.click();
    await expect(banner).not.toBeVisible();

    // 7. Open Terminal app from home screen icon
    const terminalIcon = page.getByTestId("mobile-app-icon-terminal");
    await terminalIcon.click();

    // Fullscreen app modal opens
    const fullscreenApp = page.getByTestId("mobile-fullscreen-app-terminal");
    await expect(fullscreenApp).toBeVisible();

    // 8. Run 'help' command in terminal
    const terminalInput = page.getByTestId("terminal-input");
    await terminalInput.fill("help");
    await terminalInput.press("Enter");

    // Output should contain help commands
    await expect(page.getByTestId("terminal-container")).toContainText("help");
    await expect(page.getByTestId("terminal-container")).toContainText("about");

    // 9. Close app using iOS home indicator
    const homeIndicator = page.getByTestId("mobile-home-indicator");
    await homeIndicator.click();
    await expect(fullscreenApp).not.toBeVisible();

    // 10. Reload and verify banner persistence
    await page.reload();
    await expect(page.getByTestId("lock-screen")).toBeVisible({
      timeout: 10000,
    });
    const reloadUnlockBtn = page.getByTestId("lock-submit-button");
    await reloadUnlockBtn.click();

    await expect(page.getByTestId("mobile-root")).toBeVisible({
      timeout: 10000,
    });

    // Banner should NOT appear after reload since it was saved to localStorage
    await expect(page.getByTestId("desktop-banner")).not.toBeVisible();
  });
});
