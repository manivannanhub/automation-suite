import { test, expect } from "@playwright/test";
import { NotesPage } from "./pages/notes.page";
import { registerAndLogin } from "./helpers/auth";

test.describe("Notes", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
    // Clear localStorage notes before each test
    await page.goto("/notes");
    await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter((k) => k.includes("note"));
      keys.forEach((k) => localStorage.removeItem(k));
    });
    await page.reload();
  });

  test("creates a new note", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Meeting recap", "Discussed Q3 goals and next steps.");
    await expect(page.getByText("Meeting recap")).toBeVisible();
  });

  test("created note shows content preview", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Shopping list", "Milk, eggs, bread");
    await expect(page.getByText(/Milk, eggs, bread/i)).toBeVisible();
  });

  test("creates multiple notes", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Note One", "Content one");
    await notes.createNote("Note Two", "Content two");

    await expect(page.getByText("Note One")).toBeVisible();
    await expect(page.getByText("Note Two")).toBeVisible();
  });

  test("deletes a note", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Temporary note", "This will be deleted");

    const id = await notes.getFirstNoteId();
    await notes.deleteButton(id).click();
    await page.waitForTimeout(300);

    await expect(notes.noteCard(id)).not.toBeVisible();
  });

  test("edits a note", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Draft title", "Draft content");

    const id = await notes.getFirstNoteId();
    await notes.noteCard(id).click();

    await notes.noteTitleInput.clear();
    await notes.noteTitleInput.fill("Updated title");
    await notes.noteContentInput.clear();
    await notes.noteContentInput.fill("Updated content");
    await notes.saveNoteButton.click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Updated title")).toBeVisible();
  });

  test("notes persist after page reload", async ({ page }) => {
    const notes = new NotesPage(page);
    await notes.createNote("Persistent note", "Still here after reload");
    await page.reload();
    await expect(page.getByText("Persistent note")).toBeVisible();
  });
});
