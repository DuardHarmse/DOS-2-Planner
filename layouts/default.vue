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
                <v-subheader inset class="pr-0 ml-0">
                    <span>Party Management</span>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="primary" dark>
                        <v-icon>add</v-icon>
                    </v-btn>
                </v-subheader>
                <v-list-tile v-for="item in parties" :key="item.title" avatar @click="switchParty(item)" :class="checkParty(item)">
                    <v-list-tile-avatar>
                        <v-icon color="primary" dark>account_circle</v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content class="pl-2">
                        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                        <!-- <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title> -->
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-btn icon ripple @click.stop="confirmDeleteParty(item)" :disabled="item.isDeleting">
                            <v-icon :color="item.btnDeleteColor">delete</v-icon>
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
                <input v-model="characterState.name" class="inline-input" :disabled="nameDisabled" style="width: 360px;">
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="decLevel()">
                <v-icon>remove</v-icon>
            </v-btn>
            <input v-model.number.lazy="characterState.level" @change="changeLevel()" class="text-xs-center inline-input">
            <v-btn icon @click="incLevel()">
                <v-icon>add</v-icon>
            </v-btn>
            <v-tabs v-model="activeTab" slot="extension" centered color="primary">
                <v-tab href="#overview" ripple>Overview</v-tab>
                <v-tab href="#attributes" ripple>
                    Attributes
                    <v-subheader class="pl-2 pr-0">{{ attributeState.unspent }}</v-subheader>
                </v-tab>
                <v-tab href="#combat" ripple>
                    Combat
                    <v-subheader class="pl-2 pr-0">{{ combatAbilityState.unspent }}</v-subheader>
                </v-tab>
                <v-tab href="#civil" ripple>
                    Civil
                    <v-subheader class="pl-2 pr-0">{{ civilAbilityState.unspent }}</v-subheader>
                </v-tab>
                <v-tab href="#talents" ripple>
                    Talents
                    <v-subheader class="pl-2 pr-0">{{ talentState.unspent }}</v-subheader>
                </v-tab>
            </v-tabs>
        </v-toolbar>
        <v-tabs-items v-model="activeTab">
            <v-tab-item id="overview">
                <Overview />
            </v-tab-item>
            <v-tab-item id="attributes">
                <Attributes />
            </v-tab-item>
            <v-tab-item id="combat">
                <Combat />
            </v-tab-item>
            <v-tab-item id="civil">
                <Civil />
            </v-tab-item>
            <v-tab-item id="talents">
                <Talents />
            </v-tab-item>
        </v-tabs-items>

        <v-fab-transition>
            <v-btn v-show="!hideFab" color="primary" @click="addPartyMember" dark fixed bottom right fab style="bottom: 72px;">
                <v-icon>add</v-icon>
            </v-btn>
        </v-fab-transition>

        <v-bottom-nav :value="true" :active.sync="activeCharacter.character" fixed dark id="bottom-nav">
            <div class="bottom-nav__scroll-container">
                <v-btn v-for="member in partyState.members" :key="member._id" flat :value="member._id" @click="switchCharacter(member)" color="primary">
                    {{ member.name }}
                    <v-icon>account_circle</v-icon>
                </v-btn>
            </div>
        </v-bottom-nav>

        <v-snackbar :timeout="snackbarTimeout" bottom left v-model="snackbar">
            {{ snackbarMessage }}
            <v-btn flat color="accent" @click.native="snackbar = false">Close</v-btn>
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
            this.parties = this.$store.parties;
            this.partyState = this.$store.activeParty;
            this.activeCharacter = this.$store.activeCharacter;

            this.attributeState = this.$attributeStore;
            this.combatAbilityState = this.$combatAbilityStore;
            this.civilAbilityState = this.$civilAbilityStore;
            this.talentState = this.$talentStore;

            for (let party of this.parties) {
                party.btnDeleteColor = this.btnDeleteColorDefault;
            }

            this.$ee.on('disableName', this.disableName);
            this.$ee.on('toast', this.toast);
            this.$ee.on('switchCharacter', this.switchCharacter);
        },
        components: {
            Overview,
            Attributes,
            Combat,
            Civil,
            Talents
        },
        data: data => ({
            activeCharacter: {},
            activeParty: '',
            activeTab: '',
            attributeState: { unspent: 0 },
            combatAbilityState: { unspent: 0 },
            civilAbilityState: { unspent: 0 },
            talentState: { unspent: 0 },
            btnDeleteColorConfirm: 'red',
            btnDeleteColorDefault: 'accent',
            dialog: false,
            drawer: null,
            nameDisabled: false,
            parties: [
                { _id: 1, title: 'Party #1', subtitle: 'Description of party', btnDeleteColor: '', btnDeleteDisabled: false, btnDeleteTimeout: null },
                { _id: 2, title: 'Party #2', subtitle: 'Description of party', btnDeleteColor: '', btnDeleteDisabled: false, btnDeleteTimeout: null },
                { _id: 3, title: 'Party #3', subtitle: 'Description of party', btnDeleteColor: '', btnDeleteDisabled: false, btnDeleteTimeout: null }
            ],
            parties: [],
            partyState: {
                members: []
            },
            snackbar: false,
            snackbarMessage: '',
            snackbarTimeout: 2500
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members && this.partyState.members.length != 0) {
                    return this.partyState.members.find(member => member._id == this.activeCharacter.character);
                }
                else {
                    return {
                        name: '',
                        level: 0
                    };
                }
            },
            hideFab() {
                return this.activeTab != 'overview';
            }
        },
        methods: {
            disableName(disable) {
                this.nameDisabled = disable;
            },
            incLevel() {
                this.characterState.level++;
            },
            decLevel() {
                if (this.characterState.level > 1) {
                    this.characterState.level--;
                }
            },
            changeLevel() {
                if (this.characterState.level < 1) {
                    this.characterState.level = 1;
                }
            },
            toggleDrawer() {
                this.drawer = !this.drawer;
            },
            toast(message) {
                this.snackbarMessage = message;
                this.snackbar = true;
            },
            switchCharacter(character) {
                this.activeCharacter.character = character._id;
            },
            switchParty(party) {
                this.activeParty = party._id;
                this.drawer = false;
            },
            checkParty(party) {
                if (party._id == this.activeParty) {
                    return 'active';
                }
            },
            confirmDeleteParty(party) {
                if (!party.isDeleting) {
                    party.isDeleting = true;
                    party.btnDeleteColor = this.btnDeleteColorConfirm;
                    party.btnDeleteTimeout = setTimeout(() => { this.resetBtnDelete(party) }, 2500);
                }
                else {
                    this.deleteParty(party);
                }
            },
            resetBtnDelete(party) {
                if (party) {
                    clearTimeout(party.btnDeleteTimeout);
                    delete party.isDeleting;
                    party.btnDeleteColor = this.btnDeleteColorDefault;
                }
            },
            deleteParty(party) {
                this.$db.deleteParty(party).then(() => {
                    for (let i = 0, l = this.parties.length; i < l; i++) {
                        let iParty = this.parties[i];

                        if (iParty._id == party._id) {
                            this.parties.splice(i, 1);
                            break;
                        }
                    }

                    this.resetBtnDelete();
                    this.$ee.emit('toast', 'Party deleted');
                });
            },
            addPartyMember() {
                this.$db.addPartyMember().then((result) => {
                    let members = this.partyState.members.slice();
                    members.push({
                        _id: result.character._id,
                        name: result.character.name
                    });

                    Object.assign(this.partyState, result.party);
                    this.partyState.members = members;

                    this.switchCharacter(this.partyState.members[this.partyState.members.length - 1]);
                });
            },
            getMemberName(member) {
                if (this.activeCharacter == member._id) {
                    return this.characterState.name;
                }
                else {
                    return member.name;
                }
            }
        }
    };
</script>