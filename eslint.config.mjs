// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    name: 'annuaire-tsa/mise-en-forme-des-gabarits',
    rules: {
      // Ces règles viennent du préréglage de @nuxt/eslint et décrivent une façon
      // d'écrire les gabarits Vue que ce projet n'a jamais suivie : un attribut
      // par ligne, un retour à la ligne autour de chaque contenu, une indentation
      // imposée. Elles produisaient 1928 des 2074 problèmes signalés, noyant les
      // 137 qui portent sur le code lui-même — `pnpm lint` en devenait
      // inutilisable, donc plus personne ne le lançait.
      //
      // Les appliquer aurait réécrit chaque fichier .vue du projet sans changer
      // une ligne de comportement. On désactive plutôt le bruit, pour que le
      // lint redevienne un outil qui signale des choses vraies : des `any`
      // laissés en place, des variables mortes, un v-html à surveiller.
      //
      // Rien ici ne concerne la sécurité ni la correction du code.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attributes-order': 'off'
    }
  }
)
