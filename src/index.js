const { ipcRenderer, clipboard } = require('electron');

class ImageSorterController {
	constructor() {
		this.files = [];
		this.index = 0;
		this.kept = [];
		this.folderPath = null;

		this.currentImage = document.getElementById('currentImage');
		this.imageName = document.getElementById('imageName');
		this.imagePath = document.getElementById('imagePath');
		this.pickButton = document.getElementById('pickButton');
		this.prevBtn = document.getElementById('prevBtn');
		this.keepBtn = document.getElementById('keepBtn');
		this.deleteBtn = document.getElementById('deleteBtn');
		this.nextBtn = document.getElementById('nextBtn');
		this.copyNameBtn = document.getElementById('copyNameBtn');
		this.copyPathBtn = document.getElementById('copyPathBtn');
		this.keptList = document.getElementById('keptItems');
		this.keptCount = document.getElementById('keptCount');
		this.stats = document.getElementById('stats');

		this.setupEventListeners();
		this.loadState();
	}

	setupEventListeners() {
		this.pickButton.addEventListener('click', () => {
			this.pickFolder();
		});
		this.prevBtn.addEventListener('click', () => {
			this.navigatePrevious();
		});
		this.nextBtn.addEventListener('click', () => {
			this.navigateNext();
		});
		this.keepBtn.addEventListener('click', () => {
			this.keep();
		});
		this.deleteBtn.addEventListener('click', () => {
			this.delete();
		});
		this.copyNameBtn.addEventListener('click', () => {
			this.copyName();
		});
		this.copyPathBtn.addEventListener('click', () => {
			this.copyPath();
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				this.navigatePrevious();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				this.navigateNext();
			}
		});
	}

	async pickFolder() {
		const ok = await ipcRenderer.invoke('choose-folder');
		if (ok) {
			this.load();
		}
	}

	async load() {
		const state = await ipcRenderer.invoke('get-state');
		this.files = state.files || [];
		this.index = state.index || 0;
		this.kept = state.kept || [];
		this.folderPath = state.folderPath || null;

		this.displayCurrent();
		this.updateStats();
		this.updateKeptList();
	}

	displayCurrent() {
		if (this.index < 0) {
			this.index = 0;
		}
		if (this.index >= this.files.length) {
			this.imageName.textContent = 'Terminé !';
			this.imagePath.textContent = 'Toutes les images ont été triées.';
			this.currentImage.src = '';
			this.currentImage.alt = 'Aucune image';
			this.prevBtn.disabled = true;
			this.nextBtn.disabled = true;
			this.keepBtn.disabled = true;
			this.deleteBtn.disabled = true;
			this.copyNameBtn.disabled = true;
			this.copyPathBtn.disabled = true;
			return;
		}

		const current = this.files[this.index];
		if (!current) {
			this.imageName.textContent = 'Erreur';
			this.imagePath.textContent = 'Impossible de charger l\'image.';
			return;
		}

		this.currentImage.src = `file://${current}`;
		const parts = current.split(/[/\\]/);
		const name = parts[parts.length - 1];

		this.imageName.textContent = name;
		this.imagePath.textContent = current;

		this.prevBtn.disabled = this.index === 0;
		this.nextBtn.disabled = false;
		this.keepBtn.disabled = false;
		this.deleteBtn.disabled = false;
		this.copyNameBtn.disabled = false;
		this.copyPathBtn.disabled = false;

		this.saveState();
	}

	navigatePrevious() {
		if (this.index > 0) {
			this.index--;
			this.displayCurrent();
		}
	}

	navigateNext() {
		if (this.index < this.files.length - 1) {
			this.index++;
			this.displayCurrent();
		}
	}

	keep() {
		const current = this.files[this.index];
		if (current && !this.kept.includes(current)) {
			this.kept.push(current);
			this.updateKeptList();
			this.saveState();
		}
		this.navigateNext();
	}

	delete() {
		const current = this.files[this.index];
		if (current) {
			ipcRenderer.send('delete-file', current);
		}
		this.navigateNext();
	}

	copyName() {
		clipboard.writeText(this.imageName.textContent);
	}

	copyPath() {
		clipboard.writeText(this.imagePath.textContent);
	}

	updateKeptList() {
		this.keptCount.textContent = this.kept.length;
		this.keptList.innerHTML = '';

		this.kept.slice(-20).forEach((file) => {
			const parts = file.split(/[/\\]/);
			const name = parts[parts.length - 1];
			const li = document.createElement('li');
			li.textContent = name;
			li.title = file;
			this.keptList.appendChild(li);
		});
	}

	updateStats() {
		const remaining = this.files.length - this.index;
		this.stats.textContent = `${this.index + 1} / ${this.files.length} (${remaining} restantes)`;
	}

	saveState() {
		ipcRenderer.send('save-state', {
			files: this.files,
			index: this.index,
			kept: this.kept,
			folderPath: this.folderPath,
		});
		this.updateStats();
	}

	loadState() {
		ipcRenderer.invoke('get-state').then((state) => {
			this.files = state.files || [];
			this.index = state.index || 0;
			this.kept = state.kept || [];
			this.folderPath = state.folderPath || null;

			if (this.files.length > 0) {
				this.displayCurrent();
				this.updateStats();
				this.updateKeptList();
			}
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new ImageSorterController();
});
