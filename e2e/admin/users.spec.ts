import { test, expect } from "@playwright/test"
import { adminUser } from "../auth/admin.setup"

test.describe("Admin User List", () => {
  test.use({ storageState: adminUser })

  test("displays user list with correct columns", async ({ page }) => {
    await page.goto("/admin/users")

    // Check page title
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible()

    // Verify table headers
    const expectedHeaders = ["Name", "Email", "Role", "Status", "Clearance", "Last Active"]
    for (const header of expectedHeaders) {
      await expect(page.getByRole("columnheader", { name: header })).toBeVisible()
    }

    // Check that the table has rows (header + at least 1 row)
    const rowCount = await page.getByRole("row").count()
    expect(rowCount).toBeGreaterThanOrEqual(2)

    // Test search functionality
    const searchInput = page.getByPlaceholder("Filter users...")
    await searchInput.fill("test")
    const filteredRowCount = await page.getByRole("row").count()
    expect(filteredRowCount).toBeGreaterThanOrEqual(1)

    // Test row actions
    const actionsButton = page.getByRole("button", { name: "Open menu" }).first()
    await actionsButton.click()
    
    // Verify dropdown menu items
    const expectedActions = ["Copy user ID", "View details", "Edit user", "Deactivate user"]
    for (const action of expectedActions) {
      await expect(page.getByRole("menuitem", { name: action })).toBeVisible()
    }
  })

  test("handles empty state correctly", async ({ page }) => {
    await page.goto("/admin/users")
    
    // Enter a search term that should yield no results
    const searchInput = page.getByPlaceholder("Filter users...")
    await searchInput.fill("nonexistentuser12345")

    // Check for empty state message
    await expect(page.getByText("No results.")).toBeVisible()
  })

  test("pagination works correctly", async ({ page }) => {
    await page.goto("/admin/users")

    // Check initial state of pagination buttons
    const previousButton = page.getByRole("button", { name: "Previous" })
    const nextButton = page.getByRole("button", { name: "Next" })

    // Previous should be disabled on first page
    await expect(previousButton).toBeDisabled()

    // Click next if it's enabled (meaning there are more pages)
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      // Previous should now be enabled
      await expect(previousButton).toBeEnabled()
    }
  })
}) 