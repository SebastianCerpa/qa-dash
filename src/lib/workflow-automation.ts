import { prisma } from '../../lib/prisma';
import { sendNotification } from '@/lib/notifications';

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  conditions: any;
  actions: any;
  is_active: boolean;
}

interface BugData {
  id?: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  project_id: string;
  reporter_id: string;
  assignee_id?: string;
  labels: string[];
  is_regression: boolean;
  environment?: string;
  browser?: string;
  os?: string;
}

class WorkflowAutomationService {
  /**
   * Process workflow rules for a given event
   */
  async processWorkflowRules(event: string, data: any) {
    try {
      const rules = await prisma.workflow_rules.findMany({
        where: {
          trigger: event,
          is_active: true
        }
      });

      for (const rule of rules) {
        if (await this.evaluateConditions(rule.conditions, data)) {
          await this.executeActions(rule.actions, data);
        }
      }
    } catch (error) {
      console.error('Error processing workflow rules:', error);
    }
  }

  /**
   * Auto-assign bugs based on labels, severity, and team expertise
   */
  async autoAssignBug(bugData: BugData): Promise<string | null> {
    try {
      // Get project team members (simplified approach)
      // Note: Direct team-project relationship not available in current schema
      // This would need to be implemented based on your specific requirements
      const projectTeam: any[] = [];

      if (projectTeam.length === 0) {
        return null;
      }

      // Priority assignment logic
      let assigneeId: string | null = null;

      // Flatten all users from project teams
      const allUsers = projectTeam.flatMap(team => team.users);

      // 1. Check for label-based assignment
      assigneeId = await this.assignByLabels(bugData.labels, allUsers);
      
      if (!assigneeId) {
        // 2. Check for severity-based assignment
        assigneeId = await this.assignBySeverity(bugData.severity, allUsers);
      }

      if (!assigneeId) {
        // 3. Round-robin assignment based on current workload
        assigneeId = await this.assignByWorkload(allUsers);
      }

      if (assigneeId && bugData.id) {
        // Update bug with assignee
        await prisma.bug_reports.update({
          where: { id: bugData.id },
          data: { assignee_id: assigneeId }
        });

        // Log activity
        await this.logActivity(bugData.id, 'AUTO_ASSIGNED', {
          assignee_id: assigneeId,
          reason: 'Automatic assignment by workflow'
        });

        // Send notification
        await sendNotification({
          user_id: assigneeId,
          type: 'BUG_ASSIGNED',
          title: 'Bug Assigned to You',
          message: `Bug "${bugData.title}" has been automatically assigned to you.`,
          data: { bug_id: bugData.id }
        });
      }

      return assigneeId;
    } catch (error) {
      console.error('Error in auto-assignment:', error);
      return null;
    }
  }

  /**
   * Send critical bug alerts
   */
  async sendCriticalBugAlert(bugData: BugData) {
    try {
      if (!['CRITICAL', 'BLOCKER'].includes(bugData.severity)) {
        return;
      }

      // Get project managers and team leads (simplified approach)
      // Note: Direct team-project relationship and permissions not available in current schema
      // This would need to be implemented based on your specific requirements
      const projectManagers: any[] = [];

      // Send alerts to all project managers
      for (const manager of projectManagers) {
        await sendNotification({
          user_id: manager.id,
          type: 'CRITICAL_BUG_ALERT',
          title: `🚨 Critical Bug Alert: ${bugData.severity}`,
          message: `A ${bugData.severity.toLowerCase()} bug has been reported: "${bugData.title}". Immediate attention required.`,
          data: { 
            bug_id: bugData.id,
            severity: bugData.severity,
            project_id: bugData.project_id
          },
          priority: 'HIGH'
        });
      }

      // Also send email alerts for critical bugs
      await this.sendEmailAlert(projectManagers, bugData);

      // Log the alert
      if (bugData.id) {
        await this.logActivity(bugData.id, 'CRITICAL_ALERT_SENT', {
          recipients: projectManagers.map(m => m.id),
          severity: bugData.severity
        });
      }
    } catch (error) {
      console.error('Error sending critical bug alert:', error);
    }
  }

