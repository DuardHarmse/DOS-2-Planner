export default async ({ app }, inject) => {
    inject('talentStore', {
        unspent: 0
    });
}