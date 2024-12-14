import { Devvit } from '@devvit/public-api';
import { WebviewComponent } from './components/WebviewComponent';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  label: 'Launch Interactive Experience',
  location: 'subreddit',
  onPress: async (context, event) => {
    // Show the webview when menu item is pressed
    context.ui.showWebview({ 
      component: WebviewComponent,
      options: {
        width: '100%',
        height: '80vh',
      }
    });
  },
});

export default Devvit;
