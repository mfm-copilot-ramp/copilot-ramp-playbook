/* Dependency-free ZIP reader for the Solution-package mode.
 * Parses the central directory and inflates deflate/stored entries with the
 * browser-native DecompressionStream. Returns text entries of interest only.
 * The same block is embedded verbatim into docs/credit-estimator.md.
 */
(function (root) {
  "use strict";

  var TEXT_EXT = /\.(xml|yaml|yml|json|txt|config|cdsproj|csv|md|resx|rels)$/i;
  var MAX_ENTRY = 8 * 1024 * 1024;     // skip any single entry bigger than 8 MB
  var MAX_TOTAL = 64 * 1024 * 1024;    // stop after 64 MB decompressed

  function u16(dv, o) { return dv.getUint16(o, true); }
  function u32(dv, o) { return dv.getUint32(o, true); }

  function findEOCD(dv) {
    // End of central directory signature 0x06054b50, scan backwards.
    var min = Math.max(0, dv.byteLength - 65557);
    for (var i = dv.byteLength - 22; i >= min; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) return i;
    }
    return -1;
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser can't decompress ZIP entries (no DecompressionStream). Try the latest Edge, Chrome, Firefox or Safari.");
    }
    var ds = new DecompressionStream("deflate-raw");
    var stream = new Response(bytes).body.pipeThrough(ds);
    var buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }

  // ab: ArrayBuffer of the whole zip. Returns [{name, text}] for text entries.
  async function readZip(ab) {
    var bytes = new Uint8Array(ab);
    var dv = new DataView(ab);
    var eocd = findEOCD(dv);
    if (eocd < 0) throw new Error("Not a valid ZIP file (no end-of-central-directory record).");

    var total = u16(dv, eocd + 10);
    var cdOffset = u32(dv, eocd + 16);
    if (cdOffset === 0xffffffff) throw new Error("ZIP64 archives aren't supported by this in-browser reader.");

    var decoder = new TextDecoder("utf-8");
    var out = [];
    var decompressed = 0;
    var p = cdOffset;

    for (var e = 0; e < total; e++) {
      if (p + 46 > bytes.length || u32(dv, p) !== 0x02014b50) break;
      var method = u16(dv, p + 10);
      var compSize = u32(dv, p + 20);
      var uncompSize = u32(dv, p + 24);
      var nameLen = u16(dv, p + 28);
      var extraLen = u16(dv, p + 30);
      var commentLen = u16(dv, p + 32);
      var localOff = u32(dv, p + 42);
      var name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
      p += 46 + nameLen + extraLen + commentLen;

      var isText = TEXT_EXT.test(name);
      var isDir = /\/$/.test(name);
      if (isDir || !isText) continue;
      if (uncompSize > MAX_ENTRY || decompressed > MAX_TOTAL) continue;

      // Local header: recompute data offset (its name/extra lengths can differ).
      if (u32(dv, localOff) !== 0x04034b50) continue;
      var lNameLen = u16(dv, localOff + 26);
      var lExtraLen = u16(dv, localOff + 28);
      var dataStart = localOff + 30 + lNameLen + lExtraLen;
      var raw = bytes.subarray(dataStart, dataStart + compSize);

      var content;
      try {
        if (method === 0) content = raw;                 // stored
        else if (method === 8) content = await inflateRaw(raw); // deflate
        else continue;                                   // unsupported method
      } catch (err) { continue; }

      decompressed += content.length;
      out.push({ name: name, text: decoder.decode(content) });
    }
    if (!out.length) throw new Error("No readable text files found inside the archive. Is this a Copilot Studio solution export?");
    return out;
  }

  var api = { readZip: readZip };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorZip = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
