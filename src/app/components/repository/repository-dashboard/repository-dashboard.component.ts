import { Component, ChangeDetectorRef } from '@angular/core';
import {PageComponentParent} from '../../../PageComponentParent';
import {Router} from '@angular/router';
import {RESTAPIService} from '../../../services/REST-API.service';
import {forkJoin} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CommonDialogService} from '../../../services/common-dialog.service';
import {ObjectFilterPipe} from '../../../pipes/pipes';
import { ExportToCsv } from 'export-to-csv';
import * as moment from 'moment';
import { AppConstants } from '../../../AppConstants';
declare const _spPageContextInfo;

@Component({
  selector: 'app-repository-dashboard',
  templateUrl: './repository-dashboard.component.html'
})
export class RepositoryDashboardComponent extends PageComponentParent {
  active = 1;
  repoDeliverable: any;
  repos: any;
  categories: any;
  projects: any;
  documents: any;
  sortBy = 'Title';
  reverse = true;
  filterValue = '';
  pageTitle = 'Repository';
  filterByFields = ['Name', 'Identifier', 'contractor'];
  filterProjectData = ['Category', 'Identifier', 'DocumentType', 'DocumentTitle'];
  documentLength: any;
  readonly csvOptions = {
    filename: 'Repository Documents list',
    showLabels: true,
    headers: []
  };
  activities: any;
  titleArr = [];
  projectModel: any = {};
  loginUserDetails: any = _spPageContextInfo;

