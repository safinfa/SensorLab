const { Profanity } = require('@2toad/profanity');
const profanity = new Profanity();

describe('Profanity Filter - Reflection Input Validation', () => {

  test('clean reflection text passes filter', () => {
    const text = 'The parachute slowed down really well and I learned a lot!';
    expect(profanity.exists(text)).toBe(false);
  });

  test('empty string passes filter', () => {
    expect(profanity.exists('')).toBe(false);
  });

  test('normal science words pass filter', () => {
    const text = 'The drag force increased with a larger parachute surface area.';
    expect(profanity.exists(text)).toBe(false);
  });

  test('reflection with bad word is caught', () => {
    const text = 'this is damn great';
    expect(profanity.exists(text)).toBe(true);
  });

  test('team name with inappropriate word is caught', () => {
    const teamName = 'The damn rockets';
    expect(profanity.exists(teamName)).toBe(true);
  });

  test('scientific measurement text passes filter', () => {
    const text = 'Acceleration was 12 m/s squared and drag force was 0.05 Newtons.';
    expect(profanity.exists(text)).toBe(false);
  });

});