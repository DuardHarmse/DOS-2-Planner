import EventEmitter from 'wolfy87-eventemitter'

export default async ({ app }, inject) => {
    inject('ee', new EventEmitter());
}