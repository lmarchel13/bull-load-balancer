const Queue = require("bull");
const { redisHost, getLessBusyQueue } = require("./utils");

const loadBalancerQueue = new Queue("loadbalancer", { redis: redisHost });

const clients = {
  queue1: new Queue("queue1", { redis: redisHost }),
  queue2: new Queue("queue2", { redis: redisHost }),
  queue3: new Queue("queue3", { redis: redisHost }),
};

loadBalancerQueue.process(async (job, done) => {
  const lessBusyQueue = await getLessBusyQueue();

  console.log("adding job to less busy queue", { lessBusyQueue });
  clients[lessBusyQueue].add(job.data);

  done();
});

let id = 1;
setInterval(() => {
  loadBalancerQueue.add({ id, message: "test", timestamp: new Date() });
  id++;
}, 1000);
