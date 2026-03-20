import { InvalidClientNameError } from '../errors/invalid-client-name.error';

export class Client {
  private readonly _id: string;
  private readonly _name: string;
  private _email?: string;

  constructor(id: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new InvalidClientNameError();
    }
    this._id = id;
    this._name = name;
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get email(): string | undefined { return this._email; }

  setEmail(email: string): this {
    this._email = email;
    return this;
  }
}
