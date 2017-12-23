<template>
    <v-tabs-content id="combat">
        <v-layout class="pa-3">
            <v-flex xl6 offset-xl3 lg8 offset-lg2 md10 offset-md1>
                <v-card flat>
                    <v-card-text class="pa-0">
                        <v-data-table v-bind:headers="headers" :items="items" item-key="name" hide-actions class="elevation-1">
                            <template slot="headers" scope="props">
                                <tr>
                                    <th v-for="header in props.headers" v-if="header.id != 'unspent_cmbt'" :key="header.text" :class="getHeaderClass(header.align)">{{ header.text }}</th>
                                    <th v-else :key="header.id" class="text-xs-right">{{ unspent }}{{ header.text }}</th>
                                </tr>
                            </template>
                            <template slot="items" scope="props">
                                <td>
                                    <v-btn flat icon @click.stop="props.expanded = !props.expanded">
                                        <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
                                        <v-icon v-else>keyboard_arrow_down</v-icon>
                                    </v-btn>
                                    <span>{{ props.item.name }}</span>
                                </td>
                                <td class="text-xs-right">
                                    <v-btn flat icon @click="decAbility(props.item)">
                                        <v-icon>remove</v-icon>
                                    </v-btn>
                                    <input v-model.number.lazy="props.item.points" @change="changeAbility(props.item)" class="text-xs-center inline-input">
                                    <v-btn flat icon @click="incAbility(props.item)">
                                        <v-icon>add</v-icon>
                                    </v-btn>
                                </td>
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
		items: getAbilities()
	}),
	computed: {
		base() {
			return 2 * this.value;
		},
		fromLevel() {
			return this.level * this.value;
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
				item.points += this.value;
			}
		},
		decAbility: function(item) {
			if (item.points > 0) {
				item.points -= this.value;
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

		this.$parent.$on("resetCmbtAbilities", this.resetAbilities);
		this.$parent.$on("incCmbtValue", this.incValue);
		this.$parent.$on("incCmbtBonus", this.incBonus);
	}
};

function getAbilities() {
	return [
		{
			name: "Dual Wielding",
			description:
				"Dual Wielding increases damage and Dodging when dual-wielding two one-handed weapons.",
			effects: "+5% Damage and +1% Dodge Chance.",
			points: 0
		},
		{
			name: "Ranged",
			description:
				"Ranged increase damage and Critical Chance when using bows and crossbows.",
			effects: "+5% Damage and +1% Critical Chance.",
			points: 0
		},
		{
			name: "Single-Handed",
			description:
				"Single-handed increase damage and Accuracy when using a one-handed weapon (dagger, sword, axe, mace or wand) with a shield or empty off-hand.",
			effects: "+5% Damage and +5% Accuracy.",
			points: 0
		},
		{
			name: "Two-Handed",
			description:
				"Two-Handed increase damage and critical multiplier when using two-handed melee weapon (Sword, axe, mace, spear or staff).",
			effects: "+5% Damage and +5% Critical Multiplier.",
			points: 0
		},
		{
			name: "Leadership",
			description:
				"Leadership grants dodging and resistance bonuses to all allies in a 5m radius.",
			effects: "+2% Dodging and +3% to all Resistances",
			points: 0
		},
		{
			name: "Perseverance",
			description:
				"Perseverance restores Magic Armor after you recover from Frozen or Stunned, and restores Physical Armor after knocked down or Petrified.",
			effects: "+5% Armor restored.",
			points: 0
		},
		{
			name: "Retribution",
			description:
				"Retribution reflects received damage to your attacker.",
			effects: "5% damage reflected.",
			points: 0
		},
		{
			name: "Aerotheurge",
			description: "Aerotheurge increase all Air damage you deal.",
			effects: "Air attacks deal +5% more damage.",
			points: 0
		},
		{
			name: "Geomancer",
			description:
				"Geomancer increases all Poison and Earth damage you deal, and any Physical Armour restoration you cause.",
			effects:
				"Poison and Earth attacks deal +5% more damage, +5% Physical Armour from skills and potions.",
			points: 0
		},
		{
			name: "Huntsman",
			description:
				"Huntsman increases the damage bonus when attacking from high ground.",
			effects: "+5% Damage from high ground.",
			points: 0
		},
		{
			name: "Hydrosophist",
			description:
				"Hydrosophist increases all Water damage you deal, and any Vitality healing or Magic Armour restoration that you cause.",
			effects:
				"Water attacks deal +5% more damage, +5% Vitality healed, +5% Magic Armour from skills and potions.",
			points: 0
		},
		{
			name: "Necromancer",
			description:
				"Heals you every time you deal damage to Vitality. Damage from reflection effects yields half heal. Also increase the damage dealt by Necromancy skills.",
			effects: "Heal +10% of the damage dealt to Vitality.",
			points: 0
		},
		{
			name: "Polymorph",
			description:
				"Polymorph provides one free attribute point per point invested.",
			effects: "+1 Attribute Point",
			points: 0
		},
		{
			name: "Pyrokinetic",
			description: "Pyrokinetic increase all Fire damage you deal.",
			effects: "+5% Damage.",
			points: 0
		},
		{
			name: "Scoundrel",
			description:
				"Scoundrel increases movement speed and boosts your Critical Modifier.",
			effects: "+5% Critical Multiplier, +0.3 Movement speed.",
			points: 0
		},
		{
			name: "Summoning",
			description:
				"Summoning increases Vitality, Damage, Physical Armour and Magical Armour of your summons and totems.",
			effects:
				"Summons starts with 5% more Vitality, Damage, Physical Armour and Magical Armour.",
			points: 0
		},
		{
			name: "Warfare",
			description: "Warfare increases all Physical damage you deal.",
			effects: "Physical attacks deal +5% more damage.",
			points: 0
		}
	];
}
</script>