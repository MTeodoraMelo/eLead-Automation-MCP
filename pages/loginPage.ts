import { expect, Page, Locator } from "@playwright/test";
import { TIMEOUTS, ERROR_MESSAGES } from "../src/constants/timeouts";
import { logger } from "../src/utils/logger";

/**
 * LoginPage class representing the login functionality
 * Following the rule: Each function, module, or class should focus on a single concern
 */
export class LoginPage {
	readonly page: Page;
	readonly loginTab: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly loginButton: Locator;
	readonly errorMessage: Locator;
	readonly startShoppingButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.loginTab = page.getByRole("tab", { name: "Log in" });
		this.emailInput = page.getByRole("textbox", { name: "Email" });
		this.passwordInput = page.getByRole("textbox", { name: "Password" });
		this.loginButton = page.getByRole("button", { name: "Log in" });
		this.errorMessage = page.getByText(ERROR_MESSAGES.INVALID_LOGIN);
		this.startShoppingButton = page.getByRole("button", {
			name: "Start Shopping",
			exact: true,
		});
	}

	async goto(): Promise<void> {
		await this.page.goto("/login");
	}

	/**
	 * Conditionally closes the welcome popup if it's visible
	 * Following the rule: Implement proper error handling in async functions
	 */
	async maybeCloseWelcomePopup(): Promise<void> {
		try {
			const isVisible = await this.startShoppingButton.isVisible();
			if (isVisible) {
				await this.startShoppingButton.click();
				await expect(this.startShoppingButton).toBeHidden({
					timeout: TIMEOUTS.MEDIUM,
				});
			}
		} catch (error) {
			// Log error but don't fail the test for popup handling
			logger.warn("Welcome popup handling failed", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Performs login with provided credentials
	 * @param email - User's email address
	 * @param password - User's password
	 * @throws {Error} When login elements are not found within timeout
	 */
	async login(email: string, password: string): Promise<void> {
		await this.page.goto("/login", { waitUntil: "domcontentloaded" });
		
		// Handle welcome popup if it appears
		await this.maybeCloseWelcomePopup();
		
		await expect(this.loginTab).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
		await this.loginTab.click();
		await expect(this.emailInput).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
		await expect(this.passwordInput).toBeVisible();
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}

	/**
	 * Expects error message to be visible with proper timeout
	 * @throws {Error} When error message is not found within timeout
	 */
	async expectErrorVisible(): Promise<void> {
		await expect(this.errorMessage).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
	}

	/**
	 * Expects to remain on login page after invalid login attempt
	 * @throws {Error} When not on login page within timeout
	 */
	async expectStillOnLoginPage(): Promise<void> {
		await expect(this.loginTab).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
		await expect(this.emailInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
	}
}
