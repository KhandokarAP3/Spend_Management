import { Component } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {NgForm} from '@angular/forms';
import {RESTAPIService} from '../../../services/REST-API.service';
import { AppConstants } from 'src/app/AppConstants';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html'
})
export class SendEmailComponent {

  constructor(private restAPIService: RESTAPIService, public activeModal: NgbActiveModal, private toaster: ToastrService, private commonService: CommonService) { }

  isFormSubmitted = false;
  sendEmailObj = {
    FirstName: '',
    LastName: '',
    EmailAddress: '',
    PhoneNumber: '',
    ContactPreference: "email",
    DatePick: null,
    DatePickERROR: null,
    Message: '',
  };
  uploadDocuments: any = [];
  fileData: any;
  pickDate: boolean = false;

  onContactTypeChange(event){
    if(event){
      this.sendEmailObj.ContactPreference = event;
    }
  }

  onFileChange($event) {
    this.fileData =  $event.target.files[0];
    // console.log(this.fileData.file[0].name);
    // for (const file of result.documents) {
      // this.uploadDocuments.push({ document: this.fileData.file[0], DocTitle: this.fileData.file[0].name, type: this.fileData.file[0].type, versionComments: this.fileData.file[0].verComments });
    //   this.sendEmailObj.Name.push(file.name);
    // }
    // this.sendEmailObj['documents'] = $event.target.files;
  }


  checkTypingDate(fieldName, obj?) {
    if (!obj) {
      obj = this.sendEmailObj;
    }
    this.commonService.validateDateOnBlur(obj, fieldName);
  }

  sendEmail(form: NgForm){
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toaster.error(this.commonService.validationErrorMessage);
      return;
    }

    this.sendEmailObj.DatePick = this.sendEmailObj.DatePick != null ? this.sendEmailObj.DatePick : '';
    const emailObj = {...this.sendEmailObj, document: this.fileData};
    this.restAPIService.uploadFileForHelpDesk(emailObj,'GenericContactUs').subscribe((res:any) => {
      if(res && res.status == "success"){
        this.toaster.success(AppConstants.EMAIL_SENT, '', { timeOut: 5000 })
        this.activeModal.close();
      }else{
        this.toaster.error(AppConstants.EMAIL_NOT_SENT)
      }
    });
  }
}
