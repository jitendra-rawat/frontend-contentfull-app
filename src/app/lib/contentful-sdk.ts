import { init } from '@contentful/app-sdk';

export function initContentfulSDK() {
  if (typeof window !== 'undefined') {
    // Check if we're in a Contentful iframe by looking for Contentful-specific properties
    const isInContentful = isContentfulEnvironment();
    
    if (isInContentful) {
      try {
        init((sdk) => {
          (window as any).sdk = sdk;
          console.log('Contentful SDK initialized successfully');
        });
      } catch (error) {
        console.log('Contentful SDK initialization failed:', error);
        createMockSDK();
      }
    } else {
      console.log('Running outside Contentful - using mock SDK');
      createMockSDK();
    }
  }
}

function isContentfulEnvironment(): boolean {
  // Check if we're in a Contentful iframe
  try {
    // Method 1: Check if we're in an iframe
    if (window.self !== window.top) {
      // We're in an iframe, check if it's Contentful
      const parentOrigin = window.location.origin;
      const isContentfulDomain = parentOrigin.includes('contentful.com') || 
                                parentOrigin.includes('contentful.app') ||
                                parentOrigin.includes('contentful.dev');
      
      if (isContentfulDomain) {
        return true;
      }
    }
    
    // Method 2: Check for Contentful-specific URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('space') || urlParams.has('environment')) {
      return true;
    }
    
    // Method 3: Check for Contentful-specific environment variables or properties
    if ((window as any).contentful || (window as any).__CONTENTFUL__) {
      return true;
    }
    
    // Method 4: Check if we're being accessed directly (not in iframe)
    // If we're accessing the app directly via URL, we're not in Contentful
    const isDirectAccess = window.location.pathname === '/editor' && 
                          !window.location.search.includes('space');
    
    return !isDirectAccess;
    
  } catch (error) {
    console.log('Error detecting Contentful environment:', error);
    return false;
  }
}

function createMockSDK() {
  let mockValue: any = [];
  
  // Create a comprehensive mock SDK for development
  (window as any).sdk = {
    field: {
      getValue: () => {
        console.log('Mock: Getting field value:', mockValue);
        return mockValue;
      },
      setValue: (value: any) => {
        console.log('Mock: Setting field value to:', value);
        mockValue = value;
        return Promise.resolve();
      },
      onValueChanged: (callback: (value: any) => void) => {
        console.log('Mock: Value change listener registered');
        return () => console.log('Mock: Value change listener removed');
      },
    },
    window: {
      startAutoResizer: () => {
        console.log('Mock: Auto resizer started');
      },
      stopAutoResizer: () => {
        console.log('Mock: Auto resizer stopped');
      },
    },
    entry: {
      getSys: () => {
        console.log('Mock: Getting entry sys');
        return { id: 'mock-entry-id', version: 1 };
      },
      onSysChanged: (callback: (sys: any) => void) => {
        console.log('Mock: Sys change listener registered');
        return () => console.log('Mock: Sys change listener removed');
      },
    },
    space: {
      getEntry: (id: string) => {
        console.log('Mock: Getting entry:', id);
        return Promise.resolve({ sys: { id }, fields: {} });
      },
    },
    notifier: {
      success: (message: string) => {
        console.log('Mock Success:', message);
        // Show notification for visibility in both dev and production
        showNotification('Success', message, 'success');
      },
      error: (message: string) => {
        console.log('Mock Error:', message);
        showNotification('Error', message, 'error');
      },
      warning: (message: string) => {
        console.log('Mock Warning:', message);
        showNotification('Warning', message, 'warning');
      },
    },
  };
}

function showNotification(title: string, message: string, type: 'success' | 'error' | 'warning') {
  // Create a simple notification for when not in Contentful
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  switch (type) {
    case 'success':
      notification.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      break;
    case 'error':
      notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
      break;
    case 'warning':
      notification.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      break;
  }
  
  notification.innerHTML = `
    <div style="font-size: 14px; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 12px; opacity: 0.9;">${message}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}
