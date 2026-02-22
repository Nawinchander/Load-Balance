const http = require("http");

const apiServers = [
  "http://localhost:6001",
  "http://localhost:6002"
];

const staticServer = "http://localhost:7000";

let index = 0;

function proxyRequest(target, req, res) {
  const proxy = http.request(
    target + req.url,
    { method: req.method, headers: req.headers },
    pres => {
      res.writeHead(pres.statusCode, pres.headers);
      pres.pipe(res);
    }
  );

  req.pipe(proxy);

  proxy.on("error", () => {
    res.writeHead(500);
    res.end("Proxy error");
  });
}

http.createServer((req, res) => {

  // 🔹 ROUTING LOGIC (L7 intelligence)

  if (req.url.startsWith("/api")) {
    const target = apiServers[index];
    index = (index + 1) % apiServers.length;

    console.log("Routing API to", target);
    proxyRequest(target, req, res);
  }
  else if (req.url.startsWith("/static")) {
    console.log("Routing STATIC to", staticServer);
    proxyRequest(staticServer, req, res);
  }
  else {
    res.end("Main app response");
  }

}).listen(3000, () => {
  console.log("L7 Load Balancer running on 3000");
});


