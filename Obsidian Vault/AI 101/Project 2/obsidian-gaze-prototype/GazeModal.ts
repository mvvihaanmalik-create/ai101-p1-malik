import { App, Modal } from 'obsidian';
import { DIRECTORS, type DirectorId } from './directors';
import { applyFilter } from './filters';
import { playFilmWind, playShutter } from './sounds';

const MAX_DIMENSION = 1600;
const MAX_FILE_BYTES = 30 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 40_000_000;

export class GazeModal extends Modal {
  private img: HTMLImageElement | null = null;
  private sourceCanvas: HTMLCanvasElement | null = null;
  private sourceUrl: string | null = null;
  private filteredUrl: string | null = null;
  private selectedFilter: DirectorId = 'wes-anderson';
  private isShowingOriginal = false;
  private loadSequence = 0;
  private renderSequence = 0;
  private previewEl!: HTMLImageElement;
  private emptyEl!: HTMLElement;
  private actionsEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private originalButton!: HTMLButtonElement;
  private downloadButton!: HTMLButtonElement;
  private directorButtons: HTMLButtonElement[] = [];

  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    this.buildUI();
  }

  onClose(): void {
    this.loadSequence++;
    this.renderSequence++;
    this.img = null;
    this.sourceCanvas = null;
    this.sourceUrl = null;
    this.filteredUrl = null;
    this.contentEl.empty();
  }

  buildUI(): void {
    this.modalEl.addClass('gaze-modal');
    this.contentEl.empty();

    const root = this.contentEl.createDiv({ cls: 'gaze-root' });
    const header = root.createDiv({ cls: 'gaze-header' });
    header.createSpan({ cls: 'gaze-logo', text: 'gaze.' });
    const close = header.createEl('button', { cls: 'gaze-close', text: '✕', attr: { type: 'button', 'aria-label': 'Close Gaze' } });
    close.addEventListener('click', () => this.close());

    const body = root.createDiv({ cls: 'gaze-body' });
    const workspace = body.createDiv({ cls: 'gaze-workspace' });
    const dropzone = workspace.createDiv({ cls: 'gaze-dropzone', attr: { role: 'button', tabindex: '0', 'aria-label': 'Choose or drop a photo' } });
    const fileInput = workspace.createEl('input', { cls: 'gaze-file-input', attr: { type: 'file', accept: 'image/*', 'aria-label': 'Choose an image file' } });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) this.loadImage(file);
      fileInput.value = '';
    });
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
      }
    });
    this.emptyEl = dropzone.createDiv({ cls: 'gaze-empty' });
    this.emptyEl.innerHTML = '<svg class="gaze-lens" viewBox="0 0 92 92" fill="none" aria-hidden="true"><circle cx="46" cy="46" r="34"/><circle cx="46" cy="46" r="20"/><circle cx="46" cy="46" r="6"/><path d="M46 2v10M46 80v10M2 46h10M80 46h10"/></svg>';
    this.emptyEl.createDiv({ cls: 'gaze-empty-title', text: 'Drop a photo or click to upload' });
    this.emptyEl.createDiv({ cls: 'gaze-empty-detail', text: 'One image. Four ways to see it.' });
    this.previewEl = dropzone.createEl('img', { cls: 'gaze-preview', attr: { alt: 'Image preview' } });
    this.previewEl.hidden = true;

    // Handle drops anywhere inside the modal; highlight the central dropzone.
    this.modalEl.addEventListener('dragover', event => {
      if (!event.dataTransfer?.types.includes('Files')) return;
      event.preventDefault();
      dropzone.addClass('is-drag-over');
    });
    this.modalEl.addEventListener('dragleave', event => {
      if (!this.modalEl.contains(event.relatedTarget as Node | null)) dropzone.removeClass('is-drag-over');
    });
    this.modalEl.addEventListener('drop', event => {
      if (!event.dataTransfer?.files.length) return;
      event.preventDefault();
      event.stopPropagation();
      dropzone.removeClass('is-drag-over');
      this.loadImage(event.dataTransfer.files[0]!);
    });

    this.statusEl = workspace.createDiv({ cls: 'gaze-status', attr: { role: 'status', 'aria-live': 'polite' } });
    this.statusEl.setText('Choose an image to begin.');
    this.actionsEl = workspace.createDiv({ cls: 'gaze-actions' });
    this.actionsEl.hidden = true;
    this.originalButton = this.actionsEl.createEl('button', { cls: 'gaze-action gaze-secondary', text: 'Show original', attr: { type: 'button', 'aria-pressed': 'false' } });
    this.originalButton.addEventListener('click', () => this.toggleOriginal());
    this.downloadButton = this.actionsEl.createEl('button', { cls: 'gaze-action gaze-primary', text: 'Download →', attr: { type: 'button' } });
    this.downloadButton.addEventListener('click', () => this.download());

    const directors = body.createDiv({ cls: 'gaze-directors' });
    directors.createDiv({ cls: 'gaze-eyebrow', text: 'THE DIRECTORS' });
    directors.createEl('h2', { text: 'Choose a gaze.' });
    this.directorButtons = DIRECTORS.map(director => {
      const button = directors.createEl('button', { cls: 'gaze-dir-btn', attr: { type: 'button', 'aria-pressed': String(this.selectedFilter === director.id) } });
      button.style.setProperty('--director-accent', director.accent);
      button.createSpan({ cls: 'gaze-dir-dot', attr: { 'aria-hidden': 'true' } });
      const text = button.createSpan({ cls: 'gaze-dir-copy' });
      text.createSpan({ cls: 'gaze-dir-name', text: director.name });
      text.createSpan({ cls: 'gaze-dir-tagline', text: director.tagline });
      button.toggleClass('is-active', this.selectedFilter === director.id);
      button.addEventListener('click', () => {
        this.selectedFilter = director.id;
        this.updateDirectorState();
        if (this.sourceCanvas) this.renderFiltered();
      });
      return button;
    });
  }

  private updateDirectorState(): void {
    this.directorButtons.forEach((button, index) => {
      const active = DIRECTORS[index]?.id === this.selectedFilter;
      button.toggleClass('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  private setStatus(message: string, error = false): void {
    this.statusEl.setText(message);
    this.statusEl.toggleClass('is-error', error);
  }

  loadImage(file: File): void {
    const ticket = ++this.loadSequence;
    this.renderSequence++;
    this.img = null;
    this.sourceCanvas = null;
    this.sourceUrl = null;
    this.filteredUrl = null;
    this.previewEl.hidden = true;
    this.emptyEl.hidden = false;
    this.actionsEl.hidden = true;

    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      this.setStatus('SVG is not supported. Choose a raster image such as PNG or JPEG.', true);
      return;
    }
    if (file.type && !file.type.startsWith('image/')) {
      this.setStatus('That file is not an image.', true);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.setStatus('Image is too large. Choose one under 30 MB.', true);
      return;
    }

    this.setStatus(`Opening ${file.name}…`);
    playFilmWind();
    const reader = new FileReader();
    reader.onerror = () => {
      if (ticket === this.loadSequence) this.setStatus('Could not read that file.', true);
    };
    reader.onload = () => {
      if (ticket !== this.loadSequence || typeof reader.result !== 'string') return;
      const image = new Image();
      image.onerror = () => {
        if (ticket === this.loadSequence) this.setStatus('This image format could not be opened.', true);
      };
      image.onload = () => {
        if (ticket !== this.loadSequence) return;
        if (image.naturalWidth * image.naturalHeight > MAX_SOURCE_PIXELS) {
          this.setStatus('Image dimensions are too large. Choose one below 40 megapixels.', true);
          return;
        }
        try {
          this.img = image;
          this.buildSourceCanvas();
          this.renderFiltered();
        } catch (error) {
          this.setStatus(error instanceof Error ? error.message : 'Could not process that image.', true);
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  buildSourceCanvas(): void {
    if (!this.img?.naturalWidth || !this.img.naturalHeight) throw new Error('The image has no usable dimensions.');
    const scale = Math.min(1, MAX_DIMENSION / Math.max(this.img.naturalWidth, this.img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(this.img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(this.img.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D is unavailable.');
    context.drawImage(this.img, 0, 0, canvas.width, canvas.height);
    this.sourceCanvas = canvas;
    this.sourceUrl = canvas.toDataURL('image/png');
  }

  renderFiltered(): void {
    if (!this.sourceCanvas) return;
    const ticket = ++this.renderSequence;
    this.filteredUrl = null;
    this.isShowingOriginal = false;
    this.originalButton.setText('Show original');
    this.originalButton.setAttribute('aria-pressed', 'false');
    this.downloadButton.disabled = true;
    this.setStatus('Developing the frame…');
    requestAnimationFrame(() => {
      if (ticket !== this.renderSequence || !this.sourceCanvas) return;
      try {
        const filtered = applyFilter(this.sourceCanvas, this.selectedFilter);
        this.filteredUrl = filtered.toDataURL('image/png');
        this.previewEl.src = this.filteredUrl;
        this.previewEl.hidden = false;
        this.emptyEl.hidden = true;
        this.actionsEl.hidden = false;
        this.downloadButton.disabled = false;
        this.setStatus(`${filtered.width} × ${filtered.height} PNG ready.`);
        playShutter();
      } catch (error) {
        this.filteredUrl = null;
        this.previewEl.hidden = true;
        this.emptyEl.hidden = false;
        this.actionsEl.hidden = true;
        this.downloadButton.disabled = true;
        this.setStatus(error instanceof Error ? error.message : 'Could not render this grade.', true);
      }
    });
  }

  private toggleOriginal(): void {
    if (!this.sourceUrl || !this.filteredUrl) return;
    this.isShowingOriginal = !this.isShowingOriginal;
    this.previewEl.src = this.isShowingOriginal ? this.sourceUrl : this.filteredUrl;
    this.originalButton.setText(this.isShowingOriginal ? 'Show grade' : 'Show original');
    this.originalButton.setAttribute('aria-pressed', String(this.isShowingOriginal));
  }

  download(): void {
    if (!this.filteredUrl) return;
    const link = document.createElement('a');
    link.href = this.filteredUrl;
    link.download = `gaze-${this.selectedFilter}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
