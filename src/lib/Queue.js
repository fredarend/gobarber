import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

/* Entendendo o código:
  Para cada um dos jobs criamos uma fila,
  dentro da fila armazena o bee (estancia que conecta com o redis) e o
  handle (processa as filas), processQueue processa as filas em tempo real.
*/

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFaillure).process(handle);
    });
  }

  handleFaillure(job, err) {
    console.log(`Queue ${job.queue.name}: Failed`, err);
  }
}

export default new Queue();
