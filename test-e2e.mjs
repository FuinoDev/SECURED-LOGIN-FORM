import { chromium } from 'playwright'

const email = `e2e${Date.now()}@example.com`
const password = 'SecureTestPass123!'
const name = 'E2E User'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

try {
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' })
  await page.fill('input[name="name"]', name)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.fill('input[name="confirmPassword"]', password)
  await page.click('button[type="submit"]')

  await page.waitForSelector('[role="alert"]', { timeout: 10000 })
  const registerAlert = await page.locator('[role="alert"]').first().textContent()
  console.log('REGISTER_ALERT:', registerAlert?.slice(0, 100))

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForURL('**/dashboard', { timeout: 10000 })
  console.log('LOGIN_URL:', page.url())

  const dashboardText = await page.locator('.dashboard-value').first().textContent()
  console.log('DASHBOARD_EMAIL:', dashboardText)
} catch (error) {
  console.error('E2E_FAILED:', error.message)
  process.exitCode = 1
} finally {
  await browser.close()
}
