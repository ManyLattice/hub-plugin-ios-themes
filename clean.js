// The plugin's themes in the layout of the core's Clean: the core lays any plugin theme over Classic (themes.js apply()
// drops th-clean), so while one of these themes is chosen this code puts th-clean back after every hub-theme. Colors stay
// the theme's: they are inline styles on <html> and win over clean/palette.css.
const THEMES = { "themes/liquid-glass/liquid-glass.json": "liquid", "themes/blueprint/blueprint.json": "blueprint" };
const DARK = new Set(["blueprint"]);

export default function register(hub) {
  hub.addStyle("clean.css");
  const name = decodeURIComponent(hub.url("").split("/")[2] || "");
  const saved = () => {
    try { return JSON.parse(localStorage.getItem("hub.theme") || "null") || {}; } catch { return {}; }
  };
  const chosen = () => {
    const id = saved().id || "";
    for (const [file, key] of Object.entries(THEMES)) if (id === `${name}:${file}`) return key;
    return "";
  };
  // Clean's list avatars draw the session emoji as text in a frame and drop the node's image (background: none !important);
  // the theme's avatar images go back by the emoji, from the theme the core has applied
  const avatars = (on) => {
    let st = document.getElementById("ios-clean-avatars");
    if (!on) { st?.remove(); return; }
    if (!st) { st = document.createElement("style"); st.id = "ios-clean-avatars"; document.head.append(st); }
    const urls = saved().theme?.avatars_url || {};
    st.textContent = Object.entries(urls).map(([emoji, url]) =>
      `html.ios-clean.th-clean-av #list .srow[data-clean-k] .nm > .avatar.kit-img[aria-label=${JSON.stringify(emoji)}]`
      + ` { background: url(${JSON.stringify(url)}) center / 75% no-repeat !important; }`).join("\n");
  };
  const sync = () => {
    const root = document.documentElement, key = chosen();
    avatars(!!key);
    if (!key) {
      root.classList.remove("ios-clean");
      delete root.dataset.iosTheme;
      return;
    }
    const was = root.classList.contains("th-clean");
    root.classList.add("th-clean", "ios-clean");
    root.classList.toggle("th-clean-dark", DARK.has(key));
    root.dataset.iosTheme = key;
    // Clean's page code and the list redraw by hub-theme; the one that just fired saw the page without th-clean
    if (!was) queueMicrotask(() => window.dispatchEvent(new CustomEvent("hub-theme")));
  };
  window.addEventListener("hub-theme", sync);
  sync();
}
