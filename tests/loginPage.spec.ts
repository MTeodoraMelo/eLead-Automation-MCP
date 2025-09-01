import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { LoginPage } from "../pages/loginPage";
import { TestDataFactory } from "../src/utils/test-data-factory";

test.describe("LoginPage functionality", () => {
	test("should display login form when navigating to login page", async ({
		page,
	}) => {
		// Arrange - Setup page object
		const loginPage = new LoginPage(page);

		// Act - Navigate to login page
		await loginPage.goto();

		// Assert - Verify login form elements are visible
		await expect(page.getByRole("tab", { name: "Log in" })).toBeVisible();
		await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
		await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
		await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
	});

	test("should show error message for invalid credentials", async ({
		page,
	}) => {
		// Arrange - Setup page objects and test data
		const home = new HomePage(page);
		const loginPage = new LoginPage(page);
		const invalidCredentials = TestDataFactory.generateInvalidLoginData();

		// Act - Navigate to login and attempt invalid login
		await home.goto();
		await home.maybeValidateAndCloseWelcomePopup();
		await home.clickLoginHeader();
		await loginPage.login(
			invalidCredentials.email,
			invalidCredentials.password
		);

		// Assert - Verify error message is displayed
		await loginPage.expectErrorVisible();
	});

	test("should handle login form interaction correctly", async ({ page }) => {
		// Arrange - Setup page object and test data
		const loginPage = new LoginPage(page);
		const testCredentials = TestDataFactory.generateUserLoginData();

		// Act - Fill login form with test data
		await loginPage.goto();
		await page
			.getByRole("textbox", { name: "Email" })
			.fill(testCredentials.email);
		await page
			.getByRole("textbox", { name: "Password" })
			.fill(testCredentials.password);

		// Assert - Verify form fields contain the entered values
		await expect(page.getByRole("textbox", { name: "Email" })).toHaveValue(
			testCredentials.email
		);
		await expect(page.getByRole("textbox", { name: "Password" })).toHaveValue(
			testCredentials.password
		);
	});
});
