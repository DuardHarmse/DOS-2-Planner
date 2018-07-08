importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "dos-2-planner",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/8fd7662c358bb8a4a1ce.worker.js",
    "revision": "202b1794c1c0bfc019ee66a6b02abf98"
  },
  {
    "url": "/_nuxt/app.ba081e26ac98289fef81.js",
    "revision": "7cabc5d14fc8ed36745c13f4bdbaa2a7"
  },
  {
    "url": "/_nuxt/layouts/default.0cc2e82c3963e552485b.js",
    "revision": "1c299ff3e93f73a262d033a6e8e461fa"
  },
  {
    "url": "/_nuxt/manifest.7c3a279472c1a0eb8776.js",
    "revision": "d6060232a84e8c8f1c5e575c7f5eeb08"
  },
  {
    "url": "/_nuxt/pages/index.5b8bf7085cb0ec77f2cf.js",
    "revision": "89b136a52268c678b90effef6d77e5db"
  },
  {
    "url": "/_nuxt/vendor.c5947927542324e02b7e.js",
    "revision": "3dea28d8c15b88ada989e7855e836a5f"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

