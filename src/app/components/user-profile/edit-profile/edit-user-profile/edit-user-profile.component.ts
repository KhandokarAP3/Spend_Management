import { Component, OnInit } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../../services/common.service';
import {NgForm} from '@angular/forms';
import {RESTAPIService} from '../../../../services/REST-API.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AppConstants} from '../../../../AppConstants';

@Component({
  selector: 'app-edit-user-profile',
  templateUrl: './edit-user-profile.component.html',
})
export class EditUserProfileComponent {

  isSystemUser = false;
  isDirty = false;
  user: any = {
    Bio: '',
    UserID: '',
  };
  isFormSubmitted = false;
  uploadDocuments: any = [];
  fileData: any;
  updateDoc: any = {};
  docData: any;

  constructor(private restAPIService: RESTAPIService, public activeModal: NgbActiveModal, private toaster: ToastrService, private commonService: CommonService){
    this.isSystemUser = this.commonService.isUserSystemUser();
  }

  removePhoto(calledFromRemovePhoto?) {
    if (calledFromRemovePhoto && !confirm('Do you want to remove profile image?')) {
      return;
    }
    this.user.UserID = this.updateDoc.UserID || AppConstants.spPageContextInfo.userEmail;
    this.user.ProfilePictureName = this.fileData ? this.fileData.name : undefined;
    if (calledFromRemovePhoto) {
      this.user.ProfilePictureName = undefined;
    }
    const userObj: any = {...this.user, document: this.fileData};
    this.restAPIService.uploadFileForHelpDesk(userObj, 'UserProfileData').subscribe((res: any) => {
      if (res && res.status === 'success'){
        if (calledFromRemovePhoto) {
          this.toaster.error('Profile image removed successfully.', '', { timeOut: 5000 });
        } else {
          this.toaster.success('Updated successfully', '', { timeOut: 5000 });
        }
        this.activeModal.close();
      }else{
        if (calledFromRemovePhoto) {
          this.toaster.error('Error in removing the profile image.');
        } else {
          this.toaster.error('Invalid Data');
        }
      }
    });
  }

  onFileChange($event) {
    this.fileData =  $event.target.files[0];
    this.isDirty = true;
    console.log(this.fileData);
  }

  // removePhoto(){
  //   this.fileData = '';
  // }

  updateUser(form: NgForm){
    if (form.invalid) {
      this.toaster.error(this.commonService.validationErrorMessage);
      return;
    }
    this.removePhoto();
  }
}
