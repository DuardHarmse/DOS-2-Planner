import Vue from 'vue'
import worker from 'workerize-loader!~/static/db-worker.js';

Vue.use(worker)

export default async ({ app }, inject) => {
    // Set `worker` instance on `app`
    // This way we can use it in middleware and pages `asyncData`/`fetch`
    let dbWorker = worker();

    await dbWorker.initDb();
    inject('worker', dbWorker);
}