export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'https://www.annuaire-tsa.fr/api'
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/livres': { prerender: true },
    '/apropos': { prerender: true },
    '/mentions': { prerender: true },
    '/contact': { prerender: true },
    '/suggerer': { prerender: true },
    '/livres/suggerer': { prerender: true },
    '/admin': { prerender: true, colorMode: 'light' },
    '/admin/login': { prerender: true, colorMode: 'light' },
    '/admin/modifier': { prerender: true, colorMode: 'light' },
    '/admin/livres': { prerender: true, colorMode: 'light' }
  },

  site: {
    url: 'https://www.annuaire-tsa.fr'
  },

  sitemap: {
    indexNow: {
      enabled: true,
      key: '6e19d24389e443a6af65195ef043b2f6'
    },
    sources: ['/api/__sitemap__/departements'],
    exclude: [
      '/admin',
      '/admin/**',
      '/signaler'
    ]
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Annuaire TSA',
      short_name: 'Annuaire TSA',
      description: 'Annuaire collaboratif de praticiens spécialisés TSA',
      theme_color: '#111827',
      background_color: '#f9fafb',
      display: 'standalone',
      start_url: '/',
      lang: 'fr',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      // Site statique multi-pages (SSG) : chaque page a son propre HTML prérendu.
      // PAS de navigateFallback vers '/' (cassait /livres et les autres pages au
      // rechargement, car le SW servait l'accueil à la place de la vraie page).
      navigateFallback: undefined,
      cleanupOutdatedCaches: true,
      // Le nouveau SW prend le contrôle immédiatement (sinon une MAJ du site
      // n'est visible qu'après fermeture de tous les onglets).
      clientsClaim: true,
      skipWaiting: true,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
