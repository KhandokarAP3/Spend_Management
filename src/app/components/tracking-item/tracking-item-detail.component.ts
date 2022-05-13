import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../services/common.service';
import { AppConstants } from '../../AppConstants';
import {RESTAPIService} from "../../services/REST-API.service";

@Component({
  selector: 'app-tracking-item-detail',
  templateUrl: './tracking-item-detail.component.html'
})
export class TrackingItemDetailComponent implements OnInit {
  trackingItem: any = { recipient: [], email: [], allTeamMates: false };
  teams: any;
  siteAllUsers: any;
  data: any;
  recipientField: any;
  emailRE = /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/g;
  trackingItemConstants = AppConstants.TrackingItemCategoryOptions;
  isFormSubmitted = false;
  showAllTeamMatesErr: boolean = false;
  nameAlreadyExists: boolean = false;
  invalidName: boolean = false;
  siteUsersList: any;
  showInlIneErrorForNoOfDays = false;
  showInlIneErrorForDecimalNumbers = false;

  constructor(public activeModal: NgbActiveModal, public commonService: CommonService, private cdr: ChangeDetectorRef, private restAPIService: RESTAPIService) {
    this.restAPIService.getAllSiteUsers().subscribe(users => {
      this.siteUsersList = users;
    });
  }

  submitForm(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      return;
    }
    else if (!this.trackingItem.recipient.length) {
      this.isFormSubmitted = true;
      return;
    }
    else if (this.invalidName) {
      return;
    }
    this.activeModal.close({ ...this.trackingItem });
  }

  onRecipientSelected(event) {
    if (!this.trackingItem.allTeamMates) {
      if (!this.trackingItem.recipient.includes(event.item.Title)) {
        this.trackingItem.recipient.push(event.item.Title);
        this.trackingItem.email.push(event.item.Email);
        this.invalidName = false;
        this.recipientField = null;
        this.nameAlreadyExists = false;
        this.cdr.detectChanges();
      }
      else {
        this.nameAlreadyExists = true;
        this.invalidName = false;
        this.recipientField = null;
        this.cdr.detectChanges();
      }
    }
    else {
      if (!this.trackingItem.recipient.includes(event.item.Title)) {
        this.trackingItem.recipient.push(event.item.Title);
        this.trackingItem.email.push(event.item.Email);
        this.invalidName = false;
        this.recipientField = null;
        this.nameAlreadyExists = false;
        this.cdr.detectChanges();
      }
      else {
        this.nameAlreadyExists = true;
        this.invalidName = false;
        this.recipientField = null;
        this.cdr.detectChanges();
      }
    }
  }

  cancel() {
    if (!this.trackingItem.recipient.length && this.trackingItem.category && this.trackingItem.numberOfDays) {
      this.trackingItem.category = '';
      this.trackingItem.numberOfDays = '';
      this.trackingItem.recipient = [];
      this.trackingItem.email = [];
      this.trackingItem.addNotification = false;
      this.activeModal.close({ ...this.trackingItem });
    }
    else {
      this.activeModal.dismiss();
    }
  }

  allTeamMatesChangeFN(event) {
    this.trackingItem.allTeamMates = event.target.checked;
    if (event.target.checked) {
      if (this.teams.length) {
        let count = 0;
        for (const a of this.teams) {
          if (!this.trackingItem.recipient.includes(a)) {
            this.trackingItem.recipient.push(a);
            let user = this.siteUsersList.value.find(item => item.Title.toLowerCase() === a.toLowerCase());
            this.trackingItem.email.push(user.Email);
          }
          count++;
          if (count === this.teams.length) {
            this.cdr.detectChanges();
          }
        }
      }
      else {
        this.showAllTeamMatesErr = true;
        this.trackingItem.allTeamMates = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showAllTeamMatesErr = false;
        }, 1000);
      }
    }
    else {
      this.trackingItem.recipient = [];
      this.trackingItem.email = [];
      this.showAllTeamMatesErr = false;
    }
  }

  deleteRecipient(index, name) {
    if (this.trackingItem.allTeamMates) {
      if (this.teams.includes(name)) {
        this.trackingItem.allTeamMates = false;
        this.trackingItem.recipient.splice(index, 1);
        this.trackingItem.email.splice(index, 1);
        this.cdr.detectChanges();
      }
      else {
        this.trackingItem.recipient.splice(index, 1);
        this.trackingItem.email.splice(index, 1);
        this.cdr.detectChanges();
      }
    }
    else {
      this.trackingItem.recipient.splice(index, 1);
      this.trackingItem.email.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  checkRecipientName() {
    let user;
    user = this.siteUsersList.value.find(item => item.Title.match(this.recipientField));
    if (!user) {
      this.invalidName = true;
      return;
    }
    else {
      this.invalidName = false;
    }
  }

  ngOnInit() {
    if (this.data) {
      if (this.data.trackingItem.recipient === '') {
        this.data.trackingItem.recipient = [];
      }
      if (this.data.trackingItem.email === '') {
        this.data.trackingItem.email = [];
      }
      this.trackingItem = { ...this.trackingItem, ...this.data.trackingItem };
      this.teams = this.data.teams;
      this.siteAllUsers = this.data.siteAllUsers;
    }
  }

  checkIfValueIsZero(val: any) {
    if (val === 0) {
      this.showInlIneErrorForNoOfDays = true;
    }
    else if (val !== 0 && !Number.isInteger(val)) {
      this.showInlIneErrorForDecimalNumbers = true;
    }
    else if (val < 0) {
      this.showInlIneErrorForDecimalNumbers = true;
    }
    else {
      this.showInlIneErrorForNoOfDays = false;
      this.showInlIneErrorForDecimalNumbers = false
    }
  }
}
