import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {RESTAPIService} from '../../../services/REST-API.service';
import {AppConstants} from '../../../AppConstants';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-share-document-modal',
  templateUrl: './share-document-dialog.component.html'
})

export class ShareDocumentDialogComponent implements OnInit {
  showLoader = false;
  data: any;
  lookupInputField;
  shareInfo = {
    Title: '',
    PermissionType: '',
    Recipients: []
  };
  recipientAlreadyExists = false;
  constructor(public http: HttpClient, public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
    if (this.data?.document?.DocumentTitle) {
      this.shareInfo.Title = this.data.document.DocumentTitle;
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  onRecipientSelected(event) {
    this.lookupInputField = null;
    this.cdr.detectChanges();
    for (const recipient of this.shareInfo.Recipients) {
      if (recipient.Title === event.item.Title) {
        this.recipientAlreadyExists = true;
        return;
      }
    }
    this.shareInfo.Recipients.push({Title: event.item.Title, Email: event.item.Email});
  }

  submitModalForm() {
    const obj: any = {};
    obj.DocumentTitle = this.shareInfo.Title;
    obj.PermissionStatus = this.shareInfo.PermissionType;
    const recipients = [];
    const sharingWith = [];
    for (const recipient of this.shareInfo.Recipients) {
      recipients.push(recipient.Email);
      sharingWith.push(recipient.Title);
    }
    obj.Recipients = recipients.join(';');
    obj.SharingWith = sharingWith.join(';');
    this.showLoader = true;
    this.http.post(AppConstants.WORKFLOW_URLS.SHARE_DOCUMENT_URL, obj).subscribe((res: any) => {
      this.showLoader = false;
      this.toastr.success(res.Response);
      this.activeModal.close(res);
    }, error => {
      this.showLoader = false;
      this.toastr.error(error.error || 'Could not share document, Please contact your administrator');
    });
  }

  deleteRecipient(index) {
    this.shareInfo.Recipients.splice(index, 1);
  }
}
