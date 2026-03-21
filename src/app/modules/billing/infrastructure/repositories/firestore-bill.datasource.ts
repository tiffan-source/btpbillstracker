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

export type FirestorePlainBill = {
  id: string;
  ownerUid: string;
  reference: string;
  clientId: string;
  status: 'DRAFT' | 'VALIDATED' | 'PAID';
  amountTTC?: number;
  dueDate?: string;
  externalInvoiceReference?: string;
  type?: string;
  paymentMode?: string;
  chantier?: string;
};

@Injectable({ providedIn: 'root' })
export class FirestoreBillDataSource {
  private readonly collectionName = 'bills';
  private readonly auth = getAppAuth();

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCollection(): CollectionReference<DocumentData> {
    const firestore: Firestore = getAppFirestore();
    return collection(firestore, this.collectionName);
  }

  getBillDocRef(billId: string): DocumentReference<DocumentData> {
    return doc(this.getCollection(), billId);
  }

  saveById(billId: string, payload: FirestorePlainBill): Promise<void> {
    return setDoc(this.getBillDocRef(billId), payload);
  }

  readAll(): Promise<QuerySnapshot<DocumentData>> {
    return getDocs(this.getCollection());
  }

  readById(billId: string): Promise<DocumentSnapshot<DocumentData>> {
    return getDoc(this.getBillDocRef(billId));
  }
}
