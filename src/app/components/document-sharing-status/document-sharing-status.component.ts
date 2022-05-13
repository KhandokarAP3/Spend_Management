import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { RESTAPIService } from '../../services/REST-API.service';
import { AppConstants } from '../../AppConstants';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-document-sharing-status',
  templateUrl: './document-sharing-status.component.html'
})

export class DocumentSharingStatusComponent implements OnInit {
  data: any;
  statusMap = {
    Pending: 'Pending',
    Approved: 'Approved',
    Reject: 'Rejected',
    Rejected: 'Rejected'
  };
  userEmailToTitleMap: any = {};
  statusList: any[] = [];
  siteAllUsers: any = [];
  currentUser = AppConstants.spPageContextInfo.userDisplayName;
  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    public commonService: CommonService,
    private restAPIService: RESTAPIService) {
  }

  ngOnInit() {
    forkJoin([this.restAPIService.getAllSiteUsers(), this.restAPIService.getDocumentForApprovalList(`DocumentName eq '${this.data.doc.DocumentName}'`)]).subscribe((res: any) => {
      if (this.restAPIService.isSuccessResponse(res[0])) {
        this.siteAllUsers = res[0].data;
        // for (const user of res[0].data) {
        //   this.userEmailToTitleMap[user.Email] = user.Title;
        // }
      }
      if (this.restAPIService.isSuccessResponse(res[1])) {
        const today = moment().startOf('day');
        let requestedDate;
        this.statusList = [];
        for (const status of res[1].data) {
          if (this.statusMap[status.Status]) {
            requestedDate = moment(status.RequestedDate, AppConstants.AP3DateFormat);
            /* Changed this because if there is a space inside of the email address (e.g. " ki.mahmud@gmail.com") using 'status.Approver' as the map location returns nothing
               as a result the below code always returns the email address itself. Additionally, since the value is in the location part of a map if it returns nothing
               we can't use the string.trim() function on it.
               Apologies for messing with your stuff - but wanted to give you a reason why I changed it (: */
            var displayName = '';
            const record = this.siteAllUsers.find(item => item.Email.trim().toLowerCase() === status.Approver.trim().toLowerCase());
            if (record) {
              displayName = record.Title;
            }
            this.statusList.push({
              // approver: this.userEmailToTitleMap[status.Approver] || status.Approver,
              approver: displayName || status.Approver,
              daysBefore: `${today.diff(requestedDate, 'day')} days`,
              status: this.statusMap[status.Status]
            });
          }
        }
      }
    });
  }

  cancel() {
    this.activeModal.dismiss();
  }
}
