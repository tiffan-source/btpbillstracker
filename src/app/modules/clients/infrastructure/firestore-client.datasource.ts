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

export type FirestorePlainClient = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

/**
 * Encapsuler les appels Firestore clients pour garder un repository testable sans mock de modules.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreClientDataSource {
  private readonly collectionName = 'clients';

  getCollection(): CollectionReference<DocumentData> {
    const firestore: Firestore = getAppFirestore();
    return collection(firestore, this.collectionName);
  }

  getClientDocRef(clientId: string): DocumentReference<DocumentData> {
    return doc(this.getCollection(), clientId);
  }

  saveById(clientId: string, payload: FirestorePlainClient): Promise<void> {
    return setDoc(this.getClientDocRef(clientId), payload);
  }

  readAll(): Promise<QuerySnapshot<DocumentData>> {
    return getDocs(this.getCollection());
  }

  readById(clientId: string): Promise<DocumentSnapshot<DocumentData>> {
    return getDoc(this.getClientDocRef(clientId));
  }
}
