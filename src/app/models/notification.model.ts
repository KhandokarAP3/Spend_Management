import { faThemeisle } from '@fortawesome/free-brands-svg-icons';
import * as moment from 'moment';

export class NotificationConfiguration {
  public ID = '';
  public Types = '';
  public SubjectLine = '';
  public Description = '';
  public Priority = '';
  public ContractNo = '';
  // tslint:disable-next-line:variable-name
  public Days_months = '';
  public number = '';
  // tslint:disable-next-line:variable-name
  public trigger_type = '';
  public Target = '';
  // tslint:disable-next-line:variable-name
  public Due_Date = '';
  public ReceiptDate = '';
  public Subject = '';
  public Message = '';
  public NotificationTypeID = '';
  public Title = '';
  public ParentType = '';
  public ActivityTitle = '';
  public ParentId = '';
  public NotificationIdentifier;
  public IsNotificationSent = '';
  public IsScheduled = '';
  public dueDateForShow = '';
  public afterReceiptDateForShow = '';
  public isCurrentNotification = 'No';
  public index = '';
  public Created: moment.Moment;
  public Modified: moment.Moment;

  constructor(jsonObj?: any) {
    if (jsonObj) {
      this.ID = jsonObj.ID || '';
      this.Types = jsonObj.Types || '';
      this.SubjectLine = jsonObj.SubjectLine || '';
      this.Description = jsonObj.Description || '';
      this.Priority = jsonObj.Priority || '';
      this.ContractNo = jsonObj.ContractNo || '';
      this.Days_months = jsonObj.Days_months || '';
      this.number = jsonObj.number || '';
      this.trigger_type = jsonObj.trigger_type || '';
      this.Target = jsonObj.Target || '';
      this.Due_Date = jsonObj.Due_Date || '';
      this.ReceiptDate = jsonObj.ReceiptDate || '';
      this.Subject = jsonObj.Subject || '';
      this.Message = jsonObj.Message || '';
      this.ActivityTitle = jsonObj.ActivityTitle || '';
      this.NotificationTypeID = jsonObj.NotificationTypeID || '';
      this.Title = jsonObj.Title || '';
      this.IsNotificationSent = jsonObj.IsNotificationSent || 'No';
      this.IsScheduled = jsonObj.IsScheduled || 'Yes';
      this.isCurrentNotification = jsonObj.isCurrentNotification || 'No';
      if (jsonObj.NotificationIdentifier) {
        this.NotificationIdentifier = jsonObj.NotificationIdentifier;
      }
      this.ParentId = jsonObj.ParentId || '';
      this.ParentType = jsonObj.ParentType || '';
      if (jsonObj.Created) {
        this.Created = moment(jsonObj.Created);
        this.Modified = moment(jsonObj.Modified);
      }
    }
  }

  getObjectForSave(JSONProjectData?) {
    const object: any = {
      __metadata: { type: 'SP.Data.NotificationConfigurationListItem' },
      ContractNo: this.ContractNo,
      Types: this.Types,
      SubjectLine: this.SubjectLine,
      Description: this.Description,
      Priority: this.Priority,
      Days_months: this.Days_months,
      number: String(this.number),
      trigger_type: this.trigger_type,
      Target: this.Target,
      Due_Date: this.Due_Date,
      ReceiptDate: this.ReceiptDate,
      Subject: this.Subject,
      Message: this.Message,
      NotificationTypeID: this.NotificationTypeID,
      Title: this.Title,
      IsNotificationSent: this.IsNotificationSent,
      NotificationIdentifier: this.NotificationIdentifier,
      ParentType: this.ParentType,
      ActivityTitle: this.ActivityTitle,
      ParentId: this.ParentId,
      isCurrentNotification: this.isCurrentNotification
    };
    return object;
  }
}
