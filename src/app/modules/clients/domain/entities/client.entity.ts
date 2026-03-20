import { InvalidClientNameError } from '../errors/invalid-client-name.error';

export class Client {
  private readonly _id: string;
  private _name: string;
  private _firstName?: string;
  private _lastName?: string;
  private _email?: string;
  private _phone?: string;

  constructor(id: string, name: string) {
    if (!name || name.trim().length === 0) {
      throw new InvalidClientNameError();
    }
    this._id = id;
    this._name = name.trim();
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get firstName(): string | undefined { return this._firstName; }
  get lastName(): string | undefined { return this._lastName; }
  get email(): string | undefined { return this._email; }
  get phone(): string | undefined { return this._phone; }

  setFirstName(firstName: string): this {
    const value = firstName.trim();
    if (!value) {
      throw new InvalidClientNameError();
    }

    this._firstName = value;
    this.refreshDerivedName();
    return this;
  }

  setLastName(lastName: string): this {
    const value = lastName.trim();
    if (!value) {
      throw new InvalidClientNameError();
    }

    this._lastName = value;
    this.refreshDerivedName();
    return this;
  }

  setEmail(email: string): this {
    this._email = email.trim();
    return this;
  }

  setPhone(phone: string): this {
    this._phone = phone.trim();
    return this;
  }

  private refreshDerivedName(): void {
    const chunks = [this._firstName, this._lastName].filter((value): value is string => !!value && value.length > 0);
    if (chunks.length > 0) {
      this._name = chunks.join(' ');
    }
  }
}
