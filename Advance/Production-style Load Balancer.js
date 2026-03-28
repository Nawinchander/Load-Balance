//// Production-style Load Balancer with Health Checks + Retry

const axios = require("axios");

class SmartLoadBalancer {
  constructor(servers) {
    this.servers = servers.map(url => ({
      url,
      healthy: true,
      failCount: 0,
    }));
  }

  async healthCheck() {
    for (const server of this.servers) {
      try {
        await axios.get(`${server.url}/health`);
        server.healthy = true;
        server.failCount = 0;
      } catch {
        server.failCount++;
        if (server.failCount > 2) {
          server.healthy = false;
        }
      }
    }
  }

  getHealthyServer() {
    const healthyServers = this.servers.filter(s => s.healthy);
    if (healthyServers.length === 0) {
      throw new Error("No healthy servers");
    }
    return healthyServers[Math.floor(Math.random() * healthyServers.length)];
  }

  async request(path) {
    const server = this.getHealthyServer();

    try {
      return await axios.get(`${server.url}${path}`);
    } catch (err) {
      server.healthy = false; // fail fast
      return this.request(path); // retry
    }
  }
}

// Usage
const lb = new SmartLoadBalancer([
  "http://localhost:3001",
  "http://localhost:3002",
]);

setInterval(() => lb.healthCheck(), 5000);

(async () => {
  const res = await lb.request("/api/data");
  console.log(res.data);
})();



