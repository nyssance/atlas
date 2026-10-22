// src/core.ts
function resolveReleaseSnap2(input) {
  const {
    startIndex,
    displacement,
    location,
    snapPoints,
    viewportWidth,
    flickMinIndex = 0
  } = input;
  if (!snapPoints.length)
    throw new Error("Atlas requires at least one snap point");
  if (snapPoints.length === 1)
    return 0;
  let nearest = 0;
  for (let i = 1;i < snapPoints.length; i++)
    if (Math.abs(snapPoints[i] - location) < Math.abs(snapPoints[nearest] - location))
      nearest = i;
  if (nearest !== startIndex)
    return nearest;
  if (Math.abs(displacement) < viewportWidth * 0.15)
    return startIndex;
  const direction = startIndex < snapPoints.length - 1 ? snapPoints[startIndex + 1] - snapPoints[startIndex] : snapPoints[startIndex] - snapPoints[startIndex - 1];
  const target = startIndex + (displacement * direction > 0 ? 1 : -1);
  return target < flickMinIndex ? startIndex : Math.max(0, Math.min(target, snapPoints.length - 1));
}

export { resolveReleaseSnap2 };
