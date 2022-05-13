import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {AppConstants} from '../../../AppConstants';
import {RESTAPIService} from '../../../services/REST-API.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
declare const $;

@Component({
  selector: 'app-attach-documents-project-activities',
  templateUrl: './attach-documents-project-activities.component.html'
})
export class AttachDocumentProjectActivitiesComponent implements OnInit {
  data: any = {};
  selectedItem: any;
  activeTab = 1;
  showLoader = false;

  constructor(private http: HttpClient, private restAPIService: RESTAPIService, private elementRef: ElementRef, public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef, private toastr: ToastrService, public commonService: CommonService) {
  }

  submitModalForm() {
    if (confirm(`Are you sure you want to attach this document to this ${this.data.isProject ? 'project' : 'activity'}?`)) {
      this.showLoader = true;
      let updateProject_Activity: any = {
        __metadata: { type: this.data.isProject ? 'SP.Data.ProjectGeneralListItem' : 'SP.Data.ActivityListListItem'}
      };
      let objectNeedsToBeSendForBackend: any = {
        identifier: this.selectedItem.Identifier,
        documentTitle: this.data.docToBeAttached.DocumentTitle,
        documentType: this.data.docToBeAttached.DocumentType,
        documentCategory: this.data.docToBeAttached.DocumentCategory,
      };
      if (this.data.isProject) {
        objectNeedsToBeSendForBackend.from = 'Project';

        if (this.selectedItem.ProjectFilenames.length) {
          let findDocAlreadyAttached: any = this.selectedItem.ProjectFilenames.filter(x => x === this.data.docToBeAttached.DocumentTitle);
          if (findDocAlreadyAttached.length) {
            this.showLoader = false;
            this.toastr.error('This document is already attached with this project', '', { timeOut: 5000 });
            return;
          }
          else {
            this.selectedItem.ProjectFilenames.push(this.data.docToBeAttached.DocumentTitle);
            updateProject_Activity.ProjectFilenames = JSON.stringify(this.selectedItem.ProjectFilenames);
          }
        }
        else {
          updateProject_Activity.ProjectFilenames = JSON.stringify([this.data.docToBeAttached.DocumentTitle]);
        }
        this.restAPIService.updateProject(updateProject_Activity, this.selectedItem.ID).subscribe((updateProjectResponse: any) => {
          if (this.restAPIService.isSuccessResponse(updateProjectResponse)) {
            this.http.post(AppConstants.WORKFLOW_URLS.ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL, objectNeedsToBeSendForBackend).subscribe((resAttachBackend: any) => {
              if (resAttachBackend.status) {
                this.showLoader = false;
                this.toastr.success('Document successfully attached with this project', '', { timeOut: 5000 });
                this.activeModal.close(this.selectedItem);
              }
              else {
                this.showLoader = false;
                this.toastr.error('Could not move attach document from Project Document to Document Repository, Please contact your administrator', '', { timeOut: 5000 });
              }
            }, error => {
              this.showLoader = false;
              let message = 'Could not attach document, Please contact your administrator';
              if (typeof error === 'string') {
                message = error;
              } else if (error.error && typeof error.error === 'string') {
                message = error.error;
              } else if (error.message && typeof error.message === 'string') {
                message = error.message;
              }  else if (error.error && error.error.message && typeof error.error.message === 'string') {
                message = error.error.message;
              }
              this.toastr.error(message, '', { timeOut: 5000 });
            });
          }
        });
      }
      else {
        objectNeedsToBeSendForBackend.from = 'Activity';
        objectNeedsToBeSendForBackend.categoryForActivity = this.selectedItem.ActivityType;
        if (typeof this.selectedItem.ActivityFileNames === 'string') {
          this.selectedItem.ActivityFileNames = JSON.parse(this.selectedItem.ActivityFileNames);
        }

        if (this.selectedItem.ActivityFileNames.length) {
          let findDocAlreadyAttached: any = this.selectedItem.ActivityFileNames.filter(x => x === this.data.docToBeAttached.DocumentTitle);
          if (findDocAlreadyAttached.length) {
            this.showLoader = false;
            this.toastr.error('This document is already attached with this activity', '', { timeOut: 5000 });
            return;
          }
          else {
            this.selectedItem.ActivityFileNames.push(this.data.docToBeAttached.DocumentTitle);
            updateProject_Activity.ActivityFileNames = JSON.stringify(this.selectedItem.ActivityFileNames);
          }
        }
        else {
          updateProject_Activity.ActivityFileNames = JSON.stringify([this.data.docToBeAttached.DocumentTitle]);
        }
        this.restAPIService.saveOrUpdateActivity(updateProject_Activity, this.selectedItem.ID).subscribe((updateActivityResponse: any) => {
          if (this.restAPIService.isSuccessResponse(updateActivityResponse)) {
            this.http.post(AppConstants.WORKFLOW_URLS.ATTACHDOCUMENTWITHPROJECT_ACTIVITY_URL, objectNeedsToBeSendForBackend).subscribe((resAttachBackend: any) => {
              if (resAttachBackend.status) {
                AppConstants.AttachedFilenames.push(this.data.docToBeAttached.DocumentTitle);
                this.showLoader = false;
                this.toastr.success('Document successfully attached with this activity', '', { timeOut: 5000 });
                this.activeModal.close(this.selectedItem);
              }
              else {
                this.showLoader = false;
                this.toastr.error('Could not move attach document from Project Document to Document Repository, Please contact your administrator', '', { timeOut: 5000 });
              }
            }, error => {
              this.showLoader = false;
              let message = 'Could not attach document, Please contact your administrator';
              if (typeof error === 'string') {
                message = error;
              } else if (error.error && typeof error.error === 'string') {
                message = error.error;
              } else if (error.message && typeof error.message === 'string') {
                message = error.message;
              }  else if (error.error && error.error.message && typeof error.error.message === 'string') {
                message = error.error.message;
              }
              this.toastr.error(message, '', { timeOut: 5000 });
            });
          }
        });
      }
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  ngOnInit() {
  }

}
