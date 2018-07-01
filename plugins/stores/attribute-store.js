export default async ({ app }, inject) => {
    inject('attributeStore', {
        unspent: 0
    });
}