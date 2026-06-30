const dict = {
    fr: {
        pickFolder: 'Choisir dossier',
        changeFolder: 'Changer dossier',
        previous: '← Précédent',
        keep: '✓ Garder (K)',
        delete: '✕ Virer (D)',
        next: 'Suivant →',
        copyImage: 'Copier image',
        copyName: 'Copier nom',
        copyPath: 'Copier chemin',
        reset: '⟲ Réinitialiser',
        close: '✕ Fermer',
        done: 'Terminé !',
        doneDesc: 'Toutes les images ont été triées.',
        error: 'Erreur',
        errorDesc: "Impossible de charger l'image.",
        waiting: 'En attente...',
        remaining: 'restantes',
    },
    en: {
        pickFolder: 'Choose folder',
        changeFolder: 'Change folder',
        previous: '← Previous',
        keep: '✓ Keep (K)',
        delete: '✕ Delete (D)',
        next: 'Next →',
        copyImage: 'Copy image',
        copyName: 'Copy name',
        copyPath: 'Copy path',
        reset: '⟲ Reset',
        close: '✕ Close',
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

export function t(key) {
    return dict[locale][key] || key
}

export { locale }
