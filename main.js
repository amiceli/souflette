const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let win;
let files = [];
let index = 0;

function getImages(dir) {
    return fs.readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
        .map(f => path.join(dir, f));
}

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("index.html");
});

ipcMain.handle("choose-folder", async () => {
    const res = await dialog.showOpenDialog(win, {
        properties: ["openDirectory"]
    });

    if (res.canceled) return false;

    files = getImages(res.filePaths[0]);
    index = 0;

    return true;
});

ipcMain.handle("get-current", () => {
    return files[index] || null;
});

ipcMain.on("next", () => {
    index++;
});

ipcMain.on("delete-file", (e, filePath) => {
    try {
        fs.unlinkSync(filePath);
    } catch (e) { }
});