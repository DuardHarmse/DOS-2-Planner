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
    plugins: [
        '~/plugins/vuetify.js',
        { src: '~/plugins/db-worker', ssr: false },
        { src: '~/plugins/character-state', ssr: false },
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
