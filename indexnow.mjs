const KEY = '6e19d24389e443a6af65195ef043b2f6'
const HOST = 'www.annuaire-tsa.fr'

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/apropos`,
  `https://${HOST}/cra`,
  `https://${HOST}/associations`,
  `https://${HOST}/ressources/livres`,
  `https://${HOST}/ressources/videos`,
  `https://${HOST}/contact`,
  `https://${HOST}/mentions`,
  `https://${HOST}/remerciements`,
  `https://${HOST}/donnees-praticiens`,
  `https://${HOST}/llms.txt`
]

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls })
})

console.log(`IndexNow → ${res.status} ${res.statusText}`)
if (res.status === 200 || res.status === 202) console.log(`✅ ${urls.length} URLs soumises à Bing`)
else console.log('⚠️ Réponse inattendue')
