import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QuerySnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { getAppFirestore } from '../../../core/firebase/firebase-app';
import { User } from 'firebase/auth';
import { getAppAuth } from '../../../core/firebase/firebase-app';

export type FirestorePlainChantier = {
  id: string;
  ownerUid: string;
  name: string;
};

/**
 * Encapsuler les appels Firestore chantiers pour garder un repository testable.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreChantierDataSource {
  private readonly collectionName = 'chantiers';
  private readonly auth = getAppAuth();

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCollection(): CollectionReference<DocumentData> {
    const firestore: Firestore = getAppFirestore();
    return collection(firestore, this.collectionName);
  }

  getChantierDocRef(chantierId: string): DocumentReference<DocumentData> {
    return doc(this.getCollection(), chantierId);
  }

  saveById(chantierId: string, payload: FirestorePlainChantier): Promise<void> {
    return setDoc(this.getChantierDocRef(chantierId), payload);
  }

  readAll(): Promise<QuerySnapshot<DocumentData>> {
    return getDocs(this.getCollection());
  }

  readById(chantierId: string): Promise<DocumentSnapshot<DocumentData>> {
    return getDoc(this.getChantierDocRef(chantierId));
  }
}
