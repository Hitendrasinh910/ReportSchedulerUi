import { ReportScheduleParameter } from "./report-schedule-parameter.model";
import { ReportScheduleRecipient } from "./report-schedule-recipient.model";

export class ReportSchedule {
    idSchedule?: number;

  scheduleName!: string;
  description?: string;

  outputType!: 'Message' | 'Report';

  storedProcedureName!: string;

  messageSubject?: string;
  messageHeader?: string;
  messageTemplate?: string;

  pdfTitle?: string;
  pdfFileName?: string;

  dateRangeType!: 'Today' | 'Yesterday' | '7Days';
  customDays?: number;

  receiverSource!: 'User' | 'PartyAccount' | 'Custom' | 'FromSP' | 'Mixed';

  userSelectionMode?: string;
  adminType?: string;
  userType?: string;

  partySelectionMode?: string;
  partyType?: string;
  branchType?: string;
  dealerType?: string;

  customContactNos?: string;

  mobileColumnName?: string;
  spMobileMode?: string;

  frequency!: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

  runTime?: string;
  weekDays?: string;
  monthDay?: number;

  cronMode!: 'Auto' | 'Manual';
  cronExpression!: string;

  isActive?: boolean;

  totalCount?: number;

  parameters!: ReportScheduleParameter[];
  recipients!: ReportScheduleRecipient[];
}
