const Queue = require("bull");
const Redis = require("ioredis");

const redisHost = { port: 6379, host: "127.0.0.1" };
const redis = new Redis(redisHost);
const queue1 = new Queue("queue1", { redis: redisHost });
const queue2 = new Queue("queue2", { redis: redisHost });
const queue3 = new Queue("queue3", { redis: redisHost });

console.log("queue1, 2 and 3 running");

const setPodMemory = async (key, val) => {
  await redis.set(key, val);
};

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 1000);
};

queue1.process((job, done) => {
  console.log("queue1 processing", job.id, job.data);
  done();
});

queue2.process((job, done) => {
  console.log("queue2 processing", job.id, job.data);
  done();
});

queue3.process((job, done) => {
  console.log("queue3 processing", job.id, job.data);
  done();
});

setInterval(async () => {
  console.log("set pod memory...");
  const queues = ["queue1", "queue2", "queue3"];

  await Promise.all(
    queues.map(async (queue) => {
      const key = [queue, "pod-memory"].join(":");
      const value = generateRandomNumber();
      console.log({ key, value });

      await setPodMemory(key, value);
    })
  );
}, 10000);
