<template>
    <v-layout id="attributes" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="items" item-key="_id" :loading="true" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_attributes'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
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
                                <v-btn flat icon @click="decAttribute(props.item)">
                                    <v-icon>remove</v-icon>
                                </v-btn>
                                <input v-model.number.lazy="characterState.attributes[props.item._id]" @change="changeAttribute(props.item)" class="text-xs-center inline-input">
                                <v-btn flat icon @click="incAttribute(props.item)">
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
            this.partyState = this.$store.activeParty;
            this.activeCharacter = this.$store.activeCharacter;

            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal) {
                    this.resetAttributes();
                }
            });

            this.$ee.on('resetAttributes', this.resetAttributes);
            this.$ee.on('incAttrValue', this.incValue);
            this.$ee.on('incAttrBonus', this.incBonus);

            this.$db.getAttributes().then((attributes) => {
                this.items = attributes;
            });
        },
        data: data => ({
            activeCharacter: {},
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
            items: [],
            partyState: {},
            value: 1
        }),
        computed: {
            characterState() {
                if (this.partyState && this.partyState.members && this.partyState.members.length != 0) {
                    return this.partyState.members.find(member => member._id == this.activeCharacter.character);
                }
                else {
                    return {
                        attributes: [],
                        talents: []
                    };
                }
            },
            base() {
                return 10 * this.items.length;
            },
            fromLevel() {
                return ((this.characterState.level - 1) * 2 + 3) * this.value;
            },
            spent() {
                let total = 0;

                for (let attr in this.characterState.attributes) {
                    total += this.characterState.attributes[attr];
                }

                return total;
            },
            unspent() {
                let unspent =
                    this.base
                    + this.fromLevel
                    + (this.bonus * this.value)
                    - this.spent;

                this.$attributeStore.unspent = unspent;

                return unspent
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
                    this.characterState.attributes[item._id] += this.value;
                }
            },
            decAttribute: function(item) {
                if (this.characterState.attributes[item._id] > 10) {
                    this.characterState.attributes[item._id] -= this.value;
                }
            },
            resetAttributes: function() {
                for (let attr in this.characterState.attributes) {
                    this.characterState.attributes[attr] = 10;
                }
            },
            changeAttribute: function(item) {
                if (this.unspent < 0) {
                    this.characterState.attributes[item._id] += this.unspent;
                } else if (this.characterState.attributes[item._id] < 10) {
                    this.characterState.attributes[item._id] = 10;
                }
            },
            incValue(inc) {
                if (inc < 0) {
                    for (let attr in this.characterState.attributes) {
                        this.characterState.attributes[attr] = ((this.characterState.attributes[attr] - 10) / this.value) + 10;
                    }
                }

                this.value += inc;

                if (this.value > 0) {
                    for (let attr in this.characterState.attributes) {
                        this.characterState.attributes[attr] = ((this.characterState.attributes[attr] - 10) * this.value) + 10;
                    }
                }
            },
            incBonus(inc) {
                this.bonus += inc;
            }
        }
    };
</script>