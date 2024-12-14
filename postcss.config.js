module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': false
      }
    },
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', { 
              discardComments: { removeAll: true },
              reduceIdents: false,
              normalizeWhitespace: false
            }],
          },
        }
      : {})
  },
}
