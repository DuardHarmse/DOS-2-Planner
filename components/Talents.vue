<template>
    <v-tabs-content id="talents">
        <v-layout class="pa-3">
            <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
                <v-card flat>
                    <v-card-text class="pa-0">
                        <v-data-table v-model="selected" :headers="headers" :items="items" item-key="name" hide-actions select-all class="elevation-1">
                            <template slot="headers" scope="props">
                                <tr>
                                    <th v-for="header in props.headers" v-if="header.id != 'unspent_talents'" :key="header.text" @click="changeSort(header.value)"
                                        :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                    <th v-else :key="header.id" :class="getHeaderClass(header.align)">{{ unspent }}{{ header.text }}</th>
                                </tr>
                            </template>
                            <template slot="items" scope="props">
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
                            <template slot="expand" scope="props">
                                <v-card flat>
                                    <v-card-text>{{ props.item.description }}</v-card-text>
                                </v-card>
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
        props: ["level"],
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
            items: getTalents()
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
            }
        },
        mounted() {
            this.$watch("level", function(newVal, oldVal) {
                if (newVal < oldVal && this.unspent < 0) {
                    this.resetTalents();
                }
            });

            this.$watch("selected", function(newVal, oldVal) {
                if (this.unspent == 0) {
                    console.log("No more talents!");
                }
                for (let i = 0, l = newVal.length; i < l; i++) {
                    let newTalent = newVal[i];
                    let exists = false;

                    for (let j = 0, m = oldVal.length; j < m; j++) {
                        let oldTalent = oldVal[j];

                        if (newTalent.name == oldTalent.name) {
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
            });
        }
    };

    function allSkilledUpAtrributeModifier() {
        let self = {
            onActivate: onActivate,
            onDeactivate: onDeactivate,
            hasActivated: false
        };

        return self;

        function onActivate(vue) {
            if (!self.hasActivated) {
                self.hasActivated = true;
            }
        }

        function onDeactivate(vue) {
            self.hasActivated = false;
        }
    }

    function loneWolfAttributeModifier() {
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
                vue.$parent.$emit("incAttrValue", 1);
                vue.$parent.$emit("resetAttributes");
                vue.$parent.$emit("incCmbtValue", 1);
                vue.$parent.$emit("resetCmbtAbilities");
            }
        }

        function onDeactivate(vue) {
            self.hasActivated = false;
            vue.$parent.$emit("incAttrValue", -1);
            vue.$parent.$emit("resetAttributes");
            vue.$parent.$emit("incCmbtValue", -1);
            vue.$parent.$emit("resetCmbtAbilities");
        }
    }

    function biggerAndBetterAttributeModifier() {
        let self = {
            onActivate: onActivate,
            onDeactivate: onDeactivate,
            hasActivated: false
        };
        let attrBaseibutes = null;

        return self;

        function onActivate(vue) {
            vue.$parent.$emit("incAttrBonus", 2);
            self.hasActivated = true;
        }

        function onDeactivate(vue) {
            vue.$parent.$emit("incAttrBonus", -2);
            self.hasActivated = false;
            vue.$parent.$emit("resetAttributes");
        }
    }

    function getTalents() {
        return [
            {
                name: "All Skilled Up",
                description:
                    "Grants 1 additional Combat Ability Point and 1 extra Civil Ability Point. Requirement: Level 2",
                modifier: {
                    attribute: allSkilledUpAtrributeModifier()
                }
            },
            {
                name: "Ambidextrous",
                description:
                    "Reduces the cost of using grenades and scrolls by 1AP if your offhand is free. Requirement: None"
            },
            {
                name: "Arrow Recovery",
                description:
                    "Grants a 33% chance to recover a special arrow after firing it. Requirement: None"
            },
            {
                name: "Bigger and Better",
                description:
                    "Immediately grants 2 extra attribute points. Requirement: Level 2",
                modifier: {
                    attribute: biggerAndBetterAttributeModifier()
                }
            },
            {
                name: "Comeback Kid",
                description:
                    "Once per combat, if an enemy lands a fatal blow, Comeback Kid will help you bounce back to life with 20% health. If you die and are resurrected in combat, Comeback Kid will be available again. Requirement: None"
            },
            {
                name: "Demon",
                description:
                    "Gain 15% fire resistance and 15% water weakness. Max fire resistance also increases by 10. Cannot be used with Ice King. Requirement: Pyrokinetic 1"
            },
            {
                name: "Duck Duck Goose",
                description:
                    "Lets you evade attacks of opportunity. Requirement: Huntsman 1"
            },
            {
                name: "Elemental Affinity",
                description:
                    "Lowers the Action Point cost of spells by 1 when standing in a surface of the same element. Requirement: None"
            },
            {
                name: "Elemental Ranger",
                description:
                    "Arrows will deal bonus elemental damage depending on the surface the target is standing in. Requirement:  Huntsman 1"
            },
            {
                name: "Escapist",
                description:
                    "Allows you to flee combat even when enemies are right next to you. Requirement: None"
            },
            {
                name: "Executioner",
                description:
                    "Gain 2 AP after dealing a killing blow. Does not work with The Pawn. Requirement: Warfare 1"
            },
            {
                name: "Far Out Man",
                description:
                    "Increase the range of spells and scrolls by 2m. Does not affect melee and touch-ranged skills. Requirement: None"
            },
            {
                name: "Five-star Diner",
                description:
                    "Doubles the effects of foods and potions. Requirement: None"
            },
            {
                name: "Glass Cannon",
                description:
                    "You start every combat round with Maximum AP, but Magic and Physical Armour do not protect you from statuses. Requirement: Incompatible with Lone Wolf."
            },
            {
                name: "Guerilla",
                description:
                    "While sneaking, your attack damage is increased by 40%. Requirement: Sneaking 1"
            },
            {
                name: "Hothead",
                description:
                    "While you are at maximum Vitality, Hothead grants you an extra 10% critical chance and 10% more accuracy. Requirement: None"
            },
            {
                name: "Ice King",
                description:
                    "Grants +15% Water resistance and +15% fire weakness. Max water resistance is raised by 10. Cannot work with Demon. Requirement: Hydrosophist 1"
            },
            {
                name: "Leech",
                description: "Heals you when standing in blood. Requirement: None"
            },
            {
                name: "Living Armour",
                description:
                    "35% of all healing you receive is added to your Magic Armour. Requirement: None"
            },
            {
                name: "Lone Wolf",
                description:
                    "Lone Wolf provides +2 Max AP, +2 Recovery AP, +30% Vitality, +30% Physical Armour, +30% Magic Armour, and doubles invested points in attributes and combat abilities (except Polymorph ability), while you are adventuring solo or with at most one companion. This bonus is temporarily removed while there are more than two members in the current party. Requirement: Incompatible with Glass Cannon",
                modifier: {
                    attribute: loneWolfAttributeModifier()
                }
            },
            {
                name: "Mnemonic",
                description:
                    "Gives you 3 extra points in your Memory attributes. Requirement: None"
            },
            {
                name: "Morning Person",
                description:
                    "When resurected, you resurrect to full health. Requirement: None"
            },
            {
                name: "Opportunist",
                description:
                    "Gives you the ability to perform attacks of opportunity. Requirement: None"
            },
            {
                name: "Parry Master",
                description:
                    "Gives you a 10% bonus dodge chance while dual wielding. Requirement: None"
            },
            {
                name: "Pet Pal",
                description: "Enables you to talk to animals. Requirement: None"
            },
            {
                name: "Picture of Health",
                description:
                    "Grants +3% extra Vitality for every point of Warfare. Requirement: Warfare 1"
            },
            {
                name: "Savage Sortilege",
                description:
                    "Gives all magical skills a critical chance equal to your critical chance score. Requirement: None"
            },
            {
                name: "Slingshot",
                description:
                    "Adds an extra 5m range to your grenade throws. Requirement: None"
            },
            {
                name: "Stench",
                description:
                    "Decreases everyone's attitude towards you by 25, but melee combatants will find you less attractive. Requirement: None"
            },
            {
                name: "The Pawn",
                description:
                    "Permits your character 1 AP worth of free movement per turn. Does not work with Executioner. Requirement: Scoundrel 1"
            },
            {
                name: "Torturer",
                description:
                    "Increases the duration of damage statuses caused by your skills and surfaces by 1 turn. Requirement: None"
            },
            {
                name: "Unstable",
                description:
                    "You explode upon death, dealing 50% of your vitality as physical damage in a 3 meter radius. Requirement: None"
            },
            {
                name: "Walk it Off",
                description:
                    "Reduces all status durations by 1 turn. This also affects positive statuses. Requirement: None"
            },
            {
                name: "What a Rush",
                description:
                    "Increases your recovery and maximum Action Points by 1 when your health is below 50%. Requirement: None"
            },
            {
                name: "Spider's Kiss",
                description:
                    "Spider's Kiss gives you -2 CON and +2 to another Attribute.  (depends on your choice in quest)  Requirement: A Web of Desire"
            },
            {
                name: "Trader's Secrets",
                description:
                    "Gives +1 Bartering from eating Garvan's head Requirement: Aggressive Takeover"
            },
            {
                name: "Ancestral Knowledge",
                description: "Gives you +1 to Loremaster. Requirement: Elf race"
            },
            {
                name: "Corpse Eater",
                description:
                    "Lets you eat body parts to access the memory of the dead. Requirement: Elf race"
            },
            {
                name: "Dwarven Guile",
                description: "Gives you +1 in Sneaking. Requirement: Dwarf race"
            },
            {
                name: "Sturdy",
                description:
                    "Gives you +10% max Vitality and +5% Dodging. Requirement: Dwarf race"
            },
            {
                name: "Ingenious",
                description:
                    "Gives you with +2 bonus Initiative and +5% extra Critical Chance. Requirement: Human race"
            },
            {
                name: "Thrifty",
                description: "Gives +1 to Bartering. Requirement: Human race"
            },
            {
                name: "Sophisticated",
                description:
                    "Gives you +10% Fire Resistance and +10% Poison Resistance. Requirement: Lizard race"
            },
            {
                name: "Spellsong",
                description: "Gives you +1 to Persuasion. Requirement: Lizard race"
            },
            {
                name: "Undead",
                description:
                    "Lets you heal from poison, but regular healing will damage you instead. Requirement: Undead race"
            },
            {
                name: "Rooted",
                description:
                    "Gives you 3 extra points in your Memory attribute. Requirement: Sebille talks to Elven Scion after The Mother Tree Quest"
            },
            {
                name: "Ghost Tree",
                description: "??. Requirement: ??"
            }
        ];
    }
</script>