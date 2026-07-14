(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) n(e);
  new MutationObserver((e) => {
    for (const s of e)
      if (s.type === "childList")
        for (const o of s.addedNodes)
          o.tagName === "LINK" && o.rel === "modulepreload" && n(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function i(e) {
    const s = {};
    return (
      e.integrity && (s.integrity = e.integrity),
      e.referrerPolicy && (s.referrerPolicy = e.referrerPolicy),
      e.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : e.crossOrigin === "anonymous"
          ? (s.credentials = "omit")
          : (s.credentials = "same-origin"),
      s
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    const s = i(e);
    fetch(e.href, s);
  }
})();
async function k(a, t) {
  const i = new TextEncoder(),
    n = await crypto.subtle.importKey(
      "raw",
      i.encode(a.trim()),
      { name: "PBKDF2" },
      !1,
      ["deriveBits", "deriveKey"],
    );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: t, iterations: 2e6, hash: "SHA-256" },
    n,
    { name: "AES-GCM", length: 256 },
    !1,
    ["encrypt", "decrypt"],
  );
}
async function L(a, t) {
  const i = crypto.getRandomValues(new Uint8Array(12)),
    n = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, a, t);
  return {
    iv: btoa(String.fromCharCode(...i)),
    data: btoa(String.fromCharCode(...new Uint8Array(n))),
  };
}
async function B(a, t) {
  try {
    const i = Uint8Array.from(atob(t.iv), (e) => e.charCodeAt(0)),
      n = Uint8Array.from(atob(t.data), (e) => e.charCodeAt(0));
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv: i }, a, n);
  } catch {
    return null;
  }
}
const K = new TextEncoder().encode("vault-number-hash-v1");
async function N(a) {
  const t = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(a.trim()),
      { name: "PBKDF2" },
      !1,
      ["deriveBits"],
    ),
    i = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: K, iterations: 5e6, hash: "SHA-256" },
      t,
      256,
    );
  return Array.from(new Uint8Array(i))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
function c(a, t, ...i) {
  const n = document.createElement(a);
  if (t)
    for (const [e, s] of Object.entries(t))
      e === "class"
        ? (n.className = s)
        : e.startsWith("on")
          ? n.addEventListener(e.slice(2), s)
          : n.setAttribute(e, s);
  for (const e of i) (typeof e == "string" || e) && n.append(e);
  return n;
}
const y = new Map();
let g = 0;
const U = window.webxdc.selfAddr;
let C = null,
  r = null,
  l = null,
  d = "",
  f = [];
