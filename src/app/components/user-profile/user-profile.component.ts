import { Component, OnInit } from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {NavigationEnd, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import {forkJoin} from 'rxjs';
import {CommonService} from "../../services/common.service";
import {PreviousRouteService} from "../../services/PreviousRouteService";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  templates = [];
  notificationTypes = [];
  profileModel = {
    Title : "",
    RequestedUpcomingDay: "",
    ExpertsUpcomingDays: "",
    RequestedTicket: "",
    AskTheExpert: "",
    ContactUsUpcoming: ""
  }
  configurations: any;
  previousUrl: any;

  constructor(private restAPIService: RESTAPIService, private router: Router, private toastr: ToastrService, public commonService: CommonService, private previousRouteService: PreviousRouteService) {
    forkJoin([this.restAPIService.getEmailTemplates(), this.restAPIService.getSettingsConfigurations(), this.restAPIService.getNotificationTypes()]).subscribe((response: any) => {
      if(response && response.length) {
          this.templates = response[0].data;
          this.notificationTypes = response[2].data;
          this.configurations = response[1].data;
          this.profileModel.Title = this.configurations[0].EmailAddress
          this.profileModel.ContactUsUpcoming = this.configurations[0].w5sx ? this.configurations[0].w5sx : ''
          this.profileModel.RequestedTicket = this.configurations[1].EmailAddress
          this.profileModel.RequestedUpcomingDay = this.configurations[1].w5sx ? this.configurations[1].w5sx : ''
          this.profileModel.AskTheExpert = this.configurations[2].EmailAddress
          this.profileModel.ExpertsUpcomingDays = this.configurations[2].w5sx ? this.configurations[2].w5sx : ''
      }
    });
  }

  createEmailTemplate() {
    this.router.navigate(['/email-template/create-email-template'], { queryParams: { mode: 'create' } });
  }

  editEmailTemplate(template) {
    this.router.navigate([`/email-template/${template.ID}`], { queryParams: { mode: 'edit' } });
  }

  viewEmailTemplate(template) {
    this.router.navigate([`/email-template/${template.ID}`], { queryParams: { mode: 'view' } });
  }

  deleteEmailTemplate(template, index) {
    if (confirm('Are you sure you want to delete this Email Template?')) {
      this.restAPIService.getNotificationTypes(`EmailTemplateID eq '${template.ID}'`).subscribe((findNotificationResponse: any) => {
        if (this.restAPIService.isSuccessResponse(findNotificationResponse)) {
          if (findNotificationResponse.data.length) {
            let count = 0;
            for (const a of findNotificationResponse.data) {
              this.restAPIService.updateNotificationType({EmailTemplateID: null, __metadata: { type: 'SP.Data.NotificationTypesListItem' }}, a.ID).subscribe((updateResponse: any) => {
                if (this.restAPIService.isSuccessResponse(updateResponse)) {
                  count++;

                  if (count === findNotificationResponse.data.length) {
                    this.restAPIService.deleteEmailTemplate(template.ID).subscribe((deleteResponse: any) => {
                      if (this.restAPIService.isSuccessResponse(deleteResponse)) {
                        this.templates.splice(index, 1);
                        this.toastr.success('Email Template deleted successfully', '', { timeOut: 5000 });
                      }
                    });
                  }
                }
              });
            }
          }
          else {
            this.restAPIService.deleteEmailTemplate(template.ID).subscribe((deleteResponse: any) => {
              if (this.restAPIService.isSuccessResponse(deleteResponse)) {
                this.templates.splice(index, 1);
                this.toastr.success('Email Template deleted successfully', '', { timeOut: 5000 });
              }
            });
          }
        }
      });
    }
  }

  createNotificationType() {
    this.router.navigate(['/notification-type-template/create-notification-type-template'], { queryParams: { mode: 'create' } });
  }

  editNotificationType(notification) {
    this.router.navigate([`/notification-type-template/${notification.ID}`], { queryParams: { mode: 'edit' } });
  }

  viewNotificationType(notification) {
    this.router.navigate([`/notification-type-template/${notification.ID}`], { queryParams: { mode: 'view' } });
  }

  deleteNotificationType(notification, index) {
    if (confirm('Are you sure you want to delete this Notification Type?')) {
      this.restAPIService.deleteNotificationType(notification.ID).subscribe((deleteResponse: any) => {
        if (this.restAPIService.isSuccessResponse(deleteResponse)) {
          this.notificationTypes.splice(index, 1);
          this.toastr.success('Notification Type deleted successfully', '', { timeOut: 5000 });
        }
      });
    }
  }

  saveSettings(form: NgForm){
    if(form.invalid){
      return;
    }
    this.profileModel['__metadata'] = { type: 'SP.Data.SettingsConfigurationsListItem' };


    if(this.configurations && this.configurations.length){
      let obj = {
        __metadata:{type: 'SP.Data.SettingsConfigurationsListItem'},
        EmailAddress :"",
        w5sx : "",
      };

      forkJoin([this.restAPIService.updateConfigurationSettings({EmailAddress: this.profileModel.Title,w5sx:this.profileModel.ContactUsUpcoming,__metadata:{type: 'SP.Data.SettingsConfigurationsListItem'}},this.configurations[0].ID), this.restAPIService.updateConfigurationSettings({EmailAddress: this.profileModel.RequestedTicket,w5sx:this.profileModel.RequestedUpcomingDay,__metadata:{type: 'SP.Data.SettingsConfigurationsListItem'}},this.configurations[1].ID),this.restAPIService.updateConfigurationSettings({EmailAddress: this.profileModel.AskTheExpert,w5sx:this.profileModel.ExpertsUpcomingDays,__metadata:{type: 'SP.Data.SettingsConfigurationsListItem'}},this.configurations[2].ID)]).subscribe((response: any) => {
        if(response.length === this.configurations.length){
          this.toastr.success("Settings Saved Successfully", '', { timeOut: 5000 });
        }
      });
    }
  }

  cancel() {
    let prevURL: any = this.previousRouteService.getPreviousUrl();
    if ( prevURL !== '/user-settings') {
      this.router.navigateByUrl(this.previousRouteService.getPreviousUrl());
    }
    else {
      this.router.navigate(['home']);
    }
  }
}
