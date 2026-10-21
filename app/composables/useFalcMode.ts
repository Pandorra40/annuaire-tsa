/**
 * Mode « version facile à lire » (FALC) — partagé layout ↔ pages.
 * Persistance localStorage, comme Lecture / Contraste.
 */
export function useFalcMode() {
  return useState<boolean>('falc-mode', () => false)
}
