import { Component, ChangeDetectorRef, ElementRef, } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-submit-for-approval-modal',
  templateUrl: './submit-for-approval-modal.component.html'
})
export class SubmitForApprovalModalComponent {
  requestedApprovalDateObj: any = {
    requestedApprovalDate: ''
  };

  constructor(private elementRef: ElementRef,public activeModal: NgbActiveModal,private cdr: ChangeDetectorRef, private toastr: ToastrService, public commonService: CommonService) {
  }

  cancel () {
    this.activeModal.dismiss();
  }

  submitModalForm() {
    this.activeModal.close(this.requestedApprovalDateObj);
  }

  ngOnInit() {
  }

  checkTypingDateForCalendar(fieldName, obj) {
    if (!obj) {
      obj = this.requestedApprovalDateObj;
    }
    if (fieldName === 'requestedApprovalDate') {
      if (obj.requestedApprovalDate !== '' && obj.requestedApprovalDate !== null) {
        this.commonService.validateDateOnBlur(obj, fieldName);
      } else {
        obj.requestedApprovalDateERROR = null;
      }
    } else {
      this.commonService.validateDateOnBlur(obj, fieldName);
    }
  }

}