import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const csvPath = path.join(__dirname, '../../crm_prospects_demo.csv')

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard')
  // Clear localStorage before each test
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('upload CSV valide affiche les KPIs avec valeurs non nulles', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(csvPath)

  await expect(page.locator('[data-testid="kpi-total-pipeline"]')).toContainText('€')
  await expect(page.locator('[data-testid="kpi-active-deals"]')).not.toContainText('0')
})

test('rejet un fichier non-CSV avec message d\'erreur', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'document.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a csv file'),
  })

  await expect(page.locator('[data-testid="upload-error"]')).toContainText('CSV')
})

test('données persistées après rechargement de page', async ({ page }) => {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(csvPath)

  await expect(page.locator('[data-testid="kpi-total-pipeline"]')).toContainText('€')
  const totalBefore = await page.locator('[data-testid="kpi-total-pipeline"]').textContent()

  await page.reload()

  // Wait for Zustand rehydration from localStorage to complete
  // totalBefore is like "Pipeline total353 600 €" — wait until we see a non-zero value
  await page.waitForFunction(
    (expected) => document.querySelector('[data-testid="kpi-total-pipeline"]')?.textContent === expected,
    totalBefore,
    { timeout: 5000 }
  )
  const totalAfter = await page.locator('[data-testid="kpi-total-pipeline"]').textContent()
  expect(totalAfter).toBe(totalBefore)
})

test('remplacement complet des données au second import', async ({ page }) => {
  // First import — full CSV
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(csvPath)
  await expect(page.locator('[data-testid="kpi-total-pipeline"]')).toContainText('€')
  const firstTotal = await page.locator('[data-testid="kpi-total-pipeline"]').textContent()

  // Second import — minimal CSV with one deal
  const smallCsv = 'Task Name,Status,Montant Deal\nTest Deal,prospect,1000'
  await fileInput.setInputFiles({
    name: 'small.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(smallCsv),
  })

  await page.waitForTimeout(500)
  const secondTotal = await page.locator('[data-testid="kpi-total-pipeline"]').textContent()
  expect(firstTotal).not.toBe(secondTotal)
})

test('KPIs affichent 0 / état vide avant tout import', async ({ page }) => {
  const pipeline = page.locator('[data-testid="kpi-total-pipeline"]')
  const active = page.locator('[data-testid="kpi-active-deals"]')

  await expect(pipeline).toBeVisible()
  await expect(active).toContainText('0')
})
