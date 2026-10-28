import { test, expect } from "@playwright/test";

test.describe("Window Drag & Boundaries E2E", () => {
  test("drags window smoothly without snapping to top or jumping like a magnet", async ({
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

    // 1. Open Terminal app
    await page.getByTestId("dock-icon-terminal").click();
    const windowTerminal = page.getByTestId("window-terminal");
    await expect(windowTerminal).toBeVisible();

    const titlebar = page.getByTestId("window-titlebar-terminal");
    const boxBefore = await windowTerminal.boundingBox();
    expect(boxBefore).not.toBeNull();
    const initialY = boxBefore!.y;
    const initialX = boxBefore!.x;

    // 2. Drag window titlebar down by 100px and right by 80px
    const titlebarBox = await titlebar.boundingBox();
    expect(titlebarBox).not.toBeNull();

    await page.mouse.move(
      titlebarBox!.x + titlebarBox!.width / 2,
      titlebarBox!.y + titlebarBox!.height / 2
    );
    await page.mouse.down();

    // Move mouse progressively
    await page.mouse.move(
      titlebarBox!.x + titlebarBox!.width / 2 + 80,
      titlebarBox!.y + titlebarBox!.height / 2 + 100,
      { steps: 10 }
    );

    // Verify window is NOT stuck at y = 0 during drag
    const boxDuring = await windowTerminal.boundingBox();
    expect(boxDuring!.y).toBeGreaterThan(initialY + 50);

    // Release mouse
    await page.mouse.up();

    // Verify window bounds after drag
    const boxAfter = await windowTerminal.boundingBox();
    expect(boxAfter!.y).toBeCloseTo(initialY + 100, -1);
    expect(boxAfter!.x).toBeCloseTo(initialX + 80, -1);
  });
});
