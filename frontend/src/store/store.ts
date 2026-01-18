import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import welcomeReducer from './slices/welcomeSlice';
import prioritiesReducer from './slices/prioritiesSlice';
import googleDriveReducer from './slices/googleDriveSlice';
import fileScanReducer from './slices/fileScanSlice';
import embeddedDocumentsReducer from './slices/embeddedDocumentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    welcome: welcomeReducer,
    priorities: prioritiesReducer,
    googleDrive: googleDriveReducer,
    fileScan: fileScanReducer,
    embeddedDocuments: embeddedDocumentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/checkAuth/fulfilled', 'auth/logoutUser/fulfilled'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
