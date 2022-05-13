import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {CommonService} from '../../services/common.service';
import {AppConstants} from '../../AppConstants';
import {Pagination, SortAndFilterTopLevelObjects} from '../../pipes/pipes';
import {ExportToCsv} from 'export-to-csv';
import {CommonDialogService} from '../../services/common-dialog.service';
import {forkJoin} from 'rxjs';
import {RESTAPIService} from '../../services/REST-API.service';
import {ToastrService} from 'ngx-toastr';
import * as moment from 'moment';
import {HttpClient} from '@angular/common/http';
import {ObjectOperationsService} from '../../services/object-operations.service';
declare const _spPageContextInfo: any;

@Component({
  selector: 'app-document-server',
  templateUrl: './document-server.component.html'
})

export class DocumentServerComponent implements AfterViewInit, OnInit {
  readonly csvOptions = {
    filename: 'documents',
    showLabels: true,
    headers: []
  };
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 1,
  };
  // repoDeliverable: any;
  filterValue = '';
  reverse = true;
  sortBy = 'Name';
  filterByFields = ['DocumentTitle', 'DocumentType', 'Modified', 'ModifiedBy'];
  documentTemplateRecordsList: any[] = [];
  columnNames = [
    { av: 'DocumentTitle', dv: 'Name', columnStyle: { textAlign: 'left'}},
    { av: 'DocumentType', dv: 'Document Type', columnStyle: { textAlign: 'center'}},
    { av: 'Modified', dv: 'Modified', columnStyle: { textAlign: 'center'}},
    { av: 'ModifiedBy', dv: 'Modified By', columnStyle: { textAlign: 'center'}},
  ];
  documents = [];
  projects = [];
  activities = [];
  teamMateProjectsArr = [];
  teamMateActivitiesArr = [];
  userInfo: any;
  groupAttachDocNamesByWorkCategory: any;

  constructor(
    private http: HttpClient,
    public route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService,
    public sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    private commonDialogServ: CommonDialogService,
    private toaster: ToastrService,
    private restAPIService: RESTAPIService,
    private toastr: ToastrService,
    public pagination: Pagination) {
    this.loadDocuments();
  }

  loadDocuments() {
    this.userInfo = {
      name: _spPageContextInfo.userDisplayName,
      email: _spPageContextInfo.userEmail
    };
    forkJoin([
      this.restAPIService.getProjectDocumentCollaborationData(`DocumentCreator eq '${AppConstants.spPageContextInfo.userDisplayName}' or substringof('${AppConstants.spPageContextInfo.userDisplayName}',SharingWith)`, 'ID,DocumentTitle,VersionComment,DocumentCategory,DocumentCreator,File/ServerRelativeUrl,Created,Title,DocumentType,Category,Status,Modified,Editor/Title,Author/Title&$top=5000&$expand=Editor/Title,Author/Title,File'),
      this.restAPIService.getDocumentTemplateRecords(), this.restAPIService.getDataFromProjectGeneral(null, AppConstants.SELECTED_FIELD_PROJECT), this.restAPIService.getActivities(null, AppConstants.SELECTED_FIELD_ACTIVITY_LIST),
      this.restAPIService.getDocumentCategoryForAttachDocs()
    ]).subscribe((forkJoinResponses: any) => {
      if (forkJoinResponses[0].data.length) {
        this.documents = [];
        for (const data of forkJoinResponses[0].data) {
          const dataObj: any = {};
          dataObj.ID = data.ID;
          dataObj.DocumentTitle = data.DocumentTitle;
          dataObj.DocumentType = data.DocumentType;
          dataObj.DocumentCategory = data.DocumentCategory;
          dataObj.Modified = moment(data.Modified).format(AppConstants.AP3DateFormat);
          dataObj.ModifiedBy = data.DocumentCreator;
          dataObj.File = data.File;
          dataObj.ID = data.ID;
          this.documents.push(dataObj);
        }
      }

      if (forkJoinResponses[1].data.length) {
        this.documentTemplateRecordsList = forkJoinResponses[1].data;
      }

      if (forkJoinResponses[2].data.length) {
        this.projects = [];
        this.teamMateProjectsArr = [];
        this.projects = forkJoinResponses[2].data;
        if (this.projects.length) {
          for (const project of this.projects) {
            if (ObjectOperationsService.isTeamMate(this.userInfo.name, project.Team)) {
              this.teamMateProjectsArr.push(project);
            }
          }
        }
      }

      if (forkJoinResponses[3].data.length) {
        this.activities = [];
        this.teamMateActivitiesArr = [];
        this.activities = forkJoinResponses[3].data;
        if (this.activities.length) {
          for (const activity of this.activities) {
            const findProjectForActivity: any = this.projects.find(x => x.Identifier === activity.Identifier);
            if (findProjectForActivity) {
              if (ObjectOperationsService.isTeamMate(this.userInfo.name, findProjectForActivity.Team)) {
                this.teamMateActivitiesArr.push(activity);
              }
            }
          }
        }
      }

      if (forkJoinResponses[4].data.length) {
        this.groupAttachDocNamesByWorkCategory = forkJoinResponses[4].data.reduce(function(r, a) {
          r[a.WorkCategory] = r[a.WorkCategory] || [];
          r[a.WorkCategory].push(a);
          return r;
        }, Object.create(null));
      }


      for (const column of this.columnNames) {
        this.csvOptions.headers.push(column.dv);
      }
    });
  }

  ngOnInit() {
  }

  shareDocument(document: any) {
    this.commonDialogServ.openShareDocumentModal(document).subscribe((result: any) => {
      console.log('result', result);
    });
  }

  filterFn(items: any[], filterValue: string, usePagination: boolean = true) {
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);
    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }
    return tempResult;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.width = `100%`;
      // this.margin = `6px 0 0 14%`;
    });
  }

  clearSearch() {
    this.filterValue = '';
  }

  createNewDocument() {
    this.commonDialogServ.openCreateDocumentModal({documentTemplateRecordsList: this.documentTemplateRecordsList, groupAttachDocNamesByWorkCategory: this.groupAttachDocNamesByWorkCategory}).subscribe((result: any) => {
      console.log('result', result);
      if (result === true) {
        this.loadDocuments();
      }
    });
  }

  exportToCSV() {
    const csvExporter = new ExportToCsv(this.csvOptions);
    const filteredList = this.filterFn(this.documents, this.filterValue, false);
    const data = filteredList.map((document) => {
      const obj = {};
      for (const column of this.columnNames) {
        obj[column.dv] = document[column.av] || '';
      }
      return obj;
    });
    csvExporter.generateCsv(data);
  }

  uploadDocument() {
    this.commonDialogServ.openUploadDocumentModal({ allRepoDocData: this.documents, groupAttachDocNamesByWorkCategory: this.groupAttachDocNamesByWorkCategory }).subscribe((result: any) => {
      if (result) {
        for (const file of result.documents) {
          const uploadDocObj: any = { document: file, DocTitle: result.title, type: result.type, documentCategory: result.DocumentCategory, status: result.Status, versionComments: result.verComments };
          this.restAPIService.uploadFile(uploadDocObj, null, 'Project Documents').subscribe((fileRes: any) => {
            if (fileRes.status === 'success') {
              this.restAPIService.getProjectDocumentCollaborationData(`DocumentTitle eq '${uploadDocObj.DocTitle}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Category,Status,Modified,Editor/Title&$top=5000&$expand=Editor/Title,File').subscribe((getDocResp: any) => {
                if (this.restAPIService.isSuccessResponse(getDocResp)) {
                  if (getDocResp.data.length) {
                    for (const data of getDocResp.data) {
                      const dataObj: any = {};
                      dataObj.DocumentTitle = data.DocumentTitle;
                      dataObj.DocumentType = data.DocumentType;
                      dataObj.Modified = moment(data.Modified).format(AppConstants.AP3DateFormat);
                      dataObj.ModifiedBy = data.Editor.Title;
                      dataObj.File = data.File;
                      dataObj.ID = data.ID;
                      this.documents.push(dataObj);
                    }
                    this.toaster.success('Document uploaded successfully.', '', { timeOut: 5000 });
                  }
                  else {
                    console.log('no upload data found');
                  }
                }
              });
            }
          });
        }
      }
    });
  }

  sortTableBy(key) {
    if (this.sortBy === key) {
      this.reverse = !this.reverse;
    }
    this.sortBy = key;
  }

  updateCurrentPageIndex(currentPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, currentPage};
    });
  }
  updateItemsPerPage(itemsPerPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, itemsPerPage};
    });
  }

  goToDocument(document, isEdit?) {
    isEdit = isEdit === true;
    if (isEdit && !this.commonService.canEditDocuments(document)) {
      return;
    }
    this.router.navigate(['projects', document.ID], { queryParams: { mode: isEdit ? 'edit' : 'view' } });
  }

  deleteCollaborationDocument(item){
    if (confirm('Are you sure you want to delete this document?')) {
      const index = this.documents.findIndex(p => p.ID === item.ID);
      this.restAPIService.deleteDocumentCollaborationFileById(item.ID).subscribe(response => {
        if (this.restAPIService.isSuccessResponse(response)) {
          this.documents.splice(index, 1);
          this.toastr.success('Document deleted successfully.', '', { timeOut: 5000 });
        } else {
          this.toastr.error('Could not delete document.', '', { timeOut: 5000 });
        }
      });
    }
  }

  editDocument(document) {
    this.http.post(AppConstants.WORKFLOW_URLS.EDIT_DOCUMENT_URL, { DocumentTitle: document.DocumentTitle}).subscribe((res: any) => {
      console.log(res);
      window.open(res.Response);
    }, error => {
      this.toaster.error(error.error || 'Could not edit document, Please contact your administrator', '', { timeOut: 5000 });
    });
  }

  viewDocument(document) {
    this.http.post(AppConstants.WORKFLOW_URLS.VIEW_DOCUMENT_URL, { DocumentTitle: document.DocumentTitle}).subscribe((res: any) => {
      console.log(res);
      window.open(res.Response);
    }, error => {
      this.toaster.error(error.error || 'Could not view document, Please contact your administrator', '', { timeOut: 5000 });
    });
  }

  attachDocumentToProject(doc: any, attachForProject: boolean) {
    const dataForModalView: any = attachForProject ? this.teamMateProjectsArr : this.teamMateActivitiesArr;
    if (dataForModalView.length) {
      this.commonDialogServ.openAttachDocumentInProject_ActivitiesModal({dataRequiredForAttach: dataForModalView, isProject: attachForProject, docToBeAttached: doc}).subscribe((result: any) => {
        console.log('result', result);
        if (result) {
        }
      });
    }
    else {
      this.toaster.warning(attachForProject ? 'No Projects found in which you are listed as a team member' : 'No Activities found in which you are listed as a team member', '', { timeOut: 5000 });
    }
  }
}
