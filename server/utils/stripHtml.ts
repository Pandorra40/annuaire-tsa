/**
 * Retire les balises HTML d'un champ texte plat, sans regex `/<[^>]*>/`
 * (CodeQL : js/incomplete-multi-character-sanitization + ReDoS).
 * Un `<` suivi d'une lettre ou de `/` ouvre une balise jusqu'au `>` ;
 * les `<`/`>` orphelins sont écartés (ex. « âge < 18 » → « âge  18 »).
 */
export function stripHtmlTags(input: string): string {
  const s = String(input)
  const out: string[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]!
    if (c === '<' && i + 1 < s.length && /[A-Za-z/]/.test(s[i + 1]!)) {
      const close = s.indexOf('>', i + 1)
      if (close === -1) {
        i += 1
        continue
      }
      i = close + 1
      continue
    }
    if (c === '<' || c === '>') {
      i += 1
      continue
    }
    out.push(c)
    i += 1
  }
  return out.join('')
}

/** Comme stripHtmlTags + trim ; null/undefined restent null ; '' → null. */
export function stripHtmlField(value: unknown): string | null {
  if (value == null) return null
  const s = stripHtmlTags(String(value)).trim()
  return s === '' ? null : s
}
