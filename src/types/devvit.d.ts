declare namespace Devvit {
  interface Context {
    ui: {
      showWebview: (options: WebviewOptions) => void;
      webView: {
        postMessage: (id: string, message: any) => void;
      };
    };
    redis: {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<void>;
    };
    reddit: {
      getCurrentUser: () => Promise<RedditUser>;
    };
  }

  interface WebviewOptions {
    component: React.ComponentType;
    options?: {
      width?: string;
      height?: string;
    };
  }

  interface RedditUser {
    username: string;
    id: string;
  }

  interface WebviewMessage {
    type: string;
    data?: any;
  }
}
