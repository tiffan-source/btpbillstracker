import { InvalidChantierNameError } from '../errors/invalid-chantier-name.error';

export class Chantier {
  private readonly _id: string;
  private _name: string;

  constructor(id: string, name: string) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new InvalidChantierNameError();
    }

    this._id = id;
    this._name = normalizedName;
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }

  setName(name: string): this {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new InvalidChantierNameError();
    }

    this._name = normalizedName;
    return this;
  }
}

