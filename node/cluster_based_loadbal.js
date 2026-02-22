const cluster = require("cluster");
const http = require("http");
const os = require("os");

const CPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} running`);

  for (let i = 0; i < CPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", worker => {
    console.log("Worker died, restarting...");
    cluster.fork();
  });

} else {

  http.createServer((req, res) => {
    res.end(`Handled by worker ${process.pid}`);
  }).listen(3000);

  console.log(`Worker ${process.pid} started`);
}