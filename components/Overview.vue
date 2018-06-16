<template>
    <v-layout id="attributes" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card>
                <v-card-title primary-title>
                    <div class="headline" v-text="name"></div>
                </v-card-title>
                <v-card-text>
                    <v-layout row wrap>
                        <v-flex xs12 sm6>
                            <v-subheader>Origin</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="origins" item-value="_id" item-text="desc" v-model="origin" overflow label="Origin" @input="checkRace"></v-select>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-subheader>Race</v-subheader>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-select :items="races" v-model="race" item-value="_id" item-text="desc" overflow label="Race" @input="checkSkills" :disabled="disableRace"></v-select>
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
                    <v-btn icon class="primary--text">
                        <v-icon>delete</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    // import worker from 'workerize-loader!~/static/db-worker.js';

    export default {
        props: ['level', 'name'],
        mounted() {
            this.$worker.getOrigins().then((origins) => {
                this.origins = origins;
                this.origin = this.origins[0]._id;
            })

            this.$worker.getRaces().then((races) => {
                this.races = races;
                this.race = this.races[0]._id;
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
            ]
        }),
        computed: {
            disableRace() {
                if (this.origins.length != 0) {
                    let origin = this.origins.find(origin => origin._id == this.origin);
                    return origin.desc != 'Custom';
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
            }
        }
    };
</script>