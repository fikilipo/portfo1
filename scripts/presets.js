function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("data-") || k === "role" || k === "type" || k === "aria-label")
      node.setAttribute(k, v);
    else node[k] = v;
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

function svgUse(id, props = {}) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  if (props.width) svg.setAttribute("width", props.width);
  if (props.height) svg.setAttribute("height", props.height);
  const use = document.createElementNS(ns, "use");
  use.setAttributeNS("http://www.w3.org/1999/xlink", "href", id);
  use.setAttribute("href", id);
  svg.appendChild(use);
  return svg;
}

function landing() {
  const root = el("article", { class: "preset-landing" });

  const hero = el(
    "section",
    { class: "preset-landing__hero" },
    el(
      "span",
      { class: "preset-landing__eyebrow eye-target", weight: "0.3", "data-note": JSON.stringify({
        title: "Надзаголовок",
        body: "Короткая метка категории над H1. Верхний трекинг и приглушённый цвет — чтобы не конкурировала с заголовком.",
      }) },
      "Садовод"
    ),
    el(
      "h1",
      { class: "eye-target", weight: "1.0", "data-note": JSON.stringify({
        title: "Заголовок H1",
        body: "Размер кратен модулю сетки. Одно предложение, максимум 1–2 строки.",
      }) },
      "Умная система полива для вашего сада"
    ),
    el(
      "p",
      { class: "preset-landing__sub eye-target", weight: "0.4", "data-note": JSON.stringify({
        title: "Подзаголовок",
        body: "Около 40% от размера H1 — создаёт иерархию, читается как продолжение заголовка.",
      }) },
      "Автоматизируйте уход за растениями с помощью AI-алгоритмов и датчиков влажности."
    ),
    el(
      "a",
      { class: "preset-landing__cta eye-target", weight: "0.95", href: "#", "data-note": JSON.stringify({
        title: "Главный CTA",
        body: "Высота 6×модуль, горизонтальный padding 3×модуль. Контраст с фоном — чтобы кнопку было видно сразу.",
      }) },
      "Начать бесплатно на 14 дней",
      el("span", { "aria-hidden": "true" }, "→")
    )
  );

  const features = el(
    "section",
    { class: "preset-landing__features" },
    featureCard("#i-drop", "Экономия воды до 40%", "Алгоритм учитывает осадки и не поливает, когда это не нужно."),
    featureCard("#i-phone", "Управление со смартфона", "iOS/Android приложение с Live‑графиками и напоминаниями."),
    featureCard("#i-sun", "Адаптация под погоду", "Прогноз на 7 дней синхронизируется с графиком полива.")
  );

  const reviews = el(
    "section",
    { class: "preset-landing__reviews" },
    reviewCard("АК", "Алексей Коваль", "Дачник, Тверь", "Забыл, что такое перелитые помидоры. Система окупилась за сезон."),
    reviewCard("МП", "Мария Петрова", "Ландшафтный дизайнер", "Рекомендую клиентам: меньше звонков «у меня роза вянет»."),
    reviewCard("ИГ", "Игорь Г.", "Садовод-любитель", "Приложение понятное, поставил отцу — разобрался за вечер.")
  );

  root.append(hero, features, reviews);
  return root;
}

function featureCard(iconId, title, body) {
  return el(
    "div",
    { class: "feature-card eye-target", weight: "0.7", "data-note": JSON.stringify({
      title: `Фича: ${title}`,
      body: "Карточки выровнены по колонкам. Внутренний отступ 4×модуль, между иконкой и заголовком — 2×модуль.",
    }) },
    el("div", { class: "feature-card__icon" }, svgUse(iconId)),
    el("h3", null, title),
    el("p", null, body)
  );
}

