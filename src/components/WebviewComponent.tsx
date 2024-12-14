import { useState, useEffect } from 'react';
import { useWebView, useRedis } from '@devvit/public-api';

export const WebviewComponent = () => {
  const { postMessage, onMessage } = useWebView();
  const [state, setState] = useState({ initialized: false });

  useEffect(() => {
    // Handle messages from webview
    onMessage((msg) => {
      console.log('Received from webview:', msg);
      // Handle different message types
      switch (msg.type) {
        case 'INIT_REQUEST':
          postMessage({
            type: 'INIT_RESPONSE',
            data: { initialized: true }
          });
          break;
        // Add more message handlers as needed
      }
    });
  }, []);

  return (
    <webview
      url="/webroot/index.html"
      width="100%"
      height="100%"
    />
  );
};
