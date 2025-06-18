'use client';

import { configureStore } from '@reduxjs/toolkit';
import layoutReducer from './slices/layoutSlice';
import autosaveMiddleware from './middleware/autosaveMiddleware';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  // Only persist in production or when explicitly needed
  blacklist: typeof window === 'undefined' ? ['layout'] : [],
};

const persistedReducer = persistReducer(persistConfig, layoutReducer);

export const store = configureStore({
  reducer: {
    layout: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register', 'rehydrate'],
      },
    }).concat(autosaveMiddleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
