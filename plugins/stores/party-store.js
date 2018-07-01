export default async ({ app }, inject) => {
    let activeParty = await app.$db.getActiveParty();
    activeParty.activeCharacter = 0;
    
    inject('ap', activeParty);
}