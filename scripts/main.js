// Точка входа. Связывает DOM и state, вешает слушатели.

import { getState, setState, subscribe } from "./state.js";
import { renderPreset } from "./presets.js";
import { drawGrid } from "./grid-overlay.js";
import { drawHeatmap } from "./heatmap.js";
import { analyze, renderRhythm } from "./rhythm.js";
import { mountCompare } from "./compare.js";
import { exportPng } from "./export.js";
import * as Sound from "./sound.js";

/* -------- DOM refs -------- */
const body = document.body;
const stageFrame = document.getElementById("stage-frame");
const stageContainer = document.getElementById("stage-container");
const presetRoot = document.getElementById("preset-root");
const gridSvg = document.getElementById("grid-overlay");
const heatCanvas = document.getElementById("heatmap");
const compareHandle = document.getElementById("compare-handle");

const rhythmEls = {
  badge: document.getElementById("rhythm-badge"),
  label: document.getElementById("rhythm-label"),
  stats: document.getElementById("rhythm-stats"),
  issuesList: document.getElementById("rhythm-issues"),
};
const noteBox = document.getElementById("note");

const metaGrid = document.getElementById("meta-grid");
const metaWidth = document.getElementById("meta-width");

/* -------- UI refs -------- */
const segButtons = document.querySelectorAll(".segmented__btn");
const gridBaseRadios = document.querySelectorAll('input[name="grid-base"]');
const sHeading = document.getElementById("s-heading");
const sLine = document.getElementById("s-line");
const sGap = document.getElementById("s-gap");
const sWidth = document.getElementById("s-width");
const sHeadingOut = document.getElementById("s-heading-out");
const sLineOut = document.getElementById("s-line-out");
const sGapOut = document.getElementById("s-gap-out");
const sWidthOut = document.getElementById("s-width-out");
const lGrid = document.getElementById("l-grid");
const lHeat = document.getElementById("l-heatmap");
const lSnap = document.getElementById("l-snap");
const selCB = document.getElementById("colorblind");
const btnCompare = document.getElementById("btn-compare");
const btnExport = document.getElementById("btn-export");
const btnSound = document.getElementById("btn-sound");

/* -------- вспомогалки -------- */
function snap(value, base, step = 1) {
  const snapped = Math.round(value / base) * base;
  return Math.max(step, snapped);
}

function applyCssVars(state) {
  const r = document.documentElement.style;
  r.setProperty("--grid-base", `${state.gridBase}px`);
  r.setProperty("--heading-size", `${state.headingSize}px`);
  r.setProperty("--line-height", state.lineHeight.toFixed(2));
  r.setProperty("--section-gap", `${state.sectionGap}px`);
  r.setProperty("--container-width", `${state.containerWidth}px`);
}

function syncBodyFlags(state) {
  body.dataset.preset = state.preset;
  body.dataset.gridVisible = String(state.gridVisible);
  body.dataset.heatmapVisible = String(state.heatmapVisible);
  body.dataset.compare = String(state.compare);
  body.dataset.colorblind = state.colorblind;
}

function renderMeta(state) {
  metaGrid.textContent = `${state.gridBase} px · 12 колонок · baseline ${state.gridBase}×`;
  metaWidth.textContent = `${state.containerWidth} px · line-height ${state.lineHeight.toFixed(2)}`;
}

let rafId = 0;
function scheduleOverlays() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    const s = getState();
    drawGrid(gridSvg, stageContainer, { gridBase: s.gridBase, gridVisible: s.gridVisible });
    drawHeatmap(heatCanvas, stageContainer, { heatmapVisible: s.heatmapVisible });
  });
}

function rerenderPreset(state) {
  presetRoot.innerHTML = "";
  presetRoot.appendChild(renderPreset(state.preset));
  // Если активен режим сравнения — пересоздаём хаотичный слой
  mountCompare(stageContainer, presetRoot.firstChild, compareHandle, state.compare);
  // Даём layout посчитаться, потом перерисовываем overlays
  scheduleOverlays();
}

function rerenderRhythm(state) {
  const result = analyze(state);
  renderRhythm(rhythmEls, result);
}

function updateOutputs(state) {
  sHeadingOut.textContent = `${state.headingSize} px`;
  sLineOut.textContent = state.lineHeight.toFixed(2);
  sGapOut.textContent = `${state.sectionGap} px`;
  sWidthOut.textContent = `${state.containerWidth} px`;
}

/* -------- UI → state -------- */
segButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    segButtons.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    setState({ preset: btn.dataset.preset });
  });
});

gridBaseRadios.forEach((r) => {
  r.addEventListener("change", () => {
    if (r.checked) setState({ gridBase: parseInt(r.value, 10) });
  });
});

function bindSlider(input, key, parse) {
  input.addEventListener("input", () => {
    const s = getState();
    let v = parse(input.value);
    if (s.snap && key !== "lineHeight") v = snap(v, s.gridBase);
    setState({ [key]: v });
    Sound.click();
  });
}

