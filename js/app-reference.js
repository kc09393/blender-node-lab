import { initLangToggle, tBi, t } from "./i18n.js";
import { initGlobalSearch } from "./globalSearch.js";
import { initMobileNav } from "./ui/mobileNav.js";
import { iorTable, roughnessTable, metalColorTable } from "../data/materialsReference.js";

initLangToggle();
initMobileNav();
initGlobalSearch();

function renderIorTable() {
  const el = document.getElementById("ior-table");
  el.innerHTML = `
    <thead><tr><th>${t("reference.iorColHeader")}</th><th>${t("reference.iorColValue")}</th></tr></thead>
    <tbody>
      ${iorTable
        .map((row) => `<tr><td>${tBi(row.name)}</td><td class="ref-num">${row.ior.toFixed(2)}</td></tr>`)
        .join("")}
    </tbody>
  `;
}

function renderRoughnessTable() {
  const el = document.getElementById("roughness-table");
  el.innerHTML = `
    <thead><tr><th>${t("reference.iorColHeader")}</th><th>${t("reference.roughnessColValue")}</th></tr></thead>
    <tbody>
      ${roughnessTable
        .map((row) => {
          const [lo, hi] = row.range;
          return `
            <tr>
              <td>${tBi(row.name)}</td>
              <td>
                <div class="ref-range-row">
                  <span class="ref-num">${lo.toFixed(2)} – ${hi.toFixed(2)}</span>
                  <div class="ref-range-bar">
                    <div class="ref-range-fill" style="left:${lo * 100}%; width:${(hi - lo) * 100}%"></div>
                  </div>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")}
    </tbody>
  `;
}

function renderMetalTable() {
  const el = document.getElementById("metal-table");
  el.innerHTML = `
    <thead><tr><th>${t("reference.iorColHeader")}</th><th></th><th>${t("reference.metalColValue")}</th></tr></thead>
    <tbody>
      ${metalColorTable
        .map((row) => {
          const [r, g, b] = row.color;
          const css = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
          return `
            <tr>
              <td>${tBi(row.name)}</td>
              <td><span class="ref-swatch" style="background:${css}"></span></td>
              <td class="ref-num">${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}</td>
            </tr>
          `;
        })
        .join("")}
    </tbody>
  `;
}

function renderAll() {
  renderIorTable();
  renderRoughnessTable();
  renderMetalTable();
}

renderAll();
document.addEventListener("langchange", renderAll);
