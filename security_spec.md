# Firestore Security Specification - Brac Migration Knowledge Hub

## 1. Data Invariants
- A content item must have a creatorId matching the auth.uid of the creator.
- A user profile can only be created by the authenticated user with a matching UID.
- Only SUPER_ADMIN users can modify other users' roles.
- Approved content is visible to all authenticated users.
- Pending or Declined content is only visible to the creator and SUPER_ADMIN.
- Comments on a content item can only be left by authenticated users.
- Versions are snapshots and should be immutable once created.

## 2. The Dirty Dozen Payloads (Red Team Test Cases)
1. **Identity Theft**: Creating a content item with a `creatorId` that doesn't match `request.auth.uid`. -> DENIED
2. **Privilege Escalation**: A viewer attempting to update their own `role` to `SUPER_ADMIN`. -> DENIED
3. **Draft Leak**: A user attempting to list `pending` content that they didn't create. -> DENIED
4. **Shadow Field Injection**: Adding an `isAdmin: true` field to a content item during creation. -> DENIED
5. **PII Scraping**: Attempting to list all users' private profiles without being an admin. -> DENIED
6. **State Bypassing**: A user approving their own pending content by setting `status: 'approved'`. -> DENIED
7. **Cross-User Commenting**: Posting a comment with a `userId` that doesn't match `request.auth.uid`. -> DENIED
8. **Wiki Vandalism**: Deleting a wiki entry without being an admin or the creator. -> DENIED
9. **Resource Exhaustion**: Inserting a 2MB string into the `title` field. -> DENIED
10. **ID Poisoning**: Using a 1MB string as a document ID. -> DENIED
11. **Outcome Manipulation**: Changing the `reviewerId` or `reviewComments` of an approved item. -> DENIED
12. **Anonymous Write**: Attempting to create content without being signed in. -> DENIED

## 3. Conflict Report & Evaluation
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|--------------------|-------------------|
| users      | Blocked via uid check | Blocked via role enum check | Blocked via size checks |
| content    | Blocked via creatorId match | Blocked via status change gates | Blocked via title/desc size limits |
| comments   | Blocked via userId match | N/A | Blocked via message size check |
| versions   | Blocked via changedBy match | N/A | Blocked via snapshot validation |
