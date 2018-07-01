<template>
    <v-layout id="civil" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="items" item-key="name" :loading="true" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_civl'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                <th v-else :key="header.id" class="text-xs-right">{{ unspent }}{{ header.text }}</th>
                            </tr>
                        </template>
                        <v-progress-linear v-model="percentage" slot="progress" color="blue"></v-progress-linear>
                        <template slot="items" slot-scope="props">
                            <td class="px-2">
                                <v-btn flat icon @click.stop="props.expanded = !props.expanded">
                                    <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
                                    <v-icon v-else>keyboard_arrow_down</v-icon>
                                </v-btn>
                                <span>{{ props.item.name }}</span>
                            </td>
                            <td class="px-2 text-xs-right">
                                <v-btn flat icon @click="decAbility(props.item)">
                                    <v-icon>remove</v-icon>
                                </v-btn>
                                <input v-model.number.lazy="characterState.civilAbilities[props.item._id]" @change="changeAbility(props.item)" class="text-xs-center inline-input">
                                <v-btn flat icon @click="incAbility(props.item)">
                                    <v-icon>add</v-icon>
                                </v-btn>
                            </td>
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
                if (newVal < oldVal) {
                    this.resetAbilities();
                }
            });

            this.$ee.on("resetCivlAbilities", this.resetAbilities);
            this.$ee.on("incCivlValue", this.incValue);
            this.$ee.on("incCivlBonus", this.incBonus);

            this.$db.getCivilAbilities().then((civilAbilities) => {
                this.items = civilAbilities;
            });
        },
        data: () => ({
            bonus: 0,
            headers: [
                {
                    text: "Ability",
                    align: "left",
                    sortable: true,
                    value: "name"
                },
                {
                    id: "unspent_civl",
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
                        civilAbilities: {}
                    };
                }
            },
            fromLevel() {
                if (this.characterState.level > 2) return parseInt((this.characterState.level - 2) / 4 + 2);
                if (this.characterState.level > 1) return 2;
                return 1;
            },
            spent() {
                let total = 0;

                for (let ability in this.characterState.civilAbilities) {
                    total += this.characterState.civilAbilities[ability];
                }

                return total;
            },
            unspent() {
                let unspent = this.fromLevel + this.bonus - this.spent;

                this.$civilAbilityStore.unspent = unspent;
                
                return unspent;
            },
            percentage() {
                return (this.spent / (this.fromLevel + this.bonus)) * 100;
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
            incAbility: function(item) {
                if (this.unspent > 0) {
                    this.characterState.civilAbilities[item._id]++;
                }
            },
            decAbility: function(item) {
                if (this.characterState.civilAbilities[item._id] > 0) {
                    this.characterState.civilAbilities[item._id]--;
                }
            },
            resetAbilities: function() {
                for (let i = 0, l = this.items.length; i < l; i++) {
                    this.items[i].points = 0;
                }
            },
            changeAbility: function(item) {
                if (this.unspent < 0) {
                    this.characterState.civilAbilities[item._id] += this.unspent;
                } else if (this.characterState.civilAbilities[item._id] < 0) {
                    this.characterState.civilAbilities[item._id] = 0;
                }
            },
            incValue(inc) {
                this.value += inc;
            },
            incBonus(inc) {
                this.bonus += inc;
            }
        }
    };
</script>