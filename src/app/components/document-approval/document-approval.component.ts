import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { Pagination, SortAndFilterTopLevelObjects } from '../../pipes/pipes';
import { PageComponentParent } from '../../PageComponentParent';
import { RESTAPIService } from '../../services/REST-API.service';
import { AppConstants } from '../../AppConstants';
import { forkJoin } from 'rxjs';
import { DocumentApproval } from '../../models/document_approval.model';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CommonDialogService } from '../../services/common-dialog.service';
declare const _spPageContextInfo;

@Component({
  selector: 'app-document-approval',
  templateUrl: './document-approval.component.html'
})

export class DocumentApprovalComponent extends PageComponentParent implements AfterViewInit {
  filterValue = '';
  // Holds the granular approver level 'received' records
  documentApproverArray: any[] = [];
  // Holds the overall document level 'sent' approval records
  documentRequestorArray: any[] = [];
  // Holds both sent and received records that will be displayed in the UI
  documentApprovalArray: DocumentApproval[] = [];
  usersArr: any[] = [];
  readonly csvOptions = {
    filename: 'document approvals',
    showLabels: true,
    headers: []
  };
  columnNames = [
    { av: 'RequestedDate', dv: 'Requested Date', columnStyle: { textAlign: 'left' } },
    { av: 'DueDate', dv: 'Due Date', columnStyle: { textAlign: 'center' } },
    { av: 'DocumentType', dv: 'Document Type', columnStyle: { textAlign: 'center' } },
    { av: 'Status', dv: 'Status', columnStyle: { textAlign: 'center' } },
    { av: 'Document', dv: 'Document', columnStyle: { textAlign: 'left' } },
    { av: 'RequestedBy', dv: 'Requested By', columnStyle: { textAlign: 'center' } }
  ];
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  filterByFields = ['Identifier', 'Title', 'CreationDate', 'Requested_Award_Date', 'POC', 'EstimatedValue', 'Status'];
  page = 1;
  active = 1;
  sortBy = 'Title';
  reverse = true;
  showSpinner = false;
  toggleEllipsisClassStatus: any[] = [];
  toggleEllipsisClassViewDoc: any[] = [];
  contextEmail = '';
  historyToggleSwitch = false;
  approvalCount: DocumentApproval[] = [];
  canCancel = false;
  documentApprovalStatusMap: any = {};

  constructor(public route: ActivatedRoute, private router: Router, private sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects, private pagination: Pagination, private restAPIService: RESTAPIService, private commonService: CommonService, private commonDialogService: CommonDialogService) {
    super();
    for (const column of this.columnNames) {
      this.csvOptions.headers.push(column.dv);
    }
    if (_spPageContextInfo.userEmail){
      this.contextEmail = _spPageContextInfo.userEmail.trim().toLowerCase();
    }else{
      this.contextEmail = '';
      console.log('_spPageContextInfo.userEmail is undefined or null');
    }

  }

  ngAfterViewInit() {
    this.documentRequestorArray = [];
    this.documentApproverArray = [];
    this.documentApprovalArray = [];

    forkJoin([
      this.restAPIService.getDocumentForApproval(),
      this.restAPIService.getDocumentForApprovalList(),
      this.restAPIService.getAllSiteUsers(),
      this.restAPIService.getDocumentForApprovalList()]).subscribe((responses: any) => {
        if (responses[0].data.length) {
          this.documentRequestorArray = responses[0].data;
        }

        if (responses[1].data.length) {
          this.documentApproverArray = responses[1].data;

          for (let i = 0; i < this.documentApproverArray.length; i++) {

            const approvalEmail: string = this.documentApproverArray[i].Approver? this.documentApproverArray[i].Approver.trim().toLowerCase(): '';

            if (this.isNotUndefinedNullOrEmpty(this.contextEmail) &&
              this.isNotUndefinedNullOrEmpty(approvalEmail) &&
              approvalEmail === this.contextEmail) {

              // Prepare record
              const docApprovalRecord = new DocumentApproval({
                ID: this.documentApproverArray[i].ID,
                RequestedDate: moment(this.documentApproverArray[i].Created).format('MM-DD-YYYY'),
                DueDate: this.documentApproverArray[i].DueDate,
                Title: this.documentApproverArray[i].Title,
                Status: this.documentApproverArray[i].Status,
                DocumentName: this.documentApproverArray[i].DocumentName,
                DocumentLink: this.documentApproverArray[i].DocumentLink,
                Identifier: this.documentApproverArray[i].Identifier,
                RequestedBy: this.documentApproverArray[i].RequestedBy,
                Type: AppConstants.RECEIVED,
              });

              // push record into display array
              this.documentApprovalArray.push(docApprovalRecord);
            }
          }
        }
        if (responses[2].data.length) {
          this.usersArr = responses[2].data;

          for (let i = 0; i < this.documentRequestorArray.length; i++) {

            if (this.documentRequestorArray[i].SubmitterEmailAddress && this.documentRequestorArray[i].SubmitterEmailAddress.trim().toLowerCase() === this.contextEmail) {

              // Lookup doc approval submitter's email and get their name
              let submitterName = '';
              const submitterRecord = this.usersArr.find(x => x.Email === this.documentRequestorArray[i].SubmitterEmailAddress.trim());
              if (submitterRecord) {
                submitterName = submitterRecord.Title.trim();
              }

              // Prepare record
              const docApprovalRecord = new DocumentApproval({
                ID: this.documentRequestorArray[i].ID,
                RequestedDate: moment(this.documentRequestorArray[i].Created).format('MM-DD-YYYY'),
                DueDate: this.documentRequestorArray[i].RequestedApprovalDate,
                Title: this.documentRequestorArray[i].Title,
                Status: this.documentRequestorArray[i].OverAllStatus,
                DocumentName: this.documentRequestorArray[i].DocumentName,
                DocumentLink: this.documentRequestorArray[i].DocumentLink,
                Identifier: this.documentRequestorArray[i].Identifier,
                RequestedBy: submitterName,
                Type: AppConstants.SENT,
              });

              // Check to see if there are any approvers for this document yet - if not leave CanCancel value false so it doesn't appear as option for document requestor
              for (let j = 0; j < this.documentApproverArray.length; j++) {
                if (parseInt(docApprovalRecord.ID, 10) === parseInt(this.documentApproverArray[j].TaskIdentifier, 10)) {
                  docApprovalRecord.CanCancel = true;
                  break; // we only need to verify that there is at least one approver for this document approval record in the system
                }
              }

              // push record into display array
              this.documentApprovalArray.push(docApprovalRecord);
            }
          }
        }

        if (this.restAPIService.isSuccessResponse( responses[3])) {
          for (const approvalStatus of responses[3].data) {
            this.documentApprovalStatusMap[approvalStatus.DocumentName] = true;
          }
        }
      });
  }

