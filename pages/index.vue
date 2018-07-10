<template>
    <div id="app"></div>
</template>

<script>
    export default {
        asyncData (context) {
            debugger;
            return { project: 'nuxt' };
        },
        data: data => ({
            test: true
        })
    };
</script>