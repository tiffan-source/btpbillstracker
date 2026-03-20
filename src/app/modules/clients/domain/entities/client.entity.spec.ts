import { Client } from './client.entity';
import { InvalidClientNameError } from '../errors/invalid-client-name.error';

describe('Client Entity', () => {
  it('should create a valid client with name and email', () => {
    const client = new Client('c-1', 'John Doe');
    client.setEmail('john@example.com');
    
    expect(client.id).toBe('c-1');
    expect(client.name).toBe('John Doe');
    expect(client.email).toBe('john@example.com');
  });

  it('should support editable identity fields and keep derived full name', () => {
    const client = new Client('c-3', 'Legacy Name')
      .setFirstName('John')
      .setLastName('Doe')
      .setPhone('+229 01 00 00 00 00')
      .setEmail('john.doe@example.com');

    expect(client.firstName).toBe('John');
    expect(client.lastName).toBe('Doe');
    expect(client.phone).toBe('+229 01 00 00 00 00');
    expect(client.name).toBe('John Doe');
    expect(client.email).toBe('john.doe@example.com');
  });

  it('should fail if name is empty or missing', () => {
    expect(() => new Client('c-2', '')).toThrow(InvalidClientNameError);
    expect(() => new Client('c-2', '   ')).toThrow(InvalidClientNameError);
  });
});
