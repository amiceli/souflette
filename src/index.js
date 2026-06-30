{
    const { ipcRenderer, clipboard } = window.require('electron')
    const { t, locale } = require('./src/i18n.js')

    class ImageSorterController {
        constructor() {
            this.files = []
            this.index = 0
            this.kept = []
            this.folderPath = null
            this.locale = locale

            this.currentImage = document.getElementById('currentImage')
            this.imageName = document.getElementById('imageName')
            this.imagePath = document.getElementById('imagePath')
            this.pickButton = document.getElementById('pickButton')
            this.prevBtn = document.getElementById('prevBtn')
            this.keepBtn = document.getElementById('keepBtn')
            this.deleteBtn = document.getElementById('deleteBtn')
            this.nextBtn = document.getElementById('nextBtn')
            this.copyNameBtn = document.getElementById('copyNameBtn')
            this.copyPathBtn = document.getElementById('copyPathBtn')
            this.keptList = document.getElementById('keptItems')
            this.keptCount = document.getElementById('keptCount')
            this.keptListTitle = document.getElementById('keptListTitle')
            this.stats = document.getElementById('stats')
            this.container = document.getElementById('container')
            this.controls = document.getElementById('controls')

            this.updateLabels()
            this.setupEventListeners()
            this.loadState()
        }

        updateLabels() {
            this.pickButton.textContent = t('pickFolder')
            this.prevBtn.textContent = t('previous')
            this.keepBtn.textContent = t('keep')
            this.deleteBtn.textContent = t('delete')
            this.nextBtn.textContent = t('next')
            this.copyNameBtn.textContent = t('copyName')
            this.copyPathBtn.textContent = t('copyPath')
        }

        setupEventListeners() {
            this.pickButton.addEventListener('click', () => {
                this.pickFolder()
            })
            this.prevBtn.addEventListener('click', () => {
                this.navigatePrevious()
            })
            this.nextBtn.addEventListener('click', () => {
                this.navigateNext()
            })
            this.keepBtn.addEventListener('click', () => {
                this.keep()
            })
            this.deleteBtn.addEventListener('click', () => {
                this.delete()
            })
            this.copyNameBtn.addEventListener('click', () => {
                this.copyName()
            })
            this.copyPathBtn.addEventListener('click', () => {
                this.copyPath()
            })

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

        async pickFolder() {
            const ok = await ipcRenderer.invoke('choose-folder')

            if (ok) {
                this.container.style.display = ''
                this.controls.style.display = ''
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
                this.imageName.textContent = t('done')
                this.imagePath.textContent = t('doneDesc')
                this.currentImage.src = ''
                this.currentImage.alt = ''
                this.prevBtn.disabled = true
                this.nextBtn.disabled = true
                this.keepBtn.disabled = true
                this.deleteBtn.disabled = true
                this.copyNameBtn.disabled = true
                this.copyPathBtn.disabled = true
                return
            }

            const current = this.files[this.index]

            if (!current) {
                this.imageName.textContent = t('error')
                this.imagePath.textContent = t('errorDesc')

                return
            }

            this.currentImage.src = `file://${current}`
            const parts = current.split(/[/\\]/)
            const name = parts[parts.length - 1]

            this.imageName.textContent = name
            this.imagePath.textContent = current

            this.prevBtn.disabled = this.index === 0
            this.nextBtn.disabled = false
            this.keepBtn.disabled = false
            this.deleteBtn.disabled = false
            this.copyNameBtn.disabled = false
            this.copyPathBtn.disabled = false

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
            clipboard.writeText(this.imageName.textContent)
        }

        copyPath() {
            clipboard.writeText(this.imagePath.textContent)
        }

        updateKeptList() {
            this.keptCount.textContent = this.kept.length
            this.keptListTitle.textContent = `${t('keptImages')} (${this.kept.length})`
            this.keptList.innerHTML = ''

            this.kept.slice(-20).forEach((file) => {
                const parts = file.split(/[/\\]/)
                const name = parts[parts.length - 1]
                const li = document.createElement('li')
                li.textContent = name
                li.title = file
                this.keptList.appendChild(li)
            })
        }

        updateStats() {
            const remaining = this.files.length - this.index
            this.stats.textContent = `${this.index + 1} / ${this.files.length} (${remaining} ${t('remaining')})`
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

        loadState() {
            ipcRenderer.invoke('get-state').then((state) => {
                this.files = state.files || []
                this.index = state.index || 0
                this.kept = state.kept || []
                this.folderPath = state.folderPath || null

                if (this.files.length > 0 && this.folderPath) {
                    this.container.style.display = ''
                    this.controls.style.display = ''
                    this.displayCurrent()
                    this.updateStats()
                    this.updateKeptList()
                }
            })
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new ImageSorterController()
    })
}
