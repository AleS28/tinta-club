"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { getBookById } from "@/lib/db";
import { filterCatalogBooks } from "@/data/catalog";
import { getPublicAuthorProfile } from "@/lib/users";
import type { Book } from "@/data/mock";
import type { PublicAuthorProfile } from "@/types/author";

function favoritesRef(userId: string) {
  return collection(db!, "users", userId, "favorites");
}

function followingRef(userId: string) {
  return collection(db!, "users", userId, "following");
}

export function subscribeToFavorite(
  userId: string,
  bookId: string,
  callback: (isFavorite: boolean) => void,
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    callback(false);
    return () => {};
  }

  const ref = doc(db, "users", userId, "favorites", bookId);
  return onSnapshot(ref, (snap) => callback(snap.exists()));
}

export async function toggleFavorite(
  userId: string,
  bookId: string,
  isFavorite: boolean,
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  const ref = doc(db, "users", userId, "favorites", bookId);
  if (isFavorite) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, { bookId, addedAt: serverTimestamp() });
  }
}

export async function getFavoriteBooks(userId: string): Promise<Book[]> {
  if (!db || !isFirebaseConfigured) return [];

  const snapshot = await getDocs(favoritesRef(userId));
  const books = await Promise.all(
    snapshot.docs.map((docSnap) => getBookById(docSnap.id)),
  );
  return filterCatalogBooks(
    books.filter((book): book is Book => !!book),
  );
}

export function subscribeToFollow(
  userId: string,
  authorId: string,
  callback: (isFollowing: boolean) => void,
): Unsubscribe {
  if (!db || !isFirebaseConfigured) {
    callback(false);
    return () => {};
  }

  const ref = doc(db, "users", userId, "following", authorId);
  return onSnapshot(ref, (snap) => callback(snap.exists()));
}

export async function toggleFollow(
  userId: string,
  authorId: string,
  isFollowing: boolean,
): Promise<void> {
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore no está configurado");
  }

  const ref = doc(db, "users", userId, "following", authorId);
  if (isFollowing) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, { authorId, followedAt: serverTimestamp() });
  }
}

export async function getFollowedAuthors(userId: string): Promise<PublicAuthorProfile[]> {
  if (!db || !isFirebaseConfigured) return [];

  const snapshot = await getDocs(followingRef(userId));
  const authors = await Promise.all(
    snapshot.docs.map((docSnap) => getPublicAuthorProfile(docSnap.id)),
  );
  return authors.filter((author): author is PublicAuthorProfile => !!author);
}
