importScripts('/_nuxt/workbox.3de3418b.js')

const workboxSW = new self.WorkboxSW({
  "cacheId": "dos-2-planner",
  "clientsClaim": true,
  "directoryIndex": "/"
})

workboxSW.precache([
  {
    "url": "/_nuxt/app.0ecdf2fb6efea23b0f23.js",
    "revision": "8a1b54b608d8e4250020b3a947d9897d"
  },
  {
    "url": "/_nuxt/bf6abfa39770fb65c997.worker.js",
    "revision": "9925ca5527ad70f70fed9d87e1dd7954"
  },
  {
    "url": "/_nuxt/layouts_default.6b7c2d6653f2fb6172fa.js",
    "revision": "b38816fa48bd7b1136bd22531892c3e7"
  },
  {
    "url": "/_nuxt/manifest.5a60054a3f6168a9924f.js",
    "revision": "50f9b04b254256685cfb9412e01cd4c4"
  },
  {
    "url": "/_nuxt/pages_index.12ee0ea0346133db281c.js",
    "revision": "b874a55a6ef183d7f6dd30a0717bf246"
  },
  {
    "url": "/_nuxt/vendor.d24487a8a2907db6abaf.js",
    "revision": "bb9e39c064306123038f3afcd91ca653"
  }
])


workboxSW.router.registerRoute(new RegExp('/_nuxt/.*'), workboxSW.strategies.cacheFirst({}), 'GET')

workboxSW.router.registerRoute(new RegExp('/.*'), workboxSW.strategies.networkFirst({}), 'GET')

