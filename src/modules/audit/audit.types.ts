export interface CreateAuthAuditLogInput {
  eventType: string;
  userId?: string | null;
  emailAttempted?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  method?: string | null;
  path?: string | null;
  success: boolean;
  failureReason?: string | null;
  enrichmentStatus?: string;
}
