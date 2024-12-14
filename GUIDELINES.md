# Guidance for Building Interactive Experiences on Reddit through the Devvit Platform

## Known Limitations

### CSS/JS Requirements
- ❌ No inline CSS or JavaScript
- ✅ Use separate `.css` and `.js` files

### Mobile Gestures
- ❌ Complex gestures may conflict with the Reddit app
- ✅ Use simple interactions and avoid scrolling (e.g. `overflow: none`)
- 🔄 Fix coming soon

### Asset Versioning
- ❌ Assets affect all versions when updated (including in a playtest)
- ✅ Use separate apps for development/production
- 🔄 Fix coming soon

### Forms
- ❌ No direct form submissions
- ✅ Use JavaScript to handle form data
- ✅ Send data via `postMessage`

## Best Practices

### File Organization
- Keep all web files in the `webroot/` directory
- Use separate files for HTML, CSS, and JavaScript
- Consider using a bundler for larger applications

### State Management
- Use `localStorage` for webview-only state
- Use Redis storage (via Devvit) for persistent data
- Minimize state synchronization between webview and Devvit

### Performance
- Add a "Launch App" button to prevent UI flashing
- Use local storage to cache data when possible
- Create a compelling preview within Blocks
- Prevent scaling the viewport:
  ```html
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  ```

## Communication Between Devvit and Webviews

Webviews allow you to build custom UIs with HTML/CSS/JS while accessing Devvit's backend services (Redis, fetch, scheduler, triggers) via message passing between the two contexts.

### Sample Webview Post

#### From Devvit to Webview
```typescript
// In main.tsx
context.ui.webView.postMessage('myWebView', {
  type: 'updateData',
  data: { count: 42 },
});
```

#### In Webroot App.js
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'devvit-message') {
    const { message } = event.data;
    console.log('Received from Devvit:', message);
  }
});
```

#### From Webview to Devvit
```javascript
// In webroot/app.js
window.parent.postMessage({
  type: 'userAction',
  data: { clicked: true }
}, '*');
```

#### In main.tsx
```typescript
<webview
  id="myWebView"
  url="page.html"
  onMessage={(msg) => {
    console.log('Received from webview:', msg);
  }}
/>
```

## How Apps Work

Devvit apps are designed to interact with Reddit communities.

### App Accounts
When you upload an app, an app account is automatically created. This is a separate user account your app uses to interact with a subreddit.

Once a mod or admin installs your app, the app account will appear as a user in the mod list. Actions executed by the app will be tracked through the app's user account.

### App Permissions
App permissions inform users how your app will interact with a subreddit and users.

| **Category** | **Description** | **Capabilities Involved** |
|--------------|-----------------|---------------------------|
| UI | Permissions your app needs for UI elements. | Menu actions, custom posts, asset uses. |
| User Data Handling | Permissions needed to manage user data. | App settings, key-value store, HTTP fetch, media, Redis, Reddit API. |
| Moderator Permissions (required) | Permission needed to create a mod account with full permissions. | Required for every app. |

### App Versions
When you update your app, every subreddit that has installed your app needs to be manually updated to the new version.

**To update your subreddit app installation:**
1. Go to **My Communities** from the profile dropdown in the Developer Portal.
2. Click the community you want to view.
3. If a new version is available, you will see a blue **Update** button next to the app tile. Click the button and follow the prompts to upgrade each community.

## Understanding Client-side Apps

Client-side apps run on the user's device instead of a remote server, increasing speed and responsiveness while providing a better user experience. Devvit apps operate similarly to client-side applications (browser extensions, HTML5 games, etc.). When a user visits an interactive post with a running Devvit app, the bundled source code is transmitted for optimal performance.

### What is Available to the Client
- App source code
- Anything stored in state (e.g., `useState`)

### What is Not Available to the Client
- Server side plugins (outside of state) like data from Redis, secrets, and settings.
- Fetch calls to external services from within an app.

*Note: We are currently working on mechanisms to split your code into server-side portions (hidden) and client-side portions (exposed).*

## Development Stages

Devvit apps transition through three stages during development, allowing you to build and iterate until ready for sharing.

| **Stage** | **Description** |
|-----------|-----------------|
| Private | Only visible to you, installable in small subreddits with fewer than 200 subscribers. |
| Unlisted | Visible only to you in the Apps directory; can be installed on larger subreddits. |
| Public | Once you submit your app review form and it's approved, your app is visible to all users. |

## Local, Webview-only State

Webviews do not have direct access to Devvit's services such as Redis, real-time, and scheduler. All server-side communication must be handled through message passing between the webview and Devvit contexts.
