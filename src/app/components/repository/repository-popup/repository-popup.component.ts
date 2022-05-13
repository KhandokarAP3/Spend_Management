import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CommonService} from '../../../services/common.service';

@Component({
  selector: 'app-repository-popup',
  templateUrl: './repository-popup.component.html'
})
export class RepositoryPopupComponent implements OnInit {
  updateDoc: any = {};
  docData: any;
  showActivityDropDown = false;

  constructor(public activeModal: NgbActiveModal, public commonService: CommonService) { }

  ngOnInit(): void {
    this.updateDoc = this.docData;
    if (this.updateDoc.docUploadedFrom === 'Activity') {
      this.showActivityDropDown = true;
    }
    else {
      this.showActivityDropDown = false;
    }
  }

  submitModalForm(){
    this.activeModal.close(this.updateDoc);
  }

}
