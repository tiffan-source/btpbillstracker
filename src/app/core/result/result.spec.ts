import { failure, success, type Result } from './result';

describe('Result', () => {
  it('should preserve success payload type and value', () => {
    const result: Result<{ id: string }> = success({ id: 'x-1' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('x-1');
    }
  });

  it('should preserve failure metadata payload', () => {
    const result = failure('ERR_CODE', 'Message', { source: 'core' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ERR_CODE');
      expect(result.error.metadata).toEqual({ source: 'core' });
    }
  });
});

