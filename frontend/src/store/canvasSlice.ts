import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { SEVEN_STAGES_NODE_TYPES } from '../config/nodeTypes';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  progressiveDisclosure: {
    unlockedStages: number[];
    showAll: boolean;
  };
}

const initialState: CanvasState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  progressiveDisclosure: {
    unlockedStages: [1, 2, 3],
    showAll: false,
  },
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action: PayloadAction<Node>) => {
      const index = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = action.payload;
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      state.edges = state.edges.filter(
        (e) => e.source !== action.payload && e.target !== action.payload
      );
    },
    addEdge: (state, action: PayloadAction<Edge>) => {
      state.edges.push(action.payload);
    },
    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((e) => e.id !== action.payload);
    },
    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNode = action.payload;
    },
    unlockStage: (state, action: PayloadAction<number>) => {
      const stage = action.payload;
      if (!state.progressiveDisclosure.unlockedStages.includes(stage)) {
        state.progressiveDisclosure.unlockedStages.push(stage);
      }
    },
    unlockAllStages: (state) => {
      state.progressiveDisclosure.showAll = true;
      state.progressiveDisclosure.unlockedStages = [1, 2, 3, 4, 5, 6, 7];
    },
    resetProgressiveDisclosure: (state) => {
      state.progressiveDisclosure = {
        unlockedStages: [1, 2, 3],
        showAll: false,
      };
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
  },
});

export const {
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  deleteEdge,
  setSelectedNode,
  unlockStage,
  unlockAllStages,
  resetProgressiveDisclosure,
  setNodes,
  setEdges,
} = canvasSlice.actions;

export default canvasSlice.reducer;
