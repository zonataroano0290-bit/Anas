import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase.ts';
import type { UserProfile, UserRole, BusinessProfile } from '../types/index.ts';

export const AuthService = {
  /**
   * Listen to Firebase Auth state transitions
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Register new account with email & password, and persist profile to Firestore
   */
  async register(params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'individual' | 'business';
    language: 'ckb' | 'ar' | 'en';
    businessProfile?: Partial<BusinessProfile>;
  }): Promise<{ user: UserProfile }> {
    // Security check: User cannot self-assign admin role
    if ((params.role as string) === 'admin') {
      throw new Error('Security Violation: Platform administrator accounts cannot be created via public registration.');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    const fbUser = userCredential.user;

    // Send email verification if supported
    try {
      await sendEmailVerification(fbUser);
    } catch (e) {
      console.warn('Could not trigger email verification', e);
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      phone: params.phone?.trim() || '',
      role: params.role,
      language: params.language,
      isEmailVerified: fbUser.emailVerified,
      businessProfile:
        params.role === 'business'
          ? {
              companyName: params.businessProfile?.companyName || params.name,
              commercialRegistrationNumber: params.businessProfile?.commercialRegistrationNumber || '',
              taxIdentificationNumber: params.businessProfile?.taxIdentificationNumber || '',
              businessAddress: params.businessProfile?.businessAddress || '',
              city: params.businessProfile?.city || 'Erbil',
              governorate: params.businessProfile?.governorate || 'IQ-ER',
              contactEmail: params.businessProfile?.contactEmail || params.email,
              contactPhone: params.businessProfile?.contactPhone || params.phone || '',
              industry: params.businessProfile?.industry || 'Commercial / Retail',
              verificationStatus: 'unverified',
            }
          : undefined,
      createdAt: now,
    };

    // Persist to Firestore: /users/{userId}
    try {
      await setDoc(doc(db, 'users', fbUser.uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
    }

    return { user: newProfile };
  },

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<{ user: UserProfile }> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await this.getUserProfile(cred.user.uid);
    if (!profile) {
      // Fallback create minimal profile if missing
      const now = new Date().toISOString();
      const fallback: UserProfile = {
        id: cred.user.uid,
        name: cred.user.displayName || email.split('@')[0],
        email: cred.user.email || email,
        phone: cred.user.phoneNumber || '',
        role: 'individual',
        language: 'ckb',
        isEmailVerified: cred.user.emailVerified,
        createdAt: now,
      };
      await setDoc(doc(db, 'users', cred.user.uid), fallback);
      return { user: fallback };
    }
    return { user: profile };
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Fetch user profile from Firestore with real RBAC verification
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      const data = snap.data() as UserProfile;

      // Check if user is a verified server-side admin
      const adminSnap = await getDoc(doc(db, 'admins', uid));
      if (adminSnap.exists() || (auth.currentUser?.email === 'chirayshaw@gmail.com' && auth.currentUser?.emailVerified)) {
        data.role = 'admin';
      }

      return data;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  },

  /**
   * Update non-privilege profile fields (name, phone, language, businessProfile)
   * Role cannot be altered via this method!
   */
  async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    // Strip forbidden fields to prevent client tampering
    const sanitized = { ...updates };
    delete (sanitized as any).role;
    delete (sanitized as any).id;
    delete (sanitized as any).email;
    delete (sanitized as any).createdAt;

    try {
      await updateDoc(doc(db, 'users', uid), {
        ...sanitized,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  },
};
