const dns = require("dns");

console.log("DNS Servers:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.enlivonexcluster.aaqbspc.mongodb.net",
  (err, records) => {
    console.log("Error:", err);
    console.log("Records:", records);
  }
);