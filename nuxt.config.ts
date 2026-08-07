import { ofetch } from 'ofetch'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxtjs/html-validator',
    '@vite-pwa/nuxt'
  ],

  // Déclaré ici et pas seulement dans app.vue : 200.html et 404.html sont
  // produits sans passer par le composant racine. Or 200.html est servi pour
  // toute adresse inconnue — sans `lang`, un lecteur d'écran ne sait pas dans
  // quelle langue lire la page.
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Annuaire TSA'
    }
  },

  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'https://www.annuaire-tsa.fr/api'
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // L'API tourne sur un mutualisé : trop de requêtes simultanées la font
      // échouer silencieusement et génère des pages vides.
      concurrency: 3,
      interval: 150,
      retry: 3,
      retryDelay: 1000
    }
  },

  // Les fiches praticiens / associations / départements sont rendues côté client :
  // le crawler de Nitro ne peut pas les découvrir. On interroge donc l'API au build
  // pour lui fournir la liste explicite des routes à pré-rendre (SEO).
  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) return

      const base = 'https://www.annuaire-tsa.fr/api'
      const routes: string[] = []

      try {
        const [praticiens, associations] = await Promise.all([
          ofetch<{ id: number, departement: string }[]>(`${base}/praticiens.php`),
          ofetch<{ id: number }[]>(`${base}/associations.php`)
        ])

        for (const p of praticiens) routes.push(`/praticien/${p.id}`)
        for (const a of associations) routes.push(`/association/${a.id}`)
        for (const dep of new Set(praticiens.map(p => p.departement))) {
          if (dep) routes.push(`/departement/${dep}`)
        }

        console.info(`[prerender] ${routes.length} fiches ajoutées au pré-rendu`)
      } catch (e) {
        // API injoignable : on génère le site sans les fiches plutôt que d'échouer
        console.warn('[prerender] API injoignable, fiches non pré-rendues :', e)
      }

      nitroConfig.prerender ||= {}
      nitroConfig.prerender.routes ||= []
      nitroConfig.prerender.routes.push(...routes)
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/livres': { prerender: true },
    '/cra': { prerender: true },
    '/apropos': { prerender: true },
    '/mentions': { prerender: true },
    '/couts': { prerender: true },
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

  // Embarque les SVG dans le build : sans cette liste, chaque visite déclenche
  // une requête vers api.iconify.design pour récupérer les icônes.
  icon: {
    serverBundle: {
      collections: ['lucide', 'simple-icons']
    },
    clientBundle: {
      icons: [
        'lucide:check',
        'lucide:flag',
        'lucide:link',
        'lucide:search',
        'lucide:bold',
        'lucide:italic',
        'lucide:underline',
        'lucide:align-left',
        'lucide:align-center',
        'lucide:align-right',
        'lucide:align-justify',
        'lucide:list',
        'lucide:quote',
        'simple-icons:facebook'
      ],
      scan: true,
      includeCustomCollections: true
    }
  },

  // Sans ce module, le serveur sert le robots.txt par défaut de LWS : un
  // Crawl-delay de 60 s (soit plus de cinq heures pour explorer les 335 fiches),
  // des règles pour un livre d'or inexistant, et aucune mention du sitemap.
  // Les mêmes exclusions que celles du sitemap ci-dessous.
  robots: {
    disallow: ['/admin', '/signaler']
  },

  // Vérifie le HTML produit au build. Les fiches affichent des notes saisies
  // dans Tiptap : une balise mal fermée y passerait sinon inaperçue.
  // Signale sans interrompre la génération — à nous de trier les alertes.
  htmlValidator: {
    failOnError: false,
    options: {
      rules: {
        // Les numéros viennent de la base : y insérer des espaces insécables
        // reviendrait à retoucher la donnée pour un gain purement typographique.
        'tel-non-breaking': 'off',
        // Balisage produit par l'accordéon de Nuxt UI, pas par nos gabarits.
        'prefer-native-element': 'off'
      }
    }
  },

  sitemap: {
    indexNow: {
      enabled: true,
      key: '6e19d24389e443a6af65195ef043b2f6'
    },
    sources: ['/api/__sitemap__/fiches'],
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
        // Android recadre les icônes maskable en cercle : version dédiée, au
        // symbole resserré, sinon les boucles de l'infini sont rognées.
        { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
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
