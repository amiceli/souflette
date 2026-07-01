import { t } from '@/i18n.js'
import {
    copyImage,
    copyName,
    copyPath,
    keep,
    move,
    remove,
} from '@/stores/sorter.js'

export default {
    name: 'ImageActions',
    setup() {
        const onCopyImage = () => {
            copyImage()
        }

        const onCopyName = () => {
            copyName()
        }

        const onCopyPath = () => {
            copyPath()
        }

        const onKeep = () => {
            keep()
        }

        const onMove = () => {
            move()
        }

        const onDelete = () => {
            remove()
        }

        return {
            t,
            onCopyImage,
            onCopyName,
            onCopyPath,
            onKeep,
            onMove,
            onDelete,
        }
    },
    template: `
        <div>
            <div class="d-flex flex-column mb-4">
                <button type="button" class="btn btn-block mb-2" @click="onCopyImage()">
                    {{ t('copyImage') }}
                </button>
                <button type="button" class="btn btn-block mb-2" @click="onCopyName()">
                    {{ t('copyName') }}
                </button>
                <button type="button" class="btn btn-block" @click="onCopyPath()">
                    {{ t('copyPath') }}
                </button>
            </div>

            <div class="d-flex flex-column">
                <button type="button" class="btn btn-primary btn-block btn-large mb-2" @click="onKeep()">
                    {{ t('keep') }}
                </button>
                <button type="button" class="btn btn-block btn-large" @click="onMove()">
                    {{ t('move') }}
                </button>
            </div>

            <hr class="my-4">

            <button type="button" class="btn btn-danger btn-block" @click="onDelete()">
                {{ t('delete') }}
            </button>
        </div>
    `,
}