  /**
   * Check for regression patterns and alert
   */
  async checkRegressionPattern(bugData: BugData) {
    try {
      if (!bugData.is_regression) {
        return;
      }

      // Check for similar regression bugs in the past
      const similarRegressions = await prisma.bug_reports.findMany({
        where: {
          project_id: bugData.project_id,
          is_regression: true,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (similarRegressions.length >= 3) {
        // Pattern detected - send alert
        // Note: Direct team-project relationship not available in current schema
        // This would need to be implemented based on your specific requirements
        const projectTeam: any[] = [];

        for (const user of projectTeam) {
          await sendNotification({
            user_id: user.id,
            type: 'REGRESSION_PATTERN_ALERT',
            title: '⚠️ Regression Pattern Detected',
            message: `Multiple regression bugs detected in the project. This may indicate a quality issue that needs attention.`,
            data: {
              project_id: bugData.project_id,
              regression_count: similarRegressions.length + 1
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking regression pattern:', error);
    }
  }

  /**
   * Assign bug based on labels
   */
  private async assignByLabels(labels: string[], teamMembers: any[]): Promise<string | null> {
    // Define label-to-expertise mapping
    const labelExpertise: Record<string, string[]> = {
      'frontend': ['UI', 'React', 'JavaScript', 'CSS'],
      'backend': ['API', 'Database', 'Server', 'Node.js'],
      'mobile': ['iOS', 'Android', 'React Native'],
      'performance': ['Optimization', 'Performance'],
      'security': ['Security', 'Authentication'],
      'database': ['SQL', 'Database', 'Migration']
    };

    for (const label of labels) {
      const expertise = labelExpertise[label.toLowerCase()];
      if (expertise) {
        // Find team member with matching expertise
        const expert = teamMembers.find(member => 
          expertise.some(skill => 
            member.skills?.includes(skill) || 
            member.bio?.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (expert) {
          return expert.id;
        }
      }
    }

    return null;
  }

  /**
   * Assign bug based on severity
   */
  private async assignBySeverity(severity: string, teamMembers: any[]): Promise<string | null> {
    if (['CRITICAL', 'BLOCKER'].includes(severity)) {
      // Assign to senior team members or leads
      const senior = teamMembers.find(member => 
        member.role?.includes('Senior') || 
        member.role?.includes('Lead') ||
        member.permissions?.some((p: any) => p.permission === 'MANAGE_TEAM')
      );
      return senior?.id || null;
    }

    return null;
  }

  /**
   * Assign bug based on current workload
   */
  private async assignByWorkload(teamMembers: any[]): Promise<string | null> {
    // Get current bug counts for each team member
    const workloadData = await Promise.all(
      teamMembers.map(async (member) => {
        const activeBugs = await prisma.bug_reports.count({
          where: {
            assignee_id: member.id,
            status: {
              notIn: ['RESOLVED', 'CLOSED']
            }
          }
        });
        return { member, activeBugs };
      })
    );

    // Sort by workload (ascending) and return the least busy member
    workloadData.sort((a, b) => a.activeBugs - b.activeBugs);
    return workloadData[0]?.member.id || null;
  }

  /**
   * Evaluate workflow rule conditions
   */
  private async evaluateConditions(conditions: any, data: any): Promise<boolean> {
    if (!conditions || !conditions.rules) {
      return true;
    }

    const { rules, operator = 'AND' } = conditions;
    const results = rules.map((rule: any) => {
      const { field, operator: ruleOp, value } = rule;
      const dataValue = this.getNestedValue(data, field);

      switch (ruleOp) {
        case 'equals':
          return dataValue === value;
        case 'not_equals':
          return dataValue !== value;
        case 'contains':
          return Array.isArray(dataValue) 
            ? dataValue.includes(value)
            : String(dataValue).includes(value);
        case 'greater_than':
          return Number(dataValue) > Number(value);
        case 'less_than':
          return Number(dataValue) < Number(value);
        case 'in':
          return Array.isArray(value) && value.includes(dataValue);
        default:
          return false;
      }
    });

    return operator === 'AND' 
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  /**
   * Execute workflow actions
   */
  private async executeActions(actions: any, data: any) {
    if (!actions || !Array.isArray(actions)) {
      return;
    }

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'assign_user':
            if (data.id) {
              await prisma.bug_reports.update({
                where: { id: data.id },
                data: { assignee_id: action.user_id }
              });
            }
            break;

          case 'add_label':
            if (data.id) {
              const bug = await prisma.bug_reports.findUnique({
                where: { id: data.id }
              });
              if (bug) {
                const existingLabels = bug.labels ? JSON.parse(bug.labels) : [];
                const labels = [...existingLabels, action.label];
                await prisma.bug_reports.update({
                  where: { id: data.id },
                  data: { labels: JSON.stringify(labels) }
                });
              }
            }
            break;

          case 'send_notification':
            await sendNotification({
              user_id: action.user_id,
              type: action.notification_type || 'WORKFLOW_ACTION',
              title: action.title,
              message: action.message,
              data: { bug_id: data.id }
            });
            break;

          case 'change_priority':
            if (data.id) {
              await prisma.bug_reports.update({
                where: { id: data.id },
                data: { priority: action.priority }
              });
            }
            break;
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  /**
   * Log activity
   */
  private async logActivity(bugId: string, action: string, details: any) {
    try {
      await prisma.bug_activities.create({
        data: {
          bug_id: bugId,
          user_id: 'system', // System user for automated actions
          action,
          description: details,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * Send email alert for critical bugs
   */
  private async sendEmailAlert(recipients: any[], bugData: BugData) {
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log it
    console.log('Email alert would be sent to:', recipients.map(r => r.email));
    console.log('Bug details:', {
      title: bugData.title,
      severity: bugData.severity,
      description: bugData.description
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const workflowAutomation = new WorkflowAutomationService();
export default WorkflowAutomationService;