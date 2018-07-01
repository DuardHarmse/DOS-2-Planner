<template>
    <v-layout id="talents" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table :headers="headers" :items="items" item-key="_id" :loading="true" hide-actions select-all class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th @click="changeSort(header.value)" class="text-xs-left">Talents</th>
                                <th class="text-xs-right shrinked-column px-0">{{ unspent }} unspent</th>
                                <th class="text-xs-right">
                                    <v-checkbox :input-value="characterState.talents.length == items.length || unspent == 0" :indeterminate="characterState.talents.length > 0 && characterState.talents.length < items.length && unspent > 0"
                                        primary hide-details @click.native="toggleAll"></v-checkbox>

                                </th>
                            </tr>
                        </template>
                        <v-progress-linear v-model="percentage" slot="progress" color="blue"></v-progress-linear>
                        <template slot="items" slot-scope="props">
                            <tr :active="props.selected" @click="changeTalent(props)">
                                <td colspan="2">
                                    <v-btn flat icon @click.stop="props.expanded = !props.expanded">
                                        <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
                                        <v-icon v-else>keyboard_arrow_down</v-icon>
                                    </v-btn>
                                    <span>{{ props.item.name }}</span>
                                </td>
                                <td class="shrinked-column">
                                    <v-checkbox @click.stop="changeTalent(props)" primary hide-details :input-value="characterState.talents.indexOf(props.item._id) != -1"></v-checkbox>
                                </td>
                            </tr>
                        </template>
                        <template slot="expand" slot-scope="props">
                            <v-card flat>
                                <v-card-text>{{ props.item.description }}</v-card-text>
                            </v-card>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        mounted() {
            this.partyState = this.$ap;

            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal && this.unspent < 0) {
                    this.resetTalents();
                }
            });

            // this.$watch("selected", function(newVal, oldVal) {
            //     this.$ac.talents = newVal.map(item => item._id);

            //     for (let i = 0, l = newVal.length; i < l; i++) {
            //         let newTalent = newVal[i];
            //         let exists = false;

            //         for (let j = 0, m = oldVal.length; j < m; j++) {
            //             let oldTalent = oldVal[j];

            //             if (newTalent._id == oldTalent._id) {
            //                 exists = true;
            //                 oldVal.splice(j, 1);
            //                 break;
            //             }
            //         }

            //         if (!exists) {
            //             if (newTalent.modifier && newTalent.modifier.attribute) {
            //                 newTalent.modifier.attribute.onActivate(this);
            //             }
            //         }
            //     }

            //     for (let i = 0, l = oldVal.length; i < l; i++) {
            //         let oldTalent = oldVal[i];

            //         if (oldTalent.modifier && oldTalent.modifier.attribute) {
            //             oldVal[i].modifier.attribute.onDeactivate(this);
            //         }
            //     }

            //     this.$ee.on('resetTalents', this.resetTalents)

            //     // Attributes, combat and civil abilities should be applied only when the bonuses from talents have been applied.
            //     // this.$ee.emit('talentsApplied');
            // });

            this.$db.getTalents().then((talents) => {
                this.items = talents;
                this.show = true;
                // let acTalents = [];

                // for (let i = 0, l = this.items.length; i < l; i++) {
                //     let talent = this.items[i];

                //     if (talent.modifier && talent.modifier.attribute) {
                //         if (this.hasOwnProperty(talent.modifier.attribute)) {
                //             talent.modifier.attribute = this[talent.modifier.attribute].call();
                //         }
                //         else {
                //             console.warn(`Could not find attribute modifier function '${talent.modifier.attribute}'.`);
                //         }
                //     }

                //     if (this.$ac.talents.indexOf(talent._id) != -1) {
                //         acTalents.push(talent);
                //     }
                // }

                // // Set all at once to prevent the $watch on data.selected to trigger with `newVal` and `oldVal` having the same value.
                // this.selected = acTalents;
            });
        },
        data: () => ({
            bonus: 0,
            headers: [
                {
                    id: "column_talent",
                    text: "Talent",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    id: "unspent_talents",
                    text: " unspent",
                    align: "right"
                }
            ],
            items: [],
            pagination: {
                sortBy: "name"
            },
            partyState: {}
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members) {
                    return this.partyState.members[this.partyState.activeCharacter];
                }
                else {
                    return {
                        talents: []
                    };
                }
            },
            fromLevel() {
                if (this.characterState.level > 4) return parseInt((this.characterState.level - 3) / 5 + 2);
                if (this.characterState.level > 2) return 2;
                return 1;
            },
            spent() {
                return this.characterState.talents.length;
            },
            unspent() {
                let unspent = this.fromLevel + this.bonus - this.spent;

                this.$talentStore.unspent = unspent;

                return unspent;
            },
            percentage() {
                return this.spent / (this.fromLevel + this.bonus) * 100;
            }
        },
        methods: {
            getHeaderClass(align) {
                if (align) {
                    return `text-xs-${align}`;
                } else {
                    return "text-xs-left";
                }
            },
            toggleAll() {
                if (this.characterState.talents.length) {
                    this.characterState.talents = [];
                }
                else {
                    let talents = [];

                    for (let i = 0, l = this.unspent, m = this.items.length; i < l && i < m; i++) {
                        this.items[i].selected = true;
                        talents.push(this.items[i]._id);
                    }

                    this.characterState.talents = talents;
                }
            },
            resetTalents() {
                this.characterState.talents = [];
            },
            changeTalent(props) {
                let index = this.characterState.talents.indexOf(props.item._id);

                if (index != -1) {
                    this.characterState.talents.splice(index, 1);
                }
                else if (this.unspent > 0) {
                    this.characterState.talents.push(props.item._id);
                }
            },
            toggleAllTalents(props) {
                if (this.selected.length) this.characterState.talents = [];
                else this.characterState.talents = this.items.slice();
            },
            changeSort(column) {
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending;
                } else {
                    this.pagination.sortBy = column;
                    this.pagination.descending = false;
                }
            },

            allSkilledUpAtrributeModifier() {
                let self = {
                    onActivate: onActivate,
                    onDeactivate: onDeactivate,
                    hasActivated: false
                };

                return self;

                function onActivate(vue) {
                    if (!self.hasActivated) {
                        self.hasActivated = true;
                        vue.$ee.emit('incCmbtBonus', 1);
                        vue.$ee.emit('incCivlBonus', 1);
                    }
                }

                function onDeactivate(vue) {
                    self.hasActivated = false;
                    vue.$ee.emit("incCmbtBonus", -1);
                    vue.$ee.emit("incCivlBonus", -1);
                    vue.$ee.emit("resetCmbtAbilities");
                    vue.$ee.emit("resetCivlAbilities");
                }
            },

            loneWolfAttributeModifier() {
                let self = {
                    runCount: 0,
                    maxRunCount: 1,
                    exec: exec,
                    onActivate: onActivate,
                    onDeactivate: onDeactivate,
                    hasActivated: false
                };

                return self;

                function exec(vue, item) {
                    if (self.runCount < self.maxRunCount) {
                        self.runCount++;
                        vue.incAttribute(item);
                    }
                }

                function onActivate(vue) {
                    if (!self.hasActivated) {
                        self.hasActivated = true;
                        vue.$ee.emit("incAttrValue", 1);
                        vue.$ee.emit("resetAttributes");
                        vue.$ee.emit("incCmbtValue", 1);
                        vue.$ee.emit("resetCmbtAbilities");
                    }
                }

                function onDeactivate(vue) {
                    self.hasActivated = false;
                    vue.$ee.emit("incAttrValue", -1);
                    vue.$ee.emit("resetAttributes");
                    vue.$ee.emit("incCmbtValue", -1);
                    vue.$ee.emit("resetCmbtAbilities");
                }
            },

            biggerAndBetterAttributeModifier() {
                let self = {
                    onActivate: onActivate,
                    onDeactivate: onDeactivate,
                    hasActivated: false
                };
                let attrBaseibutes = null;

                return self;

                function onActivate(vue) {
                    vue.$ee.emit("incAttrBonus", 2);
                    self.hasActivated = true;
                }

                function onDeactivate(vue) {
                    vue.$ee.emit("incAttrBonus", -2);
                    self.hasActivated = false;
                    vue.$ee.emit("resetAttributes");
                }
            }
        }
    };
</script>