bindSlider(sHeading, "headingSize", (v) => parseInt(v, 10));
bindSlider(sLine, "lineHeight", (v) => parseFloat(v));
bindSlider(sGap, "sectionGap", (v) => parseInt(v, 10));
bindSlider(sWidth, "containerWidth", (v) => parseInt(v, 10));

lGrid.addEventListener("change", () => setState({ gridVisible: lGrid.checked }));
lHeat.addEventListener("change", () => setState({ heatmapVisible: lHeat.checked }));
lSnap.addEventListener("change", () => setState({ snap: lSnap.checked }));
selCB.addEventListener("change", () => setState({ colorblind: selCB.value }));

btnCompare.addEventListener("click", () => {
  const s = getState();
  const next = !s.compare;
  btnCompare.setAttribute("aria-pressed", String(next));
  setState({ compare: next });
});

btnExport.addEventListener("click", () => {
  exportPng(stageFrame, `grid-rhythm-${getState().preset}.png`);
});

btnSound.addEventListener("click", () => {
  const s = getState();
  const next = !s.sound;
  Sound.setEnabled(next);
  btnSound.setAttribute("aria-pressed", String(next));
  btnSound.querySelector("use").setAttribute("href", next ? "#i-sound-on" : "#i-sound-off");
  setState({ sound: next });
  if (next) Sound.click();
});

/* -------- заметки дизайнера -------- */
let highlightEl = null;

function showNote(target) {
  const data = target.getAttribute("data-note");
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    noteBox.innerHTML = "";
    const tag = document.createElement("span");
    tag.className = "note__tag";
    tag.textContent = "Заметка";
    const h = document.createElement("h3");
    h.textContent = parsed.title;
    const p = document.createElement("p");
    p.textContent = parsed.body;
    noteBox.append(tag, h, p);
  } catch (e) {
    /* ignore */
  }
  highlight(target);
}

function clearNote() {
  noteBox.innerHTML = '<p class="note__empty">Кликните по элементу на сцене, чтобы увидеть, почему он свёрстан именно так.</p>';
  if (highlightEl) {
    highlightEl.remove();
    highlightEl = null;
  }
}

function highlight(target) {
  if (!highlightEl) {
    highlightEl = document.createElement("div");
    highlightEl.className = "eye-highlight";
    stageContainer.appendChild(highlightEl);
  }
  const rect = target.getBoundingClientRect();
  const hostRect = stageContainer.getBoundingClientRect();
  highlightEl.style.left = `${rect.left - hostRect.left - 4}px`;
  highlightEl.style.top = `${rect.top - hostRect.top - 4}px`;
  highlightEl.style.width = `${rect.width + 8}px`;
  highlightEl.style.height = `${rect.height + 8}px`;
}

presetRoot.addEventListener("click", (e) => {
  const t = e.target.closest(".eye-target");
  if (!t) return;
  e.preventDefault();
  showNote(t);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".eye-target") && !e.target.closest(".note")) {
    clearNote();
  }
});

/* -------- state → UI/render -------- */
subscribe((state) => {
  applyCssVars(state);
  syncBodyFlags(state);
  updateOutputs(state);
  renderMeta(state);
  rerenderRhythm(state);
});

/* «Перерисовываем пресет при смене preset» — через отдельную подписку */
let currentPreset = null;
subscribe((state) => {
  if (state.preset !== currentPreset) {
    currentPreset = state.preset;
    rerenderPreset(state);
  } else {
    // просто пересчитать overlays (размеры элементов могли поменяться)
    scheduleOverlays();
    // И если включён режим сравнения — пересоздать хаотичный слой
    if (state.compare && !stageContainer.querySelector(".stage__canvas--chaotic")) {
      mountCompare(stageContainer, presetRoot.firstChild, compareHandle, true);
    }
    if (!state.compare) {
      mountCompare(stageContainer, presetRoot.firstChild, compareHandle, false);
    }
  }
});

/* -------- начальная инициализация -------- */
// Синхронизируем значения контролов со стартовым state
(function init() {
  const s = getState();
  [...gridBaseRadios].forEach((r) => (r.checked = parseInt(r.value, 10) === s.gridBase));
  sHeading.value = s.headingSize;
  sLine.value = s.lineHeight;
  sGap.value = s.sectionGap;
  sWidth.value = s.containerWidth;
  lGrid.checked = s.gridVisible;
  lHeat.checked = s.heatmapVisible;
  selCB.value = s.colorblind;
})();

/* -------- пересчёт overlays при resize -------- */
window.addEventListener("resize", scheduleOverlays);
// ResizeObserver, если доступен (на случай, если меняется высота сцены без resize)
if (window.ResizeObserver) {
  const ro = new ResizeObserver(() => scheduleOverlays());
  ro.observe(stageContainer);
}
