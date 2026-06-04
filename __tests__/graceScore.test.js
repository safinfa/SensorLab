const calculateGraceScore = (avgVibration) => {
  return Math.max(0, Math.round(100 - avgVibration * 200));
};

describe('calculateGraceScore - Stretch Speed & Gracefulness', () => {

  test('perfect stillness gives score of 100', () => {
    expect(calculateGraceScore(0)).toBe(100);
  });

  test('vibration of 0.5 gives score of 0', () => {
    expect(calculateGraceScore(0.5)).toBe(0);
  });

  test('score is never negative', () => {
    expect(calculateGraceScore(2.0)).toBeGreaterThanOrEqual(0);
  });

  test('low vibration gives high score', () => {
    const score = calculateGraceScore(0.1);
    expect(score).toBeGreaterThan(70);
  });

  test('high vibration gives low score', () => {
    const score = calculateGraceScore(0.4);
    expect(score).toBeLessThan(30);
  });

  test('score of 80 for vibration of 0.1', () => {
    expect(calculateGraceScore(0.1)).toBe(80);
  });

});