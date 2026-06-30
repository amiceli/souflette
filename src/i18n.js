const dict = {
    fr: {
        pickFolder: 'Choisir dossier',
        previous: '← Précédent',
        keep: '✓ Garder (K)',
        delete: '✕ Virer (D)',
        next: 'Suivant →',
        copyName: 'Copier nom',
        copyPath: 'Copier chemin',
        keptImages: 'Images gardées',
        done: 'Terminé !',
        doneDesc: 'Toutes les images ont été triées.',
        error: 'Erreur',
        errorDesc: "Impossible de charger l'image.",
        waiting: 'En attente...',
        remaining: 'restantes',
    },
    en: {
        pickFolder: 'Choose folder',
        previous: '← Previous',
        keep: '✓ Keep (K)',
        delete: '✕ Delete (D)',
        next: 'Next →',
        copyName: 'Copy name',
        copyPath: 'Copy path',
        keptImages: 'Kept images',
        done: 'Done!',
        doneDesc: 'All images have been sorted.',
        error: 'Error',
        errorDesc: 'Unable to load image.',
        waiting: 'Waiting...',
        remaining: 'remaining',
    },
}

function detectLanguage() {
    const osLang = navigator.language || navigator.userLanguage

    return osLang.startsWith('fr') ? 'fr' : 'en'
}

const locale = detectLanguage()

function t(key) {
    return dict[locale][key] || key
}

module.exports = {
    dict,
    locale,
    t,
}
