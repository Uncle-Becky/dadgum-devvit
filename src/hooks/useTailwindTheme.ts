import { useEffect, useState } from 'react';

type ThemeColors = {
  [key: string]: string | ThemeColors;
};

export const useTailwindTheme = () => {
  const [colors, setColors] = useState<ThemeColors>({});

  useEffect(() => {
    // Extract colors from Tailwind CSS variables
    const extractColors = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const cssVars = Array.from(document.styleSheets)
        .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
        .reduce((acc: ThemeColors, sheet) => {
          try {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
                const vars = rule.style.cssText.match(/--[^:]+: [^;]+/g) || [];
                vars.forEach(v => {
                  const [name, value] = v.split(': ').map(s => s.trim());
                  if (name.startsWith('--tw-')) {
                    const key = name.replace('--tw-', '');
                    acc[key] = value;
                  }
                });
              }
            });
          } catch (e) {
            console.warn('Error accessing stylesheet rules:', e);
          }
          return acc;
        }, {});

      setColors(cssVars);
    };

    extractColors();
    
    // Re-extract colors when theme changes
    const observer = new MutationObserver(extractColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, []);

  return colors;
};
