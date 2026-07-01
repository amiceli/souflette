import { useStore } from '@nanostores/vue'
import { computed, ref } from 'vue'
import { t } from '@/i18n.js'
import {
    $saved,
    discardSaved,
    pickDirectory,
    resume,
    start,
} from '@/stores/sorter.js'

export default {
    name: 'StartForm',
    setup() {
        const saved = useStore($saved)
        const sourcePath = ref(saved.value?.sourcePath || '')
        const destPath = ref(saved.value?.destPath || '')

        const canStart = computed(() => {
            return Boolean(sourcePath.value) && Boolean(destPath.value)
        })

        const onChooseSource = async () => {
            const dir = await pickDirectory()

            if (dir) {
                sourcePath.value = dir
            }
        }

        const onChooseDest = async () => {
            const dir = await pickDirectory()

            if (dir) {
                destPath.value = dir
            }
        }

        const onSubmit = () => {
            if (!canStart.value) {
                return
            }

            start({
                sourcePath: sourcePath.value,
                destPath: destPath.value,
            })
        }

        const onResume = () => {
            resume()
        }

        const onFresh = () => {
            sourcePath.value = ''
            destPath.value = ''
            discardSaved()
        }

        return {
            t,
            saved,
            sourcePath,
            destPath,
            canStart,
            onChooseSource,
            onChooseDest,
            onSubmit,
            onResume,
            onFresh,
        }
    },
    template: `
        <div class="flex-1 d-flex flex-items-center flex-justify-center p-4">
            <div class="container-sm">
                <div class="Box p-4">
                    <h1 class="h2 mb-3">{{ t('formTitle') }}</h1>

                    <div v-if="saved" class="flash flash-warn mb-4">
                        <h2 class="h5 mb-1">{{ t('resumeTitle') }}</h2>
                        <p class="mb-3">{{ t('resumeDesc') }}</p>
                        <button type="button" class="btn btn-sm btn-primary mr-2" @click="onResume()">
                            {{ t('resume') }}
                        </button>
                        <button type="button" class="btn btn-sm" @click="onFresh()">
                            {{ t('fresh') }}
                        </button>
                    </div>

                    <form @submit.prevent="onSubmit()">
                        <div class="form-group mt-0">
                            <div class="form-group-header">
                                <label>{{ t('sourceLabel') }}</label>
                            </div>
                            <div class="form-group-body">
                                <div class="input-group">
                                    <input
                                        class="form-control input-block"
                                        type="text"
                                        :value="sourcePath"
                                        :placeholder="t('browse')"
                                        readonly
                                        required>
                                    <span class="input-group-button">
                                        <button type="button" class="btn" @click="onChooseSource()">
                                            {{ t('browse') }}
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="form-group-header">
                                <label>{{ t('destLabel') }}</label>
                            </div>
                            <div class="form-group-body">
                                <div class="input-group">
                                    <input
                                        class="form-control input-block"
                                        type="text"
                                        :value="destPath"
                                        :placeholder="t('browse')"
                                        readonly
                                        required>
                                    <span class="input-group-button">
                                        <button type="button" class="btn" @click="onChooseDest()">
                                            {{ t('browse') }}
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            class="btn btn-primary btn-block mt-4"
                            :disabled="!canStart">
                            {{ t('start') }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `,
}
