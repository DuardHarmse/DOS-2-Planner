<style>
    .loading-glare::before {
        content: " ";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 50%;
        z-index: 5;
        width: 500%;
        margin-left: -250%;
        animation: phAnimation .8s linear infinite;
        background: linear-gradient(to right, transparent 46%, rgba(255, 255, 255, 0.35) 50%, transparent 54%) 50% 50%;
    }

    @keyframes phAnimation {
        0% {
            transform: translate3d(-30%, 0, 0);
        }
        100% {
            transform: translate3d(30%, 0, 0);
        }
    }
</style>
<template>
    <v-app :class="{ 'loading-glare': isLoading }">
        <v-slide-x-transition>
            <div v-show="isLoading">

                <v-toolbar color="grey lighten-2" height="64"></v-toolbar>
                <v-layout id="overview" class="pa-3">
                    <v-flex xl6 offset-xl3 md4 offset-md4 sm6 offset-sm3>
                        <v-card color="grey lighten-2">
                            <v-card-title primary-title>
                                <v-avatar size="48" color="grey"></v-avatar>
                            </v-card-title>
                            <v-card-text>
                                <v-container grid-list-md text-xs-center>
                                    <v-layout row wrap>
                                        <v-flex xs12>
                                            <v-card dark color="grey">
                                                <v-card-text class="px-0"></v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout row wrap>
                                        <v-flex xs12>
                                            <v-card dark color="grey darken-1">
                                                <v-card-text class="px-0"></v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout row wrap>
                                        <v-flex xs6>
                                            <v-card dark color="grey">
                                                <v-card-text class="px-0"></v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout row wrap>
                                        <v-flex xs8 class="mb-3">
                                            <v-card dark color="grey">
                                                <v-card-text class="px-0"></v-card-text>
                                            </v-card>
                                        </v-flex>
                                    </v-layout>
                                    <v-layout row wrap>
                                        <v-flex xs12 text-xs-left>
                                            <v-btn color="grey darken-1" class="grey--text text--darken-1">Button</v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
                <v-bottom-nav color="grey lighten-2" :value="true" fixed dark id="bottom-nav">
                    <div class="bottom-nav__scroll-container">
                        <v-btn flat>
                            &nbsp;
                            <v-icon>timer</v-icon>
                        </v-btn>
                    </div>
                </v-bottom-nav>

            </div>
        </v-slide-x-transition>

        <v-slide-x-reverse-transition>
            <div v-show="showMainContent">

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
                            <v-btn @click="addParty()" flat icon color="primary" dark>
                                <v-icon>group_add</v-icon>
                            </v-btn>
                        </v-subheader>
                        <v-list-tile v-for="item in parties" :key="item._id" avatar @click.stop="switchParty(item)">
                            <v-list-tile-avatar>
                                <v-icon color="accent" dark>group</v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content class="pl-2">{{ item.name }}</v-list-tile-content>
                            <v-list-tile-action v-if="parties.length > 1">
                                <confirm-btn icon-default="delete" icon-confirm="delete_forever" @click="deleteParty(item)" :disabled="item.btnDeleteDisabled">
                                    <template slot-scope="props">
                                        <v-btn icon ripple :disabled="props.disabled">
                                            <v-icon :color="props.color">{{ props.icon }}</v-icon>
                                        </v-btn>
                                    </template>
                                </confirm-btn>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-list>
                    <v-divider></v-divider>
                    <v-list dense>
                        <v-list-tile @click="() => {}" ripple :disabled="true">
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
                
                <confirm-btn icon-default="delete" icon-confirm="delete_forever" text-default="Test" text-confirm="Test Confirm" @click="logClick">
                    <template slot-scope="props">
                        <v-btn dark :color="props.color">
                            {{ props.text }}
                            <v-icon>{{ props.icon }}</v-icon>
                        </v-btn>
                    </template>
                </confirm-btn>

                <v-speed-dial v-model="fab" bottom right direction="left" fixed style="bottom: 72px;">
                    <v-btn slot="activator" v-model="fab" color="primary" dark fab>
                        <v-icon>more_horiz</v-icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click.stop="addPartyMember" :disabled="btnAddPartyMemberDisabled || isFullParty" class="white--text">
                        <v-icon>person_add</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="saveCharacter" :disabled="btnSaveCharacterDisabled" class="white--text">
                        <v-icon>save</v-icon>
                    </v-btn>
                    <confirm-btn icon-default="delete" icon-confirm="delete_forever" @click="deleteCharacter" :disabled="btnDeleteCharacterDisabled || isSoloParty">
                        <template slot-scope="props">
                            <v-btn fab small :color="props.color" :disabled="props.disabled" class="white--text">
                                <v-icon>{{ props.icon }}</v-icon>
                            </v-btn>
                        </template>
                    </confirm-btn>
                </v-speed-dial>

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

            </div>
        </v-slide-x-reverse-transition>
    </v-app>
</template>

