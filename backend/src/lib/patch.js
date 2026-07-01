import { Buffer } from "buffer";
import bufferModule from "buffer";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (err) {
  console.warn("Failed to set DNS servers:", err);
}


if (typeof bufferModule.SlowBuffer === "undefined" || !bufferModule.SlowBuffer.prototype) {
  const SlowBuffer = function (size) {
    return Buffer.alloc(size);
  };
  SlowBuffer.prototype = Buffer.prototype;
  
  Object.defineProperty(bufferModule, "SlowBuffer", {
    value: SlowBuffer,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