function reviewCard(initials, name, role, text) {
  return el(
    "div",
    { class: "review-card eye-target", weight: "0.5", "data-note": JSON.stringify({
      title: `Отзыв: ${name}`,
      body: "Три колонки равной ширины, единый padding. Разная длина текста компенсируется выравниванием по верху.",
    }) },
    el(
      "div",
      { class: "review-card__head" },
      el("div", { class: "review-card__avatar" }, initials),
      el(
        "div",
        null,
        el("div", { class: "review-card__name" }, name),
        el("div", { class: "review-card__role" }, role)
      )
    ),
    el("p", null, `«${text}»`)
  );
}

function article() {
  const root = el("article", { class: "preset-article" });

  root.append(
    el(
      "div",
      { class: "preset-article__meta" },
      el("span", null, "Дизайн-системы"),
      el("span", null, "·"),
      el("span", null, "6 мин чтения")
    ),
    el(
      "h1",
      { class: "eye-target", weight: "1.0", "data-note": JSON.stringify({
        title: "Заголовок статьи",
        body: "В длинных текстах H1 задаёт базовый ритм. Если line-height не кратен модулю — строки начинают «плыть».",
      }) },
      "Почему модульная сетка — основа хорошего дизайна"
    ),
    el(
      "p",
      { class: "preset-article__lead eye-target", weight: "0.6", "data-note": JSON.stringify({
        title: "Лид",
        body: "Первые две строки, которые читают почти все. Коротко — о чём статья.",
      }) },
      "Разбираемся, как системный подход экономит время, улучшает пользовательский опыт и почему швейцарские типографы 1950‑х были правы."
    ),
    el(
      "p",
      { class: "eye-target", weight: "0.4", "data-note": JSON.stringify({
        title: "Абзац",
        body: "Ширина колонки держится в пределах 68 символов — глаз не устаёт возвращаться на начало строки.",
      }) },
      "Модульные сетки родились в Швейцарии 1950‑х. Йозеф Мюллер‑Брокманн формализовал подход: страница делится на равные колонки и модули, и весь контент — текст, фото, таблицы — прикреплён к этим направляющим. Это дало дизайну новое качество: предсказуемость."
    ),
    el(
      "p",
      { class: "eye-target", weight: "0.4", "data-note": JSON.stringify({
        title: "Абзац",
        body: "Все размеры и отступы — от общего модуля. Новые экраны растут как ветка, а не как заплатка.",
      }) },
      "В вебе идея трансформировалась: 12 колонок с «гаттерами», брейкпойнты, rem‑единицы. Но главное осталось неизменным — все размеры, отступы и шрифтовые шкалы привязаны к единому модулю. Именно это позволяет команде расти: новый экран вырастает как ветка, а не как заплатка."
    ),
    el(
      "figure",
      { class: "eye-target", weight: "0.85", "data-note": JSON.stringify({
        title: "Схема 12 колонок",
        body: "Визуализация скелета страницы с гаттерами и маргинами.",
      }) },
      (() => {
        const svgNs = "http://www.w3.org/2000/svg";
        const s = document.createElementNS(svgNs, "svg");
        s.setAttribute("viewBox", "0 0 600 160");
        s.setAttribute("preserveAspectRatio", "none");
        const pad = 20;
        const cols = 12;
        const gutter = 8;
        const w = 600 - pad * 2;
        const colW = (w - gutter * (cols - 1)) / cols;
        for (let i = 0; i < cols; i++) {
          const r = document.createElementNS(svgNs, "rect");
          r.setAttribute("x", pad + i * (colW + gutter));
          r.setAttribute("y", 16);
          r.setAttribute("width", colW);
          r.setAttribute("height", 128);
          r.setAttribute("fill", "#dfe3ee");
          s.appendChild(r);
        }
        const line = document.createElementNS(svgNs, "line");
        line.setAttribute("x1", 0);
        line.setAttribute("x2", 600);
        line.setAttribute("y1", 8);
        line.setAttribute("y2", 8);
        line.setAttribute("stroke", "#0d0f14");
        line.setAttribute("stroke-dasharray", "2 4");
        s.appendChild(line);
        return s;
      })(),
      el("figcaption", null, "Классическая схема 12‑колоночной сетки с гаттером 8 px")
    ),
    el(
      "blockquote",
      { class: "eye-target", weight: "0.7", "data-note": JSON.stringify({
        title: "Цитата",
        body: "Визуальный якорь в длинном тексте. Боковой отступ и фон — пауза перед следующей секцией.",
      }) },
      "«Дизайн — это не то, как предмет выглядит, а то, как он работает.»",
      el("cite", null, "— Стив Джобс")
    ),
    el(
      "div",
      { class: "preset-article__tags eye-target", weight: "0.2", "data-note": JSON.stringify({
        title: "Теги",
        body: "Низкий визуальный вес: мелкий шрифт, приглушённый цвет.",
      }) },
      el("span", null, "#типографика"),
      el("span", null, "#сетка"),
      el("span", null, "#дизайн-системы")
    )
  );

  return root;
}

