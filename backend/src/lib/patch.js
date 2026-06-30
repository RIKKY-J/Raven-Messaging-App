import { Buffer } from "buffer";
import bufferModule from "buffer";

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
