import { useStore } from '@nanostores/vue'
import { $notifications } from '@/stores/notifications.js'

export default {
    name: 'Notifications',
    setup() {
        const notifications = useStore($notifications)

        return {
            notifications,
        }
    },
    template: `
        <div class="position-fixed bottom-0 right-0 m-3">
            <div
                v-for="item in notifications"
                :key="item.id"
                class="Toast Toast--success mb-2">
                <span class="Toast-content">{{ item.message }}</span>
            </div>
        </div>
    `,
}
