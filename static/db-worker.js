import PouchDB from 'pouchdb';
import uuidv1 from 'uuid/v1';

export function ping() {
    return 'pong';
}

function ConcurrentAsyncTask() {
    var self = this;
    self._tasks = arguments || [];

    self.addTasks = function() {
        self._tasks.concat(arguments);
        return self;
    };

    self.execute = function() {
        return new Promise((resolve, reject) => {
            const numTasks = self._tasks.length;
            let taskCompletionCounter = 0;

            for (let task of self._tasks) {
                task.then((result) => {
                    taskCompletionCounter++;

                    if (taskCompletionCounter == numTasks) {
                        resolve(true);
                    }
                }).catch((err) => {
                    reject();
                });
            }
        });
    };

    return self;
}

export async function initDb() {
    try {
        var dbOrigins = new PouchDB('origins');
        var dbRaces = new PouchDB('races');
        var dbParty = new PouchDB('party');

        await new ConcurrentAsyncTask(
            dbRaces.destroy(),
            dbOrigins.destroy(),
            dbParty.destroy()
        ).execute();

        dbOrigins = new PouchDB('origins');
        dbRaces = new PouchDB('races');
        dbParty = new PouchDB('party');

        let races = [
            {
                _id: uuidv1(),
                desc: 'Dwarf',
                skills: ['Petrifying Touch']
            },
            {
                _id: uuidv1(),
                desc: 'Elf',
                skills: ['Flesh Sacrifice']
            },
            {
                _id: uuidv1(),
                desc: 'Human',
                skills: ['Encourage']
            },
            {
                _id: uuidv1(),
                desc: 'Lizard',
                skills: ["Dragon's Blaze"]
            },
            {
                _id: uuidv1(),
                desc: 'Undead',
                skills: ['Play Dead']
            }
        ];

        let origins = [
            {
                _id: uuidv1(),
                desc: 'Custom',
                race: null,
                skills: [
                    'Dome of Protection'
                ]
            },
            {
                _id: uuidv1(),
                desc: 'Beast',
                race: races.find(race => race.desc == 'Dwarf')._id,
                skills: [
                    'Petrifying Touch',
                    'Blinding Squall'
                ]
            },
            {
                _id: uuidv1(),
                desc: 'Fane',
                race: races.find(race => race.desc == 'Undead')._id,
                skills: [
                    'Play Dead',
                    'Time Warp'
                ]
            },
            {
                _id: uuidv1(),
                desc: 'Ifan Ben-Mezd',
                race: races.find(race => race.desc == 'Human')._id,
                skills: [
                    'Encourage',
                    "Summon Ifan's Soul Wolf"
                ]
            },
            {
                _id: uuidv1(),
                desc: 'Lohse',
                race: races.find(race => race.desc == 'Human')._id,
                skills: [
                    'Encourage',
                    'Maddening Song'
                ]
            },
            {
                _id: uuidv1(),
                desc: 'Sebille',
                race: races.find(race => race.desc == 'Elf')._id,
                skills: [
                    'Flesh Sacrifice',
                    'Break the Shackles'
                ]
            },
            {
                _id: uuidv1(),
                desc: 'The Red Prince',
                race: races.find(race => race.desc == 'Lizard')._id,
                skills: [
                    "Dragon's Blaze",
                    'Demonic Stare'
                ]
            }
        ];

        let party = [
            {
                _id: uuidv1(),
                name: 'Character #1',
                origin: origins[0]._id,
                race: races[0]._id,
                level: 1,
                attributes: getAttributes(),
                combatAbilities: getCombatAbilities(),
                civilAbilities: getCivilAbilities(),
                talents: getTalents()
            }
        ];

        return (await new ConcurrentAsyncTask(
            dbRaces.bulkDocs(races),
            dbOrigins.bulkDocs(origins),
            dbParty.bulkDocs(party)
        ).execute());
    }
    catch (err) {
        console.error(err);

        return null;
    }
}

export async function getRaces() {
    var db = new PouchDB('races');
    var result = await db.allDocs({ include_docs: true });

    let docs = [];

    for (let i = 0, l = result.rows.length; i < l; i++) {
        docs.push(result.rows[i].doc);
    }

    return docs;
}

export async function getOrigins() {
    var db = new PouchDB('origins');
    var result = await db.allDocs({ include_docs: true });

    let docs = [];

    for (let i = 0, l = result.rows.length; i < l; i++) {
        docs.push(result.rows[i].doc);
    }

    return docs;
}

function getAttributes() {
    return [
        {
            name: "Strength",
            points: 10
        },
        {
            name: "Finesse",
            points: 10
        },
        {
            name: "Intelligence",
            points: 10
        },
        {
            name: "Constitution",
            points: 10
        },
        {
            name: "Wits",
            points: 10
        },
        {
            name: "Memory",
            points: 10
        }
    ];
}

function getCombatAbilities() {
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

function getCivilAbilities() {
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

function getTalents() {
    return [
        {
            name: "All Skilled Up",
            description:
                "Grants 1 additional Combat Ability Point and 1 extra Civil Ability Point. Requirement: Level 2",
            modifier: {
                attribute: 'allSkilledUpAtrributeModifier'
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
                attribute: 'biggerAndBetterAttributeModifier'
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
                attribute: 'loneWolfAttributeModifier'
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
