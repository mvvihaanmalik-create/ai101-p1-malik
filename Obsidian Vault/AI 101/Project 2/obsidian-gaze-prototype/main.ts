import { Plugin } from 'obsidian';
import { GazeModal } from './GazeModal';

export default class GazePlugin extends Plugin {
  async onload(): Promise<void> {
    this.addCommand({
      id: 'open-gaze',
      name: 'Open',
      callback: () => new GazeModal(this.app).open(),
    });

    this.addRibbonIcon('camera', 'Gaze', () => new GazeModal(this.app).open());
  }
}
