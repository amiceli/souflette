import { Controller } from 'stimulus'
import { t } from '../i18n.js'

const { ipcRenderer, clipboard } = window.require('electron')

export default class ImageSorterController extends Controller {
    static targets = [
        'currentImage',
        'imageName',
        'imagePath',
        'pickButton',
        'prevBtn',
        'keepBtn',
        'deleteBtn',
        'nextBtn',
        'copyNameBtn',
        'copyPathBtn',
        'resetBtn',
        'keptList',
        'keptCount',
        'keptListTitle',
        'stats',
        'container',
        'controls',
    ]

    connect() {
        this.files = []
        this.index = 0
        this.kept = []
        this.folderPath = null

        this.updateLabels()
        this.loadState()
        this.setupKeyboardShortcuts()
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
        this.prevBtnTarget.textContent = t('previous')
        this.keepBtnTarget.textContent = t('keep')
        this.deleteBtnTarget.textContent = t('delete')
        this.nextBtnTarget.textContent = t('next')
        this.copyNameBtnTarget.textContent = t('copyName')
        this.copyPathBtnTarget.textContent = t('copyPath')
        this.resetBtnTarget.textContent = t('reset')
    }

    async pickFolder() {
        const ok = await ipcRenderer.invoke('choose-folder')

        if (ok) {
            this.containerTarget.style.display = ''
            this.controlsTarget.style.display = ''
            this.load()
        }
    }

    async load() {
        const state = await ipcRenderer.invoke('get-state')

        this.files = state.files || []
        this.index = state.index || 0
        this.kept = state.kept || []
        this.folderPath = state.folderPath || null

        this.displayCurrent()
        this.updateStats()
        this.updateKeptList()
    }

    displayCurrent() {
        if (this.index < 0) {
            this.index = 0
        }

        if (this.index >= this.files.length) {
            this.imageNameTarget.textContent = t('done')
            this.imagePathTarget.textContent = t('doneDesc')
            this.currentImageTarget.src = ''
            this.currentImageTarget.alt = ''
            this.prevBtnTarget.disabled = true
            this.nextBtnTarget.disabled = true
            this.keepBtnTarget.disabled = true
            this.deleteBtnTarget.disabled = true
            this.copyNameBtnTarget.disabled = true
            this.copyPathBtnTarget.disabled = true
            return
        }

        const current = this.files[this.index]

        if (!current) {
            this.imageNameTarget.textContent = t('error')
            this.imagePathTarget.textContent = t('errorDesc')

            return
        }

        this.currentImageTarget.src = `file://${current}`
        const parts = current.split(/[/\\]/)
        const name = parts[parts.length - 1]

        this.imageNameTarget.textContent = name
        this.imagePathTarget.textContent = current

        this.prevBtnTarget.disabled = this.index === 0
        this.nextBtnTarget.disabled = false
        this.keepBtnTarget.disabled = false
        this.deleteBtnTarget.disabled = false
        this.copyNameBtnTarget.disabled = false
        this.copyPathBtnTarget.disabled = false

        this.saveState()
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

        if (current && !this.kept.includes(current)) {
            this.kept.push(current)
            this.updateKeptList()
            this.saveState()
        }

        this.navigateNext()
    }

    delete() {
        const current = this.files[this.index]

        if (current) {
            ipcRenderer.send('delete-file', current)
            this.files.splice(this.index, 1)
            this.saveState()
        }

        if (this.index >= this.files.length) {
            this.index = Math.max(0, this.files.length - 1)
        }

        this.displayCurrent()
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

    updateKeptList() {
        this.keptListTarget.innerHTML = ''

        this.kept.slice(-20).forEach((file) => {
            const parts = file.split(/[/\\]/)
            const name = parts[parts.length - 1]
            const li = document.createElement('li')
            li.textContent = name
            li.title = file
            this.keptListTarget.appendChild(li)
        })
    }

    updateStats() {
        const remaining = this.files.length - this.index
        this.statsTarget.textContent = `${this.index + 1} / ${this.files.length} (${remaining} ${t('remaining')})`
    }

    saveState() {
        ipcRenderer.send('save-state', {
            files: this.files,
            index: this.index,
            kept: this.kept,
            folderPath: this.folderPath,
        })
        this.updateStats()
    }

    async loadState() {
        const state = await ipcRenderer.invoke('get-state')
        this.files = state.files || []
        this.index = state.index || 0
        this.kept = state.kept || []
        this.folderPath = state.folderPath || null

        if (this.files.length > 0 && this.folderPath) {
            this.containerTarget.style.display = ''
            this.controlsTarget.style.display = ''
            this.displayCurrent()
            this.updateStats()
            this.updateKeptList()
        }
    }
}
