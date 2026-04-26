export function mountCompare(stageContainer, presetRoot, handleEl, isActive) {
  const old = stageContainer.querySelector(".stage__canvas--chaotic");
  if (old) old.remove();
  handleEl.hidden = !isActive;
  if (!isActive) return;

  const clone = presetRoot.cloneNode(true);
  clone.classList.add("stage__canvas--chaotic");
  clone.querySelectorAll("*").forEach((node) => {
    node.style.setProperty("--rand", Math.random().toFixed(2));
  });
  stageContainer.appendChild(clone);
  clone.style.setProperty("--compare-x", "50%");

  const inner = handleEl.querySelector(".stage__compare-handle");
  let dragging = false;
  let rectCache = null;

  const onDown = (e) => {
    dragging = true;
    rectCache = stageContainer.getBoundingClientRect();
    inner.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const rect = rectCache || stageContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = (x / rect.width) * 100;
    inner.style.left = `${pct}%`;
    clone.style.setProperty("--compare-x", `${pct}%`);
  };
  const onUp = () => {
    dragging = false;
  };

  inner.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
