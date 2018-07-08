module.exports = {
    /*
    ** Headers of the page
    */
    head: {
        title: 'dos-2-planner',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
            { hid: 'description', name: 'description', content: '{{escape description }}' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
        ]
    },
    manifest: {
        'name': 'DOS 2 Planner',
        'short_name': 'DOS2P',
        'theme_color': '#1976d2',
        'background_color': '#1976D2',
        'display': 'standalone',
        'description': 'Party planner for Divinity: Original Sin 2.',
        'icons': [{
            'src': '/icons/icon-72x72.png',
            'sizes': '72x72',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-96x96.png',
            'sizes': '96x96',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-144x144.png',
            'sizes': '144x144',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-152x152.png',
            'sizes': '152x152',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
        }, {
            'src': '/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
        }]
    },
    plugins: [
        '~/plugins/vuetify.js',
        { src: '~/plugins/db-worker', ssr: false },
        { src: '~/plugins/stores/party-store', ssr: false },
        '~/plugins/stores/attribute-store',
        '~/plugins/stores/combat-ability-store',
        '~/plugins/stores/civil-ability-store',
        '~/plugins/stores/talent-store',
        '~/plugins/event-emitter.js'
    ],
    css: [
        { src: '~/assets/style/app.styl', lang: 'styl' }
    ],
    modules: [
        '@nuxtjs/pwa',
        'workerize-loader'
    ],
    /*
    ** Customize the progress bar color
    */
    loading: { color: '#1976D2' },
    /*
    ** Build configuration
    */
    build: {
        vendor: ['~/plugins/db-worker.js'],
        extend(config, { isDev, isClient }) {
            // Web Worker support
            if (isClient) {
                config.module.rules.push({
                    test: /\.worker\.js$/,
                    use: { loader: 'worker-loader' },
                    exclude: /(node_modules)/
                })
            }
        }
    }
}
