import PouchDB from 'pouchdb';
import uuidv1 from 'uuid/v1';
import axios from 'axios';

var MiniPouchDB = PouchDB.defaults({
    revs_limit: 1,
    auto_compaction: true
});

async function dbExists(dbNames, destroyIfNotExists) {
    let existsAll = true;

    try {
        for (let dbName of dbNames) {
            let db = new PouchDB(dbName);
            let details = await db.info();
            let exists = details.doc_count != 0 || details.update_seq != 0;

            if (!exists) {
                existsAll = false;

                if (destroyIfNotExists) {
                    await db.destroy();
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        return false;
    }

    return existsAll;
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
                    reject(err);
                });
            }
        });
    };

    return self;
}

async function getAll(dbName) {
    var db = new PouchDB(dbName);
    var result = await db.allDocs({ include_docs: true });

    let docs = [];

    for (let i = 0, l = result.rows.length; i < l; i++) {
        docs.push(result.rows[i].doc);
    }

    return docs;
}

export function ping() {
    return 'pong';
}

export async function initDb() {
    try {
        if (await dbExists(['races', 'origins', 'characters', 'parties', 'combat-abilities', 'civil-abilities', 'talents'], true)) {
            return true;
        }

        debugger;

        let races = (await axios.get('/json/races.json')).data,
            origins = (await axios.get('/json/origins.json')).data,

            attributes = (await axios.get('/json/attributes.json')).data,
            combatAbilities = (await axios.get('/json/combat-abilities.json')).data,
            civilAbilities = (await axios.get('/json/civil-abilities.json')).data,
            talents = (await axios.get('/json/talents.json')).data;

        let dbRaces = new MiniPouchDB('races'),
            dbOrigins = new MiniPouchDB('origins'),
            dbCharacters = new MiniPouchDB('characters'),
            dbParties = new MiniPouchDB('parties'),

            dbCombatAbilities = new MiniPouchDB('combat-abilities'),
            dbCivilAbilities = new MiniPouchDB('civil-abilities'),
            dbTalents = new MiniPouchDB('talents');

        let characters = [
            {
                _id: uuidv1(),
                name: 'Character #1',
                origin: origins[0]._id,
                race: races[0]._id,
                level: 1,
                attributes,
                combatAbilities: {},
                civilAbilities: {},
                talents: []
            }
        ];
        characters.push({
            _id: 'active',
            character: characters[0]._id
        });

        let parties = [
            {
                _id: uuidv1(),
                members: [characters[0]._id]
            }
        ];
        parties.push({
            _id: 'active',
            party: parties[0]._id
        });

        return (await new ConcurrentAsyncTask(
            dbRaces.bulkDocs(races),
            dbOrigins.bulkDocs(origins),
            dbCharacters.bulkDocs(characters),
            dbParties.bulkDocs(parties),
            dbCombatAbilities.bulkDocs(combatAbilities),
            dbCivilAbilities.bulkDocs(civilAbilities),
            dbTalents.bulkDocs(talents)
        ).execute());
    }
    catch (err) {
        console.error(err);

        return null;
    }
}

export async function getRaces() {
    return await getAll('races');
}

export async function getOrigins() {
    return await getAll('origins');
}

export async function getActiveParty() {
    let dbParties = new PouchDB('parties');

    let activePartyIndicator = await dbParties.get('active');
    let activeParty = await dbParties.get(activePartyIndicator.party);

    // Include characters.
    let dbCharacters = new PouchDB('characters');
    let members = (await dbCharacters.allDocs({
        include_docs: true,
        keys: activeParty.members
    })).rows.map((member) => member.doc);

    // Include combat abilities.
    let allCombatAbilities = await getAll('combat-abilities');

    // Include civil abilities.
    let allCivilAbilities = await getAll('civil-abilities');

    // Update properties for each member.
    for (let i = 0, l = members.length; i < l; i++) {
        let member = members[i];
        let combatAbilities = {};
        let civilAbilities = {};
    
        for (let j = 0, m = allCombatAbilities.length; j < m; j++) {
            combatAbilities[allCombatAbilities[j]._id] = 0;
        }
    
        for (let j = 0, m = allCivilAbilities.length; j < m; j++) {
            civilAbilities[allCivilAbilities[j]._id] = 0;
        }

        member.combatAbilities = Object.assign(combatAbilities, member.combatAbilities);
        member.civilAbilities = Object.assign(civilAbilities, member.civilAbilities);
    }

    activeParty.members = members;


    return activeParty;
}

export async function addPartyMember() {
    var dbParties = new PouchDB('parties');
    var activePartyIndicator = await dbParties.get('active');
    var activeParty = await dbParties.get(activePartyIndicator.party);

    var dbCharacters = new PouchDB('characters');
    var result = await dbCharacters.put({
        _id: uuidv1(),
        name: `Character #${activeParty.members.length + 1}`,
        origin: 'custom',
        race: 'dwarf',
        level: 1,
        attributes: (await axios.get('/json/attributes.json')).data,
        combatAbilities: {},
        civilAbilities: {},
        talents: []
    });

    activeParty.members.push(result.id);
    await dbParties.put(activeParty);

    return await dbCharacters.get(result.id);
}

export async function updateCharacter(character) {
    let db = new PouchDB('characters');

    let combatAbilities = character.combatAbilities,
        civilAbilities = character.civilAbilities;

    for (let combatAbility in character.combatAbilities) {
        let points = character.combatAbilities[combatAbility];

        if (points <= 0) {
            delete character.combatAbilities[combatAbility];
        }
    }

    for (let civilAbility in character.civilAbilities) {
        let points = character.civilAbilities[civilAbility];

        if (points <= 0) {
            delete character.civilAbilities[civilAbility];
        }
    }

    let updatedCharacter = await db.put(character);

    updatedCharacter.combatAbilities = combatAbilities;
    updatedCharacter.civilAbilities = civilAbilities;

    return updatedCharacter;
}

export async function resetCharacter(character) {
    let dbCharacters = new PouchDB('characters');

    Object.assign(character, {
        name: 'Character #1',
        origin: 'custom',
        race: 'dwarf',
        level: 1,
        combatAbilities: {},
        civilAbilities: {},
        talents: []
    });

    for (let attribute of character.attributes) {
        attribute.points = 10;
    }

    let result = await dbCharacters.put(character);

    return await dbCharacters.get(result.id);
}

export async function deleteCharacter(character, party) {
    let dbCharacters = new PouchDB('characters');
    let dbParties = new PouchDB('parties');

    // Remove deleted character from the party's member array.
    party.members.splice(party.members.indexOf(character._id), 1);

    let members = party.members;
    party.members = party.members.map(member => member._id);
    
    await dbCharacters.remove(character);    

    let result = await dbParties.put(party);
    party = await dbParties.get(result.id);

    party.members = members;

    return party;
}

export async function getCombatAbilities() {
    return await getAll('combat-abilities');
}

export async function getCivilAbilities() {
    return await getAll('civil-abilities');
}

export async function getTalents() {
    return await getAll('talents');
}

export function deleteParty() {
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
}
