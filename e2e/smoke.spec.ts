import { test, expect } from '@playwright/test'

test('search page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/My No.1s/)
})

test('tab switching works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: /Music/ }).click()
  await expect(page.getByRole('tab', { name: /Music/ })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
