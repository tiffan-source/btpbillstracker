import { getFirebaseApp } from './firebase-app';

describe('firebase app bootstrap', () => {
  it('returns the same app instance across calls', () => {
    const first = getFirebaseApp();
    const second = getFirebaseApp();

    expect(first).toBe(second);
  });
});
