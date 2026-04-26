export function analyze(params) {
  const { gridBase, headingSize, lineHeight, sectionGap, containerWidth } = params;

  const samples = [
    { name: "Размер заголовка", value: headingSize, unit: "px" },
    { name: "Отступ секций", value: sectionGap, unit: "px" },
    { name: "Ширина контейнера", value: containerWidth, unit: "px" },
    { name: "Высота строки H1", value: Math.round(headingSize * lineHeight), unit: "px" },
    { name: "Внутренний отступ 2×модуль", value: gridBase * 2, unit: "px" },
    { name: "Внутренний отступ 3×модуль", value: gridBase * 3, unit: "px" },
  ];

  const issues = [];
  let clean = 0;

  for (const s of samples) {
    const rest = s.value % gridBase;
    const penalty = Math.min(rest, gridBase - rest);
    if (penalty === 0) {
      clean += 1;
    } else {
      const suggestUp = s.value + (gridBase - rest);
      const suggestDown = s.value - rest;
      const suggest = Math.abs(s.value - suggestDown) < Math.abs(s.value - suggestUp) ? suggestDown : suggestUp;
      issues.push({
        name: s.name,
        value: s.value,
        unit: s.unit,
        suggest,
        penalty,
      });
    }
  }

  const ratio = clean / samples.length;
  let level = "green";
  let label = "Ритм соблюдён";
  if (ratio < 1 && ratio >= 0.6) {
    level = "yellow";
    label = "Есть отклонения";
  } else if (ratio < 0.6) {
    level = "red";
    label = "Ритм нарушен";
  }

  const baselineOk = Math.round(headingSize * lineHeight) % gridBase === 0;
  if (!baselineOk) {
    issues.push({
      name: "Baseline строки",
      value: Math.round(headingSize * lineHeight),
      unit: "px",
      suggest: Math.round((headingSize * lineHeight) / gridBase) * gridBase,
      penalty: 999,
      hint: "line-height × heading-size не кратен модулю — строки будут «плыть»",
    });
  }

  return {
    level,
    label,
    ratio,
    cleanCount: clean,
    totalCount: samples.length,
    issues,
  };
}

export function renderRhythm(rootEls, result) {
  const { badge, label, stats, issuesList } = rootEls;

  badge.classList.remove("rhythm__badge--green", "rhythm__badge--yellow", "rhythm__badge--red");
  badge.classList.add(`rhythm__badge--${result.level}`);
  label.textContent = result.label;

  const pct = Math.round(result.ratio * 100);
  stats.textContent = `${pct}% значений кратны модулю. Чистых: ${result.cleanCount}/${result.totalCount}.`;

  issuesList.innerHTML = "";
  for (const issue of result.issues) {
    const li = document.createElement("li");
    const suggestTxt = issue.hint
      ? issue.hint + ` (попробуйте ${issue.suggest} ${issue.unit})`
      : `${issue.name}: ${issue.value} ${issue.unit} → ближайшее кратное: ${issue.suggest} ${issue.unit}.`;
    li.textContent = suggestTxt;
    issuesList.appendChild(li);
  }
  if (!result.issues.length) {
    const li = document.createElement("li");
    li.textContent = "Все ключевые значения кратны выбранному модулю.";
    li.style.color = "var(--ok)";
    li.style.borderColor = "color-mix(in srgb, var(--ok) 30%, var(--line))";
    issuesList.appendChild(li);
  }
}
