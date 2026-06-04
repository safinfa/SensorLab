const calculatePhysics = (dropTime, heightMeters, massKg) => {
  const gravity = 9.8;
  const t = parseFloat(dropTime);
  if (!t || t <= 0) return null;
  const finalVelocity = gravity * t;
  const acceleration = (2 * heightMeters) / (t * t);
  const netForce = massKg * acceleration;
  const weight = massKg * gravity;
  const dragForce = Math.max(0, weight - netForce);
  const gForce = acceleration / gravity;
  return {
    finalVelocity: parseFloat(finalVelocity.toFixed(2)),
    acceleration: parseFloat(acceleration.toFixed(2)),
    netForce: parseFloat(netForce.toFixed(4)),
    dragForce: parseFloat(dragForce.toFixed(4)),
    weight: parseFloat(weight.toFixed(4)),
    gForce: parseFloat(gForce.toFixed(2)),
  };
};

describe('calculatePhysics - Parachute Drop Challenge', () => {

  test('calculates correct final velocity for 0.5s drop', () => {
    const result = calculatePhysics(0.5, 1.5, 0.01);
    expect(result.finalVelocity).toBe(4.9);
  });

  test('calculates correct acceleration for known drop', () => {
    const result = calculatePhysics(0.5, 1.5, 0.01);
    expect(result.acceleration).toBe(12);
  });

  test('drag force is 0 or positive — never negative', () => {
    const result = calculatePhysics(0.3, 1.5, 0.01);
    expect(result.dragForce).toBeGreaterThanOrEqual(0);
  });

  test('returns null for zero drop time', () => {
    const result = calculatePhysics(0, 1.5, 0.01);
    expect(result).toBeNull();
  });

  test('returns null for negative drop time', () => {
    const result = calculatePhysics(-1, 1.5, 0.01);
    expect(result).toBeNull();
  });

  test('weight equals mass times gravity', () => {
    const result = calculatePhysics(0.5, 1.5, 0.01);
    expect(result.weight).toBeCloseTo(0.098, 2);
  });

});