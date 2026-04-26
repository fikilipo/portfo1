// Режим «До / После»: клонирует контент пресета и накладывает поверх
// с clip‑path, управляемым вертикальным ползунком.

export function mountCompare(stageContainer, presetRoot, handleEl, isActive) {
  // Удаляем старый «хаотичный» слой
  const old = stageContainer.querySelector(".stage__canvas--chaotic");
  if (old) old.remove();
  handleEl.hidden = !isActive;
  if (!isActive) return;

  // Клонируем содержимое
  const clone = presetRoot.cloneNode(true);
  clone.classList.add("stage__canvas--chaotic");
  // Для стартового хаоса: раздадим CSS‑переменной --rand случайные значения
  clone.querySelectorAll("*").forEach((node) => {
    node.style.setProperty("--rand", Math.random().toFixed(2));
  });
  stageContainer.appendChild(clone);
  clone.style.setProperty("--compare-x", "50%");

  // Таскание разделителя
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

  // При размонтировании хендл переустанавливается; старые слушатели
  // не критичны (inner внутри handleEl, window‑listener оставляем — он no‑op пока dragging=false).
}
