export type UserRole = 'SUPER_ADMIN' | 'CONTRIBUTOR' | 'VIEWER';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: string;
}

export type ContentType = 'pdf' | 'doc' | 'image' | 'video' | 'url' | 'post' | 'wiki' | 'course';
export type ContentStatus = 'pending' | 'approved' | 'declined';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  fileUrl?: string; // Specific URL for the file/resource
  content?: string;
  status: ContentStatus;
  creatorId: string;
  creatorName: string;
  reviewerId?: string;
  reviewComments?: string;
  version: number;
  tags: string[];
  isObsolete?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  data: Partial<ContentItem>;
  versionNumber: number;
  changedBy: string;
  changeSummary: string;
  createdAt: string;
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
