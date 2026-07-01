import { useStore } from '@nanostores/vue'
import { computed, onMounted, onUnmounted } from 'vue'
import ImageActions from '@/components/ImageActions.js'
import { t } from '@/i18n.js'
import { $sorter, keep, move, next, previous, remove } from '@/stores/sorter.js'

export default {
    name: 'SorterView',
    components: {
        ImageActions,
    },
    setup() {
        const sorter = useStore($sorter)

        const current = computed(() => {
            return sorter.value.files[sorter.value.index] || null
        })

        const name = computed(() => {
            return current.value ? current.value.split(/[/\\]/).pop() : ''
        })

        const src = computed(() => {
            return current.value ? `file://${current.value}` : ''
        })

        const isVideo = computed(() => {
            return /\.(mp4|webm|mov|mkv|avi)$/i.test(current.value || '')
        })

        const canPrev = computed(() => sorter.value.index > 0)

        const canNext = computed(() => {
            return sorter.value.index < sorter.value.files.length - 1
        })

        const stats = computed(() => {
            const total = sorter.value.files.length

            if (total === 0) {
                return ''
            }

            const position = Math.min(sorter.value.index + 1, total)
            const remaining = Math.max(0, total - sorter.value.index)

            return `${position} / ${total} (${remaining} ${t('remaining')})`
        })

        const onPrev = () => {
            previous()
        }

        const onNext = () => {
            next()
        }

        const onKeydown = (event) => {
            const key = event.key.toLowerCase()

            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                previous()
            } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                next()
            } else if (key === 'k') {
                event.preventDefault()
                keep()
            } else if (key === 'm') {
                event.preventDefault()
                move()
            } else if (key === 'd') {
                event.preventDefault()
                remove()
            }
        }

        onMounted(() => {
            document.addEventListener('keydown', onKeydown)
        })

        onUnmounted(() => {
            document.removeEventListener('keydown', onKeydown)
        })

        return {
            t,
            current,
            name,
            src,
            isVideo,
            canPrev,
            canNext,
            stats,
            onPrev,
            onNext,
        }
    },
    template: `
        <div class="d-flex flex-1 overflow-hidden">
            <div class="d-flex flex-column flex-1 p-3 overflow-hidden">
                <div class="d-flex flex-1 flex-justify-center flex-items-center overflow-hidden">
                    <video v-if="current && isVideo" class="height-full" :src="src" controls></video>
                    <img v-else-if="current" class="height-full" :src="src" :alt="name">
                    <div v-else class="text-center color-fg-muted">
                        <h2 class="h2 mb-1">{{ t('done') }}</h2>
                        <p>{{ t('doneDesc') }}</p>
                    </div>
                </div>
                <div class="d-flex flex-justify-center mt-3">
                    <div class="BtnGroup">
                        <button
                            type="button"
                            class="btn BtnGroup-item"
                            :disabled="!canPrev"
                            @click="onPrev()">
                            {{ t('previous') }}
                        </button>
                        <button
                            type="button"
                            class="btn BtnGroup-item"
                            :disabled="!canNext"
                            @click="onNext()">
                            {{ t('next') }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-3 flex-shrink-0 d-flex flex-column p-3 overflow-y-auto border-left">
                <div class="mb-4">
                    <h2 class="h4 mb-1">{{ name || '–' }}</h2>
                    <p class="f6 color-fg-muted mb-0 wb-break-all">{{ current }}</p>
                </div>

                <ImageActions v-if="current" />

                <div class="h4 color-fg-muted mt-4">{{ stats }}</div>
            </div>
        </div>
    `,
}
