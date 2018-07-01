export default async ({ app }, inject) => {
    inject('civilAbilityStore', {
        unspent: 0
    });
}