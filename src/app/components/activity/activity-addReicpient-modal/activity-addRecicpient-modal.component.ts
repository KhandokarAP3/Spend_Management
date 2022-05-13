import {AfterViewInit, Component, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, OnInit} from '@angular/core';
import {PageComponentParent} from '../../../PageComponentParent';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {RESTAPIService} from '../../../services/REST-API.service';


@Component({
  selector: 'activity-add-recipient-modal',
  templateUrl: './activity-addRecicpient-modal.component.html'
})

// export class ActivityAddReceipientModalComponent implements OnInit {
export class ActivityAddReceipientModalComponent extends PageComponentParent implements OnDestroy, OnInit, AfterViewInit{
  data: any;
  isFormSubmitted = false;
  recipientTabShow = true;
  rolesTabShow = false;
  activityObj: any = {};
  lookupInputField: any;
  mode: any;

  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.activityObj = this.data.activity;
    this.mode = this.data.mode;
    if (!this.activityObj.RecipientsList) {
      this.activityObj.RecipientsList = [];
    }
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submitLinkedData(data) {
    this.activeModal.close(data);
  }

  recipientTab() {
    this.recipientTabShow = true;
    this.rolesTabShow = false;
    this.cdr.detectChanges();
  }

  rolesTab() {
    this.recipientTabShow = false;
    this.rolesTabShow = true;
    this.cdr.detectChanges();
  }

  onRecipientSelected(event) {
    if (!this.activityObj.RecipientsList.length) {
      this.activityObj.RecipientsList.push({Title: event.item.Title, Email: event.item.Email});
      this.lookupInputField = null;
      this.cdr.detectChanges();
    }
    else {
      if (this.activityObj.RecipientsList.filter(e => e.Email === event.item.Email).length > 0) {
        this.toastr.error('This Recipient is already added in the list');
        this.lookupInputField = null;
        this.cdr.detectChanges();
      }
      else {
        this.activityObj.RecipientsList.push({Title: event.item.Title, Email: event.item.Email});
        this.lookupInputField = null;
        this.cdr.detectChanges();
      }
    }
  }

  deleteRecipient(index) {
    this.activityObj.RecipientsList.splice(index, 1);
  }

}
