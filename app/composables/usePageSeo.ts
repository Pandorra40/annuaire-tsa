import type { MaybeRefOrGetter } from 'vue'

const SITE = 'https://www.annuaire-tsa.fr'
const OG_IMAGE = `${SITE}/img/og-image.png`

/**
 * Title + description + Open Graph + canonical www alignés.
 * Remplace les useSeoMeta épars pour éviter le titre OG global d'app.vue.
 */
export function usePageSeo(opts: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string | undefined>
  robots?: MaybeRefOrGetter<string | undefined>
  ogImage?: MaybeRefOrGetter<string | undefined>
  noindex?: MaybeRefOrGetter<boolean | undefined>
}) {
  const route = useRoute()

  const title = computed(() => toValue(opts.title))
  const description = computed(() => toValue(opts.description))

  const path = computed(() => {
    const brut = opts.path !== undefined ? toValue(opts.path) : route.path
    if (!brut || brut === '/') return '/'
    return brut.replace(/\/+$/, '') || '/'
  })

  const canonical = computed(() =>
    path.value === '/' ? `${SITE}/` : `${SITE}${path.value}`
  )

  const robots = computed(() => {
    if (toValue(opts.noindex)) return 'noindex, nofollow'
    return toValue(opts.robots)
      || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  })

  const ogImage = computed(() => toValue(opts.ogImage) || OG_IMAGE)

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    robots
  })

  useHead({
    link: computed(() => [{ rel: 'canonical', href: canonical.value }])
  })
}
