import { AfterViewInit, Component } from '@angular/core';
import { MainPageComponentParentComponent } from '../../page-component-parent.component';
import { RESTAPIService } from '../../services/REST-API.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { CommonDialogService } from '../../services/common-dialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notification-type-template',
  templateUrl: './notification-type-template.component.html'
})
export class NotificationTypeTemplateComponent extends MainPageComponentParentComponent {
  tinyMCEUrl = environment.assetsBaseUrl + 'tinymce';
  disableAllFields = false;
  notificationTypesForDisableFields = {
    'Action Required': true,
    'Unassign - Activity': true,
    'Support Ticket Submittal': true,
    'Assign To': true,
    'Open a ticket': true,
    'Ask the experts': true
  };
  notificationTypeTemplate: any = {};
  emailTemplate: any = {};
  isFormSubmitted = false;
  showLoader = false;
  // notificationTypes = [
  //   'Low Funding',
  //   'Burn Rate',
  //   'Contract Period Ending',
  //   'Recurring',
  //   'Custom'
  // ];
  notificationTypes = [];
  notificationTypesTemplateTypes = [
    'Create new template',
    'Use existing template as design baseline'
  ];
  notificationTypesTemplateCategory = [
    'System',
    'Manual'
  ];
  mode: string;
  title: string;
  isViewOnly = false;
  showEmailTemplate = false;
  emailTemplateTitle: any;

  // tslint:disable-next-line:max-line-length
  constructor(private route: ActivatedRoute, private router: Router, private restAPIService: RESTAPIService, private toastr: ToastrService, public commonService: CommonService, private commonDialogService: CommonDialogService) {
    super();
    this.route.params.subscribe((params) => {
      if (params.id && params.id !== 'create-notification-type-template') {
        restAPIService.getNotificationTypesById(params.id).subscribe(res => {
          if (this.restAPIService.isSuccessResponse(res)) {
            this.notificationTypeTemplate.Category = res.data.Category;
            this.notificationTypeTemplate.Title = res.data.Title;
            this.notificationTypeTemplate.Types = res.data.Types;
            this.notificationTypeTemplate.NotificationDescription = res.data.NotificationDescription;
            this.notificationTypeTemplate.ID = res.data.ID;
            this.notificationTypeTemplate.frequency = res.data.frequency;
            this.notificationTypeTemplate.excludeWeekend = JSON.parse(res.data.excludeWeekend);
            this.notificationTypeTemplate.endDate = res.data.endDate;
            this.notificationTypeTemplate.noOftimes = JSON.parse(res.data.noOftimes);
            this.notificationTypeTemplate.remainingObligatedFunds = res.data.remainingObligatedFunds;
            this.notificationTypeTemplate.ContractPeriodEndingDays = res.data.ContractPeriodEndingDays;

            if (res.data.isActive === 'Yes') {
              this.notificationTypeTemplate.isActive = true;
            }
            else {
              this.notificationTypeTemplate.isActive = false;
            }

            if (this.notificationTypesForDisableFields[this.notificationTypeTemplate.Types]) {
              this.disableAllFields = true;
            }
            if (res.data.endDate === null && res.data.noOftimes === 'null') {
              this.notificationTypeTemplate.noEnd = true;
            }
            else {
              this.notificationTypeTemplate.noEnd = false;
            }
            if (res.data.frequency === 'Weekly') {
              res.data.Days = JSON.parse(res.data.Days);
              res.data.recurrEveryDay = JSON.parse(res.data.recurrEveryDay);
              this.notificationTypeTemplate.Days = res.data.Days;
              this.notificationTypeTemplate.recurrEveryDay = res.data.recurrEveryDay;
            }
            if (res.data.frequency === 'Monthly') {
              res.data.Days = JSON.parse(res.data.Days);
              this.notificationTypeTemplate.Days = res.data.Days;
            }
            if (res.data.frequency === 'Yearly') {
              this.notificationTypeTemplate.startDate = res.data.startDate;
            }

            if (res.data.EmailTemplateID) {
              this.notificationTypeTemplate.EmailTemplateID = res.data.EmailTemplateID;
              this.notificationTypeTemplate.TemplateType = res.data.TemplateType;
              this.restAPIService.getEmailTemplateById(res.data.EmailTemplateID).subscribe((emailTempResp: any) => {
                if (this.restAPIService.isSuccessResponse(emailTempResp)) {
                  this.showEmailTemplate = true;
                  this.emailTemplate = emailTempResp.data;
                }
              });
            }
            else {
              if (this.mode === 'edit') {
                this.notificationTypeTemplate.TemplateType = 'Create new template';
                this.showEmailTemplate = true;
                this.emailTemplateTitle = 'Create new template';
              }
            }

            if (res.data.RecipientsList === null || res.data.RecipientsList === 'null' || !res.data.RecipientsList) {
              this.notificationTypeTemplate.RecipientsList = [];
            }
            else {
              this.notificationTypeTemplate.RecipientsList = JSON.parse(res.data.RecipientsList);
            }

            if (res.data.Roles === null || res.data.Roles === 'null' || !res.data.Roles) {
              this.notificationTypeTemplate.Roles = [];
            }
            else {
              this.notificationTypeTemplate.Roles = JSON.parse(res.data.Roles);
            }
          }
        });
      }
      else {
        this.notificationTypeTemplate.Category = 'System';
        this.notificationTypeTemplate.RecipientsList = [];
        this.notificationTypeTemplate.Roles = [];
      }
    });

    this.route.queryParams.subscribe(params => {
      this.mode = params.mode;
      if (params.mode === 'edit') {
        this.title = 'Update';
        this.emailTemplateTitle = 'Edit existing template';
      }
      else if (params.mode === 'create') {
        this.title = 'Create';
      }
      else {
        this.title = 'View';
        this.isViewOnly = true;
        this.emailTemplateTitle = 'Viewing existing template';
      }
    });
  }

