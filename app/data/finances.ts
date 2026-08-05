// Coûts du site, affichés sur /couts.
//
// Données statiques : deux ou trois mouvements par an ne justifient ni table
// SQL ni page d'admin. Même choix que app/data/cra.ts.
//
// Deux montants par ligne récurrente, parce que la première année a bénéficié
// d'une remise de bienvenue : n'afficher que le montant payé laisserait croire
// qu'héberger un site coûte 18 € par an, ce qui est faux dès le renouvellement.

export const ANNEE = 2026

export interface FraisRecurrent {
  libelle: string
  detail: string
  /** Réellement déboursé la première année, remises déduites. */
  paye: number
  /** Tarif plein appliqué aux années suivantes. */
  renouvellement: number
}

export interface FraisPonctuel {
  libelle: string
  detail: string
  montant: number
}

export interface Brique {
  libelle: string
  usage: string
  /** Qui paie réellement — c'est tout le propos de la page. */
  finance: string
}

/** Ce qui revient chaque année tant que le site existe. */
export const FRAIS_RECURRENTS: FraisRecurrent[] = [
  {
    libelle: 'Hébergement mutualisé',
    detail: 'LWS, formule Perso — serveur en France, base MySQL, certificat inclus. Remise de bienvenue de 63 % la première année.',
    paye: 17.88,
    renouvellement: 47.88
  },
  {
    libelle: 'Nom de domaine annuaire-tsa.fr',
    detail: 'Offert la première année avec l\'hébergement.',
    paye: 0,
    renouvellement: 6.99
  }
]

/** Engagé une seule fois. Séparé du récurrent, sinon le coût annuel serait faux. */
export const FRAIS_FABRICATION: FraisPonctuel[] = [
  {
    libelle: 'Abonnement Claude Code',
    detail: 'Quatre mois à 21,60 € — le site a été entièrement écrit avec cet outil',
    montant: 86.40
  }
]

/** Gratuit pour ce site, parce que quelqu'un d'autre le finance. */
export const GRATUIT: Brique[] = [
  {
    libelle: 'Certificat HTTPS',
    usage: 'Chiffre toutes les pages du site',
    finance: 'Let\'s Encrypt, association à but non lucratif vivant de dons'
  },
  {
    libelle: 'Envoi des courriels',
    usage: 'Formulaire de contact des praticiens',
    finance: 'Google pour l\'acheminement, bénévoles de PHPMailer pour le code'
  },
  {
    libelle: 'Mailmeteor',
    usage: 'Campagne d\'information RGPD des praticiens',
    finance: 'Offre gratuite plafonnée à 49 envois par jour'
  },
  {
    libelle: 'Hébergement du code',
    usage: 'Sauvegarde et publication des sources',
    finance: 'GitHub, filiale de Microsoft'
  },
  {
    libelle: 'Nuxt, Vue, Tailwind CSS',
    usage: 'Toute l\'interface du site',
    finance: 'Communautés du logiciel libre et leurs sponsors'
  },
  {
    libelle: 'Police OpenDyslexic',
    usage: 'Mode lecture, pour les personnes dyslexiques',
    finance: 'Publiée sous licence libre par son auteur'
  },
  {
    libelle: 'Fiches praticiens et associations',
    usage: 'La matière première de l\'annuaire',
    finance: 'Autisme Info Service et Tamis-Autisme, en licence ouverte'
  },
  {
    libelle: 'Centres Ressources Autisme',
    usage: 'La page des 47 centres',
    finance: 'GNCRA — données publiques'
  },
  {
    libelle: 'Nouveautés livres',
    usage: 'Parutions récentes sur le TSA',
    finance: 'data.bnf.fr, service public de la Bibliothèque nationale'
  }
]

const somme = (montants: number[]) => montants.reduce((total, m) => total + m, 0)

export const TOTAL_PAYE = somme(FRAIS_RECURRENTS.map(f => f.paye))
export const TOTAL_RENOUVELLEMENT = somme(FRAIS_RECURRENTS.map(f => f.renouvellement))
export const TOTAL_FABRICATION = somme(FRAIS_FABRICATION.map(f => f.montant))
export const TOTAL_ENGAGE = TOTAL_PAYE + TOTAL_FABRICATION
