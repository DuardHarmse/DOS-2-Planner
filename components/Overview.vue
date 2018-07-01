<template>
    <v-layout id="attributes" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card>
                <v-card-title primary-title>
                    <v-avatar class="primary white--text mr-2" size="32" v-text="characterState.level"></v-avatar>
                    <div class="headline" v-text="characterState.name"></div>
                </v-card-title>
                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12 sm6>
                            <v-subheader>Origin</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="origins" item-value="_id" item-text="description" v-model="characterState.origin" overflow label="Origin"></v-select>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-subheader>Race</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="races" v-model="characterState.race" item-value="_id" item-text="description" overflow label="Race" :disabled="ddlRaceDisabled"></v-select>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-subheader>Skills</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-chip v-for="skill in skills" :key="skill">
                                {{ skill }}
                            </v-chip>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn flat color="primary" @click="save" :disabled="btnSaveDisabled">Save</v-btn>
                    <v-btn flat :color="btnDeleteColor" @click="confirmDelete" :disabled="btnDeleteDisabled">{{ btnDeleteText }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        mounted() {
            this.partyState = this.$ap;
            this.btnDeleteText = this.btnDeleteTextDefault;
            this.btnDeleteColor = this.btnDeleteColorDefault;

            this.$watch('characterState.origin', this.checkRace);

            this.$db.getOrigins().then((origins) => {
                // Place the Custom origin at the start of the array,
                // thereby making it the first option in the select list.

                let customOrigin, indexCustomOrigin;

                for (let i = 0, l = origins.length; i < l; i++) {
                    if (origins[i]._id == 'custom') {
                        customOrigin = origins[i];
                        indexCustomOrigin = i;
                        break;
                    }
                }

                origins.splice(indexCustomOrigin, 1);
                origins.unshift(customOrigin);


                this.origins = origins;

            });

            this.$db.getRaces().then((races) => {
                this.races = races;
            });
        },
        data: data => ({
            btnDeleteColor: 'accent',
            btnDeleteDisabled: false,
            btnDeleteColorConfirm: 'red',
            btnDeleteColorDefault: 'accent',
            btnDeleteIsConfirming: false,
            btnDeleteText: '',
            btnDeleteTextConfirm: 'Confirm delete',
            btnDeleteTextDefault: 'Delete',
            btnDeleteTimeout: null,
            btnSaveDisabled: false,
            origins: [],
            partyState: {},
            races: []
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members) {
                    return this.partyState.members[this.partyState.activeCharacter];
                }
                else {
                    return {
                        name: '',
                        level: 1,
                        origin: '',
                        race: ''
                    };
                }
            },
            ddlRaceDisabled() {
                if (this.origins.length != 0) {
                    let disable = this.characterState.origin != 'custom';

                    if (disable) {
                        let origin = this.origins.find(o => o._id == this.characterState.origin);
                        this.characterState.name = origin.description;
                    }

                    this.$ee.emit('disableName', disable);

                    return disable;
                }

                return true;
            },
            skills() {
                let origin = this.origins.find(origin => origin._id == this.characterState.origin);

                if (origin) {
                    if (origin.race) {
                        return origin.skills;
                    }
                    else {
                        let race = this.races.find(race => race._id == this.characterState.race) || {};
                        return origin.skills.concat(race.skills);
                    }
                }
                else {
                    return [];
                }
            }
        },
        methods: {
            checkRace() {
                let origin = this.origins.find(origin => origin._id == this.characterState.origin);

                if (origin && origin.race) {
                    this.characterState.race = origin.race;
                }
            },
            save() {
                this.btnSaveDisabled = true;

                this.$db.updateCharacter(this.characterState).then((result) => {
                    this.btnSaveDisabled = false;
                    this.$ee.emit('toast', 'Saved');

                    console.log(`Active character updated to revision '${result.rev}'.`);
                    this.characterState._rev = result.rev;
                });
            },
            confirmDelete() {
                if (!this.btnDeleteIsConfirming) {
                    this.btnDeleteIsConfirming = true;
                    this.btnDeleteText = this.btnDeleteTextConfirm;
                    this.btnDeleteColor = this.btnDeleteColorConfirm;

                    this.btnDeleteTimeout = setTimeout(this.resetBtnDelete, 2500);
                }
                else {
                    this.delete();
                }
            },
            resetBtnDelete() {
                clearTimeout(this.btnDeleteTimeout);
                this.btnDeleteIsConfirming = false;
                this.btnDeleteText = this.btnDeleteTextDefault;
                this.btnDeleteColor = this.btnDeleteColorDefault;
                this.btnDeleteDisabled = false;
            },
            delete() {
                this.btnDeleteDisabled = true;

                if (this.$ap.members.length > 1) {
                    this.$db.deleteCharacter(this.$ac, this.$ap).then((party) => {
                        this.partyState = party;

                        this.$ee.emit('switchCharacter', this.partyState.members[0]);
                        this.resetBtnDelete();
                        this.$ee.emit('toast', 'Character deleted');
                    });
                }
                else {
                    this.$db.resetCharacter(this.$ac).then((character) => {
                        this.$ee.emit('switchCharacter', character);
                        this.resetBtnDelete();
                        this.$ee.emit('toast', 'Character reset to default');
                    });
                }
            }
        }
    }
</script>