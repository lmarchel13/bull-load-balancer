const Redis = require("ioredis");

const redisHost = { port: 6379, host: "127.0.0.1" };
const redis = new Redis(redisHost);

const getLessBusyQueue = async () => {
  const keys = await redis.keys("*:pod-memory");
  const values = await redis.mget(keys);

  const podMemories = keys.map((key, index) => ({ queue: key.split(":")[0], memory: values[index] }));
  const { queue } = podMemories.reduce((min, pod) => (+pod.memory < +min.memory ? pod : min), { memory: +Infinity });

  return queue;
};

module.exports = {
  getLessBusyQueue,
  redisHost,
};