  columnNames = [
    {av: 'Name', dv: 'Project Name'},
    {av: 'Identifier', dv: 'Project Identifier'},
    {av: 'CreationDate', dv: 'Project Start Date'},
    {av: 'Requested_Award_Date', dv: 'Requested Award Date'},
    {av: 'PR_to_Contracts_Date', dv: 'PR to Contracts Date'},
    {av: 'DocumentTitle', dv: 'Document Name'},
    {av: 'Category', dv: 'Document Type'},
    {av: 'DocumentType', dv: 'Document Format'},
    {av: 'Modified', dv: 'Modified Date'},
    {av: 'Title', dv: 'Modified by'},
    {av: 'Created', dv: 'Date Created'}
  ];
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };

  // tslint:disable-next-line:max-line-length
  constructor(private cdRef: ChangeDetectorRef, private objectFilter: ObjectFilterPipe, private router: Router, private restAPIService: RESTAPIService, private modalService: NgbModal, private toastr: ToastrService, private commonDialogService: CommonDialogService) {
    super();

    for (const column of this.columnNames) {
      this.csvOptions.headers.push(column.dv);
    }

    // tslint:disable-next-line:max-line-length
    // forkJoin([this.restAPIService.getProjects(), this.restAPIService.getRepositoryData(null, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,Category,Modified,Editor/Title&$top=5000&$expand=Editor/Title,File'), this.restAPIService.getContractors(), this.restAPIService.getActivities(), this.restAPIService.getInvoices(), this.restAPIService.getBaseRateOptions()]).subscribe((response: any) => {
    forkJoin([this.restAPIService.getDataFromProjectGeneral(),
      this.restAPIService.getRepositoryData(null, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,Category,Status,Modified,Editor/Title&$top=5000&$expand=Editor/Title,File'),
      this.restAPIService.getActivities()]).subscribe((response: any) => {
      this.projects = response[0].data;
      this.documents = response[1].data;
      this.activities = response[2].data;
      this.repoDeliverable = this.gData(this.projects);
      this.paginationParams.itemCount = this.repoDeliverable.length;
    });
  }

  gData(data) {
    let resultInvoices = [];
    if (data){
      const groupedInvoices = data.reduce((r, a) => {
        r[a.Identifier] = r[a.Identifier] || [];
        r[a.Identifier].push(a);
        return r;
      }, {});
      // console.log(groupedInvoices);
      let arr = [];
      for (const x in groupedInvoices) {
        if (groupedInvoices.hasOwnProperty(x)) {
          // console.log("groupedInvoices[x]",groupedInvoices[x])
          // const contractorDetail = this.contractors.filter(item => item.Identifier === x);
          const activityDetails = this.activities.filter(item => item.Identifier === x);
          // const invoices = this.invoicesData.filter(item => item.Identifier === x);

          const invoiceObj: any = {};
          invoiceObj.Identifier = x;
          invoiceObj.startDate = groupedInvoices[x][0].startDate;
          invoiceObj.endDate = groupedInvoices[x][0].endDate;
          invoiceObj.Name = groupedInvoices[x][0].Title;
          invoiceObj.CreationDate = groupedInvoices[x][0].CreationDate;
          invoiceObj.Requested_Award_Date = groupedInvoices[x][0].Requested_Award_Date;
          invoiceObj.PR_to_Contracts_Date = groupedInvoices[x][0].PR_to_Contracts_Date;

          const projectFileDetails = groupedInvoices[x][0].ProjectFilenames ? groupedInvoices[x][0].ProjectFilenames : [];
          if (projectFileDetails.length > 0) {
            const obj = JSON.stringify(this.documents);
            arr = JSON.parse(obj);
            const docDetails = arr.filter(i => projectFileDetails.includes(i.DocumentTitle));
            if (docDetails.length > 0) {
              this.titleArr.push(groupedInvoices[x][0].Title);
              docDetails[0].projectId = groupedInvoices[x][0].ID;
            }
            if (invoiceObj.DocumentData && invoiceObj.DocumentData.length){
              if (docDetails.length > 0) {
                for (const doc of docDetails) {
                  invoiceObj.DocumentData.push(doc);
                }
              }
              else {
                invoiceObj.DocumentData.push(docDetails[0]);
              }
            }
            else{
              invoiceObj.DocumentData = docDetails;
            }
          }
          // tslint:disable-next-line:max-line-length
          const financialDataFileNamesDetails = groupedInvoices[x][0].financialDataFilenames ? groupedInvoices[x][0].financialDataFilenames : [];
          if (financialDataFileNamesDetails.length > 0) {
            const obj = JSON.stringify(this.documents);
            arr = JSON.parse(obj);
            const docDetails = arr.filter(i => financialDataFileNamesDetails.includes(i.DocumentTitle));
            if (docDetails.length > 0) {
              this.titleArr.push(groupedInvoices[x][0].Title);
              docDetails[0].projectId = groupedInvoices[x][0].ID;
            }
            if (invoiceObj.DocumentData && invoiceObj.DocumentData.length){
              if (docDetails.length > 0) {
                for (const doc of docDetails) {
                  invoiceObj.DocumentData.push(doc);
                }
              }
              else {
                invoiceObj.DocumentData.push(docDetails[0]);
              }
            }
            else{
              invoiceObj.DocumentData = docDetails;
            }
          }
          let activities;
          if (activityDetails.length > 0) {
            activityDetails.map(data1 => {
              activities = data1.ActivityFileNames ? JSON.parse(data1.ActivityFileNames) : [];
              if (activities && activities.length){
                const obj = JSON.stringify(this.documents);
                arr = JSON.parse(obj);
                const r = arr.filter(a => activities.includes(a.DocumentTitle));
                if (r && r.length){
                  if (r.length > 0){
                    for (const item of r){
                      this.titleArr.push(item.Title);
                      item.activityId = data1.ID;
                    }
                  }else{
                    this.titleArr.push(r[0].Title);
                    r[0].activityId = data1.ID;
                  }
                  if (invoiceObj.DocumentData && invoiceObj.DocumentData.length){
                    if (r.length > 0) {
                      for (const item of r) {
                        invoiceObj.DocumentData.push(item);
                      }
                    }else{
                      invoiceObj.DocumentData.push(r[0]);
                    }
                  }else{
                    invoiceObj.DocumentData = r;
                  }
                }
              }
            });
          }
          if (invoiceObj.hasOwnProperty('DocumentData')){
            resultInvoices.push(invoiceObj);
          }
        }
      }
      let count = 0;
      const finalInvoices = [];
      for (const x of resultInvoices){
          if (x.DocumentData.length > 0) {
            count += x.DocumentData.length;
            finalInvoices.push(x);
          }
      }
      resultInvoices = finalInvoices;
      this.documentLength = count;
    }
    return resultInvoices;
  }

  clearSearch(){
    this.filterValue = '';
    this.changeFilteredDataStatus(this.filterValue);
  }

  updateData(item) {
    const obj: any = {
      id: item.ID,
      title: item.DocumentTitle,
      type: item.Category,
      verComments : '',
    };
    if (item.hasOwnProperty('activityId')) {
      obj.docUploadedFrom = 'Activity';
    }
    this.commonDialogService.openDocumentUpdateModel(obj).subscribe((result: any) => {
      if (result){
        const index = this.documents.findIndex(p => p.ID === item.ID);
        const updateObj = {
          Category: result.type,
          Identifier: item.Identifier,
          DocumentType: item.DocumentType,
          DocumentTitle: obj.title,
          __metadata: {type: 'SP.Data.Document_x0020_RepositoryItem'},
        };

        this.restAPIService.updateRepository(updateObj, item.ID).subscribe(response => {
          if (this.restAPIService.isSuccessResponse(response)) {

            if (item.projectId) {
              this.restAPIService.getProjectById(item.projectId).subscribe((getProjectResp: any) => {
                if (this.restAPIService.isSuccessResponse(getProjectResp)) {
                  if (getProjectResp.data) {
                    getProjectResp.data.ProjectFilenames = JSON.parse(getProjectResp.data.ProjectFilenames);
                    let projectIdx: any = getProjectResp.data.ProjectFilenames.findIndex(x => x === item.DocumentTitle);
                    getProjectResp.data.ProjectFilenames[projectIdx] = result.title;
                    let updateProjectObj: any = {};
                    updateProjectObj.__metadata = { type: 'SP.Data.ProjectGeneralListItem' };
                    updateProjectObj.ProjectFilenames = JSON.stringify(getProjectResp.data.ProjectFilenames);

                    this.restAPIService.updateProject(updateProjectObj, item.projectId).subscribe((updateProjectResponse: any) => {
                      if (this.restAPIService.isSuccessResponse(updateProjectResponse)) {
                        this.documents[index].DocumentTitle = result.title;
                        this.documents[index].Category = result.type;
                        let getProjectObj: any = this.projects.find(x => x.ID === item.projectId);
                        getProjectObj.ProjectFilenames[projectIdx] = result.title;
                        this.toastr.success('Document updated successfully.', '', { timeOut: 5000 });
                        this.repoDeliverable = this.gData(this.projects);
                      }
                    });
                  }
                  else {
                    console.log('no project data found');
                  }
                }
                else {
                  console.log('getProjectResp error');
                }
              });
            }
            if (item.activityId) {
              this.restAPIService.getActivityById(item.activityId).subscribe((getActivityResp: any) => {
                console.log('getActivityRespdd', getActivityResp)
                if (this.restAPIService.isSuccessResponse(getActivityResp)) {
                  if (getActivityResp.data) {
                    getActivityResp.data.ActivityFileNames = JSON.parse(getActivityResp.data.ActivityFileNames);
                    let activityIdx: any = getActivityResp.data.ActivityFileNames.findIndex(x => x === item.DocumentTitle);
                    getActivityResp.data.ActivityFileNames[activityIdx] = result.title;
                    let updateActivityObj: any = {};
                    updateActivityObj.__metadata = { type: 'SP.Data.ActivityListListItem' };
                    updateActivityObj.ActivityFileNames = JSON.stringify(getActivityResp.data.ActivityFileNames);

                    this.restAPIService.updateActivity(updateActivityObj, item.activityId).subscribe((updateActivityResponse: any) => {
                      if (this.restAPIService.isSuccessResponse(updateActivityResponse)) {
                        this.documents[index].DocumentTitle = result.title;
                        this.documents[index].Category = result.type;
                        let getActivityObj: any = this.activities.find(x => x.ID === item.activityId);
                        getActivityObj.ActivityFileNames = JSON.parse(getActivityObj.ActivityFileNames);
                        console.log('getActivityObj.ActivityFileNames here', getActivityObj.ActivityFileNames)
                        getActivityObj.ActivityFileNames[activityIdx] = result.title;
                        getActivityObj.ActivityFileNames = JSON.stringify(getActivityObj.ActivityFileNames);
                        this.toastr.success('Document updated successfully.', '', { timeOut: 5000 });
                        this.repoDeliverable = this.gData(this.projects);
                      }
                    });
                  }
                  else {
                    console.log('no activity data found');
                  }
                }
              });
            }
          } else {
            this.toastr.error('Could not update Document.');
          }
        });
      }
    });
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

  deleteDocumentFromRepository(item){
    const index = this.documents.findIndex(p => p.ID === item.ID);
    this.restAPIService.deleteRepository(item.ID).subscribe(response => {
      if (this.restAPIService.isSuccessResponse(response)) {
        this.documents.splice(index, 1);
        this.toastr.success('Document deleted successfully.', '', { timeOut: 5000 });
        this.repoDeliverable = this.gData(this.projects);
      } else {
        this.toastr.error('Could not delete document.');
      }
    });
  }

  deleteData(repoItem, Identifier){
    const fileCount = this.titleArr.filter(a => a === repoItem.Title);
    if (confirm('Are you sure you want to delete this document?')) {
      if (repoItem.hasOwnProperty('activityId')){
        const filteredActivity = this.activities.filter(e => e.ID === repoItem.activityId);
        const activityDocs = JSON.parse(filteredActivity[0].ActivityFileNames);
        if (activityDocs.length){
          const activityDocIndex = activityDocs.findIndex(x => x === repoItem.Title);
          activityDocs.splice(activityDocIndex, 1);
          const activityObj = {
            // __metadata : { type: repoItem.__metadata.type || 'SP.Data.ActivityListDataListItem' },
            __metadata: {type: 'SP.Data.ActivityListListItem'},
            ActivityFileNames : JSON.stringify(activityDocs)
          };
          this.restAPIService.updateActivity(activityObj, repoItem.activityId).subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              if (fileCount.length > 1){
                this.toastr.success('Document deleted successfully', '', { timeOut: 5000 });
                const projectRepo = this.repoDeliverable.filter(item => item.Identifier === Identifier);
                const itemIndex = projectRepo[0].DocumentData.findIndex(d => d.activityId === repoItem.activityId);
                projectRepo[0].DocumentData.splice(itemIndex, 1);
                const i = this.repoDeliverable.findIndex(indx => indx.Identifier === projectRepo[0].Identifier);
                this.repoDeliverable[i] = projectRepo[0];
                this.documentLength = this.documentLength - 1;
              }else{
                this.deleteDocumentFromRepository(repoItem);
              }
            }
          });
        }
      }

      if (repoItem.hasOwnProperty('projectId')){
        const filteredProjects = this.projects.filter(e => e.ID === repoItem.projectId);
        const projectDocs = filteredProjects[0].ProjectFilenames;
        const financialDataDocs = filteredProjects[0].financialDataFilenames;
        if (projectDocs && projectDocs.length) {
          const projectDocIndex = projectDocs.findIndex(x => x === repoItem.Title);
          const projectRepo = this.repoDeliverable.filter(item => item.Identifier === Identifier);
          projectDocs.splice(projectDocIndex, 1);
          this.projectModel.ID = filteredProjects[0].ID;
          this.projectModel.ProjectFilenames = projectDocs;
          // tslint:disable-next-line:max-line-length
          this.restAPIService.updateProject({__metadata: { type: 'SP.Data.ProjectGeneralListItem' }, ProjectFilenames: JSON.stringify(projectDocs)}, this.projectModel.ID).subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              if (fileCount.length > 1){
                this.toastr.success('Document deleted successfully', '', { timeOut: 5000 });
                const itemIndex = projectRepo[0].DocumentData.findIndex(d => d.projectId === repoItem.projectId);
                projectRepo[0].DocumentData.splice(itemIndex, 1);
                const i = this.repoDeliverable.findIndex(indx => indx.Identifier === projectRepo[0].Identifier);
                this.repoDeliverable[i] = projectRepo[0];
                this.documentLength = this.documentLength - 1;
              }else{
                this.deleteDocumentFromRepository(repoItem);
              }
            }
          });
        }

        if (financialDataDocs && financialDataDocs.length) {
          console.log('financialDataDocs', financialDataDocs);
          const financialDataDocIndex = financialDataDocs.findIndex(x => x === repoItem.Title);
          const projectRepo = this.repoDeliverable.filter(item => item.Identifier === Identifier);
          projectDocs.splice(financialDataDocIndex, 1);
          this.projectModel.ID = filteredProjects[0].ID;
          this.projectModel.financialDataFilenames = projectDocs;
          // tslint:disable-next-line:max-line-length
          this.restAPIService.updateProject({__metadata: { type: 'SP.Data.ProjectGeneralListItem' }, financialDataFilenames: JSON.stringify(projectDocs)}, this.projectModel.ID).subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              if (fileCount.length > 1){
                this.toastr.success('Document deleted successfully', '', { timeOut: 5000 });
                const itemIndex = projectRepo[0].DocumentData.findIndex(d => d.projectId === repoItem.projectId);
                projectRepo[0].DocumentData.splice(itemIndex, 1);
                const i = this.repoDeliverable.findIndex(indx => indx.Identifier === projectRepo[0].Identifier);
                this.repoDeliverable[i] = projectRepo[0];
                this.documentLength = this.documentLength - 1;
              }else{
                this.deleteDocumentFromRepository(repoItem);
              }
            }
          });
        }
      }
    }
  }

  changeFilteredDataStatus(event){
    if (!event){
      for (const docItem of this.repoDeliverable) {
        docItem.showItem = true;
        for (const data of docItem.DocumentData) {
          data.showItem = true;
          docItem.visibleChildrenCount = docItem.DocumentData.length;
        }
      }
    }
  }

  public filterDataFn(items, searchString) {
    searchString = searchString.toLowerCase();
    for (const docItem of items) {
      // tempItem = docItem;
      docItem.showItem = false;
      docItem.visibleChildrenCount = 0;
      for (const topLevelProp of this.filterByFields) {
          if (docItem[topLevelProp] && docItem[topLevelProp].toLowerCase().indexOf(searchString) !== -1) {
            docItem.showItem = true;
            for (const data of docItem.DocumentData) {
              data.showItem = true;
              docItem.visibleChildrenCount++;
            }
            break;
          }
      }
      if (!docItem.showItem) {
        for (const data of docItem.DocumentData) {
          data.showItem = false;
          for (const projectDataKey of  this.filterProjectData) {
            if (data[projectDataKey] && data[projectDataKey].toLowerCase().indexOf(searchString) !== -1) {
              docItem.showItem = true;
              data.showItem = true;
              docItem.visibleChildrenCount++;
              break;
            }
          }
        }
      }
    }
    return items;
  }
  showVisibleActivityCount(category) {
    if (category.visibleChildrenCount !== undefined) {
      return category.visibleChildrenCount;
    } else {
      return category.DocumentData.length;
    }
  }
  exportToCSV() {
    // {av: 'Name', dv: 'Project Name'},
    // {av: 'Identifier', dv: 'Project Number'},
    // {av: 'CreationDate', dv: 'Project Start Date'},
    // {av: 'Requested_Award_Date', dv: 'Requested Award Date'},
    // {av: 'PR_to_Contracts_Date', dv: 'PR to Contracts Date'},
    // {av: 'DocumentTitle', dv: 'Document Name'},
    // {av: 'Category', dv: 'Document Type'},
    // {av: 'DocumentType', dv: 'Document Format'},
    // {av: 'Modified', dv: 'Modified Date'},
    // {av: 'Title', dv: 'Modified by'},
    // {av: 'Created', dv: 'Date Created'}
    const csvExporter = new ExportToCsv(this.csvOptions);
    const exportData: any = [];
    for (const project of this.repoDeliverable) {
      for (const docDetail of project.DocumentData) {
        if (project.hasOwnProperty('Name')){
          const docObj: any = {};
          if (this.filterValue){
            if (project.showItem && docDetail.showItem){
              docObj['Project Name'] = project.Name || '';
              docObj['Project Number'] = project.Identifier || '';
              docObj['Project Start Date'] = project.CreationDate || '';
              docObj['Requested Award Dat'] = project.Requested_Award_Date || '';
              docObj['PR to Contracts Date'] = project.PR_to_Contracts_Date || '';
              docObj['Document Name'] = docDetail.DocumentTitle || '';
              docObj['Document Type'] = docDetail.Category || '';
              docObj['Document Format'] = docDetail.DocumentType || '';
              docObj['Modified Date'] = moment(docDetail.Modified).format(AppConstants.AP3DateFormat) || '';
              docObj['Modified by'] = docDetail.Editor.Title || '';
              docObj['Date Created'] = moment(docDetail.Created).format(AppConstants.AP3DateFormat) || '';
              exportData.push(docObj);
            }
          }else{
            docObj['Project Name'] = project.Name || '';
            docObj['Project Number'] = project.Identifier || '';
            docObj['Project Start Date'] = project.CreationDate || '';
            docObj['Requested Award Dat'] = project.Requested_Award_Date || '';
            docObj['PR to Contracts Date'] = project.PR_to_Contracts_Date || '';
            docObj['Document Name'] = docDetail.DocumentTitle || '';
            docObj['Document Type'] = docDetail.Category || '';
            docObj['Document Format'] = docDetail.DocumentType || '';
            docObj['Modified Date'] = moment(docDetail.Modified).format(AppConstants.AP3DateFormat) || '';
            docObj['Modified by'] = docDetail.Editor.Title || '';
            docObj['Date Created'] = moment(docDetail.Created).format(AppConstants.AP3DateFormat) || '';
            exportData.push(docObj);
          }
        }
      }
    }
    if (exportData.length) {
      csvExporter.generateCsv(exportData);
    }
  }

}
