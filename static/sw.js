importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "dos-2-planner",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/9c88552457be27c07207.worker.js",
    "revision": "2c3061550f14503ee5b32cbd6f37962e"
  },
  {
    "url": "/_nuxt/app.0ecdf2fb6efea23b0f23.js",
    "revision": "8a1b54b608d8e4250020b3a947d9897d"
  },
  {
    "url": "/_nuxt/layouts_default.599a37f828ad8f7543d7.js",
    "revision": "1dd084d69d5a8454cb4eece997fad5e4"
  },
  {
    "url": "/_nuxt/manifest.496bff251b2026112690.js",
    "revision": "23358ac646f7028836d04adbad9a56a1"
  },
  {
    "url": "/_nuxt/pages_index.f16e0f3a18d77d9910eb.js",
    "revision": "b874a55a6ef183d7f6dd30a0717bf246"
  },
  {
    "url": "/_nuxt/vendor.375ce1a8bd17e15abb82.js",
    "revision": "1fddd96631d9779929b0654557f303f7"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

