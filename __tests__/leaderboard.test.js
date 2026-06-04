const getScoreLabel = (activityId, totalScore) => {
  switch (activityId) {
    case 1: return `Drop Time: ${totalScore}ms`;
    case 2: return `Loudest: ${totalScore} dB`;
    case 3: return `Best Bend: ${totalScore}°`;
    case 4: return `Stability: ${totalScore}`;
    case 5: return `Grace Score: ${totalScore}/100`;
    case 6: return `Reaction: ${totalScore}ms`;
    case 7: return `Resting BPM: ${totalScore}`;
    default: return `Score: ${totalScore}`;
  }
};

const getBestDesign = (results) => {
  if (!results || results.length <= 1) return null;
  return results.slice(1).reduce((best, r) =>
    parseFloat(r.dropTime) > parseFloat(best.dropTime) ? r : best, results[1]);
};

const getBestReading = (results) => {
  if (!results || results.length === 0) return null;
  return results.reduce((best, r) =>
    r.actualAngle > best.actualAngle ? r : best, results[0]);
};

describe('Leaderboard Score Labels', () => {

  test('Activity 1 shows correct drop time label', () => {
    expect(getScoreLabel(1, 500)).toBe('Drop Time: 500ms');
  });

  test('Activity 2 shows correct dB label', () => {
    expect(getScoreLabel(2, 75)).toBe('Loudest: 75 dB');
  });

  test('Activity 3 shows correct bend angle label', () => {
    expect(getScoreLabel(3, 45)).toBe('Best Bend: 45°');
  });

  test('Activity 5 shows grace score out of 100', () => {
    expect(getScoreLabel(5, 85)).toBe('Grace Score: 85/100');
  });

  test('Activity 7 shows BPM label', () => {
    expect(getScoreLabel(7, 16)).toBe('Resting BPM: 16');
  });

  test('unknown activity returns generic score label', () => {
    expect(getScoreLabel(99, 100)).toBe('Score: 100');
  });

});

describe('Best Parachute Design Selection', () => {

  test('returns null when only baseline exists', () => {
    const results = [{ design: 'No Parachute', dropTime: '0.3' }];
    expect(getBestDesign(results)).toBeNull();
  });

  test('selects design with longest drop time', () => {
    const results = [
      { design: 'No Parachute', dropTime: '0.3' },
      { design: 'Design 1', dropTime: '0.8' },
      { design: 'Design 2', dropTime: '1.2' },
    ];
    expect(getBestDesign(results).design).toBe('Design 2');
  });

  test('returns only design when one parachute tested', () => {
    const results = [
      { design: 'No Parachute', dropTime: '0.3' },
      { design: 'Design 1', dropTime: '0.9' },
    ];
    expect(getBestDesign(results).design).toBe('Design 1');
  });

});

describe('Best Hand Fan Reading Selection', () => {

  test('returns reading with highest bend angle', () => {
    const results = [
      { design: 'Design 1', actualAngle: 25 },
      { design: 'Design 2', actualAngle: 45 },
      { design: 'Design 3', actualAngle: 30 },
    ];
    expect(getBestReading(results).actualAngle).toBe(45);
  });

  test('returns null for empty results', () => {
    expect(getBestReading([])).toBeNull();
  });

  test('returns only result when one reading', () => {
    const results = [{ design: 'Design 1', actualAngle: 20 }];
    expect(getBestReading(results).actualAngle).toBe(20);
  });

});