import { Injectable } from '@angular/core';

export type ClientIdentityProfile = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type ClientDisplayResult = {
  label: string;
  showsIncompleteIndicator: boolean;
};

@Injectable({ providedIn: 'root' })
export class ClientDisplayResolver {
  resolve(profile: ClientIdentityProfile | null | undefined): ClientDisplayResult {
    if (!profile) {
      return { label: 'Client inconnu', showsIncompleteIndicator: true };
    }

    const firstName = this.normalize(profile.firstName);
    const lastName = this.normalize(profile.lastName);
    if (firstName && lastName) {
      return { label: `${firstName} ${lastName}`, showsIncompleteIndicator: false };
    }

    const name = this.normalize(profile.name);
    if (name) {
      return { label: name, showsIncompleteIndicator: true };
    }

    return { label: 'Client inconnu', showsIncompleteIndicator: true };
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '').trim();
  }
}
