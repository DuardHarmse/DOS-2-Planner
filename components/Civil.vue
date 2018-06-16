<template>
    <v-layout id="civil" class="pa-3">
        <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
            <v-card flat>
                <v-card-text class="pa-0">
                    <v-data-table v-bind:headers="headers" :items="items" item-key="name" hide-actions class="elevation-1">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" v-if="header.id != 'unspent_civl'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
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
        data: () => ({
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
                    id: "unspent_civl",
                    text: " unspent",
                    align: "right"
                }
            ],
            items: getAbilities()
        }),
        computed: {
            fromLevel() {
                if (this.level > 2) return parseInt((this.level - 2) / 4 + 2);
                if (this.level > 1) return 2;
                return 1;
            },
            spent() {
                let total = 0;

                for (let i = 0, l = this.items.length; i < l; i++) {
                    total += this.items[i].points;
                }

                return total;
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
            incAbility: function(item) {
                if (this.unspent > 0) {
                    item.points++;
                }
            },
            decAbility: function(item) {
                if (item.points > 0) {
                    item.points--;
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
        },
        mounted() {
            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal) {
                    this.resetAbilities();
                }
            });

            this.$parent.$on("resetCivlAbilities", this.resetAbilities);
            this.$parent.$on("incCivlValue", this.incValue);
            this.$parent.$on("incCivlBonus", this.incBonus);
        }
    };

    function getAbilities() {
        return [
            {
                name: "Barting",
                description:
                    "Bartering improves your haggling skills with traders.",
                effects: "Bartering improves your haggling skills. With each point invested, traders' items become 2% cheaper and your items become 4% more expensive.",
                points: 0
            },
            {
                name: "Lucky Charm",
                description:
                    "Lucky Charm increases your likelihood of finding extra treasure whenever loot is stashed.",
                effects: "Every time the character opens a loot stash, Lucky Charm gives a chance that it will have more loot than usual . A unique sound and animation will play if Lucky Charm successfully triggers.",
                points: 0
            },
            {
                name: "Persuasion",
                description:
                    "Persuasion helps you convince characters to do your bidding in dialogues, and increases how much characters like you.",
                effects: "Increases base Attitude with strangers by 5 per point.",
                points: 0
            },
            {
                name: "Loremaster",
                description:
                    "Loremaster identifiles enemies and allows you to identify items. Increasing Loremaster allows you to identify more, faster.",
                effects: "To identify, use an identifying glass and click on the item you want to identify. To examine a monster or NPC, right click them and choose Examine. Higher level equipment will need higher Loremaster.",
                points: 0
            },
            {
                name: "Telekinesis",
                description:
                    "Telekinesis allows you to move items telepathically regardless of weight.",
                effects: "Range of telekinesis is 6m per point. ",
                points: 0
            },
            {
                name: "Sneaking",
                description:
                    "Sneaking determines how well you can sneak without getting caught.",
                effects: "A higher sneaking ability improves your movement speed while sneaking and shrinks NPC sight cones.",
                points: 0
            },
            {
                name: "Thievery",
                description:
                    "Thievery improves your lockpicking and pickpocketing skills.",
                effects: "To lockpick, use a lockpick and click on the item you want to lockpick. Or right-click the item and choose from the menu.(+2kg and xx gold value)",
                points: 0
            }
        ];
    }
</script>