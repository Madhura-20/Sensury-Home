# SENSURY HOME Firestore Security Specification

## 1. Data Invariants
1. **Identity Integrity**: Every user-owned document (`UserProfile`, `UserPrivateInfo`, `HomeProject`, `AiConversation`) and every project subcollection document (`ConstructionTask`, `ProjectExpense`, `ProgressUpdate`, `ProjectDocument`, `QuotationRequest`) must bind `ownerId` (or `uid`) strictly to `request.auth.uid` on creation and keep it immutable on updates.
2. **PII Isolation**: User email and phone reside exclusively in `/users/{userId}/private/info`, accessible only to `request.auth.uid == userId` or a verified admin.
3. **Master Gate Relational Integrity**: Subcollection documents under `/projects/{projectId}/...` can only be created, read, updated, or deleted when the parent `/projects/{projectId}` document exists and its `ownerId` equals `request.auth.uid`.
4. **Zero Client-Delegated Queries**: Every `allow list` rule evaluates `resource.data.ownerId == request.auth.uid` (or `isAdmin()`) directly without using `get()` or `exists()` inside `allow list`.
5. **Temporal & Volumetric Integrity**: `createdAt` and `updatedAt` must equal `request.time`; every string and array enforces strict `.size()` upper bounds (keeping all documents well under Firestore's 1 MB limit).
6. **Verified Email & Admin Spoof Guard**: All write operations require `request.auth.token.email_verified == true`. Admin overrides check `email_verified == true` alongside the `/admins/{uid}` document or bootstrapped verified admin email.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Project Creation**: `{ ownerId: "anon", projectName: "Test" }` with `auth: null` -> `PERMISSION_DENIED`.
2. **Owner Spoofing on Project Create**: Authenticated as `userA`, sending `{ ownerId: "userB", ... }` -> `PERMISSION_DENIED`.
3. **Shadow Ghost Field Injection**: Sending `{ ...validProject, isAdmin: true }` -> `PERMISSION_DENIED` (`hasOnly` rejects).
4. **Oversized ID Poisoning**: Document ID of 200 characters or containing `/` / `$` -> `PERMISSION_DENIED` (`isValidId` rejects).
5. **Unverified Email Spoofing Admin**: Token with `email: "madhurasrisenthilkumar@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`.
6. **Client Timestamp Forgery**: Creating a project with backdated `createdAt: Timestamp(2020-01-01)` -> `PERMISSION_DENIED` (`createdAt == request.time`).
7. **Immutable Field Mutation**: Updating `ownerId` or `createdAt` on an existing project -> `PERMISSION_DENIED`.
8. **Orphaned Subcollection Write**: Creating `/projects/nonexistent/tasks/t1` -> `PERMISSION_DENIED` (Master Gate `exists()` fails).
9. **Cross-Tenant Subcollection Hijack**: `userB` creating a task under `userA`'s project -> `PERMISSION_DENIED` (Master Gate `get().data.ownerId` fails).
10. **PII Cross-Read**: `userB` reading `/users/userA/private/info` -> `PERMISSION_DENIED`.
11. **Terminal State Mutation**: Non-admin attempting to edit a project after `status == "completed"` -> `PERMISSION_DENIED`.
12. **Denial-of-Wallet Oversized Payload**: Uploading a 900 KB `photoDataUrl` into `progress_updates` or > 50 `savedMaterialIds` -> `PERMISSION_DENIED`.
