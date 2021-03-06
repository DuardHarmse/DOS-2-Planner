<template>
    <v-tabs-content id="attributes">
        <v-layout class="pa-3">
            <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
                <v-card flat>
                    <v-card-text class="pa-0">
                        <v-data-table v-bind:headers="headers" :items="items" hide-actions class="elevation-1">
                            <template slot="headers" scope="props">
                                <tr>
                                    <th v-for="header in props.headers" v-if="header.id != 'unspent_attributes'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                    <th v-else :key="header.id" class="text-xs-right">{{ unspent }}{{ header.text }}</th>
                                </tr>
                            </template>
                            <template slot="items" scope="props">
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
    </v-tabs-content>
</template>

<script>
    export default {
        props: ['level'],
        data: data => ({
            value: 1,
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
            items: [
                {
                    value: false,
                    name: "Strength",
                    points: 10
                },
                {
                    value: false,
                    name: "Finesse",
                    points: 10
                },
                {
                    value: false,
                    name: "Intelligence",
                    points: 10
                },
                {
                    value: false,
                    name: "Constitution",
                    points: 10
                },
                {
                    value: false,
                    name: "Wits",
                    points: 10
                },
                {
                    value: false,
                    name: "Memory",
                    points: 10
                }
            ]
        }),
        computed: {
            base() {
                return 10 * this.items.length;
            },
            fromLevel() {
                return ((this.level - 1) * 2 + 3) * this.value;
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
                    this.base
                    + this.fromLevel
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
                for (let i = 0, l = this.items.length; i < l; i++) {
                    this.items[i].points = 10;
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
        },
        mounted() {
            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal) {
                    this.resetAttributes();
                }
            });

            this.$parent.$on('resetAttributes', this.resetAttributes);
            this.$parent.$on('incAttrValue', this.incValue);
            this.$parent.$on('incAttrBonus', this.incBonus);
        }
    };
</script>