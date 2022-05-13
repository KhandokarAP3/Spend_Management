import { EventEmitter, Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { MyFilterPipe, ObjectFilterPipe } from '../pipes/pipes';
import { AppConstants } from '../AppConstants';
import * as moment from 'moment';
declare var _spPageContextInfo;
@Injectable()
export class CommonService {
  public hideDashboardLink: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient, private searchFilter: MyFilterPipe, private objectFilterPipe: ObjectFilterPipe, private injector: Injector) {
    this.roleBasedActivityPrivilege = this.roleBasedProjectPrivilege;
    this.roleBasedActionItemsPrivilege = this.roleBasedProjectPrivilege;
    this.currentUserEditables = this.getCurrentUserEditablesFromLocalStorage();
    CommonService.injectorInstance = injector;
    for (let i = 1; i <= 31; i++) {
      if (i <= 7) {
        // this.durationUnitValueMap.Weeks.push(i);
        // this.durationUnitValueMap.Months.push(i);
        this.durationUnitValueMap.Days.push(i);
      } else if (i <= 12) {
        // this.durationUnitValueMap.Months.push(i);
        this.durationUnitValueMap.Days.push(i);
      } else {
        this.durationUnitValueMap.Days.push(i);
      }
    }
  }
  public static injectorInstance: Injector;
  public isSomethingUnsaved = false;
  public preventNavigation = false;
  private currentUserEditables: any = null;
  sidebarLinks = {
    home: [
      {
        text: 'Contract Administration',
        link: '#'
      },
      {
        text: 'Contract Management/Oversight',
        link: '#'
      },
      {
        text: 'Spend Management',
        link: '#'
      },
      {
        text: 'Modifications',
        link: '#'
      },
      {
        text: 'Closeout',
        link: '#'
      }
    ],
    projects: [
      {
        text: 'Contract Administration',
        link: '#'
      },
      {
        text: 'Contract Management/Oversight',
        link: '#'
      },
      {
        text: 'Spend Management',
        link: '#'
      },
      {
        text: 'Modifications',
        link: '#'
      },
      {
        text: 'Closeout',
        link: '#'
      }
    ]
  };
  timepickerUrl = _spPageContextInfo.webAbsoluteUrl + '/_api/web/siteusers';
  httpOptions = {
    headers: new HttpHeaders({
      Accept: 'application/json;odata=verbose'
    })
  };
  currentUserRole: any[];
  topLevelMetricTeammateFilterRoles = [
    'Requirements Owner',
    'Contract Officer',
    'Contract Officer Representative',
    'Contract Specialist',
    'Program Manager',
    'Program Analyst',
    'Support Contractor'
  ];
  roleWiseAccess = {
    'Requirements Owner': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Contract Officer': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Contract Officer Representative': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Contract Specialist': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Program Manager': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Program Analyst': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'Support Contractor': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC],
    'CPI Administrator': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC, AppConstants.WidgetNames.WORKLOAD_TRACKING_DASHBOARD_METRIC],
    'SSC Administrator': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.ACTIVITY_STATUS_DASHBOARD_METRIC, AppConstants.WidgetNames.PROJECTS_METRIC, AppConstants.WidgetNames.WORKLOAD_TRACKING_DASHBOARD_METRIC],
    'Head of Contracting Activity': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD, AppConstants.WidgetNames.WORKLOAD_TRACKING_DASHBOARD_METRIC],
    'Senior Procurement Executive': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD, AppConstants.WidgetNames.WORKLOAD_TRACKING_DASHBOARD_METRIC],
    'Program Director': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD, AppConstants.WidgetNames.WORKLOAD_TRACKING_DASHBOARD_METRIC],
    'First Line Manager(s)': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD],
    'Financial Management (Budget Execution)': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD],
    'Financial Management': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD],
    'Quality Assurance/Compliance': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD],
    'Quality Assurance Compliance': [AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETION, AppConstants.WidgetNames.NUMBER_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.TOTAL_DOLLAR_AMOUNT_OF_ACTIVE_PROJECTS, AppConstants.WidgetNames.NUMBER_OF_PROJECTS_WITH_EXPIRING_FUNDS, AppConstants.WidgetNames.BUDGET_PROGRESS, AppConstants.WidgetNames.PROJECTS_BY_WORK_CATEGORY_METRIC, AppConstants.WidgetNames.AVERAGE_TIME_TO_COMPLETE_DASHBOARD]
  };
  roleBasedProjectPrivilege = {
    Administrator: 'CRUD',
    'CPI Administrator': 'CRUD',
    'SSC Administrator': 'CRUD',
    'Requirements Owner': 'CRUD',
    'Contract Officer': 'CRUD',
    'Contract Officer Representative': 'CRUD',
    'Contract Specialist': 'CRUD',
    'Support Contractor': 'CRU',
    'Program Analyst': 'CRU',
    'Program Manager': 'CR',
    'Financial Management': 'R',
    'First Line Manager(s)': 'R',
    'Head of Contracting Activity': 'R',
    'Program Director': 'R',
    'Quality Assurance Compliance': 'R',
    'Senior Procurement Executive': 'R'
  };
  typeToWorkCategoryMap = {
    'Contract Management Plan (CMP)/Contract Administration Plan (CAP)': ['Contract Administration'],
    'Government Furnished Property (GFP)': ['Contract Administration'],
    'Government Furnished Information (GFI)': ['Contract Administration'],
    'Consent to Travel (CTT)': ['Contract Administration'],
    'Consent to Purchase (CTP)': ['Contract Administration'],
    'Contract Modification': ['Contract Performance Revisions'],
    'Contract Closeouts': ['Contract Completion and Closeout'],
    Deliverable: ['Contract Administration'],
    'Plan/Monitor Post-Award Orientation': ['Contract Management/Oversight'],
    'Quality Assurance Surveillance Plan (QASP)': ['Contract Management/Oversight'],
    'Inspection Checklist': ['Contract Management/Oversight'],
    'Support for Contractor Performance Assessment Rating System (CPARS)': ['Contract Management/Oversight'],
    'Performance Incentive': ['Contract Management/Oversight'],
    Other: ['Contract Administration', 'Contract Management/Oversight', 'Modifications', 'Closeout']
  };
  roleBasedActivityPrivilege = null;
  roleBasedInvoicesPrivilege = null;
  roleBasedContractorsPrivilege = null;
  roleBasedActionItemsPrivilege = null;
  roleBasedEmailTemplatePrivilege = { 'SSC Administrator': 'CRUD' };
  status = [
    AppConstants.REQ_DEV,
    AppConstants.MARKET_RESEARCH,
    AppConstants.ACQ_PLAN,
    AppConstants.PROC_PCKG,
    AppConstants.SUBMITTED,
    AppConstants.AWARDED,
    AppConstants.INACTIVE
  ];

  templateStatus = [
    AppConstants.ALL,
    AppConstants.REQ_DEV,
    AppConstants.MARKET_RESEARCH,
    AppConstants.ACQ_PLAN,
    AppConstants.PROC_PCKG
  ];

  fundingStatus = [
    'Unfunded Requirement',
    'Budgeted',
    'Reserved',
    'Committed'
  ];
  selectTriggerOptions: any[] = ['Before Due Date', 'After Receipt Date'];
  durationUnitValueMap = {
    Days: []
    // Weeks: [],
    // Months: []
  };
  priorities = [
    'High',
    'Medium',
    'Low'
  ];
  // activityStatus = [
  //   'Pending',
  //   'In-Process',
  //   'Completed'
  // ];
  activityStatus = [
    'To-do',
    'In-progress',
    'Manager Review',
    'Completed'
  ];
  activityPriority = [
    'High',
    'Medium',
    'Low'
  ];
  contractType = [
    'Firm-fixed-price',
    'Fixed-price with economic price adjustment',
    'Fixed-price incentive',
    'Fixed-price with prospective price re-determination',
    'Fixed-ceiling-price with retroactive price re-determination',
    'Firm-fixed-price, level-of-effort term',
    'Cost',
    'Cost-sharing',
    'Cost-plus-incentive-fee',
    'Cost-plus-award-fee',
    'Cost-plus-fixed-fee',
    'Blanket purchase agreement',
    'Definite-quantity',
    'Requirement',
    'Indefinite Quantity Indefinite Delivery',
    'Time-and-materials',
    'Labor-hour',
    'Letter',
    'Hybrid'
  ];

  inputFieldPattern = '^((.|\n)){0,255}$';
  textAreaPattern = '^((.|\n)){0,500}$';
  phonePattern: any = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
  teamMates = [];
  allTeamMates = [];
  teamMateObjs = [];
  validationErrorMessage = 'Please enter all required information';


  getTeamMates(term: string) {
    console.log(this.timepickerUrl, this.httpOptions);
    if (term === '') {
      return of([]);
    } else if (this.teamMates && this.teamMates.length > 0) {
      return of(this.searchObj(this.teamMates, term));
    }
    return this.http.get(this.timepickerUrl,
      this.httpOptions).pipe(
        map((response: any) => {
          console.log('PeoplePicker Response = ', response);
          // check response object and return
          for (const user of response.d.results) {
            this.teamMates.push(user.Title);
            this.allTeamMates.push(user);
          }
          return this.searchObj(this.teamMates, term);
        })
      );
  }
  public searchObj(array, searchString) {
    return this.searchFilter.transform(array, searchString);
  }

  getSidebarLinks() {
    return new Observable((observer) => {
      observer.next(this.sidebarLinks);
      observer.complete();
      /*if (this.sidebarLinks !== null) {
        observer.next(this.sidebarLinks);
        observer.complete();
      } else {
        this.http.get('/assets/sidebar-links.json').subscribe((response: any) => {
          this.sidebarLinks = response;
          observer.next(this.sidebarLinks);
          observer.complete();
        }, error => {
          observer.next({});
          observer.complete();
        });
      }*/
    });
  }

  getCurrentUserEditablesFromLocalStorage() {
    if (this.currentUserEditables === null) {
      const currentUserEditablesStr = localStorage.getItem('Editables');
      if (currentUserEditablesStr !== null) {
        this.currentUserEditables = JSON.parse(currentUserEditablesStr);
      } else {
        this.currentUserEditables = {};
      }
    }
    return this.currentUserEditables;
  }

  checkPrivilege(privilege, type) {
    if (!this.currentUserRole || this.currentUserRole.length === 0) {
      return false;
    }
    for (const role of this.currentUserRole) {
      if (type?.toLowerCase() === 'projects' && this.roleBasedProjectPrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      } else if (type?.toLowerCase() === 'activities' && this.roleBasedActivityPrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      } else if (type?.toLowerCase() === 'invoices' && this.roleBasedInvoicesPrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      } else if (type?.toLowerCase() === 'contractors' && this.roleBasedContractorsPrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      } else if (type?.toLowerCase() === 'actionitems' && this.roleBasedActionItemsPrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      } else if (type?.toLowerCase() === 'emailtemplates' && this.roleBasedEmailTemplatePrivilege[role]?.indexOf(privilege) > -1) {
        return true;
      }
    }
    return false;
  }

  isOwner(obj: any) {
    return obj?.AuthorId === _spPageContextInfo.userId;
  }

  canCreate(type) {
    return this.checkPrivilege('C', type);
  }

  canView(type) {
    return this.checkPrivilege('E', type) || this.checkPrivilege('R', type);
  }

  canEdit(type) {
    return this.checkPrivilege('U', type);
  }

  canDelete(type) {
    return this.checkPrivilege('D', type);
  }

  setCurrentUserEditablesFromLocalStorage(obj) {
    return localStorage.setItem('AP_Editables', JSON.stringify(obj));
  }

  getDescendantPropValue(obj: any, modelName) {
    console.log('modelName ' + modelName);
    const arr = modelName.split('.');
    let val = obj;
    for (const propName of arr) {
      if (val[propName] !== undefined) {
        val = val[propName];
      } else {
        return null;
      }
    }
    console.log('Val values final  : ' + JSON.stringify(val));
    return val;
  }

  isCurrentUserRole(role) {
    if (this.currentUserRole) {
      return this.currentUserRole.indexOf(role) >= 0;
    }
    return false;
  }

  isUserCPIAdministrator() {
    return this.isCurrentUserRole('CPI Administrator');
  }
  isUserSystemUser() {
    return this.isCurrentUserRole('System User');
  }
  isUserSSCAdministrator() {
    return this.isCurrentUserRole('SSC Administrator');
  }
  isUserHeadOfContractingActivity() {
    return this.isCurrentUserRole('Head of Contracting Activity');
  }
  isUserSeniorProcurementExecutive() {
    return this.isCurrentUserRole('Senior Procurement Executive');
  }
  isUserProgramDirector() {
    return this.isCurrentUserRole('Program Director');
  }
  isUserQualityAssuranceCompliance() {
    return this.isCurrentUserRole('Quality Assurance Compliance');
  }

  isSet(t) {
    return t !== '' && t !== undefined && t !== 'undefined' && t !== null;
  }

  canDeleteProjects(obj?) {
    return this.isOwner(obj) || this.canDelete('projects');
  }

  canCreateProjects() {
    return this.canCreate('projects');
  }

  canCreateDocuments() {
    return this.canCreate('documents');
  }

  canViewProjects(obj?) {
    return this.isOwner(obj) || this.canView('projects');
  }

  canEditProjects(obj?) {
    return this.isOwner(obj) || this.canEdit('projects');
  }
  canEditDocuments(obj?) {
    return this.isOwner(obj) || this.canEdit('documents');
  }

  canCreateActivities() {
    return this.canCreate('activities');
  }

  canViewActivities(obj?) {
    return this.isOwner(obj) || this.canView('activities');
  }

  canEditActivities(obj?) {
    return this.isOwner(obj) || this.canEdit('activities');
  }

  canDeleteActivities(obj?) {
    return this.isOwner(obj) || this.canDelete('activities');
  }

  validateDateOnBlur(object, dateKey) {
    if (!object[dateKey]) {
      object[dateKey] = null;
      delete object[dateKey + 'ERROR'];
      return;
    }
    if (!AppConstants.AP3DateRegex.test(object[dateKey])) {
      // object[dateKey] = '';
      object[dateKey + 'ERROR'] = 'Please enter the following date format: MM-DD-YYYY';
    } else {
      object[dateKey + 'ERROR'] = null;
    }
  }

  getTeamMateObjs(term: string) {
    if (term === '') {
      return of([]);
    } else if (this.teamMateObjs && this.teamMateObjs.length > 0) {
      return of(this.objectFilterPipe.transform(this.teamMateObjs, 'Title', term));
    }
    return this.http.get(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/siteusers`,
      this.httpOptions).pipe(
        map((response: any) => {
          for (const user of response.d.results) {
            this.teamMateObjs.push(user);
          }
          return this.objectFilterPipe.transform(this.teamMateObjs, 'Title', term);
        })
      );
  }

  public searchPeople = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.getTeamMates(term).pipe(
          catchError(() => {
            return of([]);
          })
        )
      )
    )

  public searchPeopleObj = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.getTeamMateObjs(term).pipe(
          catchError(() => {
            return of([]);
          })
        )
      )
    )

  public peopleFormatter = (obj) => {
    return obj.Title;
  }
  public selectedValueFormatter = (obj) => {
    return obj.Email;
  }

  allowSettings() {
    return this.isUserCPIAdministrator() || this.isUserSSCAdministrator();
  }

  getUserNotificationRequestFilter() {
    return `(substringof('${_spPageContextInfo.userDisplayName}',Target) or substringof('${_spPageContextInfo.userEmail}',Target))`;
    // let filter = `(Target eq '${_spPageContextInfo.userDisplayName}')`;
    // if (_spPageContextInfo.userEmail) {
    //   filter += ` or (Target eq '${_spPageContextInfo.userEmail}')`;
    // }
    // console.log({filter});
    // return `(${filter})`;
  }

  compareStartAndEndDates(startDate, endDate) {
    const stDate = moment(startDate, AppConstants.AP3DateFormat);
    const endDt = moment(endDate, AppConstants.AP3DateFormat);
    return endDt.diff(stDate, 'days') >= 0;
  }

  compareStartAndEndDatesEarlier(startDate, endDate) {
    const stDate = moment(startDate, AppConstants.AP3DateFormat);
    const endDt = moment(endDate, AppConstants.AP3DateFormat);
    return endDt.diff(stDate, 'days') <= 0;
  }

  compareActionItemsDateWithMainDate(mainDate, completionDate?, subDate?, type?) {
    if (type === 'startDate') {
      const stDate = moment(mainDate, AppConstants.AP3DateFormat);
      const lastDt = moment(subDate, AppConstants.AP3DateFormat);
      const completionDates = moment(completionDate, AppConstants.AP3DateFormat);
      // let diff = lastDt.diff(stDate, 'days');
      if (lastDt.startOf('day').isSameOrAfter(stDate.startOf('day')) && lastDt.startOf('day').isSameOrBefore(completionDates.startOf('day'))) {
        return false;
      }
      else {
        return true;
      }
    }
    else {
      const stDate = moment(mainDate, AppConstants.AP3DateFormat);
      const lastDt = moment(subDate, AppConstants.AP3DateFormat);
      const completionDates = moment(completionDate, AppConstants.AP3DateFormat);
      if (stDate.startOf('day').isSameOrAfter(lastDt.startOf('day')) && completionDates.startOf('day').isSameOrBefore(lastDt.startOf('day'))) {
        return false;
      }
      else {
        return true;
      }
    }
  }
  canCreateInvoices() {
    return this.canCreate('invoices');
  }
  canViewInvoices(obj?) {
    return this.isOwner(obj) || this.canView('invoices');
  }
  canEditInvoices(obj?) {
    return this.isOwner(obj) || this.canEdit('invoices');
  }
  canDeleteInvoices(obj?) {
    return this.isOwner(obj) || this.canDelete('invoices');
  }
  canCreateContractors() {
    return this.canCreate('contractors');
  }
  canViewContractors(obj?) {
    return this.isOwner(obj) || this.canView('contractors');
  }
  canEditContractors(obj?) {
    return this.isOwner(obj) || this.canEdit('contractors');
  }
  canDeleteContractors(obj?) {
    return this.isOwner(obj) || this.canDelete('contractors');
  }
  canCreateActionItems() {
    return this.canCreate('actionItems');
  }
  canViewActionItems(obj?) {
    return this.isOwner(obj) || this.canView('actionItems');
  }
  canEditActionItems(obj?) {
    return this.isOwner(obj) || this.canEdit('actionItems');
  }
  canDeleteActionItems(obj?) {
    return this.isOwner(obj) || this.canDelete('actionItems');
  }
  canDeleteEmailTemplate(obj?) {
    return this.isOwner(obj) || this.canDelete('emailtemplates');
  }

  allowRouteNavigation(route, state) {
    if (state.url.startsWith('/user-settings')) {
      return this.allowSettings();
    } else if (state.url.startsWith('/projects')) {
      if (route.queryParams?.mode === 'edit') {
        return this.canEditProjects() || this.currentUserEditables?.projects[route.params.projectid];
      } else if (route.queryParams?.mode === 'create') {
        return this.canCreateProjects();
      }
      return this.canViewProjects();
    } else if (state.url.startsWith('/activities')) {
      if (route.queryParams?.mode === 'edit') {
        return this.canEditActivities() || this.currentUserEditables?.activities[route.params.activityId];
      } else if (route.queryParams?.mode === 'create') {
        return this.canCreateActivities();
      }
      return this.canViewActivities();
    } else if (state.url.startsWith('/invoices')) {
      if (route.queryParams?.mode === 'edit') {
        return this.canEditInvoices() || this.currentUserEditables?.invoices[route.params.invoiceId];
      } else if (route.queryParams?.mode === 'create') {
        return this.canCreateInvoices();
      }
      return this.canViewInvoices();
    } else if (state.url.startsWith('/contractors')) {
      if (route.queryParams?.mode === 'edit') {
        return this.canEditContractors();
      } else if (route.queryParams?.mode === 'create') {
        return this.canCreateContractors();
      }
      return this.canViewContractors();
    } else if (state.url.startsWith('/action-item')) {
      if (route.queryParams?.mode === 'edit') {
        return this.canEditActionItems();
      } else if (route.queryParams?.mode === 'create') {
        return this.canCreateActionItems();
      }
      return this.canViewActionItems();
    }
    return true;
  }

  // updateNotifications

  sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  public isNotUndefinedNullOrEmpty(object) {
    var isUndefinedOrNull = false;
    if (object !== '') {
      if (object !== null) {
        if (object !== undefined) {
          isUndefinedOrNull = true;
        }
      }
    }
    return isUndefinedOrNull;
  }

  public isNotUndefinedOrNull(object) {
    var isUndefinedOrNull = false;
    if (object !== null) {
      if (object !== undefined) {
        isUndefinedOrNull = true;
      }
    }
    return isUndefinedOrNull;
  }
}
