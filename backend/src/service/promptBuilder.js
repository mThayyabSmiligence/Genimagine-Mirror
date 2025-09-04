const { emotions, poses } = require('../config/promptPresets');

function buildCharacterClause(character) {
  // Strengthen identity traits
  return `${character.name} — ${character.description}`;
}

function buildExpressionClause(emotionKey) {
  if (!emotionKey) return '';
  const e = emotions[emotionKey];
  return e ? `, expression: ${e}` : '';
}

function buildPoseClause(poseKey) {
  if (!poseKey) return '';
  const p = poses[poseKey];
  return p ? `, pose: ${p}` : '';
}

// function buildBackgroundClause(bgPrompt) {
//   return bgPrompt ? `. Scene: ${bgPrompt}` : '';
// }

exports.buildScenePrompt = ({ character, emotion, pose, extra }) => {
  // extra can include style hints, camera, lighting
  const subject = buildCharacterClause(character);
  const expr = buildExpressionClause(emotion);
  const pz = buildPoseClause(pose);
//   const bg = buildBackgroundClause(backgroundPrompt);
  const tail = extra ? `. ${extra}` : '';
  return `A high-quality illustration of ${subject}${expr}${pz}${tail}`.trim();
};
