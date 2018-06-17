export default async ({ app }, inject) => {
    let activeCharacter = await app.$db.getActiveCharacter();
    inject('ac', activeCharacter);
}