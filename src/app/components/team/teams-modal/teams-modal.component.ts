import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";
import {CommonService} from "../../../services/common.service";
import {RESTAPIService} from '../../../services/REST-API.service';
import {AppConstants} from "../../../AppConstants";

@Component({
  selector: 'app-teams-modal',
  templateUrl: './teams-modal.component.html'
})

export class TeamsModalComponent implements OnInit {
  teamMateObj: any = {title: '', name: '', email: ''};
  public readonly widgetNames = AppConstants;
  invalidName: boolean = false;

  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService) {
  }

  ngOnInit(): void {
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submitTeamForm() {
    console.log('this.teamMateObj', this.teamMateObj);
    if (this.teamMateObj.email === '') {
      this.toastr.error('The name you entered is not attached to an email address and cannot be added as a teammate to this project/contract');
      return;
    }
    this.activeModal.close(this.teamMateObj);
  }

  getPeopleEmailAddress() {
    if (this.teamMateObj.name !== '') {
      let valueExists: any = this.commonService.allTeamMates.filter(x => x.Title.toLocaleLowerCase() === this.teamMateObj.name.toLowerCase());
      if (!valueExists.length) {
        this.teamMateObj.name = '';
        this.teamMateObj.email = '';
        this.invalidName = true;
      }
      else {
        if (this.commonService.allTeamMates.length > 0) {
          for (const user of this.commonService.allTeamMates) {
            if (user.Title.toLowerCase() === this.teamMateObj.name.toLowerCase()) {
              this.teamMateObj.email = user.Email;
              this.invalidName = false;
            }
          }
        }
        else {
          console.log('No user details Found from SP Server');
          this.invalidName = false;
        }
      }
    }
    else {
      this.teamMateObj.email = '';
      this.invalidName = false;
    }
  }

  emptyEmailField(event) {
    if (event === '') {
      this.teamMateObj.email = '';
    }
  }

}
