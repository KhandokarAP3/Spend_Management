import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../services/common.service';
import { RESTAPIService } from '../../../../../services/REST-API.service';
import { Router } from '@angular/router';
import { AppConstants } from 'src/app/AppConstants';
import { SubmitForApprovalModalComponent } from '../../../../submit-for-approval-modal/submit-for-approval-modal.component';
import { forkJoin, Observable } from 'rxjs';
declare const _spPageContextInfo: any;

@Component({
  selector: 'app-view-attachments-modal',
  templateUrl: './viewattachments-modal.component.html'
})

export class ViewAttachmentsModalComponent implements OnInit {
  data: any;
  project: any;
  uploadDocuments: any;
  isDeleteFileName: any;
  mode: any;
  projectFilesArr: any[] = [];
  toggleEllipsisClass: any[] = [];
  submitDocumentsForApprovalArr: any[] = [];
  submitForApprovalSPData: any[] = [];
  documentsSubmittedForApproval: any = {};
  documentApprovalTriggerMap = [];
  // Holds the granular approver level 'received' records
  documentsArr: any[] = [];

  constructor(
    private router: Router,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    public commonService: CommonService,
    private restAPIService: RESTAPIService,
    private modalService: NgbModal,
    private ngbModelConfig: NgbModalConfig) {
  }

  ngOnInit(): void {
    console.log('this.data attachment', this.data);
    this.project = this.data.project;
    this.uploadDocuments = this.data.uploadDocuments;
    this.isDeleteFileName = this.data.isDeleteFileName;
    this.submitDocumentsForApprovalArr = this.data.submitDocumentsForApprovalArr;
    this.submitForApprovalSPData = this.data.submitForApprovalSPData;
    this.documentApprovalTriggerMap = this.data.documentApprovalTriggerMap;
    this.projectFilesArr = this.data.projectFilesArr;
    this.documentsArr = this.data.documentsArr;
    // this.allRepoDocumentsData  = this.allRepoDocumentsData;
    this.updateDocumentSubmissionStatus();
    this.mode = this.data.mode;

    if (this.uploadDocuments.length) {
      for (const fileObj of this.uploadDocuments) {
        const fileData: any = {};
        fileData.title = fileObj.DocTitle;
        fileData.filePath = `javascript:void(0)`;
        fileData.DocumentCategory = fileObj.documentCategory;
        this.projectFilesArr.push(fileData);
      }
    }

    if (AppConstants.AttachedFilenames.length) {
      // AppConstants.fileMap = new Map();
      // for (const docTitle of AppConstants.AttachedFilenames) {
      //   let docObj: any = {};
      //   this.restAPIService.getRepositoryData(`DocumentTitle eq '${docTitle.trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,DocumentCategory,Status,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((response: any) => {
      //     if (this.restAPIService.isSuccessResponse(response)) {
      //       if (response.data.length) {
      //         for (const data of response.data) {
      //           if (docTitle === data.DocumentTitle) {
      //             docObj.title = docTitle;
      //             docObj.filePath = `https://seventh.sharepoint.us${data.File.ServerRelativeUrl}`;
      //             docObj.DocumentCategory = data.DocumentCategory;

      //             this.projectFilesArr.push(docObj);
      //             if (!AppConstants.fileMap.has(docTitle)) {
      //               AppConstants.fileMap.set(docTitle, data.Title);
      //             }
      //           }
      //         }
      //       }
      //       else {
      //         docObj.title = docTitle;
      //         docObj.filePath = `javascript:void(0)`;
      //         this.projectFilesArr.push(docObj);
      //       }
      //     }
      //   });
      // }

      // Ensure that attached files list delineates which files users can submit for approvals and which files cannot be submitted for approvals
      for (let i = 0; i < this.projectFilesArr.length; i++) {
        if (!this.commonService.isNotUndefinedNullOrEmpty(this.projectFilesArr[i].DocumentCategory)) {
          this.projectFilesArr[i].canSubmitForApproval = false;
        } else {
          const typeCheck = this.documentApprovalTriggerMap.find(v => v.Title.toLowerCase() === this.projectFilesArr[i].DocumentCategory.toLowerCase());
          if (typeCheck) {
            this.projectFilesArr[i].canSubmitForApproval = true;
          } else {
            this.projectFilesArr[i].canSubmitForApproval = false;
          }
        }
      }
    }
  }

  cancel() {
    this.activeModal.close({
      project: this.project,
      uploadDocuments: this.uploadDocuments,
      isDeleteFileName: this.isDeleteFileName,
      submitDocumentsForApprovalArr: this.submitDocumentsForApprovalArr,
      mode: this.mode });
  }

