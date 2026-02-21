import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface ContactInquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const COMPANY_ID = 'twiga-agm';

export async function submitContactInquiry(data: ContactInquiryInput) {
  if (!isFirebaseConfigured || !db) {
    return { saved: false, mode: 'demo' as const };
  }

  await addDoc(collection(db, 'companies', COMPANY_ID, 'contactInquiries'), {
    ...data,
    source: 'web',
    status: 'new',
    createdAt: serverTimestamp(),
  });

  return { saved: true, mode: 'firestore' as const };
}
