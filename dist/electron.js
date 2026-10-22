// src/electron.ts
function electronTrackpad(bridge) {
  return {
    available: () => bridge.available(),
    subscribe: (listener) => bridge.subscribe(listener)
  };
}
export {
  electronTrackpad
};
