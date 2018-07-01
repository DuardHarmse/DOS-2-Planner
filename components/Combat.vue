<template>
    <v-layout id="combat" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="items" item-key="name" :loading="true" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_cmbt'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
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
                                <input v-model.number.lazy="characterState.combatAbilities[props.item._id]" @change="changeAbility(props.item)" class="text-xs-center inline-input">
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

            this.$ee.on("resetCmbtAbilities", this.resetAbilities);
            this.$ee.on("incCmbtValue", this.incValue);
            this.$ee.on("incCmbtBonus", this.incBonus);

            this.$db.getCombatAbilities().then((combatAbilities) => {
                this.items = combatAbilities;
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
                    id: "unspent_cmbt",
                    text: " unspent",
                    align: "right"
                }
            ],
            items: [],
            pagination: {
                sortBy: "name"
            },
            partyState: {},
            value: 1
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members) {
                    return this.partyState.members[this.partyState.activeCharacter];
                }
                else {
                    return {
                        combatAbilities: {}
                    };
                }
            },
            fromLevel() {
                return (2 * this.value) + ((this.characterState.level - 1) * this.value);
            },
            spent() {
                let total = 0;

                for (let ability in this.characterState.combatAbilities) {
                    total += this.characterState.combatAbilities[ability];
                }

                return total;
            },
            unspent() {
                let unspent = 
                    this.fromLevel
                    + (this.bonus * this.value)
                    - this.spent;

                this.$combatAbilityStore.unspent = unspent;

                return unspent;
            },
            percentage() {
                return (this.spent / (this.fromLevel + (this.bonus * this.value))) * 100;
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
                    this.characterState.combatAbilities[item._id] += this.value;
                }
            },
            decAbility: function(item) {
                if (this.characterState.combatAbilities[item._id] > 0) {
                    this.characterState.combatAbilities[item._id] -= this.value;
                }
            },
            resetAbilities: function() {
                for (let i = 0, l = this.items.length; i < l; i++) {
                    this.items[i].points = 0;
                }
            },
            changeAbility: function(item) {
                if (this.unspent < 0) {
                    this.characterState.combatAbilities[item._id] += this.unspent;
                } else if (this.characterState.combatAbilities[item._id] < 0) {
                    this.characterState.combatAbilities[item._id] = 0;
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