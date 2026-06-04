const convertToDb = (metering) => {
  if (metering === undefined || metering === null) return 0;
  const normalized = Math.max(0, metering + 160);
  const scaled = Math.pow(normalized / 160, 3) * 100;
  return Math.min(120, Math.round(scaled));
};

describe('convertToDb - Sound Pollution Hunter', () => {

  test('returns 0 for null input', () => {
    expect(convertToDb(null)).toBe(0);
  });

  test('returns 0 for undefined input', () => {
    expect(convertToDb(undefined)).toBe(0);
  });

  test('returns 0 for complete silence (-160 metering)', () => {
    expect(convertToDb(-160)).toBe(0);
  });

  test('returns 100 for max input (0 metering)', () => {
    expect(convertToDb(0)).toBe(100);
  });

  test('result is always between 0 and 120', () => {
    const result = convertToDb(-80);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(120);
  });

  test('louder sound gives higher dB reading', () => {
    const quiet = convertToDb(-140);
    const loud = convertToDb(-40);
    expect(loud).toBeGreaterThan(quiet);
  });

});