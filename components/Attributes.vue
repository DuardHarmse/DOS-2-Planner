<template>
    <v-layout id="attributes" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="characterState.attributes" :loading="true" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_attributes'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                <th v-else :key="header.id" class="text-xs-right">{{ unspent }}{{ header.text }}</th>
                            </tr>
                        </template>
                        <v-progress-linear v-model="percentage" slot="progress" color="blue"></v-progress-linear>
                        <template slot="items" slot-scope="props">
                            <td>{{ props.item.name }}</td>
                            <td class="text-xs-right">
                                <v-btn flat icon @click="decAttribute(props.item)">
                                    <v-icon>remove</v-icon>
                                </v-btn>
                                <input v-model.number.lazy="props.item.points" @change="changeAttribute(props.item)" class="text-xs-center inline-input">
                                <v-btn flat icon @click="incAttribute(props.item)">
                                    <v-icon>add</v-icon>
                                </v-btn>
                            </td>
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
                    this.resetAttributes();
                }
            });

            this.$ee.on('resetAttributes', this.resetAttributes);
            this.$ee.on('incAttrValue', this.incValue);
            this.$ee.on('incAttrBonus', this.incBonus);
            // this.$ee.once('talentsApplied', () => {
            //     this.items = this.$ac.attributes;
            // });
        },
        data: data => ({
            bonus: 0,
            headers: [
                {
                    text: "Attribute",
                    align: "left"
                },
                {
                    id: "unspent_attributes",
                    text: " unspent",
                    align: "right"
                }
            ],
            partyState: {},
            value: 1,
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members) {
                    return this.partyState.members[this.partyState.activeCharacter];
                }
                else {
                    return {
                        attributes: []
                    };
                }
            },
            base() {
                return 10 * this.characterState.attributes.length;
            },
            fromLevel() {
                return ((this.characterState.level - 1) * 2 + 3) * this.value;
            },
            spent() {
                let total = 0;

                for (let i = 0, l = this.characterState.attributes.length; i < l; i++) {
                    total += this.characterState.attributes[i].points;
                }

                return total;
            },
            unspent() {
                return (
                    this.base
                    + this.fromLevel
                    + (this.bonus * this.value)
                    - this.spent
                );
            },
            percentage() {
                return ((this.spent - this.base) / (this.fromLevel + (this.bonus * this.value))) * 100;
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
            incAttribute: function(item) {
                if (this.unspent > 0) {
                    item.points += this.value;
                }
            },
            decAttribute: function(item) {
                if (item.points > 10) {
                    item.points -= this.value;
                }
            },
            resetAttributes: function() {
                for (let i = 0, l = this.characterState.attributes.length; i < l; i++) {
                    this.characterState.attributes[i].points = 10;
                }
            },
            changeAttribute: function(item) {
                if (this.unspent < 0) {
                    item.points += this.unspent;
                } else if (item.points < 10) {
                    item.points = 10;
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