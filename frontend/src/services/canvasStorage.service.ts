import { Node, Edge } from 'reactflow';

const CANVAS_STORAGE_KEY = 'bm_builder_canvas';
const NODES_KEY = 'bm_builder_nodes';
const EDGES_KEY = 'bm_builder_edges';
const VERSIONS_KEY = 'bm_builder_versions';

export interface CanvasVersion {
  timestamp: number;
  nodes: Node[];
  edges: Edge[];
  label: string;
}

export class CanvasStorageService {
  // Save current canvas state
  static saveCanvas(nodes: Node[], edges: Edge[]): void {
    try {
      const canvasData = {
        nodes,
        edges,
        timestamp: Date.now(),
      };
      localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasData));
      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
      localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }

  // Load canvas state
  static loadCanvas(): { nodes: Node[]; edges: Edge[] } | null {
    try {
      const canvasData = localStorage.getItem(CANVAS_STORAGE_KEY);
      if (!canvasData) return null;

      const parsed = JSON.parse(canvasData);
      return {
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
      };
    } catch (error) {
      console.error('Failed to load canvas:', error);
      return null;
    }
  }

  // Clear canvas data
  static clearCanvas(): void {
    localStorage.removeItem(CANVAS_STORAGE_KEY);
    localStorage.removeItem(NODES_KEY);
    localStorage.removeItem(EDGES_KEY);
  }

  // Version Management (Story 5.3)
  static saveVersion(nodes: Node[], edges: Edge[], label?: string): void {
    try {
      const versions = this.getVersions();
      const newVersion: CanvasVersion = {
        timestamp: Date.now(),
        nodes,
        edges,
        label: label || this.generateVersionLabel(versions.length + 1),
      };

      // Keep only last 10 versions
      const updatedVersions = [newVersion, ...versions].slice(0, 10);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(updatedVersions));
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  }

  static getVersions(): CanvasVersion[] {
    try {
      const versionsStr = localStorage.getItem(VERSIONS_KEY);
      return versionsStr ? JSON.parse(versionsStr) : [];
    } catch (error) {
      console.error('Failed to get versions:', error);
      return [];
    }
  }

  static restoreVersion(timestamp: number): { nodes: Node[]; edges: Edge[] } | null {
    try {
      const versions = this.getVersions();
      const version = versions.find((v) => v.timestamp === timestamp);
      if (!version) return null;

      this.saveCanvas(version.nodes, version.edges);
      return {
        nodes: version.nodes,
        edges: version.edges,
      };
    } catch (error) {
      console.error('Failed to restore version:', error);
      return null;
    }
  }

  static deleteVersion(timestamp: number): void {
    try {
      const versions = this.getVersions();
      const updatedVersions = versions.filter((v) => v.timestamp !== timestamp);
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(updatedVersions));
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  }

  private static generateVersionLabel(index: number): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `버전 ${index} - ${hours}:${minutes}`;
  }

  // Check if online
  static isOnline(): boolean {
    return navigator.onLine;
  }

  // Sync with server when coming online (Story 5.2)
  static async syncWithServer(nodes: Node[], edges: Edge[]): Promise<boolean> {
    if (!this.isOnline()) return false;

    try {
      // TODO: Implement actual server sync
      // For now, just mark as synced
      const canvasData = {
        nodes,
        edges,
        timestamp: Date.now(),
        synced: true,
      };
      localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(canvasData));
      return true;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      return false;
    }
  }
}