function product() {
  const root = el("article", { class: "preset-product" });

  const gallery = el(
    "div",
    { class: "preset-product__gallery eye-target", weight: "0.9", "data-note": JSON.stringify({
      title: "Фото товара",
      body: "Самый тяжёлый магнит внимания в карточке. Соотношение 4:3 — универсальное для каталогов.",
    }) },
    el("img", {
      src: "./assets/nike-air-max-270.jpg",
      alt: "Nike Air Max 270 React",
      loading: "lazy",
    })
  );

  const info = el(
    "div",
    { class: "preset-product__info" },
    el("span", { class: "preset-product__brand eye-target", weight: "0.2", "data-note": JSON.stringify({
      title: "Бренд",
      body: "Второстепенная информация, небольшой трекинг помогает отделить её от заголовка.",
    }) }, "Nike Running"),
    el("h1", { class: "preset-product__title eye-target", weight: "1.0", "data-note": JSON.stringify({
      title: "Название товара",
      body: "В карточке товара H1 = название. Размер ~70% от базового — чтобы оставить место для цены.",
    }) }, "Nike Air Max 270 React"),
    el(
      "div",
      { class: "preset-product__price eye-target", weight: "0.85", "data-note": JSON.stringify({
        title: "Цена",
        body: "Та же типографическая шкала, что и у заголовка. Старая цена зачёркнута и приглушена.",
      }) },
      el("b", null, "12 990 ₽"),
      el("del", null, "15 490 ₽")
    ),
    el("p", { class: "preset-product__desc eye-target", weight: "0.3", "data-note": JSON.stringify({
      title: "Описание",
      body: "2–3 строки. Всё остальное — ниже, в характеристиках.",
    }) }, "Амортизация нового поколения и дышащий верх для максимального комфорта. Поддержка стопы через React‑пену."),
    el(
      "dl",
      { class: "preset-product__specs eye-target", weight: "0.3", "data-note": JSON.stringify({
        title: "Характеристики",
        body: "Две колонки: термин — значение. Межстрочный интервал равен 2×модуль.",
      }) },
      el("dt", null, "Размер"), el("dd", null, "40–45"),
      el("dt", null, "Цвет"), el("dd", null, "Чёрный / Белый / Красный"),
      el("dt", null, "Материал"), el("dd", null, "Сетка + синтетика"),
      el("dt", null, "Вес"), el("dd", null, "280 г")
    ),
    el("button", { class: "preset-product__buy eye-target", weight: "0.95", type: "button", "data-note": JSON.stringify({
      title: "Добавить в корзину",
      body: "Занимает всю ширину колонки. Контрастный фон + крупный шрифт — основное действие карточки.",
    }) }, "Добавить в корзину")
  );

  root.append(gallery, info);
  return root;
}

const factories = { landing, article, product };

export function renderPreset(key) {
  const factory = factories[key] || landing;
  return factory();
}
