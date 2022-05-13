import {AfterViewInit, Component, ChangeDetectorRef} from '@angular/core';
import {MainPageComponentParentComponent} from '../../page-component-parent.component';
import {RESTAPIService} from '../../services/REST-API.service';
import { NgForm} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../services/common.service';
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from '../../../environments/environment';
import {forkJoin, merge, Observable} from 'rxjs';
declare var $;

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html'
})
export class EmailTemplateComponent extends MainPageComponentParentComponent implements AfterViewInit{
  tinyMCEUrl = environment.assetsBaseUrl + 'tinymce';
  emailTemplate: any =  {};
  defaultRecipient = false;
  emailRE = /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/g;
  isFormSubmitted = false;
  showLoader = true;
  // TODO - Do a data call to the appropriate SharePoint list to load these
  notificationTypes = [];
  // notificationTypes = [
  //   'Action Required',
  //   'Contract Period Ending',
  //   'Invoice Processing Due',
  //   'Open a ticket',
  //   'Ask the experts',
  //   'Low Funding Notification',
  //   'Burn Rate Notification',
  //   'Custom'
  // ];
  mode: string;
  title: string;
  isViewOnly = false;

  constructor(private cdr: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private restAPIService: RESTAPIService, private toastr: ToastrService, public commonService: CommonService) {
    super();
    this.route.params.subscribe((params) => {
      if (params.id && params.id !== 'create-email-template') {
        restAPIService.getEmailTemplateById(params.id).subscribe(res => {
          if (this.restAPIService.isSuccessResponse(res) && res.data) {
            this.emailTemplate = res.data;
            this.defaultRecipient = !this.emailTemplate.Recipient;
          }else{
            console.log('Could not find an email template with that ID in the SP list.');
          }
        });
      }

      /*** Decided not to allow folks to create their own emails outside of creating a notification type.
       *   Since we are not using the create email page any longer there is no need to populate the current list of notification types from the SP backend */

      // restAPIService.getNotificationTypes().subscribe(res => {
      //   if (this.restAPIService.isSuccessResponse(res) && res.data) {
      //     for(var counter:number = 1; counter< res.data.length; counter++){
      //       this.notificationTypes[counter] = res[counter].data.title;
      //     }
      //   } else {
      //     console.log('The getNotificationTypes call errored out and was not able to return any data.');
      //   }
      // });
    });

    this.route.queryParams.subscribe(params => {
      this.mode = params.mode;
      if (params.mode === 'edit') {
        this.title = 'Update';
      }
      else if (params.mode === 'create') {
        this.title = 'Create';
      }
      else{
        this.title = 'View';
        this.isViewOnly = true;
      }
    });

  }

  uploadImag(blobInfo, success, failure) {
    setTimeout( () => {
      success('http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
    }, 2000);
  }

  onDefaultRecipientChanged() {
    if (this.defaultRecipient) {
      this.emailTemplate.Recipient = '';
    }
  }

  cancel(form: NgForm) {
    if (!form.form.pristine){
      if (confirm('Are you sure you wish to exit this page without saving your data? All data will be lost.')) {
        this.router.navigate(['user-settings']);
      }
    }else{
      this.router.navigate(['user-settings']);
    }
  }

  saveEmailTemplate(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toastr.error(this.commonService.validationErrorMessage);
      return;
    }
    let subscription;
    const emailTemplate = {
      __metadata: { type: 'SP.Data.EmailTemplatesListItem' },
      Title: this.emailTemplate.Title,
      NotificationType: this.emailTemplate.NotificationType,
      Subject: this.emailTemplate.Subject,
      // Recipient: this.emailTemplate.Recipient,
      Recipient: '',
      PreHeader: this.emailTemplate.PreHeader,
      Description: this.emailTemplate.Description,
      Message: this.emailTemplate.Message
    };
    if (this.emailTemplate.ID) {
      subscription = this.restAPIService.updateEmailTemplate(emailTemplate, this.emailTemplate.ID);
    } else {
      subscription = this.restAPIService.saveEmailTemplate(emailTemplate);
    }
    subscription.subscribe(res => {
      if (this.mode === 'edit') {
        this.toastr.success('Email template updated successfully', '', { timeOut: 5000 });
      }
      else {
        this.toastr.success('Email template saved successfully', '', { timeOut: 5000 });
      }
      this.router.navigate(['user-settings']);
      // this.emailTemplate = {};
      // this.isFormSubmitted = false;
      // form.reset();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showLoader = false;
    }, 2000);

    setTimeout(() => {
      $('.ng-select-container .ng-value-container .ng-input input').removeAttr('aria-expanded');
      $('.ng-select-container .ng-value-container .ng-input input').removeAttr('autocomplete');
      $('.tox-statusbar div').removeAttr('aria-level');
      $('.tox-split-button').attr('aria-hidden', 'true');
      $('.ng-select-container .ng-value-container .ng-input input').attr('aria-label', 'Notification Type');
      $('.ng-select-container .ng-value-container .ng-input input').attr('aria-labelledby', 'Notification Type');
      $('.ng-select-container .ng-value-container .ng-input input').attr('role', 'option');
      this.cdr.detectChanges();
    }, 5000);
  }
}
