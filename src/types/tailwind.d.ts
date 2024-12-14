declare module 'tailwind-types' {
  export type TailwindColor = {
    readonly [key: string]: string | { [key: string]: string };
  };

  export type TailwindSpacing = {
    readonly [key: string]: string;
  };

  export type TailwindBreakpoint = {
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly '2xl': string;
  };

  export type TailwindTheme = {
    readonly colors: TailwindColor;
    readonly spacing: TailwindSpacing;
    readonly screens: TailwindBreakpoint;
  };

  export type TailwindUtility = {
    readonly [key: string]: string | { [key: string]: string };
  };
}

// Extend CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Extend Tailwind classes
declare module 'tailwindcss/tailwind-config' {
  interface TailwindConfig {
    content: string[];
    theme: {
      extend: {
        colors: Record<string, string | Record<string, string>>;
        animation: Record<string, string>;
        keyframes: Record<string, Record<string, Record<string, string>>>;
        backdropFilter: Record<string, string>;
        transitionProperty: Record<string, string>;
        zIndex: Record<string, string | number>;
      };
    };
    plugins: any[];
  }
}
