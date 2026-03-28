/// Consistent Hashing (Used in Distributed Systems)

// Used for caching systems like Redis clusters / CDNs.

const crypto = require("crypto");

class ConsistentHashBalancer {
  constructor(servers, replicas = 3) {
    this.ring = new Map();
    this.sortedKeys = [];

    servers.forEach(server => {
      for (let i = 0; i < replicas; i++) {
        const key = this.hash(server + i);
        this.ring.set(key, server);
        this.sortedKeys.push(key);
      }
    });

    this.sortedKeys.sort();
  }

  hash(input) {
    return crypto.createHash("md5").update(input).digest("hex");
  }

  getServer(key) {
    const hash = this.hash(key);

    for (let node of this.sortedKeys) {
      if (hash <= node) {
        return this.ring.get(node);
      }
    }

    return this.ring.get(this.sortedKeys[0]);
  }
}

// Usage
const ch = new ConsistentHashBalancer([
  "cache1",
  "cache2",
  "cache3",
]);

console.log(ch.getServer("user123"));



