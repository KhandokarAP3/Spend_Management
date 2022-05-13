import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import { CommonService } from './common.service';
import { ObjectOperationsService } from './object-operations.service';
import { NotificationConfiguration } from '../models/notification.model';
import { AppConstants } from 'src/app/AppConstants';

declare const _spPageContextInfo: any;
declare const $;

@Injectable()
export class RESTAPIService {
  allUsers = null;
  headers = new HttpHeaders();
  headersForUpdate = new HttpHeaders();
  headersForDelete = new HttpHeaders();
  documentLibrary = 'Document Repository';
  requestDigest = null;
  public refreshNotifications: EventEmitter<any> = new EventEmitter();
  public sendAssignUserDetailsForActionItems: EventEmitter<any> = new EventEmitter();

  // REST API Service Constructor
  constructor(private http: HttpClient, private commonService: CommonService) {
    this.setHeaders();
  }

  setHeaders() {
    const obj: any = this.createHeaders({});
    this.headers = obj.headers;
    this.headersForUpdate = obj.updateHeaders;
    this.headersForDelete = obj.deleteHeaders;
  }

  public notifyRefreshNotification(data?) {
    this.refreshNotifications.emit({ data });
  }

  public isSet(str: any) {
    return typeof str !== 'undefined' && str !== null && str !== '';
  }
  public getUniqueId(parts = 4): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }
  public getUrlAppendString(parameters) {
    let appendUrl = '';
    if (!parameters) {
      return appendUrl;
    }
    if (this.isSet(parameters.select)) {
      appendUrl += `?$select=${parameters.select}`;
    }
    if (this.isSet(parameters.filter)) {
      if (this.isSet(appendUrl)) {
        appendUrl += `&$filter=${parameters.filter}`;
      } else {
        appendUrl += `?$filter=${parameters.filter}`;
      }
    }
    if (this.isSet(parameters.topCount)) {
      if (this.isSet(appendUrl)) {
        appendUrl += `&$top=${parameters.topCount}`;
      } else {
        appendUrl += `?$top=${parameters.topCount}`;
      }
    }
    if (this.isSet(parameters.id || parameters.ID)) {
      appendUrl += `(${parameters.id || parameters.ID})`;
    }
    if (parameters.isDelete) {
      appendUrl += `/recycle()`;
    }
    return appendUrl;
  }

  public createHeaders(headerValues?) {
    let headers = new HttpHeaders();
    let updateHeaders = new HttpHeaders();
    let deleteHeaders = new HttpHeaders();
    if (headerValues.Accept !== undefined) {
      headers = headers.set('Accept', headerValues.Accept);
      updateHeaders = updateHeaders.set('Accept', headerValues.Accept);
      deleteHeaders = deleteHeaders.set('Accept', headerValues.Accept);
    } else {
      headers = headers.set('Accept', 'application/json;odata=verbose');
      updateHeaders = updateHeaders.set('Accept', 'application/json;odata=verbose');
      deleteHeaders = deleteHeaders.set('Accept', 'application/json;odata=verbose');
    }

    if (headerValues['Content-Type'] !== undefined) {
      headers = headers.set('Content-Type', headerValues['Content-Type']);
      updateHeaders = updateHeaders.set('Content-Type', headerValues['Content-Type']);
      deleteHeaders = deleteHeaders.set('Content-Type', headerValues['Content-Type']);
    } else {
      headers = headers.set('Content-Type', 'application/json;odata=verbose');
      updateHeaders = updateHeaders.set('Content-Type', 'application/json;odata=verbose');
      deleteHeaders = deleteHeaders.set('Content-Type', 'application/json;odata=verbose');
    }

    if (headerValues['IF-MATCH'] !== undefined) {
      headers = headers.set('IF-MATCH', headerValues['IF-MATCH']);
      updateHeaders = updateHeaders.set('IF-MATCH', headerValues['IF-MATCH']);
      deleteHeaders = deleteHeaders.set('IF-MATCH', headerValues['IF-MATCH']);
    } else {
      headers = headers.set('IF-MATCH', '*');
      updateHeaders = updateHeaders.set('IF-MATCH', '*');
      deleteHeaders = deleteHeaders.set('IF-MATCH', '*');
    }
    if (headerValues['X-RequestDigest'] !== undefined) {
      headers = headers.set('X-RequestDigest', headerValues['X-RequestDigest']);
      updateHeaders = updateHeaders.set('X-RequestDigest', headerValues['X-RequestDigest']);
      deleteHeaders = deleteHeaders.set('X-RequestDigest', headerValues['X-RequestDigest']);
    } else {
      if (this.requestDigest === null) {
        this.requestDigest = $('#__REQUESTDIGEST').val();
      }
      headers = headers.set('X-RequestDigest', this.requestDigest);
      updateHeaders = updateHeaders.set('X-RequestDigest', this.requestDigest);
      deleteHeaders = deleteHeaders.set('X-RequestDigest', this.requestDigest);
    }

    if (headerValues['X-HTTP-Method'] !== undefined) {
      updateHeaders = updateHeaders.set('X-HTTP-Method', headerValues['X-HTTP-Method']);
      deleteHeaders = deleteHeaders.set('X-HTTP-Method', headerValues['X-HTTP-Method']);
    } else {
      updateHeaders = updateHeaders.set('X-HTTP-Method', 'MERGE');
      deleteHeaders = deleteHeaders.set('X-HTTP-Method', 'DELETE');
    }

    return {
      headers, updateHeaders, deleteHeaders
    };
  }

  public getDataFromResponse(response: any) {
    if (response?.d?.results) {
      return response.d.results;
    } else if (response?.d) {
      return response.d;
    } else if (response?.value) {
      return response.value;
    } else {
      return '';
    }
  }

  public isSuccessResponse(responseObj) {
    return responseObj.status === 'success';
  }

  public getSuccessResponse(data): any {
    return { status: 'success', data };
  }

  public getErrorResponse(error, message?): any {
    console.log(error);
    const errorObj: any = { status: 'failed', error };
    if (message) {
      errorObj.message = message;
    }
    return errorObj;
  }

  public updateRequestDigest() {
    console.log('updating digest');
    return new Observable(observer => {
      const headers = new HttpHeaders().set('Accept', 'application/json; odata=verbose');
      this.http.post(`${_spPageContextInfo.webAbsoluteUrl}/_api/contextinfo`, null, { headers }).subscribe((res: any) => {
        this.requestDigest = res.d.GetContextWebInformation.FormDigestValue;
        this.setHeaders();
        observer.next();
        observer.complete();
        console.log('digest refreshed successfully');
      }, error => {
        observer.next();
        observer.complete();
        console.log('could not refresh digest');
        console.log(error);
      });
    });
  }

  public sendPostRequest(url, data, httpOptions?) {
    if (!httpOptions) {
      httpOptions = {
        headers: this.headers,
      };
    }
    return new Observable((observer) => {
      this.http.post(url, data, httpOptions).subscribe((response: any) => {
        observer.next(this.getSuccessResponse(this.getDataFromResponse(response)));
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public anonymousGetCall(url) {
    return new Observable(observer => {
      this.http.get(`${url}`).subscribe(responseData => {
        observer.next(this.getSuccessResponse(responseData));
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public documentApprovalWorklfowAddApproversPostCall(url, id: number) {
    return new Observable(observer => {
      const headers = { 'Content-Type': 'application/json' };
      const body = { ID: id };
      this.http.post<any>(`${url}`, body, { headers }).subscribe(responseData => {
        observer.next(this.getSuccessResponse(responseData));
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public sendGetRequest(url, callback?): Observable<any> {
    const httpOptions = {
      headers: this.headers,
    };
    return new Observable((observer) => {
      this.http.get(url, httpOptions).subscribe((response: any) => {
        let responseData = this.getDataFromResponse(response);
        if (callback) {
          responseData = callback(responseData);
          observer.next(responseData);
        } else {
          observer.next(this.getSuccessResponse(responseData));
        }
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public sendDeleteRequest(url) {
    const httpOptions = {
      headers: this.headersForDelete,
    };
    return new Observable((observer) => {
      this.http.delete(url, httpOptions).subscribe((response: any) => {
        observer.next(this.getSuccessResponse(this.getDataFromResponse(response)));
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public deleteActivityDocument(docData: any) {
    const targetUrl = `${_spPageContextInfo.webServerRelativeUrl}/${this.documentLibrary}`;
    const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/getfilebyserverrelativeurl('${targetUrl}/${docData}')`;
    return this.sendDeleteRequest(url);
  }

  public getItemsUrlByListName(listName, parameters?) {
    return `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/GetByTitle('${listName}')/items${this.getUrlAppendString(parameters)}`;
  }

  public getURLForTutorialsPage(parameters?) {
    return this.getItemsUrlByListName('Tutorials', parameters);
  }

  public removeDolorAndComma(value) {
    return value.replace('$', '').replace(',', '');
  }

  // Project REST API functions
  public getURLForProjectGeneral(parameters?) {
    return `${this.getItemsUrlByListName('ProjectGeneral', parameters)}`;
  }

  public getURLForProjectDocumentShare(parameters?) {
    return `${this.getItemsUrlByListName('Project Document Share', parameters)}`;
  }

  public getURLForRepositoryPage(parameters?) {
    return this.getItemsUrlByListName('Document Repository', parameters);
  }

  public getURLForProjectCollaborationPage(parameters?) {
    return this.getItemsUrlByListName('Project Documents', parameters);
  }

  public getURLForDocumentTemplatePage(parameters?){
    return this.getItemsUrlByListName('DocumentTemplate', parameters);
  }

  public getURLHelpDeskArticles(parameters?) {
    return this.getItemsUrlByListName('HelpdeskArticles', parameters);
  }

  public getURLForActivities(parameters?) {
    return `${this.getItemsUrlByListName('ActivityList', parameters)}`;
  }

  // public getURLForDocumentApproval(parameters?) {
  //   return `${this.getItemsUrlByListName('DocumentApprover', parameters)}`;
  // }

  public getURLForDocumentApproval(parameters?) {
    return `${this.getItemsUrlByListName('DocumentLevelApprovalStatus', parameters)}`;
  }

  public getURLForDocumentApprovalList(parameters?) {
    return `${this.getItemsUrlByListName('DocumentApprovalUsersActions', parameters)}`;
  }

  public getURLForDocumentApprovalTriggerMapRecordsList(parameters?) {
    return `${this.getItemsUrlByListName('DocumentApprovalTriggerMap', parameters)}`;
  }

  public getURLForDocumentCategoryForAttachDocsList(parameters?) {
    return `${this.getItemsUrlByListName('WorkCategoriesForAttachDocuments', parameters)}`;
  }

  public getURLForMarketResearch(parameters?) {
    return this.getItemsUrlByListName('MarketResearch', parameters);
  }

  public getURLForRequirementsDevelopment(parameters?) {
    return this.getItemsUrlByListName('RequirementsDevelopment', parameters);
  }

  public getURLForProcurementRequestPackage(parameters?) {
    return this.getItemsUrlByListName('ProcurementRequestPackage', parameters);
  }

  public getURLForDevelopAcquisitionsPlan(parameters?) {
    return this.getItemsUrlByListName('DevelopAcquisitionsPlan', parameters);
  }

  public getURLForAquisitionsOverview(parameters?) {
    return this.getItemsUrlByListName('AquisitionsOverview', parameters);
  }

  public getURLForActivityTypes(parameters?) {
    return this.getItemsUrlByListName('ActivityTypes', parameters);
  }

  public getURLForActivityHelpFulLinks(parameters?) {
    return this.getItemsUrlByListName('HelpfulLinks', parameters);
  }

  public getURLForActivityVideoTutorials(parameters?) {
    return this.getItemsUrlByListName('VideoTutorials', parameters);
  }

  // public getURLForActivityDocumentTemplates(parameters?) {
  //   return this.getItemsUrlByListName('DocumentTemplates', parameters);
  // }

  public getURLForActivityWorkFlows(parameters?) {
    return this.getItemsUrlByListName('ActivityWorkFlows', parameters);
  }

  public getURLForProjectSoftwareLicense(parameters?) {
    return this.getItemsUrlByListName('ProjectSoftwareLicense', parameters);
  }

  public getUserRolesUrl(listName, parameters?) {
    return `${_spPageContextInfo.webAbsoluteUrl}/_api/web/currentuser/groups`;
  }

  public getURLForTemplatesPage(parameters?) {
    return this.getItemsUrlByListName('Templates', parameters);
  }

  public getURLForEmailTemplates(parameters?) {
    return this.getItemsUrlByListName('EmailTemplates', parameters);
  }

  public getURLForSettingsConfigurations(parameters?) {
    return this.getItemsUrlByListName('SettingsConfigurations', parameters);
  }

  public getURLForProfileSettings(parameters?) {
    return this.getItemsUrlByListName('ProfileSettings', parameters);
  }

  public getURLForProfileSettingsPage(parameters?) {
    return this.getItemsUrlByListName('UserProfileData', parameters);
  }

  public getProjectSoftwareLicense() {
    return this.sendGetRequest(this.getURLForProjectSoftwareLicense());
  }

  public getURLForNotificationTypes(parameters?) {
    return this.getItemsUrlByListName('NotificationTypes', parameters);
  }

  public getURLForAutoGeneratedEmailsOnDemand(parameters?) {
    return this.getItemsUrlByListName('AutoGeneratedEmailsOnDemand', parameters);
  }

  public getTemplatesPageData() {
    return this.sendGetRequest(this.getURLForTemplatesPage());
  }

  public getFilteredTemplatesPageData(filter?, select?) {
    return this.sendGetRequest(this.getURLForTemplatesPage({ filter, select }));
  }

  public getTutorialsPageData(filter?, select?) {
    return this.sendGetRequest(this.getURLForTutorialsPage({ filter, select }));
  }

  public requestDocumentApprovalWorkflowUpdate() {
    this.anonymousGetCall(AppConstants.WORKFLOW_URLS.DOC_WKFL_UPDATE_URL).subscribe((getCallResp: any) => {
      console.log('getCallResp', getCallResp);
    });
  }

  public requestDocumentApprovalWorkflowAddApprovers(id) {
    this.documentApprovalWorklfowAddApproversPostCall(AppConstants.WORKFLOW_URLS.DOC_WKFL_CREATE_APPROVERS_URL, id).subscribe((getCallResp: any) => {
      console.log('getCallResp', getCallResp);
    });
  }

  public deleteProject(projectId) {
    return new Observable(observer => {
      const httpOptions = {
        headers: this.headersForDelete,
      };
      const url = this.getURLForProjectGeneral({ id: projectId, isDelete: true });
      this.http.delete(url, httpOptions).subscribe((res) => {
        observer.next([]);
        observer.complete();
      }, error => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public getDataFromProjectGeneral(filter?, select?) {
    const parseTeamInProjects = (projects) => {
      const projectsArr = [];
      let projectObj: any;
      const currentUserEditables = this.commonService.getCurrentUserEditablesFromLocalStorage();
      currentUserEditables.projects = currentUserEditables.projects || {};

      for (const project of projects) {
        if (project.Team) {
          project.Team = JSON.parse(project.Team);
          project.isTeamProject = ObjectOperationsService.isTeamMate(_spPageContextInfo.userDisplayName, project.Team);
        }
        if (project.ProjectFilenames) {
          project.ProjectFilenames = JSON.parse(project.ProjectFilenames);
        }
        if (project.EstimatedValue) {
          project.EstimatedValue = JSON.parse(project.EstimatedValue);
        }
        if (project.Requested_Award_Date && project.Requested_Award_Date === null) {
          project.Requested_Award_Date = '';
        }
        if (project.PR_to_Contracts_Date && project.PR_to_Contracts_Date === null) {
          project.PR_to_Contracts_Date = '';
        }
        if (project.AreFundsExpiring && project.AreFundsExpiring === null) {
          project.AreFundsExpiring = '';
        } else if (project.AreFundsExpiring) {
          project.AreFundsExpiring = JSON.parse(project.AreFundsExpiring);
        }
        projectsArr.push(project);
        if (this.commonService.isOwner(project) || project.isTeamProject) {
          currentUserEditables.projects[project.ID] = true;
        }
      }
      this.commonService.setCurrentUserEditablesFromLocalStorage(currentUserEditables);
      return this.getSuccessResponse(projectsArr);
    };
    return this.sendGetRequest(this.getURLForProjectGeneral({ filter, select }), parseTeamInProjects);
  }

  public getProjectsAsPerUserRole(filter?, select?) {
    return new Observable((obserber) => {
      this.getDataFromProjectGeneral(filter, select).subscribe((res: any) => {
        if (this.isSuccessResponse(res)) {
          if (this.commonService.isUserSSCAdministrator() || this.commonService.isUserHeadOfContractingActivity() || this.commonService.isUserSeniorProcurementExecutive()
            || this.commonService.isUserProgramDirector() || this.commonService.isUserCPIAdministrator() || this.commonService.isUserQualityAssuranceCompliance()) {
            obserber.next(res);
            obserber.complete();
          } else {
            const filteredProjects: any[] = [];
            const projects: any[] = res.data;
            for (const project of projects) {
              project.isTeamProject = ObjectOperationsService.isTeamMate(_spPageContextInfo.userDisplayName, project.Team);
              if (project.isTeamProject) {
                filteredProjects.push(project);
              }
            }
            obserber.next(this.getSuccessResponse(filteredProjects));
            obserber.complete();
          }
        } else {
          obserber.next(res);
          obserber.complete();
        }
      });
    });
  }

  //NOTE: Need to validate that its okay to bypasss roles/permissions to capture list of all projects
  public getAllProjects() {
    return new Observable((observer) => {
      this.getDataFromProjectGeneral().subscribe((res: any) => {
        if (this.isSuccessResponse(res)) {
          const filteredProjects: any[] = [];
          const projects: any[] = res.data;
          for (const project of projects) {
            filteredProjects.push(project);
          }
          observer.next(this.getSuccessResponse(filteredProjects));
          observer.complete();

        } else {
          observer.next(res);
          observer.complete();
        }
      });
    });
  }

  public getActivities(filter?, select?) {
    return this.sendGetRequest(this.getURLForActivities({ filter, select }));
  }

  public deleteActivity(id) {
    return this.sendDeleteRequest(this.getURLForActivities({ id, isDelete: true }));
  }
  public getAllSiteUsers() {
    if (this.allUsers !== null) {
      return of({ status: 'success', value: this.allUsers, data: this.allUsers });
    }
    return new Observable((observer) => {
      this.http.get(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/siteusers`).subscribe((response: any) => {
        this.allUsers = this.getDataFromResponse(response);
        observer.next({ status: 'success', value: this.allUsers, data: this.allUsers });
        observer.complete();
      }, (error: any) => {
        observer.next(this.getErrorResponse(error));
        observer.complete();
      });
    });
  }

  public saveProject(projectObj) {
    return this.sendPostRequest(this.getURLForProjectGeneral(), projectObj);
  }

  public updateProject(projectObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForProjectGeneral({ id }), projectObj, httpOptions);
  }

  public updateProjectByIdentifier(Identifier, data) {
    return new Observable(observer => {
      this.getDataFromProjectGeneral(`Identifier eq '${Identifier}'`, 'ID').subscribe((projectsResponse: any) => {
        if (this.isSuccessResponse(projectsResponse)) {
          if (projectsResponse?.data.length) {
            let projectData = {__metadata: { type: 'SP.Data.ProjectGeneralListItem'}, ...data};
            this.updateProject(projectData, projectsResponse.data[0].ID).subscribe(res => {
              if (this.isSuccessResponse(res)) {
                observer.next();
                observer.complete();
              } else {
                observer.error(`Could not update project.`);
                observer.complete();
              }
            })
          }
          else {
            observer.error(`No Project details found against Identifier- ${Identifier}`);
            observer.complete();
          }
        }
      });
    });
  }

  public saveActivity(activityObj) {
    return this.sendPostRequest(this.getURLForActivities(), activityObj);
  }

  public saveDocumentForApproval(documentObj) {
    return this.sendPostRequest(this.getURLForDocumentApproval(), documentObj);
  }

  public getDocumentForApproval(filter?, select?) {
    return this.sendGetRequest(this.getURLForDocumentApproval({ filter, select }));
  }

  public deleteDocumentForApproval(id) {
    return this.sendDeleteRequest(this.getURLForDocumentApproval({ id, isDelete: true }));
  }

  public updateDocumentForApproval(documentObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForDocumentApproval({ id }), documentObj, httpOptions);
  }

  public getDocumentForApprovalList(filter?, select?) {
    return this.sendGetRequest(this.getURLForDocumentApprovalList({ filter, select }));
  }

  public updateDocumentForApprovalInList(documentObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForDocumentApprovalList({ id }), documentObj, httpOptions);
  }

  public deleteDocumentForApprovalInList(id) {
    return this.sendDeleteRequest(this.getURLForDocumentApprovalList({ id, isDelete: true }));
  }

  public getDocumentApprovalTriggerMapRecords(filter?, select?) {
    return this.sendGetRequest(this.getURLForDocumentApprovalTriggerMapRecordsList({ filter, select }));
  }

  public getDocumentCategoryForAttachDocs(filter?, select?) {
    return this.sendGetRequest(this.getURLForDocumentCategoryForAttachDocsList({ filter, select }));
  }

  public updateActivity(activityObjObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForActivities({ id }), activityObjObj, httpOptions);
  }

  public getUserRoles(filter?, select?) {
    return this.sendGetRequest(this.getUserRolesUrl({ filter, select }));
  }

  public getMarketResearchData() {
    return this.sendGetRequest(this.getURLForMarketResearch());
  }

  public getRequirementsDevelopmentData() {
    return this.sendGetRequest(this.getURLForRequirementsDevelopment());
  }

  public getProcurementRequestPackageData() {
    return this.sendGetRequest(this.getURLForProcurementRequestPackage());
  }

  public getDevelopAcquisitionsPlanData() {
    return this.sendGetRequest(this.getURLForDevelopAcquisitionsPlan());
  }

  public getAcquisitionsOverviewData() {
    return this.sendGetRequest(this.getURLForAquisitionsOverview());
  }

  public getActivityTypes(filter?, select?) {
    return this.sendGetRequest(this.getURLForActivityTypes({ filter, select }));
  }

  public getActivityHelpFulLinks(filter?, select?) {
    return this.sendGetRequest(this.getURLForActivityHelpFulLinks({ filter, select }));
  }

  public getActivityVideoTutorials(filter?, select?) {
    return this.sendGetRequest(this.getURLForActivityVideoTutorials({ filter, select }));
  }

  // public getActivityDocumentTemplates(filter?, select?) {
  //   return this.sendGetRequest(this.getURLForActivityDocumentTemplates({ filter, select }));
  // }

  public getActivityWorkFlows(filter?, select?) {
    const parseActivityWorkflows = (activityWorkflow) => {
      const activityWorkFlowArr = [];
      for (const workFlow of activityWorkflow) {
        workFlow.workflowObj = JSON.parse(workFlow.workflowObj);
        activityWorkFlowArr.push(workFlow);
      }
      return this.getSuccessResponse(activityWorkFlowArr);
    };
    return this.sendGetRequest(this.getURLForActivityWorkFlows({ filter, select }), parseActivityWorkflows);
  }

  public saveOrUpdateActivity(activityObj: any, ID?: string) {
    if (ID !== null) {
      return this.updateActivity(activityObj, ID);
    } else {
      return this.saveActivity(activityObj);
    }
  }

  public getActivityById(id) {
    return this.sendGetRequest(this.getURLForActivities({ id }));
  }

  public getProjectById(id) {
    return this.sendGetRequest(this.getURLForProjectGeneral({ id }));
  }

  public getRepositoryData(filter?, select?) {
    return this.sendGetRequest(this.getURLForRepositoryPage({ filter, select }));
  }

  public getProjectDocumentCollaborationData(filter?, select?) {
    return this.sendGetRequest(this.getURLForProjectCollaborationPage({ filter, select }));
  }

  public deleteDocumentCollaborationFileById(id) {
    return this.sendDeleteRequest(this.getURLForProjectCollaborationPage({ id, isDelete: true }));
  }

  public getDocumentTemplateRecords(filter?, select?) {
    return this.sendGetRequest(this.getURLForDocumentTemplatePage({ filter, select }));
  }

  // Document REST API functions
  public uploadFile(file, Identifier?, projectDocumentLibrary?) {
    const targetUrl = `${_spPageContextInfo.webServerRelativeUrl}/${projectDocumentLibrary || this.documentLibrary}`;
    let url = `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/GetFolderByServerRelativeUrl(@target)/Files/add(overwrite=true, url='${file.document.name}')?$expand=ListItemAllFields&@target='${targetUrl}'`;
    const formData = new FormData();
    let DocumentType;
    const fileNameParts = file.document.name.split('.');
    if (fileNameParts.length > 1) {
      DocumentType = fileNameParts[fileNameParts.length - 1];
    } else {
      DocumentType = file.document.type;
    }
    formData.append(file.name, file);
    file.document.versionComments = file.versionComments;
    file.document.documentCategory = file.documentCategory;
    if (Identifier) {
      file.document.Identifier = Identifier;
    }
    return new Observable(observer => {
      this.uploadFileSync(url, file.document).subscribe((result: any) => {
        if (this.isSuccessResponse(result)) {
          url = `${this.getItemsUrlByListName(projectDocumentLibrary || this.documentLibrary, { id: result.data.ListItemAllFields.Id })}`;
          const updateObject: any = {
            __metadata: {
              type: result.data.ListItemAllFields.__metadata.type
            },
            Category: file.type,
            Title: file.document.name,
            DocumentTitle: file.DocTitle,
            DocumentCategory: file.documentCategory,
            Status: file.status,
            VersionComment: file.versionComments,
            DocumentType
          };
          if (Identifier) {
            updateObject.Identifier = Identifier;
          }
          const obj: any = this.createHeaders({ 'IF-MATCH': result.data.ListItemAllFields.__metadata.etag });
          obj.updateHeaders = obj.updateHeaders.set('Content-Type', 'application/json;odata=verbose');
          const httpOptions = {
            headers: obj.updateHeaders,
          };
          this.http.post(url, updateObject, httpOptions).subscribe(() => {
            observer.next(this.getSuccessResponse(null));
            observer.complete();
          }, error => {
            observer.next(this.getErrorResponse(error));
            observer.complete();
          });
        }
        else {
          observer.next(result);
          observer.complete();
        }
      });
    });
  }

  uploadFileSync(url, file, formDigestValue?) {
    const getSuccessResponse = this.getSuccessResponse;
    const getDataFromResponse = this.getDataFromResponse;
    const getErrorResponse = this.getErrorResponse;
    return new Observable(observer => {
      if (!file) {
        $.ajax({
          url,
          type: 'POST',
          data: 'hello',
          async: true,
          processData: false,
          headers: {
            accept: 'application/json;odata=verbose',
            'X-RequestDigest': this.requestDigest,
            'content-length': 5
          },
          complete(data) {
            observer.next(observer.next(getSuccessResponse(getDataFromResponse(data.responseJSON))));
            observer.complete();
          },
          error(err) {
            observer.next(getErrorResponse(err));
            observer.complete();
          }
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = (evt) => {
          if (evt.target.readyState === FileReader.DONE) {
            const buffer: any = evt.target.result;
            // var completeUrl =siteUrl+ "/_api/web/GetFolderByServerRelativeUrl('"+folderUrl+"')/Files/add(url='" + filename + "',overwrite=true)";
            $.ajax({
              url,
              type: 'POST',
              data: buffer,
              async: true,
              processData: false,
              headers: {
                accept: 'application/json;odata=verbose',
                'X-RequestDigest': this.requestDigest,
                'content-length': buffer.length
              },
              complete(data) {
                observer.next(observer.next(getSuccessResponse(getDataFromResponse(data.responseJSON))));
                observer.complete();
              },
              error(err) {
                observer.next(getErrorResponse(err));
                observer.complete();
              }
            });
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }

  public deleteDocumentFromServer(docData: any) {
    const targetUrl = `${_spPageContextInfo.webServerRelativeUrl}/${this.documentLibrary}`;
    const url = `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/getfilebyserverrelativeurl('${targetUrl}/${docData}')`;
    return this.sendDeleteRequest(url);
  }

  // Document REST API functions
  public uploadFileForHelpDesk(dataObj: any, documentLibrary) {
    const dummyFileName = 'dummy_File.txt';
    let newFile;
    const targetUrl = `${_spPageContextInfo.webServerRelativeUrl}/${documentLibrary}`;
    if (dataObj.document) {
      const filePartsName = dataObj.document.name.split('.');
      newFile = new File([dataObj.document], `${filePartsName[0] + Math.random().toString(36).substring(7) + new Date().getTime()}.${filePartsName[1]}`);
      dataObj.document = newFile;
      if (documentLibrary === 'UserProfileData') {
        dataObj.ProfilePictureName = newFile.name;
      }
    }
    let url = `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/GetFolderByServerRelativeUrl(@target)/Files/add(overwrite=true, url='${dataObj.document ? dataObj.document.name : dummyFileName}')?$expand=ListItemAllFields&@target='${targetUrl}'`;
    let DocumentType;
    if (dataObj.document) {
      const fileNameParts = dataObj.document.name.split('.');
      if (fileNameParts.length > 1) {
        DocumentType = fileNameParts[fileNameParts.length - 1];
      } else {
        DocumentType = dataObj.document.type;
      }
    } else {
      const content = 'dummy file';
      const blob = new Blob([content], { type: 'text/xml' });
      // formData.append(dummyFileName, blob);
      newFile = new File([blob], dummyFileName);
      dataObj.document = newFile;
    }
    return new Observable(observer => {
      this.uploadFileSync(url, dataObj.document).subscribe((result: any) => {
        if (this.isSuccessResponse({ status: 'success', data: result })) {
          if (result) {
            url = `${this.getItemsUrlByListName(documentLibrary, { id: result.data.ListItemAllFields.Id })}`;
            const updateObject: any = {
              __metadata: {
                type: result.data.ListItemAllFields.__metadata.type
              },
              ...dataObj,
              // DocumentType: DocumentType
            };
            delete updateObject.document;
            const obj: any = this.createHeaders({ 'IF-MATCH': result.data.ListItemAllFields.__metadata.etag });
            obj.updateHeaders = obj.updateHeaders.set('Content-Type', 'application/json;odata=verbose');
            const httpOptions = {
              headers: obj.updateHeaders,
            };
            this.http.post(url, updateObject, httpOptions).subscribe(() => {
              observer.next(this.getSuccessResponse(result));
              observer.complete();
            }, error => {
              observer.next(this.getErrorResponse(error));
              observer.complete();
            });
          }
        } else {
          observer.next(result);
          observer.complete();
        }
      });
    });
  }

  public getHelpDeskArticles(filter?, select?) {
    return this.sendGetRequest(this.getURLHelpDeskArticles({ filter, select }));
  }

  public getEmailTemplates(filter?, select?) {
    return this.sendGetRequest(this.getURLForEmailTemplates({ filter, select }));
  }

  public getSettingsConfigurations(filter?, select?) {
    return this.sendGetRequest(this.getURLForSettingsConfigurations({ filter, select }));
  }

  public getNotificationTypes(filter?, select?) {
    return this.sendGetRequest(this.getURLForNotificationTypes({ filter, select }));
  }

  public updateNotificationType(notificationTypeTemplate, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForNotificationTypes({ id }), notificationTypeTemplate, httpOptions);
  }

  public deleteEmailTemplate(id) {
    return this.sendDeleteRequest(this.getURLForEmailTemplates({ id, isDelete: true }));
  }

  public deleteNotificationType(id) {
    return this.sendDeleteRequest(this.getURLForNotificationTypes({ id, isDelete: true }));
  }

  public updateConfigurationSettings(configurationObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForSettingsConfigurations({ id }), configurationObj, httpOptions);
  }

  public getEmailTemplateById(id) {
    return this.sendGetRequest(this.getURLForEmailTemplates({ id }));
  }

  public updateEmailTemplate(emailTemplate, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForEmailTemplates({ id }), emailTemplate, httpOptions);
  }

  public saveEmailTemplate(emailTemplate) {
    return this.sendPostRequest(this.getURLForEmailTemplates(), emailTemplate);
  }

  public getNotificationTypesById(id) {
    return this.sendGetRequest(this.getURLForNotificationTypes({ id }));
  }

  public saveNotificationType(emailTemplate) {
    return this.sendPostRequest(this.getURLForNotificationTypes(), emailTemplate);
  }

  public saveAutoGeneratedEmailsOnDemand(data) {
    return this.sendPostRequest(this.getURLForAutoGeneratedEmailsOnDemand(), data);
  }

  public updateAutoGeneratedEmailsOnDemand(data, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForAutoGeneratedEmailsOnDemand({ id }), data, httpOptions);
  }

  public profileSettings(profileData) {
    return this.sendPostRequest(this.getURLForProfileSettings(), profileData);
  }

  public getUserProfile(filter?, select?) {
    return this.sendGetRequest(this.getURLForProfileSettingsPage({ filter, select }));
  }

  public deleteRepository(id) {
    return this.sendDeleteRequest(this.getURLForRepositoryPage({ id, isDelete: true }));
  }

  public updateRepository(repositoryObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForRepositoryPage({ id }), repositoryObj, httpOptions);
  }

  // Notifications REST API functions
  public getURLForNotificationConfiguration(parameters?) {
    return this.getItemsUrlByListName('NotificationConfiguration', parameters);
  }

  public getURLForActionItem(parameters?) {
    return this.getItemsUrlByListName('ActionItems', parameters);
  }

  public getURLForNotes(parameters?) {
    return this.getItemsUrlByListName('Notes', parameters);
  }

  public getNotificationConfiguration(filter?, select?, topCount?) {
    const parseNotificationConfigurations = (objArr) => {
      const parsedObjArray: NotificationConfiguration[] = [];
      for (const obj of objArr) {
        parsedObjArray.push(new NotificationConfiguration(obj));
      }
      return this.getSuccessResponse(parsedObjArray);
    };
    return this.sendGetRequest(this.getURLForNotificationConfiguration({ filter, select, topCount }), parseNotificationConfigurations);
  }

  public deleteNotificationConfiguration(id) {
    return this.sendDeleteRequest(this.getURLForNotificationConfiguration({ id, isDelete: true }));
  }

  public saveNotificationConfiguration(notificationConfiguration) {
    return this.sendPostRequest(this.getURLForNotificationConfiguration(), notificationConfiguration.getObjectForSave());
  }

  public updateNotificationConfiguration(notificationConfiguration, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForNotificationConfiguration({ id }), notificationConfiguration.getObjectForSave(), httpOptions);
  }

  public deleteAllNotificationConfigurations() {
    return new Observable(observer => {
      this.getNotificationConfiguration().subscribe(response => {
        if (this.isSuccessResponse(response) && response.data.length > 0) {
          const subscriptions = [];
          for (const notification of response.data) {
            subscriptions.push(this.deleteNotificationConfiguration(notification.ID));
          }
          forkJoin(subscriptions).subscribe(responses => {
            console.log(responses);
            observer.next(responses);
            observer.complete();
          });
        } else {
          observer.next([]);
          observer.complete();
        }
      });
    });
  }

  getActionItems(filter?, select?) {
    const parseActionItem = (objArr) => {
      const parsedObjArray = [];
      for (const obj of objArr) {
        let newObj: any = {};
        newObj.title = obj.Title;
        newObj.priority = obj.Priority;
        newObj.assignedTo = obj.AssignedTo;
        newObj.status = obj.Status;
        newObj.description = obj.Description;
        newObj.ParentId = obj.ParentId;
        newObj.ID = obj.ID;
        newObj.TrackingItems = JSON.parse(obj.TrackingItems);
        parsedObjArray.push(newObj);
      }
      return this.getSuccessResponse(parsedObjArray);
    };
    return this.sendGetRequest(this.getURLForActionItem({ filter, select }), parseActionItem);
  }

  public getActionItemsById(id) {
    return this.sendGetRequest(this.getURLForActionItem({ id }));
  }

  saveActionItem(actionItemObj) {
    return this.sendPostRequest(this.getURLForActionItem(), actionItemObj);
  }

  updateActionItem(actionItemObj, id: string) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForActionItem({ id }), actionItemObj, httpOptions);
  }

  public deleteActionItem(id) {
    return this.sendDeleteRequest(this.getURLForActionItem({ id, isDelete: true }));
  }

  public getNotes(filter?, select?) {
    return this.sendGetRequest(this.getURLForNotes({ filter, select }));
  }
  public deleteNotes(id) {
    return this.sendDeleteRequest(this.getURLForNotes({ id }));
  }
  public updateNotes(noteObj, id) {
    const httpOptions = {
      headers: this.headersForUpdate
    };
    return this.sendPostRequest(this.getURLForNotes({ id }), noteObj, httpOptions);
  }
  public saveNotes(noteObj) {
    return this.sendPostRequest(this.getURLForNotes(), noteObj);
  }

  public shareDocument(documentInfo: any) {
    documentInfo.__metadata = { type: 'SP.Data.Project_x0020_Document_x0020_ShareListItem' };
    return this.sendPostRequest(this.getURLForProjectDocumentShare(), documentInfo);
  }

  // public anonymousGetCall() {
  //   return new Observable(observer => {
  //     this.http.get(`${AppConstants.getCall}`).subscribe(responseData => {
  //       observer.next(this.getSuccessResponse(responseData));
  //       observer.complete();
  //     }, (error: any) => {
  //       observer.next(this.getErrorResponse(error));
  //       observer.complete();
  //     });
  //   });
  // }
}
