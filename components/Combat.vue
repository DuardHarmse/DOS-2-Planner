<template>
    <v-layout id="combat" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="items" item-key="name" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_cmbt'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                <th v-else :key="header.id" class="text-xs-right">{{ unspent }}{{ header.text }}</th>
                            </tr>
                        </template>
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
                                <input v-model.number.lazy="props.item.points" @change="changeAbility(props.item)" class="text-xs-center inline-input">
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
        props: ["level"],
        mounted() {
            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal) {
                    this.resetAbilities();
                }
            });

            this.$ee.on("resetCmbtAbilities", this.resetAbilities);
            this.$ee.on("incCmbtValue", this.incValue);
            this.$ee.on("incCmbtBonus", this.incBonus);
            this.$ee.once('talentsApplied', () => {
                for (let i = 0, l = this.items.length; i < l; i++) {
                    let combatAbility = this.items[i];

                    if (this.$ac.combatAbilities[combatAbility._id]) {
                        combatAbility.points = this.$ac.combatAbilities[combatAbility._id];
                    }
                }
            });

            this.$db.getCombatAbilities().then((combatAbilities) => {
                this.items = combatAbilities;
            });
        },
        data: () => ({
            value: 1,
            bonus: 0,
            pagination: {
                sortBy: "name"
            },
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
            items: []
        }),
        computed: {
            fromLevel() {
                return (2 * this.value) + ((this.level - 1) * this.value);
            },
            spent() {
                let total = 0;

                for (let i = 0, l = this.items.length; i < l; i++) {
                    total += this.items[i].points;
                }

                return total;
            },
            unspent() {
                return (
                    this.fromLevel
                    + (this.bonus * this.value)
                    - this.spent
                );
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
                    item.points += this.value;
                }

                this.$ac.combatAbilities[item._id] = item.points;
            },
            decAbility: function(item) {
                if (item.points > 0) {
                    item.points -= this.value;
                }

                if (item.points == 0) {
                    delete this.$ac.combatAbilities[item._id];
                }
                else {
                    this.$ac.combatAbilities[item._id] = item.points;
                }
            },
            resetAbilities: function() {
                for (let i = 0, l = this.items.length; i < l; i++) {
                    this.items[i].points = 0;
                }
            },
            changeAbility: function(item) {
                if (this.unspent < 0) {
                    item.points += this.unspent;
                } else if (item.points < 0) {
                    item.points = 0;
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