  templateType(event) {
    if (event === 'Create new template') {
      this.showEmailTemplate = true;
      this.emailTemplateTitle = 'Create new template';
      this.emailTemplate = {};
      this.showLoader = true;
      setTimeout(() => {
        this.showLoader = false;
      }, 2000);
    }
    else {
      this.restAPIService.getEmailTemplates().subscribe((getEmailTemplateResp: any) => {
        if (this.restAPIService.isSuccessResponse(getEmailTemplateResp)) {
          if (getEmailTemplateResp.data.length) {
            this.commonDialogService.openNotificationTypesModal(getEmailTemplateResp.data).subscribe((result: any) => {
              console.log('result', result);
              if (result) {
                this.showEmailTemplate = true;
                this.emailTemplateTitle = 'Edit existing template';
                //Ensure that the template header values are empty so that the user must enter new ones in order to save
                //otherwise, the user can overwrite the existing template
                result.Subject = '';
                result.Title = '';
                result.PreHeader = '';
                result.Description = '';
                //load result values into the email template
                this.emailTemplate = result;
              }
              else {
                this.showEmailTemplate = false;
                this.notificationTypeTemplate.TemplateType = '';
              }
            });
          }
          else {
            this.toastr.warning('No Email Templates found in DB');
          }
        }
        else {
          this.toastr.error('Get Email Templates Error');
        }
      });
    }
  }

  cancel(form: NgForm) {
    if (!form.form.pristine) {
      if (confirm('Are you sure you wish to exit this page without saving your data? All data will be lost.')) {
        this.router.navigate(['user-settings']);
      }
    } else {
      this.router.navigate(['user-settings']);
    }
  }

  saveNotificationTypeTemplate(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toastr.error(this.commonService.validationErrorMessage);
      return;
    }

    if (this.notificationTypeTemplate.RecipientsList.length === 0 && this.notificationTypeTemplate.Roles.length === 0) {
      this.isFormSubmitted = true;
      this.toastr.error('You must add Recipients before creating Notification Type');
      return;
    }

