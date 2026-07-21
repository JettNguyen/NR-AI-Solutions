// status-toast.js — bottom-fixed toast behavior for the account-family status elements.
//
// bindStatusToast(el) upgrades a page's status element (an aria-live region already in the
// markup: #acct-status, #auth-status, #action-status) into a toast pinned to the bottom of
// the viewport, and returns a setStatus(msg, type) with the contract the pages already use:
// "" hides it, "error"/"ok" style it, any other message shows neutral. Every toast slides up
// on show, slides down on hide (styles.css §39), carries an × button, and auto-dismisses
// after 10 seconds — a new message resets the clock. The old scroll-the-banner-into-view hack
// is gone on purpose: a fixed toast is always in view.

export function bindStatusToast(el) {
  el.classList.add("status-toast");

  const text = document.createElement("span");
  text.className = "status-toast-text";
  const x = document.createElement("button");
  x.type = "button";
  x.className = "status-toast-x";
  x.setAttribute("aria-label", "Dismiss message");
  x.innerHTML = "&#215;";
  el.textContent = "";
  el.append(text, x);

  let timer = null;
  function hide() {
    if (timer) { clearTimeout(timer); timer = null; }
    el.classList.remove("is-shown");
  }
  x.addEventListener("click", hide);

  return function setStatus(msg, type = "") {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!msg) { hide(); return; }
    text.textContent = msg;
    el.className = "status-toast is-shown" + (type ? " " + type : "");
    timer = setTimeout(hide, 10000);
  };
}
