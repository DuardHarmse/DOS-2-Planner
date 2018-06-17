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

async function compact(dbNameOrReference) {
    let db = null;

    if (typeof dbNameOrReference == 'string') {
        db = new PouchDB(dbNameOrReference);
    }
    else {
        db = dbNameOrReference;
    }

    let result = null;

    try {
        result = await db.compact();
    }
    catch (err) {
        console.error(err);
    }

    return result;
}

export function ping() {
    return 'pong';
}

export async function initDb() {
    try {
        if (await dbExists(['races', 'origins', 'party', 'combat-abilities', 'civil-abilities', 'talents'], true)) {
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
            dbParty = new MiniPouchDB('party'),

            dbCombatAbilities = new MiniPouchDB('combat-abilities'),
            dbCivilAbilities = new MiniPouchDB('civil-abilities'),
            dbTalents = new MiniPouchDB('talents');

        let party = [
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

        party.push({
            _id: 'active',
            character: party[0]._id
        });

        return (await new ConcurrentAsyncTask(
            dbRaces.bulkDocs(races),
            dbOrigins.bulkDocs(origins),
            dbParty.bulkDocs(party),
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

export async function getActiveCharacter() {
    var db = new PouchDB('party');
    var doc = await db.get('active');
    var activeCharacter = db.get(doc.character);

    return activeCharacter;
}

export async function updateActiveCharacter(activeCharacter) {
    let db = new PouchDB('party');
    compact(db);

    return await db.put(activeCharacter);
}

export async function resetActiveCharacter(activeCharacter) {
    let db = new PouchDB('party');

    await db.remove(activeCharacter);

    let result = await db.put({
        _id: uuidv1(),
        name: 'Character #1',
        origin: 'custom',
        race: 'dwarf',
        level: 1,
        attributes: (await axios.get('/json/attributes.json')).data,
        combatAbilities: {},
        civilAbilities: {},
        talents: []
    });

    let doc = await db.get('active');
    doc.character = result.id;
    await db.put(doc);

    compact(db);

    return await db.get(result.id);
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
