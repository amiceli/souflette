import { atom } from 'nanostores'

export const $notifications = atom([])

let counter = 0

export function notify(message) {
    const id = ++counter

    $notifications.set([
        ...$notifications.get(),
        {
            id,
            message,
        },
    ])

    setTimeout(() => {
        $notifications.set(
            $notifications.get().filter((item) => item.id !== id),
        )
    }, 2500)
}
