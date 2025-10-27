import { test, expect } from '@playwright/test'

// Basic smoke: login to home, then navigate across core routes and assert key text
// Adjust selectors to match your actual UI labels if they differ.

test('login -> chat -> tasks -> docs -> whiteboard -> video', async ({ page }) => {
	// Login
	await page.goto('/login')
	// Fill credentials (replace with working dev creds or use Supabase magic link in your environment)
	const email = process.env.E2E_EMAIL ?? 'alex@example.com'
	const pass = process.env.E2E_PASS ?? 'password123!'
	await page.getByLabel('Email').fill(email)
	await page.getByLabel('Password').fill(pass)
	await page.getByRole('button', { name: /sign in/i }).click()
	await page.waitForURL('**/')

	// Chat
	await page.goto('/chat')
	// Presence of channel or page header
	await expect(page.getByText(/Chat/i)).toBeVisible()
	// Send a message if input exists
	const input = page.getByPlaceholder(/Type your message/i)
	if (await input.isVisible().catch(() => false)) {
		await input.fill('E2E says hello')
		await page.keyboard.press('Enter')
		await expect(page.getByText('E2E says hello')).toBeVisible()
	}

	// Tasks
	await page.goto('/tasks')
	await expect(page.getByText(/Tasks/i)).toBeVisible()

	// Documents
	await page.goto('/documents')
	await expect(page.getByText(/Documents/i)).toBeVisible()

	// Whiteboard
	await page.goto('/whiteboard')
	await expect(page.getByText(/Whiteboard/i)).toBeVisible()

	// Video
	await page.goto('/video')
	await expect(page.getByText(/Video/i)).toBeVisible()
})
