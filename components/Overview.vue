<template>
    <v-layout id="attributes" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card>
                <v-card-title primary-title>
                    <v-avatar class="primary white--text mr-2" size="32" v-text="level"></v-avatar>
                    <div class="headline" v-text="name"></div>
                </v-card-title>
                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12 sm6>
                            <v-subheader>Origin</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="origins" item-value="_id" item-text="description" v-model="origin" overflow label="Origin" @input="checkRace"></v-select>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-subheader>Race</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="races" v-model="race" item-value="_id" item-text="description" overflow label="Race" @input="checkSkills"
                                :disabled="disableRace"></v-select>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-subheader>Skills</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-chip v-for="skill in skills" :key="skill">
                                <span v-text="skill"></span>
                            </v-chip>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn flat color="primary" @click="save" :disabled="disableSave">Save</v-btn>
                    <v-btn flat :color="resetBtnColor" @click="confirmReset" :disabled="disableReset">{{ resetBtnText }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        props: ['level', 'name'],
        mounted() {
            this.resetBtnText = this.defaultResetText;
            this.resetBtnColor = this.defaultResetColor;

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
                this.origin = this.$ac.origin;
            });

            this.$db.getRaces().then((races) => {
                this.races = races;
                this.race = this.$ac.race;
            });
        },
        data: data => ({
            origins: [],
            races: [],
            origin: null,
            race: null,
            skills: [
                'Dome of Protection',
                'Encourage'
            ],
            resetBtnText: '',
            resetBtnColor: 'accent',
            defaultResetText: 'Delete',
            confirmResetText: 'Confirm delete',
            defaultResetColor: 'accent',
            confirmResetColor: 'red',
            resetBtnTimeout: null,
            disableReset: false,
            disableSave: false
        }),
        computed: {
            disableRace() {
                if (this.origins.length != 0) {
                    let disable = this.origin != 'custom';

                    if (disable) {
                        let origin = this.origins.find(o => o._id == this.origin);
                        this.$ee.emit('updateName', origin.description);
                    }

                    this.$ee.emit('disableName', disable);

                    return disable;
                }

                return true;
            }
        },
        methods: {
            checkRace() {
                let origin = this.origins.find(origin => origin._id == this.origin);

                if (origin && origin.race) {
                    this.race = origin.race;
                }

                this.checkSkills();
            },
            checkSkills() {
                let origin = this.origins.find(origin => origin._id == this.origin);

                if (origin) {
                    if (origin.race) {
                        this.skills = origin.skills;
                    }
                    else {
                        let race = this.races.find(race => race._id == this.race);
                        this.skills = origin.skills.concat(race.skills);
                    }
                }
            },
            save() {
                this.disableSave = true;
                this.$ac.level = this.level;
                this.$ac.name = this.name;

                this.$ac.origin = this.origin;
                this.$ac.race = this.race;

                this.$db.updateActiveCharacter(this.$ac).then((result) => {
                    this.disableSave = false;
                    this.$ee.emit('toast', 'Saved');

                    console.log(`Active character updated to revision '${result.rev}'.`);
                    this.$ac._rev = result.rev;
                });
            },
            confirmReset() {
                if (this.resetBtnText != this.confirmResetText) {
                    this.resetBtnText = this.confirmResetText;
                    this.resetBtnColor = this.confirmResetColor;

                    this.resetBtnTimeout = setTimeout(this.defaultResetBtn, 2500);
                }
                else {
                    this.reset();
                }
            },
            defaultResetBtn() {
                clearTimeout(this.resetBtnTimeout);
                this.resetBtnColor = this.defaultResetColor;
                this.resetBtnText = this.defaultResetText;
            },
            reset() {
                this.disableReset = true;

                this.$db.resetActiveCharacter(this.$ac).then((activeCharacter) => {
                    for (let prop in activeCharacter) {
                        this.$ac[prop] = activeCharacter[prop];

                        this.$ee.emit('updateName', activeCharacter.name);
                        this.$ee.emit('updateLevel', activeCharacter.level);

                        this.$ee.emit('resetAttributes');
                        this.$ee.emit('resetCmbtAbilities');
                        this.$ee.emit('resetCivlAbilities');
                        this.$ee.emit('resetTalents');
                    }

                    this.defaultResetBtn();
                    this.disableReset = false;
                    this.$ee.emit('toast', 'Character reset to default');
                });
            }
        }
    };
</script>