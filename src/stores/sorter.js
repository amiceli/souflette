import { map } from 'nanostores'
import { t } from '@/i18n.js'
import { notify } from '@/stores/notifications.js'

const { ipcRenderer, clipboard, nativeImage } = window.require('electron')

const initialState = {
    files: [],
    index: 0,
    kept: [],
    sourcePath: null,
    destPath: null,
    started: false,
}

export const $sorter = map({
    ...initialState,
})

// Saved session found on disk, proposed for resuming.
export const $saved = map(null)

function persist() {
    const state = $sorter.get()

    ipcRenderer.send('save-state', {
        files: state.files,
        index: state.index,
        kept: state.kept,
        sourcePath: state.sourcePath,
        destPath: state.destPath,
    })
}

export async function init() {
    const saved = await ipcRenderer.invoke('get-state')

    if (saved?.sourcePath) {
        $saved.set(saved)
    }
}

export async function pickDirectory() {
    const dir = await ipcRenderer.invoke('pick-directory')

    return dir
}

export async function start(options) {
    const files = await ipcRenderer.invoke('scan-folder', {
        sourcePath: options.sourcePath,
    })

    $sorter.set({
        files,
        index: 0,
        kept: [],
        sourcePath: options.sourcePath,
        destPath: options.destPath,
        started: true,
    })
    persist()
}

export function resume() {
    const saved = $saved.get()

    $sorter.set({
        files: saved.files || [],
        index: saved.index || 0,
        kept: saved.kept || [],
        sourcePath: saved.sourcePath,
        destPath: saved.destPath,
        started: true,
    })
}

export function discardSaved() {
    $saved.set(null)
}

export function close() {
    $sorter.set({
        ...initialState,
    })
    $saved.set(null)
    persist()
}

export function previous() {
    const state = $sorter.get()

    if (state.index > 0) {
        $sorter.setKey('index', state.index - 1)
        persist()
    }
}

export function next() {
    const state = $sorter.get()

    if (state.index < state.files.length - 1) {
        $sorter.setKey('index', state.index + 1)
        persist()
    }
}

export function keep() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    const kept = state.kept.includes(current)
        ? state.kept
        : [
              ...state.kept,
              current,
          ]

    $sorter.set({
        ...state,
        kept,
        index: Math.min(state.index + 1, state.files.length),
    })
    persist()
}

export async function move() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    await ipcRenderer.invoke('move-file', {
        filePath: current,
        destPath: state.destPath,
    })

    const files = state.files.filter((_, i) => i !== state.index)
    const index = Math.min(state.index, Math.max(0, files.length - 1))

    $sorter.set({
        ...state,
        files,
        index,
    })
    persist()
    notify(t('moved'))
}

export function remove() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    ipcRenderer.send('delete-file', current)

    const files = state.files.filter((_, i) => i !== state.index)
    const index = Math.min(state.index, Math.max(0, files.length - 1))

    $sorter.set({
        ...state,
        files,
        index,
    })
    persist()
}

export function copyImage() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    clipboard.writeImage(nativeImage.createFromPath(current))
    notify(t('copiedImage'))
}

export function copyName() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    clipboard.writeText(current.split(/[/\\]/).pop())
    notify(t('copiedName'))
}

export function copyPath() {
    const state = $sorter.get()
    const current = state.files[state.index]

    if (!current) {
        return
    }

    clipboard.writeText(current)
    notify(t('copiedPath'))
}
