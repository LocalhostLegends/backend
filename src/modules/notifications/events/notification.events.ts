import { NotificationType } from '@common/enums/notification-type.enum';

export class BaseNotificationEvent {
  constructor(
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class LeaveRequestedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { leaveRequestId: string; employeeName: string }) {
    super(
      userId,
      NotificationType.LEAVE_REQUEST_CREATED,
      'New Leave Request',
      `${metadata.employeeName} has requested leave.`,
      metadata,
    );
  }
}

export class LeaveApprovedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { leaveRequestId: string }) {
    super(
      userId,
      NotificationType.LEAVE_REQUEST_APPROVED,
      'Leave Approved',
      'Your leave request has been approved.',
      metadata,
    );
  }
}

export class LeaveRejectedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { leaveRequestId: string; reason?: string }) {
    super(
      userId,
      NotificationType.LEAVE_REQUEST_REJECTED,
      'Leave Rejected',
      `Your leave request has been rejected.${metadata.reason ? ' Reason: ' + metadata.reason : ''}`,
      metadata,
    );
  }
}

export class TaskAssignedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { taskId: string; taskTitle: string }) {
    super(
      userId,
      NotificationType.TASK_ASSIGNED,
      'New Task Assigned',
      `You have been assigned a new task: ${metadata.taskTitle}`,
      metadata,
    );
  }
}

export class CandidateStageChangedEvent extends BaseNotificationEvent {
  constructor(
    userId: string,
    metadata: { candidateId: string; candidateName: string; oldStage: string; newStage: string },
  ) {
    super(
      userId,
      NotificationType.CANDIDATE_STAGE_CHANGED,
      'Candidate Stage Updated',
      `Candidate ${metadata.candidateName} moved from ${metadata.oldStage} to ${metadata.newStage}`,
      metadata,
    );
  }
}

export class CandidateAssignedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { candidateId: string; candidateName: string }) {
    super(
      userId,
      NotificationType.CANDIDATE_ASSIGNED,
      'New Candidate Assigned',
      `You have been assigned to candidate: ${metadata.candidateName}`,
      metadata,
    );
  }
}

export class CalendarEventInvitedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { eventId: string; eventTitle: string; startTime: Date }) {
    super(
      userId,
      NotificationType.CALENDAR_INVITATION,
      'New Event Invitation',
      `You are invited to: ${metadata.eventTitle} on ${metadata.startTime.toLocaleString()}`,
      metadata,
    );
  }
}

export class TaskCommentAddedEvent extends BaseNotificationEvent {
  constructor(userId: string, metadata: { taskId: string; taskTitle: string; authorName: string }) {
    super(
      userId,
      NotificationType.TASK_COMMENT_ADDED,
      'New Comment on Task',
      `${metadata.authorName} left a comment on "${metadata.taskTitle}"`,
      metadata,
    );
  }
}