    if (this.notificationTypeTemplate.Types === 'Recurring' && !this.notificationTypeTemplate.frequency) {
      this.isFormSubmitted = true;
      this.toastr.error('Recurring notification type cannot be saved without configuring the recurrence frequency and duration');
      return;
    }

    if (this.notificationTypeTemplate.TemplateType === 'Create new template' && this.mode === 'create') {
      const emailTemplate = {
        __metadata: { type: 'SP.Data.EmailTemplatesListItem' },
        Title: this.emailTemplate.Title,
        NotificationType: this.notificationTypeTemplate.Types,
        Subject: this.emailTemplate.Subject,
        PreHeader: this.emailTemplate.PreHeader,
        Description: this.emailTemplate.Description,
        Message: this.emailTemplate.Message
      };

      this.restAPIService.saveEmailTemplate(emailTemplate).subscribe((emailTemplateResponse: any) => {
        if (this.restAPIService.isSuccessResponse(emailTemplateResponse)) {
          const notificationTypeTemplate: any = {
            __metadata: { type: 'SP.Data.NotificationTypesListItem' },
            Category: this.notificationTypeTemplate.Category,
            Title: this.notificationTypeTemplate.Title,
            Types: this.notificationTypeTemplate.Types,
            TemplateType: this.notificationTypeTemplate.TemplateType,
            NotificationDescription: this.notificationTypeTemplate.NotificationDescription,
            EmailTemplateID: JSON.stringify(emailTemplateResponse.data.ID),
            frequency: this.notificationTypeTemplate.frequency,
            excludeWeekend: JSON.stringify(this.notificationTypeTemplate.excludeWeekend),
            endDate: this.notificationTypeTemplate.endDate ? this.notificationTypeTemplate.endDate : '',
            noOftimes: JSON.stringify(this.notificationTypeTemplate.noOftimes),
            isActive: this.notificationTypeTemplate.isActive === true ? 'Yes' : 'No'
          };
          if (this.notificationTypeTemplate.frequency === 'Weekly') {
            notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
            notificationTypeTemplate.recurrEveryDay = JSON.stringify(this.notificationTypeTemplate.recurrEveryDay);
          }
          if (this.notificationTypeTemplate.frequency === 'Monthly') {
            notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
          }
          if (this.notificationTypeTemplate.frequency === 'Yearly') {
            notificationTypeTemplate.startDate = this.notificationTypeTemplate.startDate;
          }

          const emails = [];
          for (const recipient of this.notificationTypeTemplate.RecipientsList) {
            emails.push(recipient.Email);
          }
          notificationTypeTemplate.RecipientsEmail = emails.join(',');
          notificationTypeTemplate.RecipientsList = JSON.stringify(this.notificationTypeTemplate.RecipientsList);
          notificationTypeTemplate.Roles = JSON.stringify(this.notificationTypeTemplate.Roles);
          this.restAPIService.saveNotificationType(notificationTypeTemplate).subscribe((notificationTypeTemplateResponse: any) => {
            if (this.restAPIService.isSuccessResponse(notificationTypeTemplateResponse)) {
              this.toastr.success('Notification Type saved successfully', '', { timeOut: 5000 });
              this.router.navigate(['user-settings']);
            }
          });
        }
        else {
          this.toastr.error('Email Template Not saved');
        }
      });
    }
    else {
      if (this.notificationTypeTemplate.TemplateType === 'Use existing template as design baseline' && this.mode === 'create') {
        const emailTemplate = {
          __metadata: { type: 'SP.Data.EmailTemplatesListItem' },
          Title: this.emailTemplate.Title,
          NotificationType: this.notificationTypeTemplate.Types,
          Subject: this.emailTemplate.Subject,
          PreHeader: this.emailTemplate.PreHeader,
          Description: this.emailTemplate.Description,
          Message: this.emailTemplate.Message
        };

        // this.restAPIService.updateEmailTemplate(emailTemplate, this.emailTemplate.ID).subscribe((emailTemplateUpdateResponse: any) => {
        //   if (this.restAPIService.isSuccessResponse(emailTemplateUpdateResponse)) {
        //     const notificationTypeTemplate: any = {
        //       __metadata: { type: 'SP.Data.NotificationTypesListItem' },
        //       Category: this.notificationTypeTemplate.Category,
        //       Title: this.notificationTypeTemplate.Title,
        //       Types: this.notificationTypeTemplate.Types,
        //       TemplateType: this.notificationTypeTemplate.TemplateType,
        //       NotificationDescription: this.notificationTypeTemplate.NotificationDescription,
        //       EmailTemplateID: JSON.stringify(this.emailTemplate.ID),
        //       frequency: this.notificationTypeTemplate.frequency,
        //       excludeWeekend: JSON.stringify(this.notificationTypeTemplate.excludeWeekend),
        //       endDate: this.notificationTypeTemplate.endDate ? this.notificationTypeTemplate.endDate : '',
        //       noOftimes: JSON.stringify(this.notificationTypeTemplate.noOftimes),
        //       isActive: this.notificationTypeTemplate.isActive === true ? 'Yes' : 'No'
        //     };
        //     if (this.notificationTypeTemplate.frequency === 'Weekly') {
        //       notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
        //       notificationTypeTemplate.recurrEveryDay = JSON.stringify(this.notificationTypeTemplate.recurrEveryDay);
        //     }
        //     if (this.notificationTypeTemplate.frequency === 'Monthly') {
        //       notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
        //     }
        //     if (this.notificationTypeTemplate.frequency === 'Yearly') {
        //       notificationTypeTemplate.startDate = this.notificationTypeTemplate.startDate;
        //     }
        //     const emails = [];
        //     for (const recipient of this.notificationTypeTemplate.RecipientsList) {
        //       emails.push(recipient.Email);
        //     }
        //     notificationTypeTemplate.RecipientsEmail = emails.join(',');
        //     notificationTypeTemplate.RecipientsList = JSON.stringify(this.notificationTypeTemplate.RecipientsList);
        //     notificationTypeTemplate.Roles = JSON.stringify(this.notificationTypeTemplate.Roles);
        //     this.restAPIService.saveNotificationType(notificationTypeTemplate).subscribe((notificationTypeTemplateResponse: any) => {
        //       if (this.restAPIService.isSuccessResponse(notificationTypeTemplateResponse)) {
        //         this.toastr.success('Notification Type saved successfully', '', { timeOut: 5000 });
        //         this.router.navigate(['user-settings']);
        //       }
        //     });
        //   }
        // });

        this.restAPIService.saveEmailTemplate(emailTemplate).subscribe((emailTemplateResponse: any) => {
          if (this.restAPIService.isSuccessResponse(emailTemplateResponse)) {
            const notificationTypeTemplate: any = {
              __metadata: { type: 'SP.Data.NotificationTypesListItem' },
              Category: this.notificationTypeTemplate.Category,
              Title: this.notificationTypeTemplate.Title,
              Types: this.notificationTypeTemplate.Types,
              TemplateType: this.notificationTypeTemplate.TemplateType,
              NotificationDescription: this.notificationTypeTemplate.NotificationDescription,
              EmailTemplateID: JSON.stringify(emailTemplateResponse.data.ID),
              frequency: this.notificationTypeTemplate.frequency,
              excludeWeekend: JSON.stringify(this.notificationTypeTemplate.excludeWeekend),
              endDate: this.notificationTypeTemplate.endDate ? this.notificationTypeTemplate.endDate : '',
              noOftimes: JSON.stringify(this.notificationTypeTemplate.noOftimes),
              isActive: this.notificationTypeTemplate.isActive === true ? 'Yes' : 'No'
            };
            if (this.notificationTypeTemplate.frequency === 'Weekly') {
              notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
              notificationTypeTemplate.recurrEveryDay = JSON.stringify(this.notificationTypeTemplate.recurrEveryDay);
            }
            if (this.notificationTypeTemplate.frequency === 'Monthly') {
              notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
            }
            if (this.notificationTypeTemplate.frequency === 'Yearly') {
              notificationTypeTemplate.startDate = this.notificationTypeTemplate.startDate;
            }
            const emails = [];
            for (const recipient of this.notificationTypeTemplate.RecipientsList) {
              emails.push(recipient.Email);
            }
            notificationTypeTemplate.RecipientsEmail = emails.join(',');
            notificationTypeTemplate.RecipientsList = JSON.stringify(this.notificationTypeTemplate.RecipientsList);
            notificationTypeTemplate.Roles = JSON.stringify(this.notificationTypeTemplate.Roles);
            this.restAPIService.saveNotificationType(notificationTypeTemplate).subscribe((notificationTypeTemplateResponse: any) => {
              if (this.restAPIService.isSuccessResponse(notificationTypeTemplateResponse)) {
                this.toastr.success('Notification Type saved successfully', '', { timeOut: 5000 });
                this.router.navigate(['user-settings']);
              }
            });
          }
        });
      }
      else {
        if (this.notificationTypeTemplate.Types === 'Custom' || this.notificationTypeTemplate.Types === 'Recurring') {
          const emailTemplate = {
            __metadata: { type: 'SP.Data.EmailTemplatesListItem' },
            Title: this.emailTemplate.Title,
            NotificationType: this.notificationTypeTemplate.Types,
            Subject: this.emailTemplate.Subject,
            PreHeader: this.emailTemplate.PreHeader,
            Description: this.emailTemplate.Description,
            Message: this.emailTemplate.Message
          };

          this.restAPIService.saveEmailTemplate(emailTemplate).subscribe((emailTemplateResponse: any) => {
            if (this.restAPIService.isSuccessResponse(emailTemplateResponse)) {
              const notificationTypeTemplate: any = {
                __metadata: { type: 'SP.Data.NotificationTypesListItem' },
                Category: this.notificationTypeTemplate.Category,
                Title: this.notificationTypeTemplate.Title,
                Types: this.notificationTypeTemplate.Types,
                TemplateType: this.notificationTypeTemplate.TemplateType,
                NotificationDescription: this.notificationTypeTemplate.NotificationDescription,
                EmailTemplateID: JSON.stringify(emailTemplateResponse.data.ID),
                frequency: this.notificationTypeTemplate.frequency,
                excludeWeekend: JSON.stringify(this.notificationTypeTemplate.excludeWeekend),
                endDate: this.notificationTypeTemplate.endDate ? this.notificationTypeTemplate.endDate : '',
                noOftimes: JSON.stringify(this.notificationTypeTemplate.noOftimes),
                isActive: this.notificationTypeTemplate.isActive === true ? 'Yes' : 'No'
              };
              if (this.notificationTypeTemplate.frequency === 'Weekly') {
                notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
                notificationTypeTemplate.recurrEveryDay = JSON.stringify(this.notificationTypeTemplate.recurrEveryDay);
              }
              if (this.notificationTypeTemplate.frequency === 'Monthly') {
                notificationTypeTemplate.Days = JSON.stringify(this.notificationTypeTemplate.Days);
              }
              if (this.notificationTypeTemplate.frequency === 'Yearly') {
                notificationTypeTemplate.startDate = this.notificationTypeTemplate.startDate;
              }
              const emails = [];
              for (const recipient of this.notificationTypeTemplate.RecipientsList) {
                emails.push(recipient.Email);
              }
              notificationTypeTemplate.RecipientsEmail = emails.join(',');
              notificationTypeTemplate.RecipientsList = JSON.stringify(this.notificationTypeTemplate.RecipientsList);
              notificationTypeTemplate.Roles = JSON.stringify(this.notificationTypeTemplate.Roles);
              // tslint:disable-next-line:max-line-length
              this.restAPIService.updateNotificationType(notificationTypeTemplate, this.notificationTypeTemplate.ID).subscribe((notificationTypeTemplateResponse: any) => {
                if (this.restAPIService.isSuccessResponse(notificationTypeTemplateResponse)) {
                  this.toastr.success('Notification Type UPDATED successfully', '', { timeOut: 5000 });
                  this.router.navigate(['user-settings']);
                }
              });
            }
          });
        }
        else {
          const notificationTypeTemplate: any = {
            __metadata: { type: 'SP.Data.NotificationTypesListItem' },
            isActive: this.notificationTypeTemplate.isActive === true ? 'Yes' : 'No'
          };
          const emails = [];
          for (const recipient of this.notificationTypeTemplate.RecipientsList) {
            emails.push(recipient.Email);
          }
          notificationTypeTemplate.RecipientsEmail = emails.join(',');
          notificationTypeTemplate.RecipientsList = JSON.stringify(this.notificationTypeTemplate.RecipientsList);
          notificationTypeTemplate.Roles = JSON.stringify(this.notificationTypeTemplate.Roles);
          // tslint:disable-next-line:max-line-length
          if (this.notificationTypeTemplate.remainingObligatedFunds !== null && this.notificationTypeTemplate.remainingObligatedFunds !== '') {
            notificationTypeTemplate.remainingObligatedFunds = String(this.notificationTypeTemplate.remainingObligatedFunds);
          }
          if (this.notificationTypeTemplate.ContractPeriodEndingDays !== null && this.notificationTypeTemplate.ContractPeriodEndingDays !== '') {
            notificationTypeTemplate.ContractPeriodEndingDays = String(this.notificationTypeTemplate.ContractPeriodEndingDays);
          }

          // tslint:disable-next-line:max-line-length
          this.restAPIService.updateNotificationType(notificationTypeTemplate, this.notificationTypeTemplate.ID).subscribe((notificationTypeTemplateResponse: any) => {
            if (this.restAPIService.isSuccessResponse(notificationTypeTemplateResponse)) {
              this.toastr.success('Notification Type Updated successfully', '', { timeOut: 5000 });
              this.router.navigate(['user-settings']);
            }
          });
        }
      }
    }
  }

  configureNotificationRecurrence() {
    this.commonDialogService.openNotificationTypesRecurrenceModal(this.notificationTypeTemplate).subscribe((result: any) => {
      if (result) {
        this.notificationTypeTemplate.frequency = result.frequency;
        if (!result.noEnd) {
          this.notificationTypeTemplate.noEnd = false;
          if (result.endDate) {
            this.notificationTypeTemplate.endDate = result.endDate;
          }
          this.notificationTypeTemplate.noOftimes = result.noOftimes;
        }
        else {
          this.notificationTypeTemplate.noEnd = result.noEnd;
        }
        if (result.frequency === 'Daily') {
          if (!result.excludeWeekend) {
            this.notificationTypeTemplate.excludeWeekend = false;
          }
          else {
            this.notificationTypeTemplate.excludeWeekend = result.excludeWeekend;
          }
        }
        if (result.frequency === 'Weekly') {
          this.notificationTypeTemplate.Days = result.Days;
          this.notificationTypeTemplate.recurrEveryDay = result.recurrEveryDay;
        }
        if (result.frequency === 'Monthly') {
          this.notificationTypeTemplate.Days = result.Days;
        }
        if (result.frequency === 'Yearly') {
          this.notificationTypeTemplate.startDate = result.startDate;
        }
      }
    });
  }

  configureAddRecipient() {
    // tslint:disable-next-line:max-line-length
    this.commonDialogService.openNotificationTypesAddRecipientModal({ RecipientsList: this.notificationTypeTemplate.RecipientsList, Roles: this.notificationTypeTemplate.Roles }).subscribe((result: any) => {
      if (result) {
        this.notificationTypeTemplate.RecipientsList = result.RecipientsList;
        this.notificationTypeTemplate.Roles = result.Roles;
      }
    });
  }

}
