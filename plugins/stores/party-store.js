export default async ({ app }, inject) => {
    let parties = await app.$db.getParties();
    let activeParty = await app.$db.getActiveParty();
    let activeCharacter = await app.$db.getActiveCharacter();

    inject('store', {
        parties,
        activeParty,
        activeCharacter
    });
}