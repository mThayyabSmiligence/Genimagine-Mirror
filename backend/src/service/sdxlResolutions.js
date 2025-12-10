// backend/src/service/sdxlResolutions.js

const SDXL_ALLOWED_SIZES = [
  { width: 1024, height: 1024 },
  { width: 1152, height: 896 },
  { width: 1216, height: 832 },
  { width: 1344, height: 768 },
  { width: 1536, height: 640 },
  { width: 640,  height: 1536 },
  { width: 768,  height: 1344 },
  { width: 832,  height: 1216 },
  { width: 896,  height: 1152 },
];

export function snapToNearestSDXLSize(width, height) {
  let best = SDXL_ALLOWED_SIZES[0];
  let bestDiff = Infinity;

  for (const s of SDXL_ALLOWED_SIZES) {
    const diff = Math.abs(s.width - width) + Math.abs(s.height - height);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = s;
    }
  }
  return best;
}
