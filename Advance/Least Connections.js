//// Least Connections Load Balancer (Real-world backend usage)

class LeastConnectionBalancer {
  constructor(servers) {
    this.servers = servers.map((url) => ({
      url,
      activeConnections: 0,
    }));
  }

  getServer() {
    let least = this.servers[0];

    for (const server of this.servers) {
      if (server.activeConnections < least.activeConnections) {
        least = server;
      }
    }

    least.activeConnections++;
    return least;
  }

  release(serverUrl) {
    const server = this.servers.find(s => s.url === serverUrl);
    if (server) server.activeConnections--;
  }
}

// Usage
const lb = new LeastConnectionBalancer([
  "http://s1",
  "http://s2",
]);

const server = lb.getServer();
console.log(server.url);

// after request finishes
lb.release(server.url);