<script>
    import ConfirmBtn from '~/components/ConfirmBtn.vue';
    import Overview from '~/components/Overview.vue';
    import Attributes from "~/components/Attributes.vue";
    import Combat from "~/components/Combat.vue"
    import Civil from "~/components/Civil.vue"
    import Talents from "~/components/Talents.vue";

    export default {
        mounted() {
            this.parties = this.$store.parties.map(party => Object.assign(party, {
                btnDeleteColor: this.btnDeleteColorDefault,
                btnDeleteDisabled: false
            }));
            this.partyState = this.$store.activeParty;
            this.activeCharacter = this.$store.activeCharacter;

            this.activeParty = this.parties[0]._id;

            this.attributeState = this.$attributeStore;
            this.combatAbilityState = this.$combatAbilityStore;
            this.civilAbilityState = this.$civilAbilityStore;
            this.talentState = this.$talentStore;

            this.$ee.on('disableName', this.disableName);
            this.$ee.on('toast', this.toast);
            this.$ee.on('switchCharacter', this.switchCharacter);
            this.$ee.on('updateActiveParty', this.updateActiveParty);

            this.isLoading = false;
            setTimeout(() => { this.showMainContent = true; }, 1000);
        },
        components: {
            ConfirmBtn,
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
            fab: false,
            talentState: { unspent: 0 },
            btnAddPartyMemberDisabled: false,
            btnDeleteCharacterDisabled: false,
            btnSaveCharacterDisabled: false,
            drawer: null,
            isLoading: true,
            nameDisabled: false,
            parties: [],
            partyState: {
                members: []
            },
            showMainContent: false,
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
            isFullParty() {
                return this.partyState.members.length == 4;
            },
            isSoloParty() {
                return this.partyState.members.length == 1;
            }
        },
        methods: {
            logClick(event, reset) {
                console.log('Click');

                reset();
                this.btnDeleteCharacterDisabled = true;

                setTimeout(() => {
                    this.btnDeleteCharacterDisabled = false;
                }, 1000);
            },
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
            saveCharacter() {
                this.btnSaveCharacterDisabled = true;

                let numOperations = 2,
                    numCompletedOperations = 0,
                    updateCharacterResult = null,
                    updatePartyResult = null;

                this.$db.updateCharacter(this.characterState).then((result) => {
                    numCompletedOperations++;
                    updateCharacterResult = result;

                    if (numCompletedOperations == numOperations) {
                        update(updateCharacterResult, updatePartyResult);
                    }
                });

                this.$db.updateParty(this.partyState).then((result) => {
                    numCompletedOperations++;
                    updatePartyResult = result;

                    if (numCompletedOperations == numOperations) {
                        update(updateCharacterResult, updatePartyResult);
                    }
                });

                let update = (character, party) => {
                    this.btnSaveCharacterDisabled = false;
                    this.$ee.emit('toast', 'Saved');

                    this.characterState._rev = character.rev;
                    this.partyState.members.find(member => member._id == this.characterState._id).name = this.characterState.name;

                    this.partyState._rev = party.rev;
                    this.parties.find(party => party._id == this.partyState._id).name = this.partyState.name;
                }
            },
            deleteCharacter(event, reset) {
                reset();
                this.btnDeleteCharacterDisabled = true;

                if (this.partyState.members.length > 1) {
                    this.$db.deleteCharacter(this.characterState, this.partyState).then((party) => {
                        Object.assign(this.partyState, party);
                        this.btnDeleteCharacterDisabled = false;

                        this.$ee.emit('switchCharacter', this.partyState.members[0]);
                        this.$ee.emit('toast', 'Character deleted');
                    });
                }
                else {
                    this.$db.resetCharacter(this.$ac).then((character) => {
                        this.btnDeleteCharacterDisabled = false;
                        this.$ee.emit('toast', 'Character reset to default');
                    });
                }
            },
            switchCharacter(character) {
                this.activeCharacter.character = character._id;
            },
            switchParty(party) {
                this.$db.getParty(party._id).then((newParty) => {
                    Object.assign(this.partyState, newParty);
                    this.switchCharacter(this.partyState.members[0]);

                    this.drawer = false;
                }).catch((err) => {
                    console.error(err);
                });
            },
            checkParty(party) {
                if (party._id == this.activeParty) {
                    return 'active';
                }
            },
            addPartyMember() {
                this.btnAddPartyMemberDisabled = true;

                this.$db.addPartyMember(this.partyState).then((result) => {
                    this.partyState.members.push(result.character);
                    this.partyState._rev = result.party._rev;

                    this.switchCharacter(this.partyState.members[this.partyState.members.length - 1]);

                    this.btnAddPartyMemberDisabled = false;
                });
            },
            getMemberName(member) {
                if (this.activeCharacter == member._id) {
                    return this.characterState.name;
                }
                else {
                    return member.name;
                }
            },
            addParty() {
                this.$db.addParty().then((result) => {
                    this.parties.push({
                        _id: result.party._id,
                        name: result.party.name,
                        btnDeleteColor: this.btnDeleteColorDefault,
                    });
                }).catch((err) => {
                    console.error(err);
                });
            },
            deleteParty(party) {
                party.btnDeleteDisabled = true;

                this.$db.deleteParty(party).then(() => {
                    this.parties = this.parties.filter(p => p._id != party._id);
                    this.switchParty(this.parties[0]);
                    party.btnDeleteDisabled = false;
                    this.$ee.emit('toast', 'Party deleted');
                });
            },
            updateActiveParty(details) {
                let activeParty = this.parties.find(party => party._id == this.activeParty);
                activeParty.name = details.name;
            }
        }
    };
</script>