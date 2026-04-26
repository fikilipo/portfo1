const defaults = {
  preset: "landing",
  gridBase: 8,
  headingSize: 48,
  lineHeight: 1.5,
  sectionGap: 64,
  containerWidth: 960,
  gridVisible: true,
  heatmapVisible: false,
  snap: false,
  compare: false,
  colorblind: "none",
  sound: false,
};

const listeners = new Set();
const state = { ...defaults };

export function getState() {
  return { ...state };
}

export function setState(patch) {
  const prev = { ...state };
  let changed = false;
  for (const key of Object.keys(patch)) {
    if (state[key] !== patch[key]) {
      state[key] = patch[key];
      changed = true;
    }
  }
  if (!changed) return;
  for (const listener of listeners) listener(state, prev);
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(state, state);
  return () => listeners.delete(listener);
}
