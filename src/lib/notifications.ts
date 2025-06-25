import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean>;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  expires_at?: Date;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class NotificationService {
  /**
   * Send a notification to a user
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Create notification in database
      await prisma.notifications.create({
        data: {
          user_id: notificationData.user_id,
          message: `${notificationData.title}: ${notificationData.message}`,
          is_read: false,
        },
      });

      // Send real-time notification if user is online
      await this.sendRealTimeNotification(notificationData);

      // Send email for high priority notifications
      if (["HIGH", "URGENT"].includes(notificationData.priority || "MEDIUM")) {
        await this.sendEmailNotification(notificationData);
      }

      // Send push notification for mobile users
      await this.sendPushNotification(notificationData);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    notifications: NotificationData[]
  ): Promise<void> {
    try {
      // Create all notifications in database
      await prisma.notifications.createMany({
        data: notifications.map((notification) => ({
          user_id: notification.user_id,
          message: `${notification.title}: ${notification.message}`,
          is_read: false,
        })),
      });

      // Send real-time and email notifications
      for (const notification of notifications) {
        await this.sendRealTimeNotification(notification);

        if (["HIGH", "URGENT"].includes(notification.priority || "MEDIUM")) {
          await this.sendEmailNotification(notification);
        }
      }
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false, type } = options;

      const where: Prisma.notificationsWhereInput = {
        user_id: userId,
      };

      if (unreadOnly) {
        where.is_read = false;
      }

      if (type) {
        where.type = {
          contains: type,
        };
      }

      const notifications = await prisma.notifications.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.notifications.count({ where });
      const unreadCount = await prisma.notifications.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });

      return {
        notifications,
        total,
        unreadCount,
        hasMore: offset + notifications.length < total,
      };
    } catch (error) {
      console.error("Error getting user notifications:", error);
      return {
        notifications: [],
        total: 0,
        unreadCount: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notifications.updateMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
        data: {
          is_read: true,
        },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notifications.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      await prisma.notifications.deleteMany({
        where: {
          id: notificationId,
          user_id: userId,
        },
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }

  /**
   * Clean up expired notifications
   * Note: expires_at field not available in current schema
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      // TODO: Implement cleanup logic when expires_at field is added to schema
      console.log(
        "Cleanup method called - expires_at field not available in current schema"
      );
    } catch (error) {
      console.error("Error cleaning up expired notifications:", error);
    }
  }

  /**
   * Send real-time notification (WebSocket/SSE)
   */
  private async sendRealTimeNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // This would integrate with your WebSocket/SSE implementation
      console.log("Real-time notification would be sent:", {
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
      });

      // Example WebSocket implementation:
      // const userSocket = this.getActiveUserSocket(notification.user_id);
      // if (userSocket) {
      //   userSocket.emit('notification', {
      //     type: notification.type,
      //     title: notification.title,
      //     message: notification.message,
      //     data: notification.data,
      //     priority: notification.priority
      //   });
      // }
    } catch (error) {
      console.error("Error sending real-time notification:", error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get user email
      const user = await prisma.users.findUnique({
        where: { id: notification.user_id },
        select: { email: true, name: true },
      });

      if (!user || !user.email) {
        return;
      }

      // Note: User notification preferences would need to be implemented
      // if email preferences are required in the future

      // Generate email template
      const emailTemplate = this.generateEmailTemplate(notification, user.name);

      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      console.log("Email would be sent to:", user.email);
      console.log("Email template:", emailTemplate);

      // Example email service integration:
      // await this.emailService.send({
      //   to: user.email,
      //   subject: emailTemplate.subject,
      //   html: emailTemplate.html,
      //   text: emailTemplate.text
      // });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // Get user's push notification tokens
      const user = await prisma.users.findUnique({
        where: { id: notification.user_id },
        select: { id: true },
      });

      if (!user) {
        return;
      }

      // Note: Push notification tokens and preferences would need to be implemented
      // if push notifications are required in the future

      // This would integrate with your push notification service (FCM, APNs, etc.)
      console.log("Push notification would be sent (tokens not implemented)");
      console.log("Push notification data:", {
        title: notification.title,
        body: notification.message,
        data: notification.data,
      });

      // Example FCM integration:
      // await this.fcmService.sendToTokens(pushTokens, {
      //   notification: {
      //     title: notification.title,
      //     body: notification.message
      //   },
      //   data: notification.data
      // });
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  /**
   * Generate email template
   */
  private generateEmailTemplate(
    notification: NotificationData,
    userName: string
  ): EmailTemplate {
    const baseTemplate = {
      subject: `QA Dashboard: ${notification.title}`,
      text: `Hi ${userName},\n\n${notification.message}\n\nBest regards,\nQA Dashboard Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">QA Dashboard Notification</h2>
            <div style="background-color: white; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #333; margin-top: 0;">${notification.title}</h3>
              <p style="color: #666; line-height: 1.6;">${notification.message}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                This notification was sent from QA Dashboard. 
                <a href="#" style="color: #3b82f6;">Manage your notification preferences</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Customize template based on notification type
    switch (notification.type) {
      case "CRITICAL_BUG_ALERT":
        return {
          ...baseTemplate,
          subject: `🚨 Critical Bug Alert: ${notification.title}`,
          html: baseTemplate.html.replace(
            "border-left: 4px solid #3b82f6",
            "border-left: 4px solid #ef4444"
          ),
        };

      case "BUG_ASSIGNED":
        return {
          ...baseTemplate,
          subject: `📋 Bug Assigned: ${notification.title}`,
          html: baseTemplate.html.replace(
            "border-left: 4px solid #3b82f6",
            "border-left: 4px solid #10b981"
          ),
        };

      case "TEST_FAILURE_ALERT":
        return {
          ...baseTemplate,
          subject: `❌ Test Failure Alert: ${notification.title}`,
          html: baseTemplate.html.replace(
            "border-left: 4px solid #3b82f6",
            "border-left: 4px solid #f59e0b"
          ),
        };

      default:
        return baseTemplate;
    }
  }

  /**
   * Create notification templates for common scenarios
   */
  static createBugAssignedNotification(
    bugId: string,
    bugTitle: string,
    assigneeId: string
  ): NotificationData {
    return {
      user_id: assigneeId,
      type: "BUG_ASSIGNED",
      title: "Bug Assigned to You",
      message: `You have been assigned to bug: "${bugTitle}". Please review and take appropriate action.`,
      data: { bug_id: bugId },
      priority: "MEDIUM",
    };
  }

  static createCriticalBugNotification(
    bugId: string,
    bugTitle: string,
    severity: string,
    userId: string
  ): NotificationData {
    return {
      user_id: userId,
      type: "CRITICAL_BUG_ALERT",
      title: `Critical Bug Alert: ${severity}`,
      message: `A ${severity.toLowerCase()} bug has been reported: "${bugTitle}". Immediate attention required.`,
      data: { bug_id: bugId, severity },
      priority: "URGENT",
    };
  }

  static createTestFailureNotification(
    testName: string,
    projectId: string,
    userId: string
  ): NotificationData {
    return {
      user_id: userId,
      type: "TEST_FAILURE_ALERT",
      title: "Test Failure Detected",
      message: `Test "${testName}" has failed. Please investigate and fix the issue.`,
      data: { test_name: testName, project_id: projectId },
      priority: "HIGH",
    };
  }

  static createFlakyTestNotification(
    testName: string,
    flakyScore: number,
    userId: string
  ): NotificationData {
    return {
      user_id: userId,
      type: "FLAKY_TEST_ALERT",
      title: "Flaky Test Detected",
      message: `Test "${testName}" has been identified as flaky (${Math.round(
        flakyScore * 100
      )}% flaky score). Consider investigating and stabilizing this test.`,
      data: { test_name: testName, flaky_score: flakyScore },
      priority: "MEDIUM",
    };
  }

  static createRegressionPatternNotification(
    projectId: string,
    regressionCount: number,
    userId: string
  ): NotificationData {
    return {
      user_id: userId,
      type: "REGRESSION_PATTERN_ALERT",
      title: "Regression Pattern Detected",
      message: `Multiple regression bugs (${regressionCount}) detected in the project. This may indicate a quality issue that needs attention.`,
      data: { project_id: projectId, regression_count: regressionCount },
      priority: "HIGH",
    };
  }
}

export const notificationService = new NotificationService();
export const sendNotification = (data: NotificationData) =>
  notificationService.sendNotification(data);
export default NotificationService;
