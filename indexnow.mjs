const KEY = '6e19d24389e443a6af65195ef043b2f6'
const HOST = 'www.annuaire-tsa.fr'

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/suggerer`,
  `https://${HOST}/livres`,
  `https://${HOST}/livres/suggerer`,
  `https://${HOST}/apropos`,
  `https://${HOST}/contact`,
  `https://${HOST}/mentions`,
  `https://${HOST}/departement/93`
]

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls })
})

console.log(`IndexNow → ${res.status} ${res.statusText}`)
if (res.status === 200 || res.status === 202) console.log(`✅ ${urls.length} URLs soumises à Bing`)
else console.log('⚠️ Réponse inattendue')
