const Queue = require("bull");
const Redis = require("ioredis");

const redisHost = { port: 6379, host: "127.0.0.1" };
const redis = new Redis(redisHost);
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

async function getLessBusyQueue() {
  const keys = await redis.keys("*:pod-memory");
  let min = +Infinity;
  let lessBusyQueue = "";

  await Promise.all(
    keys.map(async (key) => {
      const queueName = key.split(":")[0];
      const value = +(await redis.get(key));

      if (value <= min) {
        min = value;
        lessBusyQueue = queueName;
      }
    })
  );

  return lessBusyQueue;
}

(async () => {
  let id = 1;

  setInterval(() => {
    loadBalancerQueue.add({ id, name: "blablabla", timestamp: new Date() });
    id++;
  }, 1000);
})();
