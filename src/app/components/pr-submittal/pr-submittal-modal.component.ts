import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../services/common.service';
import {RESTAPIService} from '../../services/REST-API.service';
import {AppConstants} from '../../AppConstants';

@Component({
  selector: 'pr-submittal-modal',
  templateUrl: './pr-submittal-modal.component.html'
})

export class PRSubmittalModalComponent implements OnInit {
  data: any;
  isFormSubmitted = false;
  activeTabName = 'RECIPIENTS_TAB';
  selectedRoles = '';
  public widgetNames: any = AppConstants;
  addRecipientsObj: any = {
    RecipientsList: [],
    Roles: []
  };
  lookupInputField: any;
  AutoPopulatePRToContractsDate = false;
  recipientAlreadyExists = false;
  // roleAlreadyExists = false;

  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
    if (this.data && this.data.RecipientsList) {
      this.addRecipientsObj.RecipientsList = this.data.RecipientsList;
    }
    // if (this.data && this.data.Roles) {
    //   this.addRecipientsObj.Roles = this.data.Roles;
    // }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submitLinkedData(addRecipientsObj) {
    this.activeModal.close({addRecipientsObj, AutoPopulatePRToContractsDate: this.AutoPopulatePRToContractsDate});
  }

  recipientTab() {
    this.activeTabName = 'RECIPIENTS_TAB';
    this.cdr.detectChanges();
  }

  // rolesTab() {
  //   this.activeTabName = 'ROLES_TAB';
  //   this.cdr.detectChanges();
  // }

  onRecipientSelected(event) {
    if (!this.addRecipientsObj.RecipientsList.length) {
      this.addRecipientsObj.RecipientsList.push({Title: event.item.Title, Email: event.item.Email});
      this.lookupInputField = null;
      this.recipientAlreadyExists = false;
      this.cdr.detectChanges();
    }
    else {
      if (this.addRecipientsObj.RecipientsList.filter((e) => e.Title.toLowerCase() === event.item.Title.toLowerCase() ).length > 0) {
        this.lookupInputField = null;
        this.recipientAlreadyExists = true;
        this.cdr.detectChanges();
      }
      else {
        this.addRecipientsObj.RecipientsList.push({Title: event.item.Title, Email: event.item.Email});
        this.lookupInputField = null;
        this.recipientAlreadyExists = false;
        this.cdr.detectChanges();
      }
    }
  }

  deleteRecipient(index) {
    this.addRecipientsObj.RecipientsList.splice(index, 1);
  }

  // removeRole(index) {
  //   this.addRecipientsObj.Roles.splice(index, 1);
  // }

  // onRoleSelect() {
  //   if (!this.addRecipientsObj.Roles.length) {
  //     this.addRecipientsObj.Roles.push(this.selectedRoles);
  //     this.selectedRoles = '';
  //     this.roleAlreadyExists = false;
  //     this.cdr.detectChanges();
  //   }
  //   else {
  //     if (this.addRecipientsObj.Roles.includes(this.selectedRoles)) {
  //       this.selectedRoles = '';
  //       this.roleAlreadyExists = true;
  //       this.cdr.detectChanges();
  //     }
  //     else {
  //       this.addRecipientsObj.Roles.push(this.selectedRoles);
  //       this.selectedRoles = '';
  //       this.roleAlreadyExists = false;
  //       this.cdr.detectChanges();
  //     }
  //   }
  // }
}

