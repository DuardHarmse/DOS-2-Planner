<template>
    <v-app>
        <div>
            <v-toolbar color="primary" class="elevation-4 mb-3" dark tabs>
                <v-toolbar-title>
                    <input v-model="name" class="inline-input" style="width: 360px;">
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="decLevel()">
                    <v-icon>remove</v-icon>
                </v-btn>
                <input v-model.number.lazy="level" @change="changeLevel()" class="text-xs-center inline-input">
                <v-btn icon @click="incLevel()">
                    <v-icon>add</v-icon>
                </v-btn>
                <v-tabs v-model="active" slot="extension" centered color="primary">
                    <v-tab href="#attributes" ripple>Attributes</v-tab>
                    <v-tab href="#combat" ripple>Combat</v-tab>
                    <v-tab href="#civil" ripple>Civil</v-tab>
                    <v-tab href="#talents" ripple>Talents</v-tab>
                </v-tabs>
            </v-toolbar>
            <v-tabs-items v-model="active">
                <v-tab-item id="attributes">
                    <Attributes :level="level" />
                </v-tab-item>
                <v-tab-item id="combat">
                    <Combat :level="level" />
                </v-tab-item>
                <v-tab-item id="civil">
                    <Civil :level="level" />
                </v-tab-item>
                <v-tab-item id="talents">
                    <Talents :level="level" />
                </v-tab-item>
            </v-tabs-items>
        </div>
    </v-app>
</template>

<script>
    import Attributes from "~/components/Attributes.vue";
    import Combat from "~/components/Combat.vue"
    import Civil from "~/components/Civil.vue"
    import Talents from "~/components/Talents.vue";

    export default {
        components: {
            Attributes,
            Combat,
            Civil,
            Talents
        },
        data() {
            return {
                active: null,
                level: 1,
                name: "Character Name",
                attr: {
                    value: 1,
                    bonus: 0
                }
            };
        },
        methods: {
            incLevel() {
                this.level++;
            },
            decLevel() {
                if (this.level > 1) {
                    this.level--;
                }
            },
            changeLevel() {
                if (this.level < 1) {
                    debugger;
                    this.level = 1;
                }
            }
        }
    };
</script>