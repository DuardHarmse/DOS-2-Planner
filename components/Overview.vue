<template>
    <v-layout id="overview" class="pa-3" wrap>
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1 class="mb-3">
            <v-subheader>Party</v-subheader>
            <v-text-field v-model="partyState.name" label="Party name" solo @input="updatePartyName"></v-text-field>
        </v-flex>
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-subheader>Character</v-subheader>
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
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        mounted() {
            this.partyState = this.$store.activeParty;
            this.activeCharacter = this.$store.activeCharacter;

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
            activeCharacter: {},
            origins: [],
            partyState: {
                members: []
            },
            races: [],
            partyName: 'Party #1'
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members && this.partyState.members.length != 0) {
                    return this.partyState.members.find(member => member._id == this.activeCharacter.character);
                }
                else {
                    return {
                        name: '',
                        level: 0,
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
            updatePartyName(value) {
                this.$ee.emit('updateActiveParty', {
                    name: value
                });
            }
        }
    }
</script>