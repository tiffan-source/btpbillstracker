import { Client } from './client.entity';

describe('Client Entity', () => {
  it('should create a valid client with name and email', () => {
    const client = new Client('c-1', 'John Doe');
    client.setEmail('john@example.com');
    
    expect(client.id).toBe('c-1');
    expect(client.name).toBe('John Doe');
    expect(client.email).toBe('john@example.com');
  });

  it('should fail if name is empty or missing', () => {
    expect(() => new Client('c-2', '')).toThrow('Un client doit avoir un nom valide.');
    expect(() => new Client('c-2', '   ')).toThrow('Un client doit avoir un nom valide.');
  });
});
