/* site-bus.js — portable-estimate bus for carrying work between site tools.
 *
 * V1 wires only the transient HANDOFF lane (Credit Estimator → ROI Estimator).
 * The DURABLE WORKSPACE lane + registry ship now on the FINAL envelope schema so
 * V2 ("My estimates" cart, multi-producer, aggregate ROI) and V3 (proposal composer)
 * are additive — no schema migration, no storage swap, no tool re-coupling.
 *
 * The atom that travels — an Item envelope (final shape, V1 == V3):
 *   { id, v, kind, producer, createdAt, updatedAt, label, input, refs, meta }
 * Invariant: input carries INPUTS ONLY (recompute-on-arrival) — never a frozen
 * credit number — so EstimatorCore stays the single source of truth. meta/label are
 * display-only. See files/portable-estimates-roadmap.md for the full plan.
 *
 * No DOM, no init — this module only defines window.SiteBus. Safe to load on every page.
 */
(function () {
  "use strict";

  var VERSION = 1;
  var HANDOFF_KEY = "cr-handoff-v1";     // sessionStorage: { kind: item } (one pending per kind)
  var WORKSPACE_KEY = "cr-workspace-v1"; // localStorage: [ item, ... ]

  /* ── Single config point for handoff UX — swap these without touching flow code.
   *   nav:       "same-tab" | "new-tab"   — how the producer opens the destination
   *   target:    "quick" | "detailed"     — which ROI mode the import lands in
   *   autoApply: false | true             — false = review-before-commit banner;
   *                                          true  = apply the import immediately     */
  var UX = { nav: "same-tab", target: "quick", autoApply: false };

  // ── tiny utilities ──────────────────────────────────────────────────────────
  function isArr(x) { return Object.prototype.toString.call(x) === "[object Array]"; }
  function now() { return Date.now ? Date.now() : new Date().getTime(); }
  function uuid() {
    // RFC4122-ish; crypto when available, Math.random fallback (ids need not be secure).
    var c = (typeof window !== "undefined" && window.crypto) || null;
    if (c && c.getRandomValues) {
      var b = new Uint8Array(16); c.getRandomValues(b);
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      var h = []; for (var i = 0; i < 16; i++) h.push((b[i] + 0x100).toString(16).slice(1));
      return h[0] + h[1] + h[2] + h[3] + "-" + h[4] + h[5] + "-" + h[6] + h[7] + "-" +
             h[8] + h[9] + "-" + h[10] + h[11] + h[12] + h[13] + h[14] + h[15];
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) {
      var r = (Math.random() * 16) | 0, val = ch === "x" ? r : (r & 0x3) | 0x8;
      return val.toString(16);
    });
  }

  // ── storage with an in-memory fallback (private mode / Node / disabled storage) ──
  function memStore() {
    var m = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; },
      setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; }
    };
  }
  var _mem = { session: null, local: null };
  function pick(kind) {
    var win = (typeof window !== "undefined") ? window : null;
    try {
      var s = win ? win[kind + "Storage"] : null;
      if (s) { var probe = "__cr_probe__"; s.setItem(probe, "1"); s.removeItem(probe); return s; }
    } catch (e) { /* storage blocked — fall through to memory */ }
    var slot = kind === "session" ? "session" : "local";
    if (!_mem[slot]) _mem[slot] = memStore();
    return _mem[slot];
  }
  function ss() { return pick("session"); }
  function ls() { return pick("local"); }
  function readJSON(store, key) {
    try { var s = store.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function writeJSON(store, key, val) {
    try { store.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  // ── envelope ─────────────────────────────────────────────────────────────────
  function makeItem(o) {
    o = o || {};
    return {
      id: o.id || uuid(),
      v: VERSION,
      kind: o.kind || "estimate",
      producer: o.producer || null,
      createdAt: o.createdAt || now(),
      updatedAt: now(),
      label: o.label || "",
      input: o.input || {},
      refs: isArr(o.refs) ? o.refs.slice() : [],
      meta: o.meta || {}
    };
  }
  // Normalize a stored item to the current schema. Returns null for junk / a newer
  // schema we don't understand (forward-compat: ignore rather than mis-read).
  function migrate(item) {
    if (!item || typeof item !== "object") return null;
    if (item.v == null) item.v = VERSION;
    if (item.v > VERSION) return null;
    // (future: step migrations item.v === 1 -> 2 here, then bump)
    if (!item.id) item.id = uuid();
    if (!item.kind) item.kind = "estimate";
    if (!isArr(item.refs)) item.refs = [];
    if (!item.input || typeof item.input !== "object") item.input = {};
    if (!item.meta || typeof item.meta !== "object") item.meta = {};
    return item;
  }

  // ── handoff lane (sessionStorage, consume-once, one pending item per kind) ─────
  function handoff(item) {
    item = makeItem(item);
    var map = readJSON(ss(), HANDOFF_KEY) || {};
    map[item.kind] = item;
    writeJSON(ss(), HANDOFF_KEY, map);
    return item;
  }
  function _firstKey(map) { for (var k in map) if (Object.prototype.hasOwnProperty.call(map, k)) return k; return null; }
  function peekHandoff(kind) {
    var map = readJSON(ss(), HANDOFF_KEY) || {};
    var k = kind || _firstKey(map);
    return (k && map[k]) ? migrate(map[k]) : null;
  }
  function takeHandoff(kind) {
    var map = readJSON(ss(), HANDOFF_KEY) || {};
    var k = kind || _firstKey(map);
    if (!k || !map[k]) return null;
    var item = map[k];
    delete map[k];
    writeJSON(ss(), HANDOFF_KEY, map);
    return migrate(item);
  }

  // ── workspace lane (localStorage, durable collection) — SHIPS, unused UI in V1 ──
  function _all() {
    var arr = readJSON(ls(), WORKSPACE_KEY);
    if (!isArr(arr)) return [];
    var out = []; for (var i = 0; i < arr.length; i++) { var m = migrate(arr[i]); if (m) out.push(m); }
    return out;
  }
  function _save(arr) { writeJSON(ls(), WORKSPACE_KEY, arr); }
  function list(filter) {
    var arr = _all();
    if (filter) {
      if (filter.kind) arr = arr.filter(function (i) { return i.kind === filter.kind; });
      if (filter.producer) arr = arr.filter(function (i) { return i.producer === filter.producer; });
    }
    return arr;
  }
  function get(id) { var a = _all(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function put(item) {
    item = makeItem(item);
    var arr = _all(), idx = -1;
    for (var i = 0; i < arr.length; i++) if (arr[i].id === item.id) { idx = i; break; }
    if (idx >= 0) arr[idx] = item; else arr.push(item);
    _save(arr);
    return item;
  }
  function remove(id) { _save(_all().filter(function (i) { return i.id !== id; })); }
  function clear() { _save([]); }
  function link(fromId, toId) {
    var it = get(fromId); if (!it) return null;
    if (it.refs.indexOf(toId) < 0) { it.refs.push(toId); return put(it); }
    return it;
  }

  // ── registry (producers/consumers plug in here, never into each other) ────────
  var registry = {};
  function register(kind, def) { registry[kind] = def || {}; return registry[kind]; }
  function definition(kind) { return registry[kind] || null; }

  var api = {
    VERSION: VERSION, UX: UX,
    makeItem: makeItem, migrate: migrate, uuid: uuid,
    handoff: handoff, peekHandoff: peekHandoff, takeHandoff: takeHandoff,
    put: put, get: get, list: list, remove: remove, clear: clear, link: link,
    register: register, definition: definition
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.SiteBus = api;
})();
