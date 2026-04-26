const NS = "http://www.w3.org/2000/svg";

export function drawGrid(svg, container, { gridBase, gridVisible }) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (!gridVisible) return;

  const rect = container.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (!w || !h) return;

  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);

  const cols = 12;
  const gutter = Math.max(8, Math.round(w * 0.012));
  const margin = Math.max(16, Math.round(w * 0.02));
  const usable = w - margin * 2;
  const colW = (usable - gutter * (cols - 1)) / cols;

  for (let i = 0; i < cols; i++) {
    const x = margin + i * (colW + gutter);
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("x", x.toFixed(2));
    r.setAttribute("y", 0);
    r.setAttribute("width", colW.toFixed(2));
    r.setAttribute("height", h);
    r.setAttribute("fill", "rgba(231, 248, 90, 0.18)");
    r.setAttribute("stroke", "rgba(13, 15, 20, 0.06)");
    r.setAttribute("stroke-width", "1");
    svg.appendChild(r);
  }

  [margin, w - margin].forEach((x) => {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", x);
    l.setAttribute("x2", x);
    l.setAttribute("y1", 0);
    l.setAttribute("y2", h);
    l.setAttribute("stroke", "rgba(13, 15, 20, 0.25)");
    l.setAttribute("stroke-dasharray", "4 6");
    l.setAttribute("stroke-width", "1");
    svg.appendChild(l);
  });

  const step = gridBase;
  for (let y = step; y < h; y += step) {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", 0);
    l.setAttribute("x2", w);
    l.setAttribute("y1", y);
    l.setAttribute("y2", y);
    const isMajor = Math.round(y / step) % 4 === 0;
    l.setAttribute("stroke", isMajor ? "rgba(13, 15, 20, 0.12)" : "rgba(13, 15, 20, 0.05)");
    l.setAttribute("stroke-width", "1");
    svg.appendChild(l);
  }
}
