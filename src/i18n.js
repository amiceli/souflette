const dict = {
    fr: {
        title: 'Tri des images',
        formTitle: 'Trier des images',
        sourceLabel: 'Dossier source (images à trier)',
        destLabel: 'Dossier destination (déplacement)',
        browse: 'Parcourir',
        start: 'Commencer',
        resumeTitle: 'Session précédente trouvée',
        resumeDesc: 'Voulez-vous reprendre là où vous vous êtes arrêté ?',
        resume: 'Reprendre',
        fresh: 'Repartir de zéro',
        close: '✕ Fermer',
        previous: '← Précédent',
        next: 'Suivant →',
        keep: '✓ Garder (K)',
        move: '→ Déplacer (M)',
        delete: '✕ Supprimer (D)',
        copyImage: 'Copier image',
        copyName: 'Copier nom',
        copyPath: 'Copier chemin',
        copiedImage: 'Image copiée',
        copiedName: 'Nom copié',
        copiedPath: 'Chemin copié',
        moved: 'Image déplacée',
        done: 'Terminé !',
        doneDesc: 'Toutes les images ont été triées.',
        remaining: 'restantes',
    },
    en: {
        title: 'Image sorting',
        formTitle: 'Sort images',
        sourceLabel: 'Source folder (images to sort)',
        destLabel: 'Destination folder (move target)',
        browse: 'Browse',
        start: 'Start',
        resumeTitle: 'Previous session found',
        resumeDesc: 'Do you want to resume where you left off?',
        resume: 'Resume',
        fresh: 'Start fresh',
        close: '✕ Close',
        previous: '← Previous',
        next: 'Next →',
        keep: '✓ Keep (K)',
        move: '→ Move (M)',
        delete: '✕ Delete (D)',
        copyImage: 'Copy image',
        copyName: 'Copy name',
        copyPath: 'Copy path',
        copiedImage: 'Image copied',
        copiedName: 'Name copied',
        copiedPath: 'Path copied',
        moved: 'Image moved',
        done: 'Done!',
        doneDesc: 'All images have been sorted.',
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