  deleteUploadDec(docTitle: any) {
    if (this.mode && this.mode === 'edit') {
      if (this.uploadDocuments.length) {
        for (let a = 0; a < this.uploadDocuments.length; a++) {
          if (this.uploadDocuments[a].DocTitle === docTitle) {
            this.uploadDocuments.splice(a, 1);
            this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(docTitle), 1);
            AppConstants.AttachedFilenames.splice(AppConstants.AttachedFilenames.indexOf(docTitle), 1);
            const findIdx: any = this.projectFilesArr.findIndex(i => i.title === docTitle);
            this.projectFilesArr.splice(findIdx, 1);
            break;
          }
        }
      } else {
        const fileNameCheck = this.project.ProjectFilenames.filter(v => v.toLowerCase() === docTitle.toLowerCase());
        const attachedFileNameCheck = AppConstants.AttachedFilenames.filter(v => v.toLowerCase() === docTitle.toLowerCase());
        if (fileNameCheck.length) {
          // Validate that this file hasn't already been pushed into the isDeleteFileName array
          if (-1 === this.isDeleteFileName.indexOf(docTitle)) {
            this.isDeleteFileName.push(docTitle);
          }
          // If the fileName exists in the ProjectFilenames array then remove it
          this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(docTitle), 1);
        }
        if (attachedFileNameCheck.length) {
          // Validate that this file hasn't already been pushed into the isDeleteFileName array
          if (-1 === this.isDeleteFileName.indexOf(docTitle)) {
            this.isDeleteFileName.push(docTitle);
          }
          // If the fileName exists in the AttachedFilenames array then remove it
          AppConstants.AttachedFilenames.splice(AppConstants.AttachedFilenames.indexOf(docTitle), 1);
        }

        if (fileNameCheck.length > 0 || attachedFileNameCheck.length > 0) {
          for (let i = 0; i < this.projectFilesArr.length; i++) {
            if (this.projectFilesArr[i].title === docTitle) {
              this.projectFilesArr.splice(i, 1);
            }
          }
        }
      }
    }
    else if (this.mode && this.mode === 'create') {
      if (this.uploadDocuments.length) {
        for (let a = 0; a < this.uploadDocuments.length; a++) {
          if (this.uploadDocuments[a].DocTitle === docTitle) {
            this.uploadDocuments.splice(a, 1);
            this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(docTitle), 1);
            AppConstants.AttachedFilenames.splice(AppConstants.AttachedFilenames.indexOf(docTitle), 1);
            const findIdx: any = this.projectFilesArr.findIndex(i => i.title === docTitle);
            this.projectFilesArr.splice(findIdx, 1);
            break;
          }
        }
      }
    }
  }

  downloadDocument(doc) {
    const docSplit = doc.split('.');
    if (docSplit.length === 2) {
      this.restAPIService.getRepositoryData(`DocumentTitle eq '${docSplit[0].trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((response: any) => {
        if (this.restAPIService.isSuccessResponse(response)) {
          console.log('response', response);
        }
      });
    }
  }

  submitDocumentForPanelApproval(document: any) {
    this.openSubmitForApprovalModal().subscribe((result: any) => {
      if (result && result.requestedApprovalDate) {
        const createApproverObj: any = {};
        // createApproverObj.__metadata = { type: 'SP.Data.DocumentApproverListItem' };
        createApproverObj.__metadata = { type: 'SP.Data.DocumentLevelApprovalStatusListItem' };

        if (this.mode === 'create') {
          const findDocDetails: any = this.uploadDocuments.find(x => x.DocTitle === document.title);

          createApproverObj.Title = findDocDetails.documentCategory;
          createApproverObj.DocumentName = document.title;
          createApproverObj.TriggerFrom = 'Project';
          createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
          createApproverObj.Identifier = this.project.Identifier;
          createApproverObj.RequestedApprovalDate = result.requestedApprovalDate;
          createApproverObj.OverAllStatus = AppConstants.SUBMITTED;
          createApproverObj.IsApprovalprocessCompleted = AppConstants.NO;

          this.submitDocumentsForApprovalArr.push(createApproverObj);
          this.updateDocumentSubmissionStatus();
        }
        if (this.mode === 'edit') {
          this.restAPIService.getRepositoryData(`DocumentTitle eq '${document.title.trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,DocumentCategory,Status,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              if (response.data.length) {
                const findDocDetails: any = response.data.find(x => x.DocumentTitle === document.title);
                if (findDocDetails) {
                  createApproverObj.Title = findDocDetails.DocumentCategory;
                  createApproverObj.DocumentName = findDocDetails.DocumentTitle;
                  createApproverObj.TriggerFrom = 'Project';
                  createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
                  createApproverObj.Identifier = this.project.Identifier;
                  createApproverObj.RequestedApprovalDate = result.requestedApprovalDate;
                  createApproverObj.OverAllStatus = AppConstants.SUBMITTED;
                  createApproverObj.IsApprovalprocessCompleted = AppConstants.NO;

                  this.submitDocumentsForApprovalArr.push(createApproverObj);
                  this.updateDocumentSubmissionStatus();
                }
              }
              else {
                if (this.uploadDocuments.length) {
                  const findDocDetails: any = this.uploadDocuments.find(x => x.DocTitle === document.title);
                  if (findDocDetails) {
                    createApproverObj.Title = findDocDetails.documentCategory;
                    createApproverObj.DocumentName = document.title;
                    createApproverObj.TriggerFrom = 'Project';
                    createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
                    createApproverObj.Identifier = this.project.Identifier;
                    createApproverObj.RequestedApprovalDate = result.requestedApprovalDate;
                    createApproverObj.OverAllStatus = AppConstants.SUBMITTED;
                    createApproverObj.IsApprovalprocessCompleted = AppConstants.NO;

                    this.submitDocumentsForApprovalArr.push(createApproverObj);
                    this.updateDocumentSubmissionStatus();
                  }
                }
              }
            }
          });
        }
      }
    });
  }

  cancelDocumentForApproval(document: any) {
    if (this.mode === 'create') {
      const findDocForApproval: any = this.submitDocumentsForApprovalArr.find(x => x.DocumentName === document.title);
      if (findDocForApproval) {
        this.submitDocumentsForApprovalArr.splice(findDocForApproval, 1);
        this.updateDocumentSubmissionStatus();
      }
    }
    if (this.mode === 'edit') {
      if (this.submitDocumentsForApprovalArr.length) {
        const findDocDetails: any = this.submitDocumentsForApprovalArr.find(x => x.DocumentName === document.title);
        if (findDocDetails) {
          this.submitDocumentsForApprovalArr.splice(findDocDetails, 1);
          this.updateDocumentSubmissionStatus();
        }
      }
      else {
        if (this.submitForApprovalSPData.length) {
          const findDoc: any = this.submitForApprovalSPData.find(x => x.DocumentName === document.title);
          if (findDoc) {

            // let documentObjForUpdate: any = {
            //   __metadata: { type: 'SP.Data.DocumentApproverListItem' },
            //   OverAllStatus: AppConstants.CANCELLED
            // };
            const documentObjForUpdate: any = {
              __metadata: { type: 'SP.Data.DocumentLevelApprovalStatusListItem' },
              OverAllStatus: AppConstants.CANCELLED
            };
            this.restAPIService.updateDocumentForApproval(documentObjForUpdate, String(findDoc.ID)).subscribe((updateStatusResp: any) => {
              // this.restAPIService.deleteDocumentForApproval(findDoc.ID).subscribe((deleteDocApprovalResp: any) => {
              if (this.restAPIService.isSuccessResponse(updateStatusResp)) {
                this.submitForApprovalSPData.splice(findDoc, 1);
                this.updateDocumentSubmissionStatus();

                const observable = [];
                for (let i = 0; i < this.documentsArr.length; i++) {
                  if (
                    // approvalDoc.Title === this.documentsArr[i].Title &&
                    findDoc.DocumentName === this.documentsArr[i].DocumentName &&
                    findDoc.DocumentLink === this.documentsArr[i].DocumentLink &&
                    findDoc.RequestedApprovalDate === this.documentsArr[i].DueDate
                  ) {
                    this.documentsArr[i].Status = AppConstants.CANCELLED;
                    const documentObjForUpdate1: any = {
                      __metadata: { type: 'SP.Data.DocumentApprovalUsersActionsListItem' },
                      Status: AppConstants.CANCELLED
                    };
                    observable.push(this.restAPIService.updateDocumentForApprovalInList(documentObjForUpdate1, this.documentsArr[i].ID));
                  }
                }
                forkJoin(observable).subscribe((responses: any[]) => {
                  if (responses.length) {
                    // this.documentsApproverArr = [];
                    this.documentsArr = [];

                    // Call Powerautomate script to update document approval lists/db tables based on business logic
                    this.restAPIService.requestDocumentApprovalWorkflowUpdate();

                    // this.ngAfterViewInit();
                    this.restAPIService.notifyRefreshNotification();
                  }
                });

              }
            });
          }
        }
      }
    }
  }

  public toggleEllipsis(index: any) {
    let count = 0;
    if (this.toggleEllipsisClass.length) {
      for (let item = 0; item < this.toggleEllipsisClass.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClass[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClass.length) {
          this.toggleEllipsisClass[index] = !this.toggleEllipsisClass[index];
        }
      }
    }
    else {
      this.toggleEllipsisClass[index] = !this.toggleEllipsisClass[index];
    }
  }

  updateDocumentSubmissionStatus() {
    this.documentsSubmittedForApproval = {};
    for (const docObj of this.submitForApprovalSPData) {
      this.documentsSubmittedForApproval[docObj.DocumentName] = docObj;
    }
    for (const docObj of this.submitDocumentsForApprovalArr) {
      this.documentsSubmittedForApproval[docObj.DocumentName] = docObj;
    }
  }

  openSubmitForApprovalModal() {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(SubmitForApprovalModalComponent, { windowClass: 'submitForApproval-modal' });
      // modalRef.componentInstance.docData = item;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

}
