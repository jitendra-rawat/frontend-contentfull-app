'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { initContentfulSDK } from './lib/contentful-sdk';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    initContentfulSDK();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div>
          <h1>Contentful Layout Editor</h1>
          <p>This app is designed to be embedded in Contentful as a fullscreen app.</p>
          <p>Navigate to /editor to access the layout editor.</p>
        </div>
      </PersistGate>
    </Provider>
  );
}
