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
            this.partyState = this.$store.activeParty;
            this.activeCharacter = this.$store.activeCharacter;

            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal && this.unspent < 0) {
                    this.resetTalents();
                }
            });

            this.$watch('characterState.talents', this.applyTalents);

            this.$db.getTalents().then((talents) => {
                this.items = talents;
                this.show = true;

                this.applyTalents(this.characterState.talents, []);
            });
        },
        data: () => ({
            activeCharacter: {},
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
                if (this.partyState && this.partyState.members && this.partyState.members.length != 0) {
                    return this.partyState.members.find(member => member._id == this.activeCharacter.character);
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
                let talents = this.characterState.talents.slice();
                let index = talents.indexOf(props.item._id);

                if (index != -1) {
                    talents.splice(index, 1);
                }
                else if (this.unspent > 0) {
                    talents.push(props.item._id);
                }

                this.characterState.talents = talents;
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
            applyTalents(newVal, oldVal) {
                let diffNew = newVal.filter(i => oldVal.indexOf(i) < 0),
                    diffOld = oldVal.filter(i => newVal.indexOf(i) < 0);

                // Activate all talents in diffNew.
                if (diffNew && diffNew.length != 0) {
                    for (let diff of diffNew) {
                        let talent = this.items.find(i => i._id == diff);
                        
                        if (talent && talent.modifier && talent.modifier.attribute) {
                            if (this[talent.modifier.attribute]) {
                                console.log(`Activating talent ${talent.name}`, talent);
                                this[talent.modifier.attribute](this).onActivate(this);
                            }
                        }
                    }
                }

                // Deactivate all talents in diffOld.
                if (diffOld && diffOld.length != 0) {
                    for (let diff of diffOld) {
                        let talent = this.items.find(i => i._id == diff);
                        
                        if (talent && talent.modifier && talent.modifier.attribute) {
                            if (this[talent.modifier.attribute]) {
                                console.log(`Deactivating talent ${talent.name}`, talent);
                                this[talent.modifier.attribute](this).onDeactivate(this);
                            }
                        }
                    }
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
                        vue.$ee.emit("incCmbtValue", 1);
                    }
                }

                function onDeactivate(vue) {
                    self.hasActivated = false;
                    vue.$ee.emit("incAttrValue", -1);
                    vue.$ee.emit("incCmbtValue", -1);
                }
            },

            biggerAndBetterAttributeModifier() {
                let self = {
                    onActivate: onActivate,
                    onDeactivate: onDeactivate,
                    hasActivated: false
                };

                return self;

                function onActivate(vue) {
                    self.hasActivated = true;
                    vue.$ee.emit("incAttrBonus", 2);
                }

                function onDeactivate(vue) {
                    self.hasActivated = false;
                    vue.$ee.emit("incAttrBonus", -2);
                    vue.$ee.emit("resetAttributes");
                }
            }
        }
    };
</script>