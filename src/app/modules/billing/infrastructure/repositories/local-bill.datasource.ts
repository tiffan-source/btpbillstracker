import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { getAppAuth } from '../../../../core/firebase/firebase-app';

@Injectable({ providedIn: 'root' })
export class LocalBillDataSource {
  getCurrentUser(): User | null {
    return getAppAuth().currentUser;
  }
}
