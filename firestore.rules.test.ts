/**
 * Security Rules Verification Suite (Conceptual / Rules Emulator Runner)
 * Covers the Dirty Dozen payloads against firestore.rules.
 */
export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'get' | 'update' | 'list' | 'delete';
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  { id: 1, name: 'Unauthenticated project create', collectionPath: 'projects/p1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Owner spoofing on project create', collectionPath: 'projects/p1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Shadow field injection on update', collectionPath: 'projects/p1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Oversized / invalid document ID', collectionPath: 'projects/' + 'x'.repeat(200), operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Unverified admin email spoof', collectionPath: 'materials/m1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Backdated createdAt timestamp forgery', collectionPath: 'projects/p1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Immutable ownerId mutation on update', collectionPath: 'projects/p1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Orphaned task under missing project', collectionPath: 'projects/missing/tasks/t1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Cross-tenant task create under victim project', collectionPath: 'projects/p1/tasks/t1', operation: 'create', expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Cross-user PII private info read', collectionPath: 'users/userA/private/info', operation: 'get', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Non-admin update on completed project', collectionPath: 'projects/p1', operation: 'update', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Oversized photoDataUrl payload > 350KB', collectionPath: 'projects/p1/progress_updates/u1', operation: 'create', expected: 'PERMISSION_DENIED' },
];
