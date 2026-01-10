// ABQD_THEME_v1
(function () {
  function setTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    document.querySelectorAll(".seg button").forEach(b => b.classList.remove("active"));
    const btn = document.querySelector(`.seg button[data-theme="${theme}"]`);
    if (btn) btn.classList.add("active");
  }

  function initThemeSeg(){
    const seg = document.getElementById("themeSeg");
    if (!seg) return;

    seg.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme")));
    });

    const saved = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme") || "soft";
    setTheme(saved);
  }

  window.ABQD = window.ABQD || {};
  window.ABQD.theme = { setTheme, initThemeSeg };
})();
