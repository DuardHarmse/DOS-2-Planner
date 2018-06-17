<template>
    <v-app>
        <v-navigation-drawer v-model="drawer" temporary fixed>
            <v-toolbar flat>
                <v-list>
                    <v-list-tile>
                        <v-list-tile-title class="title">DOS 2 Planner</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-toolbar>
            <v-divider></v-divider>
            <v-list two-line subheader>
                <v-subheader inset class="pr-0">
                    <span>Party</span>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="primary" dark>
                        <v-icon>add</v-icon>
                    </v-btn>
                </v-subheader>
                <v-list-tile v-for="item in items" :key="item.title" avatar>
                    <v-list-tile-avatar>
                        <v-icon color="primary" dark>{{ item.icon }}</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content class="pl-2">
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple>
                            <v-icon color="grey lighten-1">delete</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <v-list dense>
                <v-list-tile @click="" ripple>
                    <v-list-tile-action>
                        <v-icon>settings</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Settings</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>

        <v-toolbar color="primary" class="elevation-4 mb-3" dark tabs>
            <v-toolbar-side-icon @click.stop="toggleDrawer"></v-toolbar-side-icon>
            <v-toolbar-title>
                <input v-model="name" class="inline-input" :disabled="disableName" style="width: 360px;">
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="decLevel()">
                <v-icon>remove</v-icon>
            </v-btn>
            <input v-model.number.lazy="level" @change="changeLevel()" class="text-xs-center inline-input">
            <v-btn icon @click="incLevel()">
                <v-icon>add</v-icon>
            </v-btn>
            <v-tabs v-model="activeTab" slot="extension" centered color="primary">
                <v-tab href="#overview" ripple>Overview</v-tab>
                <v-tab href="#attributes" ripple>Attributes</v-tab>
                <v-tab href="#combat" ripple>Combat</v-tab>
                <v-tab href="#civil" ripple>Civil</v-tab>
                <v-tab href="#talents" ripple>Talents</v-tab>
            </v-tabs>
        </v-toolbar>
        <v-tabs-items v-model="activeTab">
            <v-tab-item id="overview">
                <Overview :level="level" :name="name" />
            </v-tab-item>
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

        <v-fab-transition>
            <v-btn v-show="!hideFab" color="primary" dark fixed bottom right fab style="bottom: 72px;">
                <v-icon>add</v-icon>
            </v-btn>
        </v-fab-transition>

        <v-bottom-nav :value="true" :active.sync="bottomNav" fixed dark id="bottom-nav">
            <div class="bottom-nav__scroll-container">
                <v-btn v-for="partyMember in party" :key="partyMember" flat :value="partyMember" color="primary">
                    <span v-text="name"></span>
                    <v-icon>account_circle</v-icon>
                </v-btn>
            </div>
        </v-bottom-nav>

        <v-snackbar :timeout="snackbarTimeout" bottom v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
    import Overview from '~/components/Overview.vue';
    import Attributes from "~/components/Attributes.vue";
    import Combat from "~/components/Combat.vue"
    import Civil from "~/components/Civil.vue"
    import Talents from "~/components/Talents.vue";

    export default {
        mounted() {
            this.level = this.$ac.level;
            this.name = this.$ac.name;

            this.$ee.on('updateName', (name) => {
                this.name = name;
            });
            this.$ee.on('disableName', (disable) => {
                this.disableName = disable;
            });
            this.$ee.on('updateLevel', (level) => {
                this.level = level;
            });

            this.$ee.on('toast', this.toast);
        },
        components: {
            Overview,
            Attributes,
            Combat,
            Civil,
            Talents
        },
        data() {
            return {
                activeTab: null,
                level: 1,
                name: '',
                bottomNav: 1,
                party: [1],
                drawer: null,
                items: [
                    { icon: 'account_circle', title: 'Character #1', subtitle: 'Class goes here' },
                    { icon: 'account_circle', title: 'Character #2', subtitle: 'Class goes here' },
                    { icon: 'account_circle', title: 'Character #3', subtitle: 'Class goes here' }
                ],
                disableName: false,
                snackbar: false,
                snackbarTimeout: 2500,
                snackbarMessage: ''
            };
        },
        computed: {
            hideFab() {
                return this.activeTab != 'overview';
            }
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
            },
            toggleDrawer() {
                this.drawer = !this.drawer;
            },
            toast(message) {
                this.snackbarMessage = message;
                this.snackbar = true;
            }
        }
    };
</script>