  updateCurrentPageIndex(currentPage) {
    setTimeout(() => {
      this.paginationParams = { ...this.paginationParams, currentPage };
    });
  }

  updateItemsPerPage(itemsPerPage) {
    setTimeout(() => {
      this.paginationParams = { ...this.paginationParams, itemsPerPage };
    });
  }

  clearSearch() {
    this.filterValue = '';
  }

  sortTableBy(key) {
    if (this.sortBy === key) {
      this.reverse = !this.reverse;
    }
    this.sortBy = key;
  }

  filterFn(items: any[], filterValue: string, usePagination: boolean = true) {
    this.approvalCount = [];
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);

    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }

    const result = [];

    for (const record of tempResult) {

      if (this.active === 1 && record.Status === AppConstants.PENDING && record.Type === AppConstants.RECEIVED) {
        result.push(record);
        this.approvalCount.push(record);
      } else if (this.active === 2 && record.Status === AppConstants.SUBMITTED && record.Type === AppConstants.SENT) {
        result.push(record);
        this.approvalCount.push(record);
      } else if (this.active === 3) {
        if (this.historyToggleSwitch === false && record.Type === AppConstants.RECEIVED) {
          result.push(record);
          this.approvalCount.push(record);
        } else if (this.historyToggleSwitch === true && record.Type === AppConstants.SENT) {
          result.push(record);
          this.approvalCount.push(record);
        }
      }
    }
    return result;
  }

  addRequestedByValue(record: DocumentApproval, type: string): DocumentApproval {
    // If value is empty return - no need to do anything
    if (!this.isNotUndefinedNullOrEmpty(record)) {
      return;
    }

    // Create temp variable to hold record
    let modifiedRecord: DocumentApproval = record;

    // If this record is what we want add the additional paramater and return it
    for (let j = 0; j < this.documentApproverArray.length; j++) {
      if (this.documentApproverArray[j].DocumentLink === record.DocumentLink) {
        if (record.Type === type) {
          record.RequestedBy = this.documentApproverArray[j].RequestedBy;
          record.Identifier = this.documentApproverArray[j].Identifier;
          modifiedRecord = record;
          return modifiedRecord;
        }
      }
    }
  }

  exportToCSV() {
    const csvExporter = new ExportToCsv(this.csvOptions);
    const filteredList = this.filterFn(this.documentApproverArray, this.filterValue, false);
    const data = filteredList.map((project) => {
      return {
        'Requested Date': project.Identifier,
        'Due Date': project.Title || '',
        'Document Type': project.EstimatedValue,
        'Estimated Value': project.CreationDate || '',
        Status: project.Status || '',
        'Requested By': project.requestedApprovalDate
      };
    });
    csvExporter.generateCsv(data);
  }

  public toggleEllipsisStatus(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassStatus.length) {
      for (let item = 0; item < this.toggleEllipsisClassStatus.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassStatus[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassStatus.length) {
          this.toggleEllipsisClassStatus[index] = !this.toggleEllipsisClassStatus[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassStatus[index] = !this.toggleEllipsisClassStatus[index];
    }
  }

  public toggleEllipsisViewDoc(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassViewDoc.length) {
      for (let item = 0; item < this.toggleEllipsisClassViewDoc.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassViewDoc[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassViewDoc.length) {
          this.toggleEllipsisClassViewDoc[index] = !this.toggleEllipsisClassViewDoc[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassViewDoc[index] = !this.toggleEllipsisClassViewDoc[index];
    }
  }

  viewProject(doc: any) {
    this.restAPIService.getDataFromProjectGeneral(`Identifier eq '${doc.Identifier}'`, AppConstants.SELECTED_FIELD_PROJECT).subscribe((getProjectResponse: any) => {
      if (this.restAPIService.isSuccessResponse(getProjectResponse)) {
        if (getProjectResponse.data.length) {
          this.router.navigate(['projects', getProjectResponse.data[0].ID], { queryParams: { mode: 'view' }, state: { fromDocumentApprovalPage: true } });
        }
        else {
          console.log('No Project details found against Identifier- ', doc.Identifier);
        }
      }
    });
  }

  viewApprovalStatus(doc: any) {
    this.commonDialogService.openDocumentShareStatusModel({ doc }).subscribe(res => {
      console.log(res);
    });
  }

  changeStatus_FN_Approver(approvalDoc: any, status: string) {
    if (confirm('Are you sure that you want to change the status of this approval?')) {

      let updateRecordID = -1;

      for (let i = 0; i < this.documentApproverArray.length; i++) {

        if (parseInt(approvalDoc.ID, 10) === parseInt(this.documentApproverArray[i].ID, 10)) {
          updateRecordID = this.documentApproverArray[i].ID;
        }
      }
      if (this.isNotUndefinedNullOrEmpty(updateRecordID)) {
        const documentObjForUpdate: any = {
          __metadata: { type: 'SP.Data.DocumentApprovalUsersActionsListItem' },
          Status: status,
          IsCompleted: AppConstants.NO
        };
        this.restAPIService.updateDocumentForApprovalInList(documentObjForUpdate, String(updateRecordID)).subscribe((updateStatusResp: any) => {
          if (this.restAPIService.isSuccessResponse(updateStatusResp)) {
            approvalDoc.Status = status;
            this.documentRequestorArray = [];
            this.documentApproverArray = [];
            this.commonService.sleep(2000);

            //Call Powerautomate script to update document approval lists/db tables based on business logic
            this.restAPIService.requestDocumentApprovalWorkflowUpdate();

            this.ngAfterViewInit();
            this.restAPIService.notifyRefreshNotification();
          }
        });
      }
    }
  }

  changeStatus_FN_Requestor(approvalDoc: any, status: string) {
    if (confirm('Are you sure that you want to change the status of this approval?')) {

      let updateRecordID = -1;

      for (let i = 0; i < this.documentRequestorArray.length; i++) {
        // Gets id for update of DocumentApproval record
        if (parseInt(approvalDoc.ID, 10) === parseInt(this.documentRequestorArray[i].ID, 10)) {
          updateRecordID = this.documentRequestorArray[i].ID;
        }
      }

      if (this.isNotUndefinedNullOrEmpty(updateRecordID)) {
        // const documentObjForUpdate: any = {
        //   __metadata: { type: 'SP.Data.DocumentApproverListItem' },
        //   OverAllStatus: status
        // };
        let documentObjForUpdate: any = {
          __metadata: { type: 'SP.Data.DocumentLevelApprovalStatusListItem' },
          OverAllStatus: status
        };
        this.restAPIService.updateDocumentForApproval(documentObjForUpdate, String(updateRecordID)).subscribe((updateStatusResp: any) => {
          if (this.restAPIService.isSuccessResponse(updateStatusResp)) {

            approvalDoc.Status = status;

            const observable = [];
            for (let i = 0; i < this.documentApproverArray.length; i++) {
              if (parseInt(approvalDoc.ID, 10) === parseInt(this.documentApproverArray[i].TaskIdentifier, 10)) {
                this.documentApproverArray[i].Status = AppConstants.CANCELLED;
                if (status === AppConstants.CANCEL) {
                  status = AppConstants.CANCELLED;
                }
                const docObjForUpdate: any = {
                  __metadata: { type: 'SP.Data.DocumentApprovalUsersActionsListItem' },
                  Status: status
                };
                observable.push(this.restAPIService.updateDocumentForApprovalInList(docObjForUpdate, this.documentApproverArray[i].ID));
              }
            }
            forkJoin(observable).subscribe((responses: any[]) => {
              if (responses.length) {

                //Call Powerautomate script to update document approval lists/db tables based on business logic
                this.restAPIService.requestDocumentApprovalWorkflowUpdate();

                this.documentRequestorArray = [];
                this.documentApproverArray = [];
                this.commonService.sleep(2000);
                this.ngAfterViewInit();
                this.restAPIService.notifyRefreshNotification();
              }
            });
          }
        });
      }
    }
  }

  isNotUndefinedNullOrEmpty(object) {
    let isUndefinedOrNull = false;
    if (object !== '') {
      if (object !== null) {
        if (object !== undefined) {
          isUndefinedOrNull = true;
        }
      }
    }
    return isUndefinedOrNull;
  }

  getDownloadLink(link) {
    const linkParts = link.split('?');
    if (linkParts.length > 1) {
      linkParts.pop();
    }
    return linkParts.join('?');
  }
}
