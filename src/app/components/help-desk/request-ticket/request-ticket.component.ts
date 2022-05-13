import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {NgForm} from '@angular/forms';
import {RESTAPIService} from '../../../services/REST-API.service';
import { AppConstants } from 'src/app/AppConstants';
declare const _spPageContextInfo;

@Component({
  selector: 'app-request-ticket',
  templateUrl: './request-ticket.component.html'
})
export class RequestTicketComponent {

  constructor(private restAPIService: RESTAPIService, private toaster: ToastrService, public commonService: CommonService, public activeModal: NgbActiveModal) { }

  isFormSubmitted = false;
  requestTicketObj = {
    FirstName: _spPageContextInfo.userDisplayName.split(' ')[0],
    LastName: _spPageContextInfo.userDisplayName.split(' ')[1],
    Department: '',
    Topic: '',
    ProblemDescription: '',
    Priority: '',
    EmailAddress: _spPageContextInfo.userEmail,
    PhoneNumber: '',
    ContactPreference: 'email',
    // PickDate: null,
    DatePickERROR: null,
    Message: '',
  };
  fileData: any;
  pickDate = false;
  getHelpDeskObjectForSaving(data){
    return {
      FirstName: data.FirstName,
      LastName: data.LastName,
      Department: data.Department,
      Topic: data.Topic,
      ProblemDescription: data.ProblemDescription,
      Priority: data.Priority,
      EmailAddress: data.EmailAddress,
      PhoneNumber: data.PhoneNumber,
      ContactPreference: data.ContactPreference,
      // PickDate: data.PickDate,
      Message: data.Message,
    };
  }

  onContactTypeChange(event){
    if (event){
      this.requestTicketObj.ContactPreference = event;
    }
  }

  checkTypingDate(fieldName, obj?) {
    if (!obj) {
      obj = this.requestTicketObj;
    }
    this.commonService.validateDateOnBlur(obj, fieldName);
  }

  onFileChange($event) {
    if ($event.target.files && $event.target.files.length > 0) {
      this.fileData =  $event.target.files[0];
    }
  }

  requestTicket(form: NgForm){
    if (form.invalid) {
      console.log('form', form);
      this.isFormSubmitted = true;
      this.toaster.error(this.commonService.validationErrorMessage);
      return;
    }

    if (this.fileData && this.fileData.size > 5000000){
      this.toaster.error('Your document has exceeded the maximum file size limit for document upload. Maximum limit is 5 MB.');
      return;
    }

    // this.requestTicketObj.PickDate = this.requestTicketObj.PickDate != null ? this.requestTicketObj.PickDate : '';
    const emailObj = {...this.getHelpDeskObjectForSaving(this.requestTicketObj), document: this.fileData};
    this.restAPIService.uploadFileForHelpDesk(emailObj, 'HelpDeskTicket').subscribe((res: any) => {
      if (res && res.status === 'success'){
        this.toaster.success(AppConstants.EMAIL_SENT, '', { timeOut: 5000 });
        this.activeModal.close();
      }else{
        this.toaster.error(AppConstants.EMAIL_NOT_SENT);
      }
    });
  }

}
