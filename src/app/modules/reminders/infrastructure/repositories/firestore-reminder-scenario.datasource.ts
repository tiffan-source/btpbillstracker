import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
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
import { getAppAuth, getAppFirestore } from '../../../../core/firebase/firebase-app';

export type FirestorePlainReminderScenario = {
  id: string;
  ownerUid: string;
  name: string;
  steps: number[];
};

@Injectable({ providedIn: 'root' })
export class FirestoreReminderScenarioDataSource {
  private readonly collectionName = 'reminder_scenarios';
  private readonly auth = getAppAuth();

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCollection(): CollectionReference<DocumentData> {
    const firestore: Firestore = getAppFirestore();
    return collection(firestore, this.collectionName);
  }

  getScenarioDocRef(scenarioId: string): DocumentReference<DocumentData> {
    return doc(this.getCollection(), scenarioId);
  }

  saveById(scenarioId: string, payload: FirestorePlainReminderScenario): Promise<void> {
    return setDoc(this.getScenarioDocRef(scenarioId), payload);
  }

  readAll(): Promise<QuerySnapshot<DocumentData>> {
    return getDocs(this.getCollection());
  }

  readById(scenarioId: string): Promise<DocumentSnapshot<DocumentData>> {
    return getDoc(this.getScenarioDocRef(scenarioId));
  }
}
