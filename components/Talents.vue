<template>
    <v-layout id="talents" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-model="selected" :headers="headers" :items="items" item-key="name" hide-actions select-all class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_talents'" :key="header.text" @click="changeSort(header.value)"
                                    :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                <th v-else :key="header.id" :class="getHeaderClass(header.align)">{{ unspent }}{{ header.text }}</th>
                            </tr>
                        </template>
                        <template slot="items" slot-scope="props">
                            <tr :active="props.selected" @click="changeTalent(props)">
                                <td>
                                    <v-btn flat icon @click.stop="props.expanded = !props.expanded">
                                        <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
                                        <v-icon v-else>keyboard_arrow_down</v-icon>
                                    </v-btn>
                                    <span>{{ props.item.name }}</span>
                                </td>
                                <td class="shrinked-column">
                                    <v-checkbox primary hide-details :input-value="props.selected" :disabled="!props.selected && unspent == 0"></v-checkbox>
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
        props: ['level'],
        mounted() {
            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal && this.unspent < 0) {
                    this.resetTalents();
                }
            });

            this.$watch("selected", function(newVal, oldVal) {
                this.$ac.talents = newVal.map(item => item._id);

                for (let i = 0, l = newVal.length; i < l; i++) {
                    let newTalent = newVal[i];
                    let exists = false;

                    for (let j = 0, m = oldVal.length; j < m; j++) {
                        let oldTalent = oldVal[j];

                        if (newTalent._id == oldTalent._id) {
                            exists = true;
                            oldVal.splice(j, 1);
                            break;
                        }
                    }

                    if (!exists) {
                        if (newTalent.modifier && newTalent.modifier.attribute) {
                            newTalent.modifier.attribute.onActivate(this);
                        }
                    }
                }

                for (let i = 0, l = oldVal.length; i < l; i++) {
                    let oldTalent = oldVal[i];

                    if (oldTalent.modifier && oldTalent.modifier.attribute) {
                        oldVal[i].modifier.attribute.onDeactivate(this);
                    }
                }

                this.$ee.on('resetTalents', this.resetTalents)

                // Attributes, combat and civil abilities should be applied only when the bonuses from talents have been applied.
                this.$ee.emit('talentsApplied');
            });

            this.$db.getTalents().then((talents) => {
                this.items = talents;
                let acTalents = [];

                for (let i = 0, l = this.items.length; i < l; i++) {
                    let talent = this.items[i];

                    if (talent.modifier && talent.modifier.attribute) {
                        if (this.hasOwnProperty(talent.modifier.attribute)) {
                            talent.modifier.attribute = this[talent.modifier.attribute].call();
                        }
                        else {
                            console.warn(`Could not find attribute modifier function '${talent.modifier.attribute}'.`);
                        }
                    }

                    if (this.$ac.talents.indexOf(talent._id) != -1) {
                        acTalents.push(talent);
                    }
                }

                // Set all at once to prevent the $watch on data.selected to trigger with `newVal` and `oldVal` having the same value.
                this.selected = acTalents;
            });
        },
        data: () => ({
            bonus: 0,
            selected: [],
            pagination: {
                sortBy: "name"
            },
            headers: [
                {
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
            items: []
        }),
        computed: {
            fromLevel() {
                if (this.level > 4) return parseInt((this.level - 3) / 5 + 2);
                if (this.level > 2) return 2;
                return 1;
            },
            spent() {
                return this.selected.length;
            },
            unspent() {
                return this.fromLevel + this.bonus - this.spent;
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
            resetTalents() {
                this.selected = [];
            },
            changeTalent(props) {
                if (!props.selected && this.unspent > 0) {
                    props.selected = true;
                } else {
                    props.selected = false;
                }
            },
            toggleAllTalents(props) {
                if (this.selected.length) this.selected = [];
                else this.selected = this.items.slice();
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