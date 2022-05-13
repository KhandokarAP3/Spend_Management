import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {RESTAPIService} from '../../../services/REST-API.service';
import {AppConstants} from '../../../AppConstants';

@Component({
  selector: 'app-notification-type-modal',
  templateUrl: './notification-type-modal.component.html'
})

export class NotificationTypesModalComponent implements OnInit {
  data: any;
  selectedData: any;
  isDataSelected = false;

  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService) {
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submitLinkedData(data) {
    if (confirm('Are you sure you want to select this template?')) {
      this.activeModal.close(data);
    }
  }

  getSelectedData(data) {
   this.selectedData = data;
   this.isDataSelected = true;
  }


}
