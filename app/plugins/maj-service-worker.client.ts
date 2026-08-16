export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return

  // Un onglet sans service worker actif est une première visite : le
  // recharger au premier contrôle ferait une boucle inutile. On ne réagit
  // qu'aux changements de contrôleur sur un onglet déjà actif — le cas d'une
  // mise à jour déployée pendant que l'onglet était resté ouvert.
  const avaitDejaUnControleur = !!navigator.serviceWorker.controller
  let rechargementDeclenche = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!avaitDejaUnControleur || rechargementDeclenche) return
    rechargementDeclenche = true
    window.location.reload()
  })
})
