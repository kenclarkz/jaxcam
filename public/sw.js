/* jaxcam service worker — pocket offline shell */
const VERSION = 'jaxcam-v1'
const SHELL_CACHE = `${VERSION}-shell`

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(['./'])).catch(() => undefined))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('./', copy)).catch(() => undefined)
          return response
        })
        .catch(() => caches.match('./').then((hit) => hit ?? caches.match('/'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
        }
        return response
      })
    }),
  )
})