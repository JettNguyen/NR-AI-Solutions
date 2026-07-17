// account-nav.js — powers the account avatar + dropdown in the site nav on every page.
//
// It reflects Firebase auth state (shared with the Archie desktop app, project archie-77170):
//   • signed out → "Log in" / "Sign up"   (links to /login/)
//   • signed in  → account email, "Manage account" (/account/), "Sign out"
//
// Loaded as a module on every page. It shares the default Firebase app with the login/account
// pages via getApps()/getApp(), so initialising here never collides with their own init.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA46RqJV4tcJD8h4mdcSZ26dDoikA9L64M",
  authDomain: "archie-77170.firebaseapp.com",
  projectId: "archie-77170",
  storageBucket: "archie-77170.firebasestorage.app",
  messagingSenderId: "516396797258",
  appId: "1:516396797258:web:362cf2815128f3c82345b3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const root = document.getElementById("navAccount");
if (root) {
  const btn = document.getElementById("navAccountBtn");
  const menu = document.getElementById("navAccountMenu");
  const avatar = document.getElementById("navAccountAvatar");

  const USER_GLYPH =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>';

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function openMenu() { root.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  function closeMenu() { root.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    root.classList.contains("open") ? closeMenu() : openMenu();
  });
  document.addEventListener("click", (e) => { if (!root.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  function renderSignedOut() {
    btn.classList.remove("is-authed");
    btn.setAttribute("aria-label", "Account — sign in");
    avatar.textContent = "";
    avatar.innerHTML = USER_GLYPH;
    menu.innerHTML =
      '<a role="menuitem" href="/login/">Log in</a>' +
      '<a role="menuitem" href="/login/?mode=signup">Sign up</a>';
  }

  function renderSignedIn(user) {
    const name = (user.displayName || "").trim();
    const email = (user.email || "").trim();
    btn.classList.add("is-authed");
    btn.setAttribute("aria-label", "Account menu" + (name || email ? " — " + (name || email) : ""));
    avatar.innerHTML = "";
    // Initial from the name if we have it, else the email.
    avatar.textContent = ((name || email)[0] || "U").toUpperCase();
    const label = name
      ? escapeHtml(name) + (email ? '<br><span class="nav-account-sub">' + escapeHtml(email) + "</span>" : "")
      : escapeHtml(email || "Signed in");
    menu.innerHTML =
      '<div class="nav-account-menu-label">' + label + "</div>" +
      '<a role="menuitem" href="/account/">Manage account</a>' +
      '<div class="nav-account-divider"></div>' +
      '<button role="menuitem" type="button" id="navAccountSignout">Sign out</button>';
    const out = document.getElementById("navAccountSignout");
    out.addEventListener("click", async () => {
      closeMenu();
      try { await signOut(auth); } catch (e) { /* ignore */ }
      // If we're on a signed-in-only page, get out of it.
      if (location.pathname.replace(/\/+$/, "").endsWith("/account")) location.href = "/login/";
    });
  }

  renderSignedOut(); // sensible default until auth resolves
  onAuthStateChanged(auth, (user) => { user ? renderSignedIn(user) : renderSignedOut(); });
}
