const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

let win
const stateFile = path.join(app.getPath('userData'), 'sorter-state.json')

function getImages(dir) {
    const entries = fs.readdirSync(dir, {
        withFileTypes: true,
    })

    const images = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            images.push(...getImages(fullPath))
        } else if (
            /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|mkv|avi)$/i.test(entry.name)
        ) {
            images.push(fullPath)
        }
    }

    return images.sort()
}

function readState() {
    if (!fs.existsSync(stateFile)) {
        return null
    }

    try {
        return JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
    } catch {
        return null
    }
}

function writeState(state) {
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

ipcMain.handle('pick-directory', async () => {
    const res = await dialog.showOpenDialog(win, {
        properties: [
            'openDirectory',
        ],
    })

    if (res.canceled) {
        return false
    }

    return res.filePaths[0]
})

ipcMain.handle('scan-folder', (_e, options) => {
    return getImages(options.sourcePath)
})

ipcMain.handle('get-state', () => {
    return readState()
})

ipcMain.on('save-state', (_e, state) => {
    writeState(state)
})

ipcMain.on('delete-file', (_e, filePath) => {
    try {
        fs.unlinkSync(filePath)
    } catch {
        // File might already be deleted
    }
})

ipcMain.handle('move-file', (_e, options) => {
    const target = path.join(options.destPath, path.basename(options.filePath))

    try {
        fs.renameSync(options.filePath, target)
    } catch {
        fs.copyFileSync(options.filePath, target)
        fs.unlinkSync(options.filePath)
    }

    return target
})
