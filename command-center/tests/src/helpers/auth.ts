import { type Page } from "@playwright/test";

let _counter = Date.now();

export function uniqueEmail(): string {
  return `testuser_${_counter++}@example.com`;
}

export async function registerAndLogin(
  page: Page,
  name = "Test User",
  email = uniqueEmail(),
  password = "password123",
): Promise<{ name: string; email: string; password: string }> {
  await page.goto("/register");
  await page.getByTestId("input-name").fill(name);
  await page.getByTestId("input-email").fill(email);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("button-register").click();
  await page.waitForURL("**/dashboard");
  return { name, email, password };
}
