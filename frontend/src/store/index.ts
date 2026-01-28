import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './canvasSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for React Flow serialization
        ignoredActions: [
          'canvas/addNode',
          'canvas/updateNode',
          'canvas/setNodes',
          'canvas/setEdges',
        ],
        // Ignore these field paths in all actions
        ignoredPaths: ['canvas.nodes', 'canvas.edges'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
