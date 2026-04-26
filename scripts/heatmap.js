export function drawHeatmap(canvas, container, { heatmapVisible }) {
  const ctx = canvas.getContext("2d");
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = rect.width;
  const h = rect.height;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  if (!heatmapVisible || !w || !h) return;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "rgba(30, 90, 200, 0.10)");
  bg.addColorStop(1, "rgba(20, 40, 90, 0.04)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "lighter";

  const targets = container.querySelectorAll(".eye-target");
  const containerRect = container.getBoundingClientRect();

  targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left - containerRect.left + r.width / 2;
    const y = r.top - containerRect.top + r.height / 2;
    let weight = parseFloat(el.getAttribute("weight") || "0.3");

    const vy = y / h;
    weight *= 1 - vy * 0.4;
    if (vy < 0.25 && (x / w) < 0.6) weight += 0.2;
    else if (vy >= 0.25 && vy < 0.55 && (x / w) < 0.5) weight += 0.1;
    weight = Math.max(0.05, Math.min(1.1, weight));

    const radius = Math.max(80, Math.max(r.width, r.height) * 0.8);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(229, 72, 77, ${0.55 * weight})`);
    grad.addColorStop(0.4, `rgba(245, 165, 36, ${0.35 * weight})`);
    grad.addColorStop(0.8, `rgba(231, 248, 90, ${0.15 * weight})`);
    grad.addColorStop(1, "rgba(231, 248, 90, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
}
