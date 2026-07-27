import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

export type FeedbackUserType = "Lector" | "Autor" | "Amante de las historias";

export interface FeedbackInput {
  userType: FeedbackUserType;
  genres: string[];
  featureRequest: string;
  comments: string;
  userId?: string;
  userEmail?: string;
}

export async function submitFeedback(input: FeedbackInput): Promise<string> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  const docRef = await addDoc(collection(db, "feedback"), {
    userType: input.userType,
    genres: input.genres,
    featureRequest: input.featureRequest.trim(),
    comments: input.comments.trim(),
    userId: input.userId ?? null,
    userEmail: input.userEmail ?? null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
