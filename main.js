const { app, BrowserWindow, ipcMain, dialog } = require('node:electron')
const fs = require('node:fs')
const path = require('node:path')

let win
const stateFile = path.join(app.getPath('userData'), 'sorter-state.json')

function getImages(dir) {
    return fs
        .readdirSync(dir)
        .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
        .map((f) => path.join(dir, f))
        .sort()
}

function loadState() {
    if (fs.existsSync(stateFile)) {
        const data = fs.readFileSync(stateFile, 'utf-8')
        try {
            return JSON.parse(data)
        } catch {
            return {
                files: [],
                index: 0,
                kept: [],
                folderPath: null,
            }
        }
    }
    return {
        files: [],
        index: 0,
        kept: [],
        folderPath: null,
    }
}

function saveState(state) {
    fs.mkdirSync(path.dirname(stateFile), {
        recursive: true,
    })
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
}

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    win.loadFile('index.html')
})

ipcMain.handle('choose-folder', async () => {
    const res = await dialog.showOpenDialog(win, {
        properties: [
            'openDirectory',
        ],
    })

    if (res.canceled) {
        return false
    }

    const folderPath = res.filePaths[0]
    const files = getImages(folderPath)

    const state = {
        files,
        index: 0,
        kept: [],
        folderPath,
    }

    saveState(state)
    return true
})

ipcMain.handle('get-state', () => {
    return loadState()
})

ipcMain.on('save-state', (_e, state) => {
    saveState(state)
})

ipcMain.on('delete-file', (_e, filePath) => {
    try {
        fs.unlinkSync(filePath)
    } catch {
        // File might already be deleted
    }
})
