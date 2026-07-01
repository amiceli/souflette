import { useStore } from '@nanostores/vue'
import Notifications from '@/components/Notifications.js'
import SorterView from '@/components/SorterView.js'
import StartForm from '@/components/StartForm.js'
import { t } from '@/i18n.js'
import { $sorter, close } from '@/stores/sorter.js'

export default {
    name: 'App',
    components: {
        StartForm,
        SorterView,
        Notifications,
    },
    setup() {
        const sorter = useStore($sorter)

        const onClose = () => {
            close()
        }

        return {
            t,
            sorter,
            onClose,
        }
    },
    template: `
        <div class="height-full d-flex flex-column">
            <header
                v-if="sorter.started"
                class="d-flex flex-items-center p-3 border-bottom">
                <h1 class="h4 mb-0">{{ t('title') }}</h1>
                <button type="button" class="btn btn-danger ml-auto" @click="onClose()">
                    {{ t('close') }}
                </button>
            </header>

            <StartForm v-if="!sorter.started" />
            <SorterView v-else />

            <Notifications />
        </div>
    `,
}
