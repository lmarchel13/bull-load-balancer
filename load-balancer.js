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
  const values = await redis.mget(keys);

  const podMemories = keys.map((key, index) => ({ queue: key.split(":")[0], memory: values[index] }));
  const bestPod = podMemories.reduce((min, pod) => (+pod.memory < +min.memory ? pod : min), { memory: +Infinity });

  return bestPod.queue;
}

(async () => {
  let id = 1;

  setInterval(() => {
    loadBalancerQueue.add({ id, name: "blablabla", timestamp: new Date() });
    id++;
  }, 1000);
})();
