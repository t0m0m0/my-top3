import { test, expect } from '@playwright/test'

// Mock all API routes to avoid dependency on real API keys.
// CI uses dummy API keys, so unmocked requests would fail.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { items: [], totalItems: 0 } }),
    }),
  )
})

test('search page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/すきコレ/)
})

test('tab switching works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: /音楽/ }).click()
  await expect(page.getByRole('tab', { name: /音楽/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
