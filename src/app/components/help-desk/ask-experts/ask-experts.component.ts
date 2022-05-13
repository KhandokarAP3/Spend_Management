import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {NgForm} from '@angular/forms';
import {RESTAPIService} from '../../../services/REST-API.service';
import { AppConstants } from 'src/app/AppConstants';
declare const _spPageContextInfo;

@Component({
  selector: 'app-ask-experts',
  templateUrl: './ask-experts.component.html'
})
export class AskExpertsComponent {
  constructor(private restAPIService: RESTAPIService, private toaster: ToastrService, public commonService: CommonService, public activeModal: NgbActiveModal) { }
  isFormSubmitted = false;
  askExpertsObj = {
    FirstName: _spPageContextInfo.userDisplayName.split(' ')[0],
    LastName: this.mergeLastName(),
    Department: '',
    Topic: '',
    EmailAddress: _spPageContextInfo.userEmail,
    PhoneNumber: '',
    ContactPreference: 'email',
    PickDate: null,
    PickDateERROR: null,
    Question: '',
    Message: '',
  };
  fileData: any;
  pickDate = false;

  checkTypingDate(fieldName, obj?) {
    if (!obj) {
      obj = this.askExpertsObj;
    }
    this.commonService.validateDateOnBlur(obj, fieldName);
  }

  onContactTypeChange(event){
    if (event){
      this.askExpertsObj.ContactPreference = event;
    }
  }

  onFileChange($event) {
    if ($event.target.files && $event.target.files.length > 0) {
      this.fileData =  $event.target.files[0];
    }
  }

  getHelpDeskObjectForSaving(data){
    return {
      FirstName: data.FirstName,
      LastName: data.LastName,
      Department: data.Department,
      Topic: data.Topic,
      EmailAddress: data.EmailAddress,
      PhoneNumber: data.PhoneNumber,
      ContactPreference: data.ContactPreference,
      PickDate: data.PickDate,
      Question: data.Question,
      Message: data.Message,
    };
  }

  askExperts(form: NgForm){
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toaster.error(this.commonService.validationErrorMessage);
      return;
    }

    if (this.fileData && this.fileData.size > 5000000){
      this.toaster.error('Your document has exceeded the maximum file size limit for document upload. Maximum limit is 5 MB.');
      return;
    }

    this.askExpertsObj.PickDate = this.askExpertsObj.PickDate != null ? this.askExpertsObj.PickDate : '';
    const emailObj = {...this.getHelpDeskObjectForSaving(this.askExpertsObj), document: this.fileData};
    this.restAPIService.uploadFileForHelpDesk(emailObj, 'AskTheExperts').subscribe((res: any) => {
      if (res && res.status == 'success'){
        this.toaster.success(AppConstants.EMAIL_SENT, '', { timeOut: 5000 });
        this.activeModal.close();
      }else{
        this.toaster.error(AppConstants.EMAIL_NOT_SENT);
      }
    });
  }

  mergeLastName() {
    let getNameLength: any = _spPageContextInfo.userDisplayName.split(' ');
    let finalLastName: string = '';

    for (const [idx, text] of getNameLength.entries()) {
      if (idx > 0) {
        finalLastName = `${finalLastName} ${text}`;
      }
    }
    return finalLastName;
  }

}
