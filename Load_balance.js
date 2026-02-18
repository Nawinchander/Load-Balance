// load-balancer.js
const http = require("http");
const { request } = require("http");

class LoadBalancer {
  constructor(servers, strategy = "round-robin") {
    this.servers = servers.map(url => ({
      url,
      connections: 0,
      healthy: true
    }));

    this.strategy = strategy;
    this.currentIndex = 0;

    // run health checks every 5 sec
    setInterval(() => this.healthCheck(), 5000);
  }

  // ---------- STRATEGIES ----------

  getNextServer() {
    const healthyServers = this.servers.filter(s => s.healthy);
    if (!healthyServers.length) return null;

    if (this.strategy === "least-conn") {
      return healthyServers.reduce((min, s) =>
        s.connections < min.connections ? s : min
      );
    }

    // default → round robin
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    return server;
  }

  // ---------- HEALTH CHECK ----------

  async healthCheck() {
    for (const server of this.servers) {
      const req = request(server.url, { method: "GET", timeout: 2000 }, res => {
        server.healthy = res.statusCode < 500;
      });

      req.on("error", () => {
        server.healthy = false;
      });

      req.end();
    }
  }

  // ---------- REQUEST HANDLER ----------

  handleClient(req, res) {
    const server = this.getNextServer();

    if (!server) {
      res.writeHead(503);
      return res.end("No healthy servers available");
    }

    server.connections++;

    const proxyReq = request(
      server.url + req.url,
      {
        method: req.method,
        headers: req.headers
      },
      proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", err => {
      res.writeHead(500);
      res.end("Proxy error");
    });

    proxyReq.on("close", () => {
      server.connections--;
    });

    req.pipe(proxyReq);
  }
}


// ---------- BACKEND SERVERS ----------
// Run 2–3 dummy servers to test

function startBackend(port) {
  http.createServer((req, res) => {
    setTimeout(() => {
      res.end(`Response from server ${port}`);
    }, Math.random() * 500);
  }).listen(port, () => {
    console.log("Backend running on", port);
  });
}

startBackend(4001);
startBackend(4002);
startBackend(4003);


// ---------- LOAD BALANCER SERVER ----------

const lb = new LoadBalancer(
  [
    "http://localhost:4001",
    "http://localhost:4002",
    "http://localhost:4003"
  ],
  "least-conn" // change to "round-robin"
);

http.createServer((req, res) => lb.handleClient(req, res))
  .listen(3000, () => {
    console.log("Load balancer running on port 3000");
  });