function E() {
  const a = document.getElementById("edit-badge"),
    t = document.getElementById("lock-btn");
  (a && (a.style.display = ""), t && t.classList.add("lock-dirty"));
}
function I() {
  const a = document.getElementById("app");
  a.replaceChildren();
  const t = c("input", {
    id: "number-input",
    class: "input",
    type: "text",
    placeholder: "Enter passphrase",
  });
  t.onkeydown = (e) => {
    e.key === "Enter" && D();
  };
  const i = c(
      "button",
      { id: "unlock-btn", class: "btn", onclick: D },
      "Unlock Vault",
    ),
    n = c("div", { id: "unlock-status", class: "hint" });
  (a.append(
    c(
      "div",
      { class: "entry" },
      c("img", { class: "icon", src: "icon.png" }),
      c("h1", null, "Vault"),
      t,
      i,
      n,
    ),
  ),
    t.focus());
}
async function D() {
  const a = document.getElementById("number-input"),
    t = document.getElementById("unlock-btn"),
    i = document.getElementById("unlock-status"),
    n = a.value.trimEnd();
  if (!n) return;
  ((a.disabled = !0),
    (t.disabled = !0),
    (t.textContent = "Unlocking…"),
    (i.textContent = "Deriving key, please wait…"),
    await new Promise((s) => setTimeout(s, 50)),
    (C = n),
    (r = await N(n)));
  const e = y.get(r);
  if (e && e.salt) {
    const s = Uint8Array.from(atob(e.salt), (o) => o.charCodeAt(0));
    if (((l = await k(n, s)), (d = ""), e.textIv && e.textData)) {
      const o = await B(l, { iv: e.textIv, data: e.textData });
      o && (d = new TextDecoder().decode(o));
    }
    f = e.files || [];
  } else {
    const s = crypto.getRandomValues(new Uint8Array(16));
    ((l = await k(n, s)), (d = ""), (f = []));
    const o = {
      numberHash: r,
      salt: btoa(String.fromCharCode(...s)),
      textIv: null,
      textData: null,
      files: [],
      version: ++g,
      addr: U,
    };
    (y.set(r, o), window.webxdc.sendUpdate({ payload: o }, "vault created"));
  }
  O();
}
async function H() {
  (await S(), (C = null), (r = null), (l = null), (d = ""), (f = []), I());
}
document.addEventListener("visibilitychange", () => {
  document.hidden && r && l && S();
});
function O() {
  const a = document.getElementById("app");
  a.replaceChildren();
  const t = c("div", { class: "number" });
  t.textContent = C;
  const i = c(
      "button",
      { id: "lock-btn", class: "lock-btn", onclick: H },
      "Lock",
    ),
    n = c("span", { id: "edit-badge", class: "edit-badge" }, "editing");
  n.style.display = "none";
  const e = c(
      "div",
      { class: "vault-header" },
      c("div", null, c("div", { class: "label" }, "Vault"), t),
      c("div", { class: "vault-actions" }, n, i),
    ),
    s = c("textarea", { id: "ta", placeholder: "Write anything..." });
  s.value = d;
  const o = c("input", {
      type: "file",
      id: "file-input",
      style: "display:none",
    }),
    v = c("label", { class: "attach-btn" }, "+ Attach", o),
    m = c("div", { id: "file-list" }),
    p = c(
      "div",
      { class: "file-section" },
      c(
        "div",
        { class: "file-header" },
        c("span", null, "Attachments (max 200 KB each)"),
        v,
      ),
      m,
    ),
    h = c(
      "div",
      { class: "hint" },
      "Changes are saved when you lock the vault",
    );
  (a.append(e, s, p, h),
    s.focus(),
    (s.selectionStart = s.selectionEnd = s.value.length),
    (s.oninput = () => {
      ((d = s.value), E());
    }),
    (o.onchange = async (w) => {
      const u = w.target.files[0];
      if (!u) return;
      if (u.size > 200 * 1024) {
        alert("Max file size is 200 KB");
        return;
      }
      const b = await u.arrayBuffer(),
        A = await L(l, new Uint8Array(b));
      (f.push({ name: u.name, size: u.size, iv: A.iv, data: A.data }),
        E(),
        x(),
        (w.target.value = ""));
    }),
    x());
}
function x() {
  const a = document.getElementById("file-list");
  a &&
    (a.replaceChildren(),
    f.forEach((t, i) => {
      const n = document.createElement("div");
      n.className = "file-item";
      const e = document.createElement("div");
      e.className = "file-info";
      const s = document.createElement("div");
      ((s.className = "file-name"), (s.textContent = t.name));
      const o = document.createElement("div");
      ((o.className = "file-size"),
        (o.textContent = (t.size / 1024).toFixed(1) + " KB"),
        e.append(s, o));
      const v = document.createElement("div");
      v.className = "file-actions";
      const m = document.createElement("button");
      ((m.className = "dl"),
        (m.textContent = "↓"),
        (m.onclick = async () => {
          const h = await B(l, { iv: t.iv, data: t.data });
          if (h) {
            const w = new Blob([h]),
              u = URL.createObjectURL(w),
              b = document.createElement("a");
            ((b.href = u),
              (b.download = t.name),
              b.click(),
              URL.revokeObjectURL(u));
          }
        }));
      const p = document.createElement("button");
      ((p.className = "del"),
        (p.textContent = "×"),
        (p.onclick = () => {
          (f.splice(i, 1), E(), x());
        }),
        v.append(m, p),
        n.append(e, v),
        a.appendChild(n));
    }));
}
function P(a, t) {
  ((d = a), (f = t));
  const i = document.getElementById("ta");
  if (i) {
    if (i.value !== a) {
      const n = i.selectionStart,
        e = i.selectionEnd;
      ((i.value = a), (i.selectionStart = n), (i.selectionEnd = e));
    }
    x();
  }
}
async function S() {
  if (!r || !l) return;
  let a = null,
    t = null;
  if (d) {
    const e = await L(l, new TextEncoder().encode(d));
    ((a = e.iv), (t = e.data));
  }
  const i = y.get(r),
    n = {
      numberHash: r,
      salt: i?.salt,
      textIv: a,
      textData: t,
      files: f,
      version: ++g,
      addr: U,
    };
  (y.set(r, n), window.webxdc.sendUpdate({ payload: n }, "vault updated"));
}
function V(a) {
  const t = a.payload;
  if (!t || !t.numberHash) return;
  g = Math.max(g, t.version || 0);
  const i = y.get(t.numberHash);
  if (i) {
    const n = i.version || 0,
      e = t.version || 0;
    if (n > e || (n === e && (i.addr || "") >= (t.addr || ""))) return;
  }
  (y.set(t.numberHash, t),
    t.numberHash === r &&
      l &&
      (async () => {
        let n = "";
        if (t.textIv && t.textData) {
          const e = await B(l, { iv: t.textIv, data: t.textData });
          e && (n = new TextDecoder().decode(e));
        }
        P(n, t.files || []);
      })());
}
window.webxdc.setUpdateListener(V, 0);
I();
