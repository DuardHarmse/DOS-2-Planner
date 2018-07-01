export default async ({ app }, inject) => {
    inject('combatAbilityStore', {
        unspent: 0
    });
}