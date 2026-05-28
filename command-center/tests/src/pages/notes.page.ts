import { type Page, type Locator } from "@playwright/test";

export class NotesPage {
  readonly page: Page;
  readonly newNoteButton: Locator;
  readonly noteTitleInput: Locator;
  readonly noteContentInput: Locator;
  readonly saveNoteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newNoteButton = page.getByTestId("button-new-note");
    this.noteTitleInput = page.getByTestId("input-note-title");
    this.noteContentInput = page.getByTestId("input-note-content");
    this.saveNoteButton = page.getByTestId("button-save-note");
  }

  async goto() {
    await this.page.goto("/notes");
  }

  async createNote(title: string, content: string) {
    await this.newNoteButton.click();
    await this.noteTitleInput.fill(title);
    await this.noteContentInput.fill(content);
    await this.saveNoteButton.click();
  }

  noteCard(id: string | number) {
    return this.page.getByTestId(`note-card-${id}`);
  }

  deleteButton(id: string | number) {
    return this.page.getByTestId(`button-delete-note-${id}`);
  }

  async getFirstNoteId(): Promise<string> {
    const card = this.page.locator("[data-testid^='note-card-']").first();
    const testId = await card.getAttribute("data-testid");
    return testId!.replace("note-card-", "");
  }
}
