import { expect, type Locator, type Page } from '@playwright/test';
import { waitForSave } from '../test-utils';

export class SongEditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly bpmInput: Locator;
  readonly timeSignatureBeatsInput: Locator;
  readonly timeSignatureValueSelect: Locator;
  readonly addSectionButton: Locator;
  readonly sectionNameInput: Locator;
  readonly measuresInput: Locator;
  readonly removeSectionButton: Locator;
  readonly addGridButton: Locator;
  readonly grid: Locator;
  readonly kickRow: Locator;
  readonly symbolPicker: Locator;
  readonly playButton: Locator;
  readonly activeStep: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('input[placeholder="Song Title"]');
    this.bpmInput = page.getByTestId('bpm-input');
    this.timeSignatureBeatsInput = page.getByTestId('time-signature-beats');
    this.timeSignatureValueSelect = page.getByTestId('time-signature-value');

    this.addSectionButton = page.locator('text=Add New Section');
    this.sectionNameInput = page.locator('input[placeholder="Section Name"]');
    this.measuresInput = page.getByTestId('song-editor-measures-input');
    this.removeSectionButton = page.locator('button[title="Remove Section"]');

    this.addGridButton = page.locator('text=+ ADD GRID');
    this.grid = page.getByTestId('groove-grid');
    this.kickRow = page.getByTestId('instrument-row-kick');
    this.symbolPicker = page.getByTestId('symbol-picker');

    this.playButton = page.locator('button', { hasText: /Play|Stop|Loading/i }).first();
    this.activeStep = page.getByTestId('active-step').first();
  }

  async createNewSongFromLibrary() {
    await expect(this.page.getByTestId('create-new-button')).toHaveText(/New song/i, {
      timeout: 15000,
    });
    await this.page.getByTestId('create-new-button').click();
    await expect(this.page).toHaveURL(/\/songs\//);
  }

  async fillMetadata(title: string, bpm: string, beats: string, value: string) {
    await this.titleInput.fill(title);
    await this.bpmInput.fill(bpm);
    await this.timeSignatureBeatsInput.fill(beats);
    await this.timeSignatureValueSelect.selectOption(value);
    await this.waitForSave();
  }

  async verifyMetadata(title: string, bpm: string, beats: string, value: string) {
    await expect(this.titleInput).toHaveValue(title);
    await expect(this.bpmInput).toHaveValue(bpm);
    await expect(this.timeSignatureBeatsInput).toHaveValue(beats);
    await expect(this.timeSignatureValueSelect).toHaveValue(value);
  }

  async addSection(name: string, measures: string) {
    await this.addSectionButton.click();
    await expect(this.sectionNameInput).toBeVisible();
    await this.sectionNameInput.fill(name);
    await this.measuresInput.fill(measures);
    await this.waitForSave();
  }

  async removeSection() {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.removeSectionButton.click();
    await expect(this.sectionNameInput).not.toBeVisible();
    await this.waitForSave();
  }

  async addGrid() {
    await this.addGridButton.click();
    await expect(this.grid).toBeVisible();
  }

  async getCell(row: Locator, index: number) {
    return row.getByTestId('note-cell').nth(index);
  }

  async toggleNote(cell: Locator) {
    await cell.click();
    await expect(cell.getByTestId('note-cell-icon')).toBeVisible({ timeout: 10000 });
  }

  async openSymbolPicker(cell: Locator) {
    await cell.click({ button: 'right' });
    await expect(this.symbolPicker).toBeVisible({ timeout: 10000 });
  }

  async selectSymbol(label: string) {
    await this.symbolPicker.locator(`button[aria-label="${label}"]`).click({ force: true });
  }

  async setVelocity(type: string) {
    const btn = this.symbolPicker.getByTestId(`velocity-btn-${type.toLowerCase()}`);
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click({ force: true });
  }

  async closeSymbolPicker() {
    await this.symbolPicker.locator('button', { hasText: 'Done' }).click({ force: true });
    await expect(this.symbolPicker).not.toBeVisible();
  }

  async togglePlayback() {
    const isPlaying = (await this.playButton.textContent()) === 'Stop';
    await this.playButton.click();
    if (isPlaying) {
      await expect(this.playButton).toHaveText(/Play/i);
    } else {
      await expect(this.playButton).toHaveText(/Stop/i);
    }
  }

  async waitForSave() {
    await waitForSave(this.page);
  }
}
