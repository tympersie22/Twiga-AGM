import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { isSupabaseConfigured, supabase } from './supabase';

export interface ContactInquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const COMPANY_ID = 'twiga-agm';

export async function submitContactInquiry(data: ContactInquiryInput) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_inquiries').insert({
      ...data,
      company_id: COMPANY_ID,
      source: 'web',
      status: 'new',
      created_at: new Date().toISOString(),
    });
    if (!error) return { saved: true, mode: 'supabase' as const };
  }

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
