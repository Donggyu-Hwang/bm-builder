import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import prioritiesReducer from './slices/prioritiesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    priorities: prioritiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
