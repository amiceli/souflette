import { Controller } from 'stimulus'
import { t } from '../i18n.js'

const { ipcRenderer, clipboard, nativeImage } = window.require('electron')

export default class ImageSorterController extends Controller {
    static targets = [
        'currentImage',
        'imageName',
        'imagePath',
        'pickButton',
        'changeFolderBtn',
        'prevBtn',
        'keepBtn',
        'deleteBtn',
        'nextBtn',
        'copyImageBtn',
        'copyNameBtn',
        'copyPathBtn',
        'resetBtn',
        'closeBtn',
        'stats',
        'container',
        'navButtons',
        'imageWrap',
        'controls',
    ]

    static classes = [
        'hidden',
    ]

    connect() {
        this.files = []
        this.index = 0
        this.kept = []
        this.folderPath = null

        this.updateLabels()
        this.setupKeyboardShortcuts()
        this.loadState()
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase()
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                this.navigatePrevious()
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                this.navigateNext()
            } else if (key === 'k') {
                e.preventDefault()
                this.keep()
            } else if (key === 'd') {
                e.preventDefault()
                this.delete()
            }
        })
    }

    updateLabels() {
        this.pickButtonTarget.textContent = t('pickFolder')
        this.changeFolderBtnTarget.textContent = t('changeFolder')
        this.prevBtnTarget.textContent = t('previous')
        this.keepBtnTarget.textContent = t('keep')
        this.deleteBtnTarget.textContent = t('delete')
        this.nextBtnTarget.textContent = t('next')
        this.copyImageBtnTarget.textContent = t('copyImage')
        this.copyNameBtnTarget.textContent = t('copyName')
        this.copyPathBtnTarget.textContent = t('copyPath')
        this.resetBtnTarget.textContent = t('reset')
        this.closeBtnTarget.textContent = t('close')
    }

    applyState(state) {
        this.files = state.files || []
        this.index = state.index || 0
        this.kept = state.kept || []
        this.folderPath = state.folderPath || null
    }

    async loadState() {
        const state = await ipcRenderer.invoke('get-state')

        this.applyState(state)
        this.displayCurrent()
    }

    async pickFolder() {
        const ok = await ipcRenderer.invoke('choose-folder')

        if (ok) {
            const state = await ipcRenderer.invoke('get-state')
            this.applyState(state)
            this.displayCurrent()
        }
    }

    displayCurrent() {
        if (this.index < 0) {
            this.index = 0
        }

        const current = this.files[this.index]

        if (current) {
            this.currentImageTarget.src = `file://${current}`
            const parts = current.split(/[/\\]/)
            const name = parts[parts.length - 1]

            this.imageNameTarget.textContent = name
            this.imagePathTarget.textContent = current
            this.prevBtnTarget.disabled = this.index === 0
            this.nextBtnTarget.disabled = this.index >= this.files.length - 1
        } else {
            this.currentImageTarget.src = ''
            this.imageNameTarget.textContent = this.folderPath ? t('done') : ''
            this.imagePathTarget.textContent = this.folderPath
                ? t('doneDesc')
                : ''
        }

        this.updateStats()
        this.render()
        this.saveState()
    }

    render() {
        const hasFolder = Boolean(this.folderPath)
        const hasImage = hasFolder && Boolean(this.files[this.index])

        this.pickButtonTarget.classList.toggle(this.hiddenClass, hasFolder)
        this.navButtonsTarget.classList.toggle(this.hiddenClass, !hasFolder)
        this.closeBtnTarget.classList.toggle(this.hiddenClass, !hasFolder)
        this.containerTarget.classList.toggle(this.hiddenClass, !hasFolder)
        this.imageWrapTarget.classList.toggle(this.hiddenClass, !hasImage)
        this.controlsTarget.classList.toggle(this.hiddenClass, !hasImage)
    }

    navigatePrevious() {
        if (this.index > 0) {
            this.index--
            this.displayCurrent()
        }
    }

    navigateNext() {
        if (this.index < this.files.length - 1) {
            this.index++
            this.displayCurrent()
        }
    }

    keep() {
        const current = this.files[this.index]

        if (!current) {
            return
        }

        if (!this.kept.includes(current)) {
            this.kept.push(current)
        }

        this.index++
        this.displayCurrent()
    }

    delete() {
        const current = this.files[this.index]

        if (!current) {
            return
        }

        ipcRenderer.send('delete-file', current)
        this.files.splice(this.index, 1)

        if (this.index >= this.files.length) {
            this.index = Math.max(0, this.files.length - 1)
        }

        this.displayCurrent()
    }

    copyImage() {
        const currentFile = this.files[this.index]

        if (currentFile) {
            const image = nativeImage.createFromPath(currentFile)
            clipboard.writeImage(image)
        }
    }

    copyName() {
        clipboard.writeText(this.imageNameTarget.textContent)
    }

    copyPath() {
        clipboard.writeText(this.imagePathTarget.textContent)
    }

    reset() {
        this.index = 0
        this.displayCurrent()
    }

    close() {
        this.files = []
        this.index = 0
        this.kept = []
        this.folderPath = null

        this.saveState()
        this.displayCurrent()
    }

    updateStats() {
        if (!this.folderPath || this.files.length === 0) {
            this.statsTarget.textContent = ''

            return
        }

        const position = Math.min(this.index + 1, this.files.length)
        const remaining = Math.max(0, this.files.length - this.index)

        this.statsTarget.textContent = `${position} / ${this.files.length} (${remaining} ${t('remaining')})`
    }

    saveState() {
        ipcRenderer.send('save-state', {
            files: this.files,
            index: this.index,
            kept: this.kept,
            folderPath: this.folderPath,
        })
    }
}
