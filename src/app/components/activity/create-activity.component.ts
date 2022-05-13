import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChildren,
  ElementRef,
  QueryList,
  ViewChild
} from '@angular/core';
import { RESTAPIService } from '../../services/REST-API.service';
import { CommonService } from '../../services/common.service';
import { PageComponentParentComponent } from '../../page-component-parent.component';
import { forkJoin, merge, Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { CommonDialogService } from '../../services/common-dialog.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AppConstants } from '../../AppConstants';
import * as moment from 'moment';
import { NotificationService } from 'src/app/services/notification-service';
import * as momentTZ from 'moment-timezone';

declare const _spPageContextInfo: any;
declare const $;

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  // viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  animations: [
    // the fade-in/fade-out animation.
    trigger('fadeAnimation', [

      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({ opacity: 0 }),
        animate(700)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave',
        animate(700, style({ opacity: 0 })))
    ])
  ]
})

export class CreateActivityComponent extends PageComponentParentComponent implements OnDestroy, OnInit {
  actionItem = null;
  actionItems = [];
  documentsSubmittedForApproval: any = {};
  isFormSubmitted = false;
  title: string;
  activity: any;
  navigation: any;
  mode: string;
  isViewMode = false;
  activityTypesObject: any = {};
  steps = [];
  workFlowMap: any = {};
  siteAllUsers: any;
  selectedProject: any;
  projectNameArray = [];
  projectNameToObjMap: any = {};
  allHelpfulLinks: any;
  allVideoLinks: any;
  allDocTemplates: any;
  helpfulLinks: any = [];
  videoLinks: any = [];
  documentLinks: any = [];
  uploadDocuments: any = [];
  uploadedDocuments: any = [];
  submitDocumentsForApprovalArr: any[] = [];
  isDeleteFileName: any[] = [];
  // Holds the overall document level 'sent' approval records
  submitForApprovalSPData: any[] = [];
  // Holds the granular approver level 'received' records
  documentsArr: any[] = [];
  projectParams: any = {};
  showActivityProgressBar = false;
  slideConfig = { slidesToShow: 4, slidesToScroll: 1, infinite: false };
  allActivityTypeArr: any[] = [];
  toggleEllipsisClass: any[] = [];
  paramsActivityId: any;
  isDialogShown = true;
  initialLoad = true;
  originalAssginedToUser = '';
  assignedTo = '';
  newTrackingItems = [];
  // prTrackingItems = [];
  prTrackingItem: any;
  notificationsToBeDeleted = [];
  notificationsToBeAdded = [];
  notificationsToBeEdited = [];
  origTrackingItems = [];
  documentApprovalTriggerMap = [];
  fileNameDisplayArray = [];
  /* add activitytype control for validation */
  isActivityTypeValid = true;
  // originalActionItemList = [];
  @ViewChildren('inputsDiv') inputsDivView: QueryList<ElementRef>;
  @ViewChildren('taskDiv') taskDivView: QueryList<ElementRef>;
  @ViewChildren('finalStepDiv') finalStepDivView: QueryList<ElementRef>;
  @ViewChild('slickModal') slickModal: any;
  @ViewChild('activityForm') public activityForm: NgForm;
  @ViewChild('activityTypeBtn') public activityTypeBtn: ElementRef;
  activityFormData: Subscription;
  public readonly widgetNames = AppConstants;
  workCategoryArr: any[] = [AppConstants.REQ_DEV, AppConstants.MARKET_RESEARCH, AppConstants.ACQ_PLAN, AppConstants.PROC_PCKG];
  allRepoDocumentsData: any[] = [];
  teamsArr: any = [];
  scheduledDateErrorInTrackingItems = false;
  actualReceiptDateErrorInTrackingItems = false;
  groupActivitiesByWorkCategory = {};
  groupAttachDocNamesByWorkCategory = {};
  isSubmitPRPackage = false;
  Process_PR_To_Contracts_Text = AppConstants.PROCESS_PR_TO_CONTRACTS;
  RecipientsList: any[] = [];
  isPRSubmittal = false;
  manageAssignToNotifications: NotificationService;
  manageAssignToActionItemNotifications: NotificationService;
  manageActionReqNotifications: NotificationService;
  managePRToContractsNotifications: NotificationService;
  manageUnassignToActionItemNotifications: NotificationService;


  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    return merge(debouncedText$).pipe(
      map(term => (term === '' ? this.projectNameArray
        : this.projectNameArray.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  constructor(public commonService: CommonService, private restAPIService: RESTAPIService, public route: ActivatedRoute, private toastr: ToastrService, private toaster: ToastrService, private router: Router, private commonDialogService: CommonDialogService, private cdRef: ChangeDetectorRef) {
    super();

    this.restAPIService.getRepositoryData(null, 'ID,DocumentTitle,DocumentCategory,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,Category,Status,Modified,Editor/Title&$top=5000&$expand=Editor/Title,File').subscribe((allRepoDocDataResp: any) => {
      if (this.restAPIService.isSuccessResponse(allRepoDocDataResp)) {
        this.allRepoDocumentsData = allRepoDocDataResp.data;
      }
    });

    // Create Assign To manage notifications object
    this.manageAssignToNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO);

    // Create Assign Action Items manage notifications object
    this.manageAssignToActionItemNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO_ACTION_ITEM);

    // Create Unassign Action Items manage notifications object
    this.manageUnassignToActionItemNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.UNASSIGN_TO_ACTION_ITEM);

    // Create Action Required manage notifications object
    this.manageActionReqNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ACTION_REQUIRED);

    // Create PR to Contracts manage notifications object
    this.managePRToContractsNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.PROCESS_PR_TO_CONTRACTS);


    this.navigation = this.router.getCurrentNavigation();

    if (this.navigation?.extras?.state?.Identifier) {
      this.projectParams.Identifier = this.navigation.extras.state.Identifier;
      this.projectParams.projectId = this.navigation.extras.state.projectId;
      this.projectParams.mode = this.navigation.extras.state.mode;
      this.projectParams.projectTitle = this.navigation.extras.state.projectTitle;
      this.mode = this.navigation.extras.state.mode;
    }

    if (this.navigation?.extras?.state?.actionItem) {
      this.activity = this.navigation.extras.state.Activity;
      this.mode = this.navigation.extras.state.mode;
      this.projectParams = this.navigation.extras.state.projectParams;
      this.selectedProject = this.activity.selectedProject;
      this.actionItems = this.navigation.extras.state.actionItem;
      this.fileNameDisplayArray = this.navigation?.extras?.state.parentFileNameDisplayArray;
      this.uploadDocuments = this.navigation.extras.state.uploadedDocuments;
      this.getTeamNames();
    }
    forkJoin([
      this.restAPIService.getAllSiteUsers(),
      this.restAPIService.getActivityTypes(null, AppConstants.ACTIVITY_TYPES),
      this.restAPIService.getProjectsAsPerUserRole(null, AppConstants.SELECTED_FIELD_PROJECT),
      this.restAPIService.getActivityHelpFulLinks(null, AppConstants.ACTIVITY_HELPFUL_LINKS),
      this.restAPIService.getTutorialsPageData(),
      // this.restAPIService.getActivityVideoTutorials(null, AppConstants.ACTIVITY_VIDEO_TUTORIALS),
      this.restAPIService.getTemplatesPageData(),
      // this.restAPIService.getActivityDocumentTemplates(null, AppConstants.ACTIVITY_DOCUMENT_TEMPLATES),
      this.restAPIService.getDocumentForApproval(),
      this.restAPIService.getDocumentForApprovalList(),
      this.restAPIService.getDocumentApprovalTriggerMapRecords(),
      this.restAPIService.getDocumentCategoryForAttachDocs()]).subscribe((forkJoinResponses: any) => {
        if (forkJoinResponses[0].data.length) {
          this.siteAllUsers = forkJoinResponses[0].data;
        }
        if (forkJoinResponses[1].data.length) {
          this.allActivityTypeArr = forkJoinResponses[1].data;
          for (const type of forkJoinResponses[1].data) {
            this.activityTypesObject[type.Title] = [type.WorkCategory];
          }

          if (this.allActivityTypeArr.length) {
            this.groupActivitiesByWorkCategory = this.allActivityTypeArr.reduce((r, a) => {
              r[a.WorkCategory] = r[a.WorkCategory] || [];
              r[a.WorkCategory].push(a);
              return r;
            }, Object.create(null));
          }
          this.showActivityProgressBar = true;
        }
        else {
          console.log('No Activity Type List found in SP List');
          this.showActivityProgressBar = false;
        }
        if (forkJoinResponses[2].data.length) {
          for (const project of forkJoinResponses[2].data) {
            this.projectNameArray.push(project.Title);
            this.projectNameToObjMap[project.Title] = project;
          }
          this.route.queryParams.subscribe(params => {
            this.mode = params.mode;

            if (params.mode === 'create' && !this.navigation?.extras?.state?.actionItem) {
              this.title = 'Create Activity';
              this.isViewMode = false;
              this.addActivity();
            }
            else if (params.mode === 'edit') {
              this.title = 'Update Activity';
              this.isViewMode = false;
            }
            else if (params.mode === 'view') {
              this.title = 'View Activity';
              this.isViewMode = true;
            }
            else {
              this.title = 'Create Activity';
              this.isViewMode = false;
              // this.addActivity(this.activity);
              if (this.navigation?.extras?.state) {
                this.fileNameDisplayArray = this.navigation?.extras?.state?.parentFileNameDisplayArray;
                this.uploadedDocuments = this.navigation?.extras?.state?.uploadedDocuments;
              }
            }
          });

          this.route.params.subscribe((params) => {
            if (params.activityId !== 'newactivity') {
              forkJoin([
                this.restAPIService.getActivityById(params.activityId),
                this.restAPIService.getActionItems(`ParentId eq '${params.activityId}'`)]).subscribe((res: any[]) => {
                  // this.restAPIService.getActionItems(params.activityId)]).subscribe((res: any[]) => {
                  const getActivityResponse = res[0];
                  if (this.restAPIService.isSuccessResponse(getActivityResponse)) {
                    // save original AssignedTo activity data
                    this.originalAssginedToUser = getActivityResponse.data.AssignedTo;

                    // save original Tracking item recipient information in array for comparison and identification of deltas later
                    if (getActivityResponse.data.TrackingItems) {
                      if (this.mode === 'edit') {
                        this.origTrackingItems = JSON.parse(getActivityResponse.data.TrackingItems);
                      }
                    }

                    // Original pre-modified notification information (makes tracking information accessible to header file for notification logic)
                    // The first time the page loads is the original value that may/may not be changed
                    // The second time the page loads is the new value
                    const isInitialLoad = Boolean(this.initialLoad);

                    // Use copy of 'response.data.trackingItems' to ensure there are no linkages with any data inside the array to other arrays, etc.
                    const deepCopy = JSON.parse(JSON.stringify(getActivityResponse.data.TrackingItems));
                    // Push here creates multi-dimensional array which makes it easier to maintain
                    AppConstants.notificationList.push(deepCopy);

                    const forTesting = JSON.parse(JSON.stringify(AppConstants.notificationList));
                    if (forTesting.length > 1) {
                      forTesting.shift();
                      AppConstants.notificationList = []; // clears all contents of array
                      AppConstants.notificationList = forTesting;
                    }
                    this.initialLoad = false;

                    // get activity workflows
                    this.restAPIService.getActivityWorkFlows(`ActivityTitle eq '${getActivityResponse.data.ActivityType}'`, AppConstants.ACTIVITY_WORKFLOWS).subscribe((activityWorkflow: any) => {
                      if (this.restAPIService.isSuccessResponse(activityWorkflow)) {
                        this.workFlowMap[getActivityResponse.data.ActivityType] = JSON.parse(getActivityResponse.data.WorkflowObj);
                        if (this.allHelpfulLinks && this.allHelpfulLinks.length) {
                          for (const linkObj of this.allHelpfulLinks) {
                            if (linkObj.ActivityType.results.indexOf(getActivityResponse.data.ActivityType) !== -1) {
                              this.helpfulLinks.push(linkObj);
                            }
                          }
                        }
                        if (this.allVideoLinks.length) {
                          for (const linkObj of this.allVideoLinks) {
                            if (linkObj.ActivityType !== null) {
                              if (linkObj.ActivityType.results.indexOf(getActivityResponse.data.ActivityType) !== -1) {
                                this.videoLinks.push(linkObj);
                              }
                            }
                          }
                        }
                        if (this.allDocTemplates.length) {
                          for (const linkObj of this.allDocTemplates) {
                            if (linkObj.ActivityType !== null) {
                              if (linkObj.ActivityType.results.indexOf(getActivityResponse.data.ActivityType) !== -1) {
                                this.documentLinks.push(linkObj);
                              }
                            }
                          }
                        }
                        this.addActivity(getActivityResponse.data);
                      }
                    });
                  }
                  if (this.restAPIService.isSuccessResponse(res[1])) {
                    if (!this.navigation?.extras?.state?.actionItem) {
                      this.actionItems = res[1].data;
                      // AppConstants.originalActionItemList = res[1].data;
                    }
                  }
                });
            }
            else {
              if (this.navigation?.extras?.state?.Identifier) {
                this.addActivity();
                this.activity.ProjectTitle = this.projectParams.projectTitle;
                this.activity.Identifier = this.projectNameToObjMap[this.projectParams.projectTitle].Identifier;
                this.selectedProject = this.projectNameToObjMap[this.projectParams.projectTitle];
                this.getTeamNames();
              } else if (this.navigation?.extras?.state?.ActivityType) {
                this.activity.ActivityType = this.navigation.extras.state.ActivityType;
                this.setWorkCategory(this.activity);
                if (this.activity.ActivityType === AppConstants.PROCESS_PR_TO_CONTRACTS) {
                  this.isSubmitPRPackage = true;
                }
              }
            }
          });
        }
        if (forkJoinResponses[6].data.length) {
          const tempArray = forkJoinResponses[6].data;
          for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i].OverAllStatus !== 'Cancelled') {
              if (tempArray[i].OverAllStatus !== 'Cancel') {
                this.submitForApprovalSPData.push(tempArray[i]);
              }
            }
          }
          this.updateDocumentSubmissionStatus();
        }
        if (forkJoinResponses[7].data.length) {
          this.documentsArr = forkJoinResponses[7].data;
        } else {
          console.log('No Document Approvals found in SP');
        }
        if (forkJoinResponses[3].data.length) {
          this.allHelpfulLinks = forkJoinResponses[3].data;
        }
        if (forkJoinResponses[4].data.length) {
          this.allVideoLinks = forkJoinResponses[4].data;
        }
        if (forkJoinResponses[5].data.length) {
          this.allDocTemplates = forkJoinResponses[5].data;
        }
        if (forkJoinResponses[8].data.length) {
          this.documentApprovalTriggerMap = forkJoinResponses[8].data;
        }
        if (forkJoinResponses[9].data.length) {
          this.groupAttachDocNamesByWorkCategory = forkJoinResponses[9].data.reduce((r, a) => {
            r[a.WorkCategory] = r[a.WorkCategory] || [];
            r[a.WorkCategory].push(a);
            return r;
          }, Object.create(null));
        }

        if (this.mode && this.mode !== 'view') {
          setTimeout(() => {
            this.activityFormData = this.activityForm.valueChanges.subscribe(selectedValue => {
              if (selectedValue && Object.keys(selectedValue).length) {
                this.commonService.isSomethingUnsaved = true;
              }
            });
          }, 1000);
        }
      });
  }

  ngOnInit() { }

  onChanges() {
    // Update page document upload
    for (const doc of this.fileNameDisplayArray) {
      for (const step of this.steps) {
        if (step.content && doc.documentCategory) {
          if (step.content.trim() === doc.documentCategory.trim()) {
            step.isDocumentUploaded = true;
          }
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.activityFormData) {
      this.activityFormData.unsubscribe();
    }
  }

  returnToProject() {
    this.router.navigate(['projects', this.projectParams.projectId], { queryParams: { mode: this.projectParams.mode } });
  }

  saveActivity(form: NgForm, AutoPopulatePRToContractsDate: boolean = false) {
    this.toaster.clear();
    this['isActivityTypeValid'] = true;
    if (form.invalid || !this.activity.ActivityType) {
      this.isActivityTypeValid = false;
      this.isFormSubmitted = true;
      this.toaster.error(this.commonService.validationErrorMessage);
      return false;
    }
    this.commonService.isSomethingUnsaved = false;
    // const getActivityObject: any = ObjectOperationsService.getActivityObjectForSave(this.activity);
    const getActivityObject: any = { ...this.activity };
    const ID: any = this.mode === 'create' ? null : this.activity.ID;
    // var trackingItemData: string = '';

    if (getActivityObject.ActivityFileNames) {
      getActivityObject.ActivityFileNames = JSON.stringify(this.activity.ActivityFileNames);
    }
    if (getActivityObject.WorkflowObj) {
      getActivityObject.WorkflowObj = getActivityObject.WorkflowObj !== null ? JSON.stringify(getActivityObject.WorkflowObj) : JSON.stringify({});
    }
    if (getActivityObject.TrackingItems) {

      // Stringifies tracking item values for activity save
      // getActivityObject.TrackingItems = this.addAdditionalTrackingAttributes(JSON.stringify(getActivityObject.TrackingItems));
      getActivityObject.TrackingItems = this.removeEmptyTrackingItems(JSON.stringify(getActivityObject.TrackingItems));

      // Saves all tracking values in array fromat for us later on
      this.newTrackingItems = JSON.parse(getActivityObject.TrackingItems);
    }
    if (getActivityObject.Status === 'Completed') {
      const today: any = moment().startOf('day');
      getActivityObject.ActivityMarkAsCompletedDate = today.format(AppConstants.AP3DateFormat);
    }
    else {
      getActivityObject.ActivityMarkAsCompletedDate = '';
    }
    delete getActivityObject.selectedProject;

    // getActivityObject.trackingItems = this.addAdditionalTrackingAttributes(getActivityObject.trackingItems.toString());

    getActivityObject.__metadata = { type: 'SP.Data.ActivityListListItem' };

    this.restAPIService.saveOrUpdateActivity(getActivityObject, ID).subscribe((saveOrUpdateActivityResponse: any) => {

      // Once activity is saved or updated, persist/delete additional objects/records
      if (this.restAPIService.isSuccessResponse(saveOrUpdateActivityResponse)) {
        if (AutoPopulatePRToContractsDate) {
          console.log('update project prToContractsDate to ' + moment().format(AppConstants.AP3DateFormat));
          this.restAPIService.updateProjectByIdentifier(this.activity.Identifier, { PR_to_Contracts_Date: moment().format(AppConstants.AP3DateFormat) }).subscribe(res => {
            if (!this.restAPIService.isSuccessResponse(res)) {
              this.toaster.error(`Could not update project's PR to contracts date.`);
            }
          });
        }
        this.activity.ID = this.activity.ID || saveOrUpdateActivityResponse.data.ID;
        if (this.actionItems.length) {
          this.saveActionItems();
        }

        this.saveUpdateOrDeleteDocumentsOnServer();

        // Add, edit, and delete all NOtification Configuration and AutoEmailGenerated SP list records
        if (this.mode === 'create') {
          // Adds 'ASSIGN TO' Notifications records and adds AutoGeneratedEmail records
          this.manageAssignToNotifications.postEmailsAndAddOrDeleteNotificaitonsForActivities(this.activity, this.activity.AssignedTo, this.originalAssginedToUser, this.mode);

          // Adds 'ACTION REQUIRED' tracking notifications (if any) to the Notifications Configuration SP list
          for (let iterator = 0; iterator < this.newTrackingItems.length; iterator++) {
            this.manageActionReqNotifications.saveNotificationRecord(
              this.activity.ID,
              this.newTrackingItems[iterator],
              this.mode,
              AppConstants.ACTION_REQUIRED,
              AppConstants.ACTIVITY_TYPE,
              this.activity.Title,
              '', // Activities have no description so we leave this blank
              this.activity.Identifier,
              '');
          }
        } else if (this.mode === 'edit') {
          // Adds, updates, or deletes 'ASSIGN TO' Notifications records and adds AutoGeneratedEmail records
          this.manageAssignToNotifications.postEmailsAndAddOrDeleteNotificaitonsForActivities(this.activity, this.activity.AssignedTo, this.originalAssginedToUser, this.mode);

          // Adds, updates, or deletes 'ACTION REQUIRED' tracking notifications (if any) to the Notifications Configuration SP list
          this.addUpdateOrDeleteNotifications(
            '',
            this.mode,
            AppConstants.ACTIVITY_TYPE,
            this.newTrackingItems,
            this.origTrackingItems,
            this.notificationsToBeDeleted,
            this.notificationsToBeAdded,
            this.notificationsToBeEdited);
        }
        // this.toaster.success('Activity saved successfully', '', { timeOut: 5000 });
        if (this.commonService.isNotUndefinedNullOrEmpty(this.activity) && this.activity.ActivityType === AppConstants.PROCESS_PR_TO_CONTRACTS && this.isPRSubmittal) {

          const emailList: string[] = [];
          if (this.RecipientsList.length > 1) {
            for (const item of this.RecipientsList) {
              emailList.push(item.Email);
            }
          } else {
            emailList.push(this.RecipientsList[0].Email);
          }

          const emailString = emailList.join(',');

          // Create tracking items for PR to Contracts Notification
          this.prTrackingItem = {
            addNotification: true,
            actualReceiptDate: '',
            scheduledDate: moment().format(AppConstants.AP3DateFormat),
            numberOfDays: -1,
            category: AppConstants.TrackingItemCategoryOptions.BEFORE_SCHEDULED_DATE,
            email: emailString,
            itemDescription: '',
            NotificationIdentifier: this.restAPIService.getUniqueId(),
            isScheduled: false
          };

          // Ensure that if there is already a notification in the system for today we do not duplicate it
          this.restAPIService.getNotificationConfiguration(`ParentId eq '${this.activity.ID}'`).subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              // List of existing system notification attached to this activity
              const notificationList = response.data;
              let emailCounter = 0;
              let targetList: string[] = [];

              if (notificationList.length > 0) {
                for (let iterator = 0; iterator < notificationList.length; iterator++) {
                  // 0 equals false, 1 equals true, and -1 equals partially true
                  let isNotificationRecordAlreadyInSystem = 0;
                  // Validate that received notification record is for the type we want (PR to Contracts) and has the same activity id
                  if (
                    notificationList[iterator].ParentType === AppConstants.ACTIVITY_TYPE &&
                    notificationList[iterator].ParentId === this.activity.ID &&
                    notificationList[iterator].ActivityTitle === AppConstants.PROCESS_PR_TO_CONTRACTS &&
                    notificationList[iterator].Types === AppConstants.PROCESS_PR_TO_CONTRACTS) {

                    // List of existing email targets attached to this particular notification
                    targetList = notificationList[iterator].Target ? notificationList[iterator].Target.split(',') : [];

                    // Validate that received notification record has today's date
                    for (let iteration = 0; iteration < this.RecipientsList.length; iteration++) {
                      if (this.prTrackingItem.scheduledDate === moment().format(AppConstants.AP3DateFormat)) {
                        // Compare email addresses & number of email addresses of incoming notifications to proposed email addresses
                        // and number of email addresses proposed in new notification record to be saved in DB
                        for (let number = 0; number < targetList.length; number++) {
                          if (targetList[number] === this.RecipientsList[iteration].Email) {
                            emailCounter++;
                          }
                        }
                      }
                    }

                    // After all of the above validations if the notification record in the system has the same number of emails and
                    // the exact same email addresses then we don't need to create or edit this notification record
                    if (emailCounter === targetList.length) {
                      isNotificationRecordAlreadyInSystem = 1;
                    } // If at least one email address is the same but the others are not
                    else {
                      isNotificationRecordAlreadyInSystem = -1;
                    }

                    // Updates existing notification configuration record in the system
                    if (isNotificationRecordAlreadyInSystem === -1) {
                      if (this.activity.ID) {
                        // Update existing notification AND send out PR to contract email
                        // Assumption is that there is only one PR to Contracts notification per contract/project
                        this.managePRToContractsNotifications.updateNotficationRecord(
                          this.activity.ID,
                          // this.prTrackingItems[iteration],
                          this.prTrackingItem,
                          notificationList[iterator],
                          AppConstants.EDIT_MODE,
                          AppConstants.PROCESS_PR_TO_CONTRACTS,
                          AppConstants.ACTIVITY_TYPE,
                          AppConstants.PROCESS_PR_TO_CONTRACTS,
                          '',
                          this.activity.Identifier);
                      } else {
                        console.log('Activity object id is not present. Notification can not be saved.');
                      }
                    } else if (isNotificationRecordAlreadyInSystem === 1) {
                      // Send PR to Contracts email
                      this.managePRToContractsNotifications.sendEmailForActivity(this.activity, this.RecipientsList, AppConstants.PROCESS_PR_TO_CONTRACTS, notificationList[iterator].NotificationIdentifier);
                    }
                  }
                }
              } else {
                // Create new Action Required notification
                if (this.activity.ID) {
                  this.manageActionReqNotifications.saveNotificationRecord(
                    this.activity.ID,
                    // this.prTrackingItems[iteration],
                    this.prTrackingItem,
                    AppConstants.CREATE_MODE,
                    AppConstants.PROCESS_PR_TO_CONTRACTS,
                    AppConstants.ACTIVITY_TYPE,
                    AppConstants.PROCESS_PR_TO_CONTRACTS,
                    '', // Activities have no description so we leave this blank
                    this.activity.Identifier,
                    this.prTrackingItem.email);
                } else {
                  console.log('Activity object id is not present. Notification can not be saved.');
                }
              }
            }
          });

          this.toastr.success('Your PR package has been successfully submitted.', '', { timeOut: 5000 });
          this.isPRSubmittal = false;
          // this.router.navigate(['activities']);
        }

      } else {
        // In the event that the page doesn't redirect to the activity list page - deactivate the save button so that user can't click it multiple times
        const element = document.getElementById('createActivityPageUpdateButton') as HTMLInputElement;
        if (this.isNotUndefinedNullOrEmpty(element)) {
          element.disabled = true;
        }
        const element2 = document.getElementById('createActivityPageSavebutton') as HTMLInputElement;
        if (this.isNotUndefinedNullOrEmpty(element2)) {
          element2.disabled = true;
        }
        this.toaster.success('The activity was not saved successfully. Please refresh the page and try again.', '', { timeOut: 5000 });
      }
    });

  }

  addUpdateOrDeleteNotifications(
    actionItem: any,
    mode: string,
    type: string,
    newTrackingItems: any[],
    origTrackingItems: any[],
    notificationsToBeDeleted: any[],
    notificationsToBeAdded: any[],
    notificationsToBeEdited: any[]
  ) {
    // Make changes if scheduled notifications were edited or deleted
    if (mode === 'edit') {
      // Ensure that there is something there (not undefined/null)
      if (newTrackingItems) {
        // If there was a change between the original tracking item and the new one
        if (JSON.stringify(origTrackingItems) !== JSON.stringify(newTrackingItems)) {

          // If there are any notifications to be deleted - delete them
          if (notificationsToBeDeleted.length > 0) {
            for (let iterator = 0; iterator <= notificationsToBeDeleted.length; iterator++) {
              this.manageActionReqNotifications.deleteNotificationByNotificationIdentifier(notificationsToBeDeleted[iterator]);
            }
            notificationsToBeDeleted = [];
          }
          // If there are any notifications to be added - add them
          if (notificationsToBeAdded.length > 0) {
            if (type === AppConstants.ACTIVITY_TYPE) {
              for (let iterator = 0; iterator < notificationsToBeAdded.length; iterator++) {
                this.manageActionReqNotifications.saveNotificationRecord(
                  this.activity.ID,
                  notificationsToBeAdded[iterator],
                  this.mode,
                  AppConstants.ACTION_REQUIRED,
                  type,
                  this.activity.Title,
                  '',
                  this.activity.Identifier,
                  '');
              }
            } else if (type === AppConstants.ACTION_ITEM_TYPE) {
              for (let iterator = 0; iterator < notificationsToBeAdded.length; iterator++) {
                this.manageAssignToActionItemNotifications.saveNotificationRecord(
                  actionItem.ID,
                  notificationsToBeAdded[iterator],
                  this.mode,
                  AppConstants.ACTION_REQUIRED,
                  type,
                  this.activity.Title,
                  actionItem.description,
                  this.activity.Identifier,
                  '');
              }
            }
            notificationsToBeAdded = [];
          }
          // If there are any notifications to be edited
          if (notificationsToBeEdited.length > 0) {
            if (type === AppConstants.ACTIVITY_TYPE) {
              for (let iterator = 0; iterator < notificationsToBeEdited.length; iterator++) {
                this.manageActionReqNotifications.updateNotificationRecords(
                  this.activity.ID,
                  notificationsToBeEdited,
                  this.mode,
                  AppConstants.ACTION_REQUIRED,
                  AppConstants.ACTIVITY_TYPE,
                  this.activity.Title,
                  '',
                  this.activity.ProjectTitle);
              }
            } else if (type === AppConstants.ACTION_ITEM_TYPE) {
              for (let iterator = 0; iterator < notificationsToBeEdited.length; iterator++) {
                this.manageAssignToActionItemNotifications.updateNotificationRecords(
                  actionItem.ID,
                  notificationsToBeEdited,
                  this.mode,
                  AppConstants.ACTION_REQUIRED,
                  AppConstants.ACTION_ITEM_TYPE,
                  actionItem.title,
                  actionItem.description,
                  this.activity.ProjectTitle);
              }
            }
            notificationsToBeEdited = [];
          }
        }
      }
    }
  }

  saveUpdateOrDeleteDocumentsOnServer() {
    let count = 0;
    if (this.mode === 'create') {
      if (this.uploadDocuments.length > 0) {
        for (const uploadedDoc of this.uploadDocuments) {
          this.restAPIService.uploadFile(uploadedDoc, this.activity.Identifier).subscribe((fileRes: any) => {
            if (fileRes && fileRes.status === 'success') {
              count++;
              if (count === this.uploadDocuments.length) {
                if (this.submitDocumentsForApprovalArr.length) {
                  let submitCount = 0;
                  for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                    this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                      if (this.restAPIService.isSuccessResponse(submitDocResponse)) {
                        submitCount++;
                        if (submitCount === this.submitDocumentsForApprovalArr.length) {

                          // Call Powerautomate script to pull business rules and add approvers
                          this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.data.ID);

                          if (this.projectParams.projectId) {
                            this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                            this.returnToProject();
                          }
                          else {
                            this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                            this.router.navigate(['activities']);
                          }
                        }
                      }
                    });
                  }
                }
                else {
                  if (this.projectParams.projectId) {
                    this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                    this.returnToProject();
                  }
                  else {
                    this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                    this.router.navigate(['activities']);
                  }
                }
              }
            } else {
              console.log('Upload of the following document failed: ', uploadedDoc);
            }
          });
        }
      }
      else {
        if (this.projectParams.projectId) {
          this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
          this.returnToProject();
        }
        else {
          this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
          this.router.navigate(['activities']);
        }
      }
    }
    else if (this.mode === 'edit') {
      let count = 0;
      if (this.uploadDocuments.length > 0) {
        for (const uploadedDoc of this.uploadDocuments) {
          this.restAPIService.uploadFile(uploadedDoc, this.activity.Identifier).subscribe((uploadFileResponse: any) => {
            if (uploadFileResponse && uploadFileResponse.status === 'success') {
              count++;
              if (count === this.uploadDocuments.length) {
                this.uploadDocuments = [];
                if (this.isDeleteFileName.length > 0) {
                  this.deleteActivityDocuments();
                }
                else {
                  if (this.submitDocumentsForApprovalArr.length) {
                    let submitCount = 0;
                    for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                      this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                        if (this.restAPIService.isSuccessResponse(submitDocResponse)) {

                          // Call Powerautomate script to pull business rules and add approvers
                          this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.data.ID);

                          submitCount++;
                          if (submitCount === this.submitDocumentsForApprovalArr.length) {
                            if (this.projectParams.projectId) {
                              this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                              this.returnToProject();
                            }
                            else {
                              this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                              this.router.navigate(['activities']);
                            }
                          }
                        }
                      });
                    }
                  }
                  else {
                    if (this.projectParams.projectId) {
                      this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                      this.returnToProject();
                    }
                    else {
                      this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                      this.router.navigate(['activities']);
                    }
                  }
                }
              }
            } else {
              console.log('Upload of the following document failed: ', uploadedDoc);
            }
          });
        }
      }
      else {
        if (this.isDeleteFileName.length > 0) {
          this.deleteActivityDocuments();
        }
        else {
          if (this.submitDocumentsForApprovalArr.length) {
            let submitCount = 0;
            for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
              this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                if (this.restAPIService.isSuccessResponse(submitDocResponse)) {

                  // Call Powerautomate script to pull business rules and add approvers
                  this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.data.ID);

                  submitCount++;
                  if (submitCount === this.submitDocumentsForApprovalArr.length) {
                    if (this.projectParams.projectId) {
                      this.toaster.success('Activity saved successfully', '', { timeOut: 5000 });
                      this.returnToProject();
                    }
                    else {
                      this.toaster.success('Activity saved successfully', '', { timeOut: 5000 });
                      this.router.navigate(['activities']);
                    }
                  }
                }
              });
            }
          }
          else {
            if (this.projectParams.projectId) {
              this.toaster.success('Activity updated successfully', '', { timeOut: 5000 });
              this.returnToProject();
            }
            else {
              this.toaster.success('Activity updated successfully', '', { timeOut: 5000 });
              this.router.navigate(['activities']);
            }
          }
        }
      }
    }
  }

  deleteActivityDocuments() {
    let count = 0;
    for (const toBeDeleted of this.isDeleteFileName) {
      this.restAPIService.getRepositoryData(`DocumentTitle eq '${toBeDeleted.trim()}'`, 'ID,DocumentTitle,DocumentCategory,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((repoResponse: any) => {
        if (this.restAPIService.isSuccessResponse(repoResponse)) {
          this.restAPIService.deleteDocumentFromServer(repoResponse.data[0].Title).subscribe((deleteFileResponse: any) => {
            if (deleteFileResponse.status === 'success') {
              count++;
              if (count === this.isDeleteFileName.length) {
                this.isDeleteFileName = [];
                if (this.submitDocumentsForApprovalArr.length) {
                  let submitCount = 0;
                  for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                    this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                      if (this.restAPIService.isSuccessResponse(submitDocResponse)) {
                        submitCount++;
                        if (submitCount === this.submitDocumentsForApprovalArr.length) {
                          if (this.projectParams.projectId) {
                            this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                            this.returnToProject();
                          }
                          else {
                            this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                            this.router.navigate(['activities']);
                          }
                        }
                      }
                    });
                  }
                }
                else {
                  if (this.projectParams.projectId) {
                    this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                    this.returnToProject();
                  }
                  else {
                    this.toaster.success(this.mode === 'create' ? 'Activity saved successfully' : 'Activity updated successfully', '', { timeOut: 5000 });
                    this.router.navigate(['activities']);
                  }
                }
              }
            }
          });
        }
      });
    }
    this.onChanges();
  }

  selectActivityInTimeline(activityWorkCategory: string) {
    const activeSlideClass = this.getClassName(activityWorkCategory);
    $('.activity-tab-carousel').find('.active').removeClass('active');
    $('.activity-tab-carousel').find('.' + activeSlideClass).addClass('active');
    // let findIdx;
    // const selectedSlide: any = this.slickModal.slides.find((x: any, idx: number) => {
    //   if (x && x.el && x.el.nativeElement && x.el.nativeElement.innerText && x.el.nativeElement.innerText.toLowerCase() === activityWorkCategory.toLowerCase()) {
    //     findIdx = idx;
    //     return x;
    //   }
    // });
    // if (findIdx) {
    //   this.slickModal.slickGoTo(findIdx);
    // }
    this.cdRef.detectChanges();
  }

  notesFN() {
  }

  openSubmitPackageModal() {
    if (this.activity.ActivityType === '') {
      this.toaster.error('Please select activity type before attaching a file');
      return;
    }

    // Ensure that all required document categories have been uploaded
    let counter = 0;
    for (const doc of this.fileNameDisplayArray) {
      for (const cat of AppConstants.REQ_PR_PACKAGE_DOC_CATEGORIES) {
        if (cat === doc.documentCategory) {
          counter++;
        }
      }
    }

    if (counter !== AppConstants.REQ_PR_PACKAGE_DOC_CATEGORIES.length) {
      this.toaster.error('Please upload all documents listed as required below.');
      return;
    }

    // REQ_PR_PACKAGE_DOC_CATEGORIES
    if (this.activity.ProjectTitle === '') {
      this.toaster.error('You must enter a valid Project Name before scheduling a notification.');
      return;
    }
    this.commonDialogService.openPRSubmittalDialog().subscribe((result: any) => {
      if (result) {
        this.RecipientsList = result.addRecipientsObj.RecipientsList;
        // console.log(result.AutoPopulatePRToContractsDate);
        // if (result.AutoPopulatePRToContractsDate) {
        //   this.restAPIService.updateProjectByIdentifier(this.activity.Identifier, {PR_to_Contracts_Date: moment().format(AppConstants.AP3DateFormat)}).subscribe(res => {
        //     if (!this.restAPIService.isSuccessResponse(res)) {
        //       this.toaster.error(`Could not update project's PR to contracts date.`);
        //     }
        //   });
        // }
        if (confirm('Are you sure you want to submit this PR package?')) {
          this.isPRSubmittal = true;
          this.saveActivity(this.activityForm, result.AutoPopulatePRToContractsDate);
        }
      }
    });
  }

  openAttachFileModal() {
    if (this.activity.ActivityType === '') {
      this.toaster.error('Please select activity type before attaching a file');
      return;
    }

    const activityObj = {
      type: 'activity',
      activityType: this.activity.ActivityType,
      allRepoDocData: this.allRepoDocumentsData,
      fileNameDisplayArray: this.fileNameDisplayArray,
      groupAttachDocNamesByWorkCategory: this.groupAttachDocNamesByWorkCategory,
      uploadedDocuments: this.uploadedDocuments
    };

    this.commonDialogService.openAttachFileModel(activityObj).subscribe((result: any) => {
      if (result) {
        const today: any = (moment().startOf('day').format('YYYY-MM-DD')).replace(/-/g, '');
        const currentTime: any = momentTZ().tz('America/New_York').format('hh:mm A').replace(/\s/g, '');
        const timeZone: any = momentTZ().tz('America/New_York').format('z');

        let origTitle = '';

        if (this.mode && this.mode === 'create') {
          for (const file of result.documents) {
            origTitle = result.title;
            result.title = `${this.activity.Identifier}_${result.title}_${(today)}-${currentTime}${timeZone}`;
            this.uploadDocuments.push({ document: file, DocTitle: result.title, type: result.type, documentCategory: result.DocumentCategory, status: result.Status, versionComments: result.verComments });
            this.uploadedDocuments = this.uploadDocuments;
            if (!AppConstants.activityAttachmentFileMap.has(file.name)) {
              this.activity.ActivityFileNames.push(result.title);

              // Check to see if the document type is one that we have an approval process mapped out for
              if (result.DocumentCategory) {
                const typeCheck = this.documentApprovalTriggerMap.find(v => v.Title.toLowerCase() === result.DocumentCategory.toLowerCase());
                if (typeCheck) {
                  const fileItem = {
                    title: result.title,
                    canSubmitForApproval: true,
                    documentName: origTitle,
                    documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                  };
                  this.fileNameDisplayArray.push(fileItem);
                } else {
                  const fileItem = {
                    title: result.title,
                    canSubmitForApproval: false,
                    documentName: origTitle,
                    documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                  };
                  this.fileNameDisplayArray.push(fileItem);
                }
              } else {
                const fileItem = {
                  title: result.title,
                  canSubmitForApproval: false,
                  documentName: origTitle,
                  documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                };
                this.fileNameDisplayArray.push(fileItem);
              }
            }
          }
        }
        else if (this.mode && this.mode === 'edit') {
          for (const file of result.documents) {
            if (!AppConstants.activityAttachmentFileMap.has(file.name)) {
              origTitle = result.title;
              result.title = `${this.activity.Identifier}_${result.title}_${(today)}-${currentTime}${timeZone}`;
              this.uploadDocuments.push({ document: file, DocTitle: result.title, type: result.type, documentCategory: result.DocumentCategory, status: result.Status, versionComments: result.verComments });
              this.uploadedDocuments = this.uploadDocuments;
              if (!this.IsEmpty(this.activity.ActivityFileNames) && this.activity.ActivityFileNames.length) {
                const nameCheck = this.activity.ActivityFileNames.filter(v => v.toLowerCase() === result.title.toLowerCase());
                if (!nameCheck.length) {
                  this.activity.ActivityFileNames.push(result.title);
                }
              }
              else {
                this.activity.ActivityFileNames.push(result.title);
              }

              // Check to see if the document type is one that we have an approval process mapped out for
              if (result.DocumentCategory) {
                const typeCheck = this.documentApprovalTriggerMap.find(v => v.Title.toLowerCase() === result.DocumentCategory.toLowerCase());
                if (typeCheck) {
                  const fileItem = {
                    title: result.title,
                    canSubmitForApproval: true,
                    documentName: origTitle,
                    documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                  };
                  this.fileNameDisplayArray.push(fileItem);
                } else {
                  const fileItem = {
                    title: result.title,
                    canSubmitForApproval: false,
                    documentName: origTitle,
                    documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                  };
                  this.fileNameDisplayArray.push(fileItem);
                }
              } else {
                const fileItem = {
                  title: result.title,
                  canSubmitForApproval: false,
                  documentName: origTitle,
                  documentCategory: result.DocumentCategory ? result.DocumentCategory.trim() : ''
                };
                this.fileNameDisplayArray.push(fileItem);
              }
            }
          }
        }
        this.onChanges();
      }
    });
  }

  IsEmpty(val) {
    return val == null || !(Object.keys(val) || val).length;
  }

  selectedItem(event: any, activityObj) {
    this.activity.ProjectTitle = event.item;
    this.activity.Identifier = this.projectNameToObjMap[event.item].Identifier;
    // this.selectedProject = this.projectNameToObjMap[event.item];
    this.selectedProject = this.projectNameToObjMap[event.item];
    this.getTeamNames();
  }

  setWorkCategory(activity) {
    if (this.workFlowMap[activity.ActivityType]) {
      this.activity.WorkflowObj = this.workFlowMap[activity.ActivityType];
      activity.WorkCategory = this.activityTypesObject[activity.ActivityType][0];
      this.initWorkflowSteps();
      this.selectActivityInTimeline(activity.WorkCategory);
      if (activity.ActivityType === AppConstants.PROCESS_PR_TO_CONTRACTS) {
        this.isSubmitPRPackage = true;
      } else {
        this.isSubmitPRPackage = false;
      }
      return;
    }

    if (activity.ActivityType === AppConstants.PROCESS_PR_TO_CONTRACTS) {
      this.isSubmitPRPackage = true;
    } else {
      this.isSubmitPRPackage = false;
    }
    this.restAPIService.getActivityWorkFlows(`ActivityTitle eq '${activity.ActivityType}'`, AppConstants.ACTIVITY_WORKFLOWS).subscribe((activityWorkflow: any) => {
      if (this.restAPIService.isSuccessResponse(activityWorkflow)) {
        if (activityWorkflow.data.length) {
          this.activity.WorkflowObj = activityWorkflow.data[0].workflowObj;
          this.workFlowMap[activity.ActivityType] = activityWorkflow.data[0].workflowObj;
          activity.WorkCategory = this.activityTypesObject[activity.ActivityType][0];
          this.initWorkflowSteps();
        }
        else {
          activity.WorkCategory = this.activityTypesObject[activity.ActivityType][0];
          activity.WorkflowObj = null;
        }

        if (this.allHelpfulLinks && this.allHelpfulLinks.length) {
          for (const linkObj of this.allHelpfulLinks) {
            if (linkObj.ActivityType !== null) {
              if (linkObj.ActivityType.results.indexOf(activity.ActivityType) !== -1) {
                this.helpfulLinks.push(linkObj);
              }
            }
          }
        }
        if (this.allVideoLinks.length) {
          for (const linkObj of this.allVideoLinks) {
            if (linkObj.ActivityType !== null) {
              if (linkObj.ActivityType.results.indexOf(activity.ActivityType) !== -1) {
                this.videoLinks.push(linkObj);
              }
            }
          }
        }
        if (this.allDocTemplates.length) {
          for (const linkObj of this.allDocTemplates) {
            if (linkObj.ActivityType !== null) {
              if (linkObj.ActivityType.results.indexOf(activity.ActivityType) !== -1) {
                this.documentLinks.push(linkObj);
              }
            }
          }
        }
        this.selectActivityInTimeline(activity.WorkCategory);
      }
    });
  }

  public addActivity(addToActivities?) {
    const obj: any = {
      Title: '',
      Identifier: '',
      ProjectTitle: '',
      ActivityType: '',
      WorkCategory: '',
      AssignedTo: '',
      Status: 'To-do',
      Priority: '',
      // actionItemsObj: [],
      TrackingItems: [{
        addNotification: false,
        actualReceiptDate: '',
        scheduledDate: '',
      }],
      ActivityFileNames: [],
      ActivityMarkAsCompletedDate: ''
    };
    if (addToActivities) {
      obj.ID = addToActivities.ID;
      obj.Title = addToActivities.Title;
      obj.Identifier = addToActivities.Identifier;
      obj.ProjectTitle = addToActivities.ProjectTitle;
      obj.ActivityType = addToActivities.ActivityType;
      obj.WorkCategory = addToActivities.WorkCategory;
      obj.AssignedTo = addToActivities.AssignedTo;
      obj.Status = addToActivities.Status;
      // obj.actionItemsObj = JSON.parse(addToActivities.actionItemsObj);
      obj.Priority = addToActivities.Priority;
      obj.TrackingItems = typeof addToActivities.TrackingItems === 'string' ? JSON.parse(addToActivities.TrackingItems) : addToActivities.TrackingItems;
      obj.ActivityFileNames = typeof addToActivities.ActivityFileNames === 'string' ? JSON.parse(addToActivities.ActivityFileNames) : addToActivities.ActivityFileNames;


      // Ensure that attached files list delineates which files users can submit for approvals and which files cannot be submitted for approvals
      for (let i = 0; i < obj.ActivityFileNames.length; i++) {
        for (let j = 0; j < this.allRepoDocumentsData.length; j++) {
          if (obj.ActivityFileNames[i] === this.allRepoDocumentsData[j].DocumentTitle) {
            const typeCheck = this.documentApprovalTriggerMap.find(v => v.Title.toLowerCase() === this.allRepoDocumentsData[j].DocumentCategory.toLowerCase());
            if (typeCheck) {
              const fileItem = {
                title: this.allRepoDocumentsData[j].DocumentTitle,
                canSubmitForApproval: true,
                documentName: this.allRepoDocumentsData[j].Title,
                documentCategory: this.allRepoDocumentsData[j].DocumentCategory ? this.allRepoDocumentsData[j].DocumentCategory : ''
              };
              if (this.fileNameDisplayArray.filter(s => s.title == fileItem.title).length == 0) {
                this.fileNameDisplayArray.push(fileItem);
              }
            } else {
              const fileItem = {
                title: this.allRepoDocumentsData[j].DocumentTitle,
                canSubmitForApproval: false,
                documentName: this.allRepoDocumentsData[j].Title,
                documentCategory: this.allRepoDocumentsData[j].DocumentCategory ? this.allRepoDocumentsData[j].DocumentCategory : ''
              };
              if (this.fileNameDisplayArray.filter(s => s.title == fileItem.title).length == 0) {
                this.fileNameDisplayArray.push(fileItem);
              }
            }
          }
        }
      }

      // Currently, this.activity.ActivityFileNames was overridden when retrieving from API.
      if (this.activity) {
        const tempActivityFileNames = this.activity.ActivityFileNames.filter(x => !obj.ActivityFileNames.includes(x))
        tempActivityFileNames.forEach((y, i) => obj.ActivityFileNames.push(y));
      }

      obj.WorkflowObj = typeof addToActivities.WorkflowObj === 'string' ? JSON.parse(addToActivities.WorkflowObj) : addToActivities.WorkflowObj;
      obj.ActivityMarkAsCompletedDate = addToActivities.ActivityMarkAsCompletedDate;

    }
    this.activity = obj;

    if (this.activity.ActivityType === AppConstants.PROCESS_PR_TO_CONTRACTS) {
      this.isSubmitPRPackage = true;
    } else {
      this.isSubmitPRPackage = false;
    }

    if (this.mode !== 'create') {
      this.initWorkflowSteps();
      this.selectActivityInTimeline(addToActivities.WorkCategory);
      this.selectedProject = this.projectNameToObjMap[addToActivities.ProjectTitle];
      this.getTeamNames();
    }
  }

  checkTypingDateForCalendar(fieldName, obj) {
    if (!obj) {
      obj = this.activity;
    }
    if (fieldName === 'actualReceiptDate') {
      if (obj.actualReceiptDate !== '' && obj.actualReceiptDate !== '' && obj.actualReceiptDate !== null) {
        this.commonService.validateDateOnBlur(obj, fieldName);
      } else {
        obj.actualReceiptDateERROR = null;
      }
    } else {
      if (obj.scheduledDate !== '' && obj.scheduledDate !== '' && obj.scheduledDate !== null) {
        this.commonService.validateDateOnBlur(obj, fieldName);
      }
      else {
        obj.scheduledDateERROR = null;
      }
    }

    if (obj.ReceiptDate === '' && !obj.addNotification && obj.category === 'After Receipt Date' && obj.actualReceiptDate !== '') {
      obj.addNotification = true;
    }

    if (obj.scheduledDateERROR === 'Please enter the following date format: MM-DD-YYYY') {
      this.scheduledDateErrorInTrackingItems = true;
    }
    else {
      this.scheduledDateErrorInTrackingItems = false;
    }

    if (obj.actualReceiptDateERROR === 'Please enter the following date format: MM-DD-YYYY') {
      this.actualReceiptDateErrorInTrackingItems = true;
    }
    else {
      this.actualReceiptDateErrorInTrackingItems = false;
    }
  }

  onAddNotification(trackingItem: any, val?) {
    if (trackingItem.scheduledDate === '') {
      this.toaster.error('You must enter a valid Scheduled Date before scheduling a notification.');
      return;
    }
    if (this.activity.ProjectTitle === '') {
      this.toaster.error('You must enter a valid Project Name before scheduling a notification.');
      return;
    }
    if (val === 'view') {
      trackingItem.mode = val;
    }
    const projectTeamNames = [];

    let finalProjectTeamNames;

    projectTeamNames.push(this.selectedProject.Team.requirementsowner);

    projectTeamNames.push(this.selectedProject.Team.contractingOfficer);

    if (this.selectedProject.Team.assignedSupportContractor !== '') {
      projectTeamNames.push(this.selectedProject.Team.assignedSupportContractor);
    }
    if (this.selectedProject.Team.contractSpecialist !== '') {
      projectTeamNames.push(this.selectedProject.Team.contractSpecialist);
    }
    if (this.selectedProject.Team.contractingOfficerRepresentative !== '') {
      projectTeamNames.push(this.selectedProject.Team.contractingOfficerRepresentative);
    }
    if (this.selectedProject.Team.projectManager !== '') {
      projectTeamNames.push(this.selectedProject.Team.projectManager);
    }
    if (this.selectedProject.Team.teamMates.length) {
      for (const name of this.selectedProject.Team.teamMates) {
        projectTeamNames.push(name.name);
      }
    }
    if (projectTeamNames.length) {
      finalProjectTeamNames = projectTeamNames.filter(this.onlyUnique);
    }
    else {
      finalProjectTeamNames = [];
    }

    this.commonDialogService.openTrackingItemDialog({ trackingItem, teams: finalProjectTeamNames, siteAllUsers: this.siteAllUsers }).subscribe((result: any) => {
      if (result) {
        trackingItem.category = result.category;
        trackingItem.numberOfDays = result.numberOfDays;
        trackingItem.recipient = result.recipient;
        trackingItem.email = result.email;
        result.email = []; // Prevents duplicate emails for the same user
        trackingItem.allTeamMates = result.allTeamMates;
        trackingItem.addNotification = trackingItem.actualReceiptDate === '' && result.category === 'After Receipt Date' ? false : true;

        if (this.isNotUndefinedNullOrEmpty(result.NotificationIdentifier)) {
          for (let counter = 0; counter < this.origTrackingItems.length; counter++) {
            if (this.origTrackingItems[counter].NotificationIdentifier === result.NotificationIdentifier) {
              // check to see if the existing notification has been changed
              if (
                this.origTrackingItems[counter].category !== result.category ||
                parseInt(this.origTrackingItems[counter].numberOfDays, 10) !== parseInt(result.numberOfDays, 10) ||
                JSON.stringify(this.origTrackingItems[counter].recipient) !== JSON.stringify(result.recipient)) {

                const revisedItem = this.addAdditionalTrackingAttributesToItem(trackingItem);
                this.notificationsToBeEdited.push(revisedItem);
              }
            }
          }
        } else {
          // trackingItem.NotificationIdentifier = this.restAPIService.getUniqueId();
          const revisedItem = this.addAdditionalTrackingAttributesToItem(trackingItem);
          this.notificationsToBeAdded.push(revisedItem);
        }
      } else {
        trackingItem.addNotification = false;
        if (trackingItem.mode) {
          delete trackingItem.mode;
        }
      }

    });
  }

  deleteAddNotificationDetails(trackingItem) {
    delete trackingItem.category;
    delete trackingItem.numberOfDays;
    delete trackingItem.recipient;
    delete trackingItem.allTeamMates;
    delete trackingItem.email;
    delete trackingItem.Due_Date;
    delete trackingItem.NotificationIdentifier;
    trackingItem.addNotification = false;
    if (trackingItem.mode) {
      delete trackingItem.mode;
    }
    // Iterate through original notification configuration list and get the id to be deleted
    for (let iterator = 0; iterator < this.origTrackingItems.length; iterator++) {
      if (trackingItem.NotificationIdentifier === this.origTrackingItems[iterator].NotificationIdentifier) {
        this.notificationsToBeDeleted.push(this.origTrackingItems[iterator].NotificationIdentifier);
      }
    }

    // Ensure that if the item to be deleted was added in this current session we remove it from the to be added list
    for (let counter = 0; counter < this.notificationsToBeAdded.length; counter++) {
      if (trackingItem.NotificationIdentifier === this.notificationsToBeAdded[counter].NotificationIdentifier) {
        this.notificationsToBeAdded.splice(counter);
      }
    }
  }

  addTrackingItem(activity?) {
    if (!activity) {
      activity = this.activity;
    }
    activity.TrackingItems.push({
      addNotification: false,
      actualReceiptDate: '',
      scheduledDate: '',
    });
  }

  deleteTrackingItem(activity, trackingItemIndex) {
    if (confirm('Do you want to delete tracking item?')) {
      activity.TrackingItems.splice(trackingItemIndex, 1);
      // TODO - delete all notifications associated with this tracking item
    }
  }

  removeEmptyTrackingItems(trackingItems): any {
    if (trackingItems || typeof trackingItems !== 'undefined' || trackingItems !== null) {
      // Comes in as JSON
      const temp = JSON.parse(trackingItems);
      for (const item of temp) {
        if (// if there is actually nothing here just delete it from the array
          !this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
          !this.isNotUndefinedNullOrEmpty(item.category) &&
          !this.isNotUndefinedNullOrEmpty(item.recipient) &&
          !this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {
          const index = temp.indexOf(item);
          temp.splice(index, 1);
        }
      }
      return JSON.stringify(temp);
    }
    return '';
  }

  // addAdditionalTrackingAttributes(trackingItems): any {
  //   if (trackingItems || typeof trackingItems !== 'undefined' || trackingItems !== null) {
  //     //Comes in as JSON
  //     const temp = JSON.parse(trackingItems);
  //     for (const item of temp) {
  //       if (//If this is a valid notification
  //         this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
  //         this.isNotUndefinedNullOrEmpty(item.category) &&
  //         this.isNotUndefinedNullOrEmpty(item.recipient) &&
  //         this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {

  //         //If this is a valid notification then give it a notification identifier
  //         if (!item.hasOwnProperty('NotificationIdentifier')) {
  //           item.NotificationIdentifier = this.restAPIService.getUniqueId();
  //         }
  //         if (!item.hasOwnProperty('category')) {
  //           item.category = '';
  //         }
  //         if (!item.hasOwnProperty('numberOfDays')) {
  //           item.numberOfDays = '';
  //         }
  //         if (!item.hasOwnProperty('recipient')) {
  //           item.recipient = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //         }
  //         if (!item.hasOwnProperty('allTeamMates')) {
  //           item.allTeamMates = '';
  //         }
  //         if (!item.hasOwnProperty('processStage')) {
  //           item.processStage = '';
  //         }
  //         if (!item.hasOwnProperty('email')) {
  //           item.email = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //         }
  //         if (item.scheduledDate !== '' && item.category !== '') {
  //           if (this.sendOutNotificationToday(item)) {
  //             item.isScheduled = 'No';
  //           } else {
  //             item.isScheduled = 'Yes';
  //           }
  //         } else {
  //           item.isScheduled = 'Yes';
  //         }
  //       } else if (//if this is just a tracking item without a notification
  //         !this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
  //         !this.isNotUndefinedNullOrEmpty(item.category) &&
  //         !this.isNotUndefinedNullOrEmpty(item.recipient) &&
  //         this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {
  //         if (!item.hasOwnProperty('category')) {
  //           item.category = '';
  //         }
  //         if (!item.hasOwnProperty('numberOfDays')) {
  //           item.numberOfDays = '';
  //         }
  //         if (!item.hasOwnProperty('recipient')) {
  //           item.recipient = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //         }
  //         if (!item.hasOwnProperty('allTeamMates')) {
  //           item.allTeamMates = '';
  //         }
  //         if (!item.hasOwnProperty('processStage')) {
  //           item.processStage = '';
  //         }
  //         if (!item.hasOwnProperty('email')) {
  //           item.email = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //         }
  //         if (!item.hasOwnProperty('NotificationIdentifier')) {
  //           item.NotificationIdentifier = '';
  //         }
  //         if (item.scheduledDate !== '' && item.category !== '') {
  //           if (this.sendOutNotificationToday(item)) {
  //             item.isScheduled = 'No';
  //           } else {
  //             item.isScheduled = 'Yes';
  //           }
  //         } else {
  //           item.isScheduled = 'Yes';
  //         }
  //       } else if (//if there is actually nothing here just delete it from the array
  //         !this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
  //         !this.isNotUndefinedNullOrEmpty(item.category) &&
  //         !this.isNotUndefinedNullOrEmpty(item.recipient) &&
  //         !this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {
  //         let index = temp.indexOf(item);
  //         temp.splice(index, 1);
  //       }
  //     }
  //     return JSON.stringify(temp);
  //   }
  //   return '';
  // }

  addAdditionalTrackingAttributesToItem(item): any {
    if (// If this is a valid notification
      this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
      this.isNotUndefinedNullOrEmpty(item.category) &&
      this.isNotUndefinedNullOrEmpty(item.recipient) &&
      this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {

      // If this is a valid notification then give it a notification identifier
      if (!item.hasOwnProperty('NotificationIdentifier')) {
        item.NotificationIdentifier = this.restAPIService.getUniqueId();
      }
      if (!item.hasOwnProperty('category')) {
        item.category = '';
      }
      if (!item.hasOwnProperty('numberOfDays')) {
        item.numberOfDays = '';
      }
      if (!item.hasOwnProperty('recipient')) {
        item.recipient = []; // Needs to be array otherwise Powerautomate script JSON parser throws error
      }
      if (!item.hasOwnProperty('allTeamMates')) {
        item.allTeamMates = '';
      }
      if (!item.hasOwnProperty('processStage')) {
        item.processStage = '';
      }
      if (!item.hasOwnProperty('email')) {
        item.email = []; // Needs to be array otherwise Powerautomate script JSON parser throws error
      }
      if (item.scheduledDate !== '' && item.category !== '') {
        if (this.sendOutNotificationToday(item)) {
          item.isScheduled = 'No';
        } else {
          item.isScheduled = 'Yes';
        }
      } else {
        item.isScheduled = 'Yes';
      }
    } else if (// if this is just a tracking item without a notification
      !this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
      !this.isNotUndefinedNullOrEmpty(item.category) &&
      !this.isNotUndefinedNullOrEmpty(item.recipient) &&
      this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {
      if (!item.hasOwnProperty('category')) {
        item.category = '';
      }
      if (!item.hasOwnProperty('numberOfDays')) {
        item.numberOfDays = '';
      }
      if (!item.hasOwnProperty('recipient')) {
        item.recipient = []; // Needs to be array otherwise Powerautomate script JSON parser throws error
      }
      if (!item.hasOwnProperty('allTeamMates')) {
        item.allTeamMates = '';
      }
      if (!item.hasOwnProperty('processStage')) {
        item.processStage = '';
      }
      if (!item.hasOwnProperty('email')) {
        item.email = []; // Needs to be array otherwise Powerautomate script JSON parser throws error
      }
      if (!item.hasOwnProperty('NotificationIdentifier')) {
        item.NotificationIdentifier = '';
      }
      if (item.scheduledDate !== '' && item.category !== '') {
        if (this.sendOutNotificationToday(item)) {
          item.isScheduled = 'No';
        } else {
          item.isScheduled = 'Yes';
        }
      } else {
        item.isScheduled = 'Yes';
      }
    } else if (// if there is actually nothing here just leave it
      !this.isNotUndefinedNullOrEmpty(item.numberOfDays) &&
      !this.isNotUndefinedNullOrEmpty(item.category) &&
      !this.isNotUndefinedNullOrEmpty(item.recipient) &&
      !this.isNotUndefinedNullOrEmpty(item.scheduledDate)) {
    }
    return item;
  }

  sendOutNotificationToday(item): boolean {
    let isToday = false;
    const momentToday = moment().startOf('day');
    if (item.category === 'Before Due Date' || item.category === 'Before Scheduled Date') {
      const schedDate = moment(item.scheduledDate, AppConstants.AP3DateFormat);
      item.Due_Date = schedDate.subtract(item.numberOfDays, 'day').format('MM-DD-YYYY');
      // The purpose of the extra 'IsScheduled' field is to ensure that notifications slated to go out via the daily scheduled
      // service aren't sent out whenever a user arbitrarily adds another notification
      if (moment(item.Due_Date).isSame(momentToday)) {
        isToday = true;
      }
    }
    if (item.category === 'After Receipt Date' && item.actualReceiptDate !== '') {
      const actualReceiptDate = moment(item.actualReceiptDate, AppConstants.AP3DateFormat);
      item.ReceiptDate = actualReceiptDate.add(item.numberOfDays, 'day').format('MM-DD-YYYY');
      if (moment(item.ReceiptDate).isSame(momentToday)) {
        isToday = true;
      }
    }
    else {
      item.ReceiptDate = '';
      isToday = false;
    }
    return isToday;
  }

  // sendAssignedToEmail() {
  //   let user;
  //   if (this.activity.AssignedTo) {
  //     user = this.siteAllUsers.value.find(item => item.Title.toLowerCase() === this.activity.AssignedTo.toLowerCase());
  //   }

  //   const sendEmailObj: any = {};
  //   sendEmailObj.RecipientsList = user.Email;
  //   sendEmailObj.ContractNo = this.activity.contractNo;
  //   sendEmailObj.Title = this.activity.activityType;
  //   sendEmailObj.ItemType = AppConstants.ACTIVITY_TYPE;
  //   sendEmailObj.NotificationIdentifier = this.activity.NotificationIdentifier;
  //   sendEmailObj.WorkItemId = this.activity.data.ID;
  //   sendEmailObj.URL = _spPageContextInfo.webAbsoluteUrl + '/SitePages/DevHome.aspx/activities/' + this.activity.data.ID + '?mode=edit';
  //   sendEmailObj.__metadata = { type: 'SP.Data.AutoGeneratedEmailsOnDemandListItem' };

  //   this.restAPIService.saveAutoGeneratedEmailsOnDemand(sendEmailObj).subscribe((autoGeneratedEmailsOnDemandResponse: any) => {
  //     if (this.restAPIService.isSuccessResponse(autoGeneratedEmailsOnDemandResponse)) {
  //       console.log('autoGeneratedEmailsOnDemandResponse', autoGeneratedEmailsOnDemandResponse);
  //     }
  //   });
  // }

  // sendEmail(form) {
  //   if (form.invalid) {
  //     this.isFormSubmitted = true;
  //     this.toastr.error(this.commonService.validationErrorMessage);
  //     return;
  //   }

  //   this.commonDialogService.openActivityAddReceipientModal({ activity: this.activity, mode: this.mode }).subscribe((result: any) => {
  //     if (result) {
  //       if (result.RecipientsList.length) {
  //         const emails = [];
  //         const sendEmailObj: any = {};

  //         for (const recipient of result.RecipientsList) {
  //           emails.push(recipient.Email);
  //         }
  //         sendEmailObj.RecipientsList = emails.join(',');
  //         sendEmailObj.ContractNo = result.project;
  //         sendEmailObj.NotificationIdentifier = this.activity.NotificationIdentifier;
  //         sendEmailObj.__metadata = { type: 'SP.Data.AutoGeneratedEmailsOnDemandListItem' };
  //       }
  //     }
  //   });
  // }

  // setAssignedToUser() {
  //   this.assignedUser = false;
  // }

  // getUserInfo() {
  //   this.isDialogShown = true;
  //   const email = _spPageContextInfo.userEmail;
  //   if (email) {
  //     this.restAPIService.getUserProfile(`UserID eq '${email}'`).subscribe((response: any) => {
  //       if (this.restAPIService.isSuccessResponse(response)) {
  //         if (response && response.data.length) {
  //           const items = response.data.find(item => JSON.parse(item.isDialogShown));
  //           if (items && items.isDialogShown) {
  //             this.isDialogShown = false;
  //             this.assignedUser = items;
  //           }
  //         }
  //       }
  //     });
  //   }
  // }

  cancel() {
    if (this.projectParams.projectId) {
      this.returnToProject();
    }
    else {
      this.router.navigate(['activities']);
    }
    AppConstants.actionItemNotificationsToBeDeleted = [];
    AppConstants.actionItemNotificationsToBeAdded = [];
    AppConstants.actionItemNotificationsToBeEdited = [];
    AppConstants.originalActionItemList = [];
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  initWorkflowSteps() {
    this.steps = [];
    this.steps.push(this.activity.WorkflowObj);
    let keepIterating = true;
    while (keepIterating) {
      const stepsCount = this.steps.length;
      this.stepCompleted(this.steps[stepsCount - 1], stepsCount - 1);
      keepIterating = stepsCount < this.steps.length;
    }

    for (const doc of this.fileNameDisplayArray) {
      for (const step of this.steps) {
        if (step.content && doc.documentCategory) {
          if (step.content.trim() === doc.documentCategory.trim()) {
            step.isDocumentUploaded = true;
          }
        }
      }
    }
  }

  stepCompleted(stepObj, index) {
    const stepTypeWithoutAction = new Set();
    stepTypeWithoutAction.add('inputs');
    stepTypeWithoutAction.add('task');
    stepTypeWithoutAction.add('final-step');
    stepTypeWithoutAction.add('next-step');
    let nextStep = null;
    if (this.steps.length > index + 1) {
      const steps = this.steps.splice(index + 1, this.steps.length);
      for (const step of steps) {
        if (step.answer) {
          step.answer = '';
        } else if (step.completed) {
          step.completed = '';
        }
        step.isDocumentUploaded = false;
      }
    }
    if (stepObj && stepObj.type === 'question' && stepObj.yesChildren && stepObj.noChildren) {
      if (stepObj.answer === 'yes') {
        nextStep = stepObj.yesChildren;
      } else if (stepObj.answer === 'no') {
        nextStep = stepObj.noChildren;
      }
    } else if (stepObj && stepTypeWithoutAction.has(stepObj.type) && stepObj.children) {
      nextStep = stepObj.children;
    } else {
      console.log('Steps are Completed, Result is = ', this.activity.workflowObj);
    }
    if (nextStep !== null) {
      this.steps.push(nextStep);
      nextStep = null;
      this.stepCompleted(this.steps[this.steps.length - 1], this.steps.length - 1);
    }
    // else {
    //   setTimeout(() => {
    //     const inputsElem: any = this.inputsDivView.toArray();
    //     const taskElem: any = this.taskDivView.toArray();
    //     const finalStepElem: any = this.finalStepDivView.toArray();
    //
    //     if (inputsElem.length) {
    //       const firstInputsElem: ElementRef = inputsElem[0];
    //       const lastInputsElem: ElementRef = inputsElem[inputsElem.length - 1];
    //
    //       if (!firstInputsElem.nativeElement.className.includes('activity-rounded-corners-top')) {
    //         firstInputsElem.nativeElement.classList.add('activity-rounded-corners-top');
    //       }
    //       if (!lastInputsElem.nativeElement.className.includes('activity-rounded-corners-bottom')) {
    //         lastInputsElem.nativeElement.classList.add('activity-rounded-corners-bottom');
    //       }
    //     }
    //     if (taskElem.length) {
    //       const firstTaskElem: ElementRef = taskElem[0];
    //       const lastTaskElem: ElementRef = taskElem[taskElem.length - 1];
    //
    //       if (!firstTaskElem.nativeElement.className.includes('activity-rounded-corners-top')) {
    //         firstTaskElem.nativeElement.classList.add('activity-rounded-corners-top');
    //       }
    //       if (!lastTaskElem.nativeElement.className.includes('activity-rounded-corners-bottom')) {
    //         lastTaskElem.nativeElement.classList.add('activity-rounded-corners-bottom');
    //       }
    //     }
    //     if (finalStepElem.length) {
    //       const firstFinalStepElem: ElementRef = finalStepElem[0];
    //       const lastFinalStepElem: ElementRef = finalStepElem[finalStepElem.length - 1];
    //
    //       if (!firstFinalStepElem.nativeElement.className.includes('activity-rounded-corners-top')) {
    //         firstFinalStepElem.nativeElement.classList.add('activity-rounded-corners-top');
    //       }
    //       if (!lastFinalStepElem.nativeElement.className.includes('activity-rounded-corners-bottom')) {
    //         lastFinalStepElem.nativeElement.classList.add('activity-rounded-corners-bottom');
    //       }
    //     }
    //   }, 300);
    // }
  }

  downloadFile(docName) {
    this.restAPIService.getRepositoryData(`DocumentTitle eq '${docName}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,DocumentCategory,Status,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((docResponse: any) => {
      if (this.restAPIService.isSuccessResponse(docResponse)) {
        if (docResponse.data.length) {
          window.open(`https://seventh.sharepoint.us${docResponse.data[0].File.ServerRelativeUrl}`, '_blank',
            'toolbar,scrollbars,resizable,top=200,left=500,width=400,height=400');
        }
      }
    });
  }

  deleteUploadDocWithoutCPARS(fileName: any) {

    // Update steps array/page functions on delete
    for (const doc of this.fileNameDisplayArray) {
      for (const step of this.steps) {
        if (step.content && doc.documentCategory) {
          if (step.content.trim() === doc.documentCategory.trim() && doc.title === fileName) {
            step.isDocumentUploaded = false;
          }
        }
      }
    }

    if (this.mode && this.mode === 'edit') {
      if (this.uploadDocuments.length > 0) {
        for (let a = 0; a < this.uploadDocuments.length; a++) {
          if (this.uploadDocuments[a].DocTitle === fileName) {
            this.uploadDocuments.splice(a, 1);
            this.activity.ActivityFileNames.splice(this.activity.ActivityFileNames.indexOf(fileName), 1);
            // this.fileNameDisplayArray.splice(this.fileNameDisplayArray.indexOf(fileName), 1);
            // Added extra support for change of fileNameDisplayArray into a complex object with multiple parameters
            let index = -1;
            for (let i = 0; i < this.fileNameDisplayArray.length; i++) {
              if (this.fileNameDisplayArray[i].title === fileName) {
                index = i;
              }
            }

            if (index !== -1) {
              this.fileNameDisplayArray.splice(index, 1);
            }
          }
        }
      }
      else {
        const nameCheck = this.activity.ActivityFileNames.filter(v => v.toLowerCase() === fileName.toLowerCase());
        if (nameCheck.length > 0) {
          this.isDeleteFileName.push(fileName);
          this.activity.ActivityFileNames.splice(this.activity.ActivityFileNames.indexOf(fileName), 1);
          // this.fileNameDisplayArray.splice(this.fileNameDisplayArray.indexOf(fileName), 1);
          // Added extra support for change of fileNameDisplayArray into a complex object with multiple parameters
          let index = -1;
          for (let i = 0; i < this.fileNameDisplayArray.length; i++) {
            if (this.fileNameDisplayArray[i].title === fileName) {
              index = i;
            }
          }

          if (index !== -1) {
            this.fileNameDisplayArray.splice(index, 1);
          }
        }
      }
    }
    else if (this.mode && this.mode === 'create') {
      if (this.uploadDocuments.length) {
        for (let a = 0; a < this.uploadDocuments.length; a++) {
          if (this.uploadDocuments[a].DocTitle === fileName) {
            this.uploadDocuments.splice(a, 1);
            this.activity.ActivityFileNames.splice(this.activity.ActivityFileNames.indexOf(fileName), 1);
            // this.fileNameDisplayArray.splice(this.fileNameDisplayArray.indexOf(fileName), 1);
            // Added extra support for change of fileNameDisplayArray into a complex object with multiple parameters
            let index = -1;
            for (let i = 0; i < this.fileNameDisplayArray.length; i++) {
              if (this.fileNameDisplayArray[i].title === fileName) {
                index = i;
              }
            }

            if (index !== -1) {
              this.fileNameDisplayArray.splice(index, 1);
            }
            break;
          }
        }
      }
    }
  }

  submitDocumentForPanelApproval(document: any) {
    this.commonDialogService.openSubmitForApprovalModal().subscribe((result: any) => {
      if (result && result.requestedApprovalDate) {
        const createApproverObj: any = {};
        // createApproverObj.__metadata = { type: 'SP.Data.DocumentApproverListItem' };
        createApproverObj.__metadata = { type: 'SP.Data.DocumentLevelApprovalStatusListItem' };

        if (this.mode === 'create') {
          const findDocDetails: any = this.uploadDocuments.find(x => x.DocTitle === document);
          if (findDocDetails) {
            createApproverObj.Title = findDocDetails.documentCategory;
            createApproverObj.DocumentName = document;
            createApproverObj.TriggerFrom = 'Activity';
            createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
            createApproverObj.Identifier = this.activity.Identifier;
            createApproverObj.RequestedApprovalDate = result.requestedApprovalDate;
            createApproverObj.OverAllStatus = AppConstants.SUBMITTED;
            createApproverObj.IsApprovalprocessCompleted = AppConstants.NO;


            this.submitDocumentsForApprovalArr.push(createApproverObj);
            this.updateDocumentSubmissionStatus();
          }
        }
        if (this.mode === 'edit') {
          this.restAPIService.getRepositoryData(`DocumentTitle eq '${document.trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,DocumentCategory,Status,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((response: any) => {
            if (this.restAPIService.isSuccessResponse(response)) {
              if (response.data.length) {
                const findDocDetails: any = response.data.find(x => x.DocumentTitle === document);
                if (findDocDetails) {
                  createApproverObj.Title = findDocDetails.DocumentCategory;
                  createApproverObj.DocumentName = findDocDetails.DocumentTitle;
                  createApproverObj.TriggerFrom = 'Activity';
                  createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
                  createApproverObj.Identifier = this.activity.Identifier;
                  createApproverObj.RequestedApprovalDate = result.requestedApprovalDate;
                  createApproverObj.OverAllStatus = AppConstants.SUBMITTED;
                  createApproverObj.IsApprovalprocessCompleted = AppConstants.NO;

                  this.submitDocumentsForApprovalArr.push(createApproverObj);
                  this.updateDocumentSubmissionStatus();
                }
              }
              else {
                if (this.uploadDocuments.length) {
                  const findDocDetails: any = this.uploadDocuments.find(x => x.DocTitle === document);
                  if (findDocDetails) {
                    createApproverObj.Title = findDocDetails.documentCategory;
                    createApproverObj.DocumentName = document;
                    createApproverObj.TriggerFrom = 'Activity';
                    createApproverObj.SubmitterEmailAddress = _spPageContextInfo.userEmail;
                    createApproverObj.Identifier = this.activity.Identifier;
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
      const findDocForApproval: any = this.submitDocumentsForApprovalArr.find(x => x.DocumentName === document);
      if (findDocForApproval) {
        this.submitDocumentsForApprovalArr.splice(findDocForApproval, 1);
        this.updateDocumentSubmissionStatus();
      }
    }
    if (this.mode === 'edit') {
      if (this.submitDocumentsForApprovalArr.length) {
        const findDocDetails: any = this.submitDocumentsForApprovalArr.find(x => x.DocumentName === document);
        if (findDocDetails) {
          this.submitDocumentsForApprovalArr.splice(findDocDetails, 1);
          this.updateDocumentSubmissionStatus();
        }
      }
      else {
        if (this.submitForApprovalSPData.length) {
          const findDoc: any = this.submitForApprovalSPData.find(x => x.DocumentName === document);
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
                    const documentObjForUpdate: any = {
                      __metadata: { type: 'SP.Data.DocumentApprovalUsersActionsListItem' },
                      Status: AppConstants.CANCELLED
                    };
                    observable.push(this.restAPIService.updateDocumentForApprovalInList(documentObjForUpdate, this.documentsArr[i].ID));
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

  public getClassName(s) {
    return s.toLowerCase().replace('/', ' ').split(' ').join('-');
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

  addActionItemInActivity(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toastr.error(this.commonService.validationErrorMessage);
      return;
    }

    this.commonService.isSomethingUnsaved = false;

    this.activity.selectedProject = this.selectedProject;
    this.router.navigate(['action-item'], {
      state: {
        parentPageData: this.activity,
        mode: this.mode,
        parentPage: 'Activity',
        projectParams: this.projectParams,
        siteUsersList: this.siteAllUsers,
        activityActionItems: this.actionItems,
        parentFileNameDisplayArray: this.fileNameDisplayArray,
        uploadedDocuments: this.uploadedDocuments
      }
    });
  }

  goToActionItem(actionItem, index) {
    if (actionItem) {
      this.activity.selectedProject = this.selectedProject;
    }
    if (!this.commonService.isNotUndefinedNullOrEmpty(this.paramsActivityId)) {

      this.paramsActivityId = this.activity.ID;
    }
    this.router.navigate(['action-item'], {
      state: {
        parentPageData: this.activity,
        mode: this.mode,
        projectParams: this.projectParams,
        parentPage: AppConstants.ACTIVITY_TYPE,
        parentPageDataId: this.paramsActivityId,
        activityActionItems: this.actionItems,
        siteUsersList: this.siteAllUsers,
        index,
        actionItem,
        parentFileNameDisplayArray: this.fileNameDisplayArray,
        uploadedDocuments: this.uploadedDocuments
      }
    }
    );
  }

  deleteActionItem(index) {
    const actionItemObj: any = this.actionItems[index];
    if (actionItemObj.ID) {
      this.restAPIService.deleteActionItem(actionItemObj.ID).subscribe((delActionItemResp: any) => {
        if (this.restAPIService.isSuccessResponse(delActionItemResp)) {
          this.actionItems.splice(index, 1);

          // Sends 'UNASSIGN' AutoGeneratedEmail records
          this.manageAssignToActionItemNotifications.sendUnassignedToEmailForActionItem(this.activity, actionItemObj, actionItemObj.assignedTo);

          // Deletes all notifications associated with this action item
          this.manageAssignToActionItemNotifications.deleteAllNotificationsForActionItem(actionItemObj.ID);
        }
      });
    }
    else {
      this.actionItems.splice(index, 1);
    }
  }

  saveActionItems() {
    const observables = [];
    for (const actionItem of this.actionItems) {
      observables.push(new Observable(observer => {
        const actionItemObj = {
          __metadata: { type: 'SP.Data.ActionItemsListItem' },
          Title: actionItem.title,
          Priority: actionItem.priority,
          AssignedTo: actionItem.assignedTo,
          // Status: actionItem.status,
          TrackingItems: actionItem.TrackingItems,
          Description: actionItem.description,
          ParentId: String(this.activity.ID)
        };
        if (actionItem.ID) {
          if (Array.isArray(actionItemObj.TrackingItems)) {
            actionItemObj.TrackingItems = JSON.stringify(actionItemObj.TrackingItems);
          }
          this.restAPIService.updateActionItem(actionItemObj, actionItem.ID).subscribe(res => {
            if (this.restAPIService.isSuccessResponse) {
              // EDIT ACTION ITEM NOTIFICATIONS
              // Compare action item before and after value
              const item = AppConstants.originalActionItemList.find(x => x.ID === actionItem.ID);
              // If this edits an existing action item
              if (item) {
                const trackingItemsArray: any[] = [];
                if (this.commonService.isNotUndefinedNullOrEmpty(actionItem) &&
                  this.commonService.isNotUndefinedNullOrEmpty(actionItem.TrackingItems)) {
                    if (Array.isArray(actionItem.TrackingItems)) {
                      item.TrackingItems = JSON.stringify(item.TrackingItems);
                    }
                } else if (this.commonService.isNotUndefinedNullOrEmpty(this.actionItem) &&
                this.commonService.isNotUndefinedNullOrEmpty(this.actionItem.TrackingItems)) {
                  if (Array.isArray(this.actionItem.TrackingItems)) {
                    item.TrackingItems = JSON.stringify(item.TrackingItems);
                  }
                }

                // if (Array.isArray(this.actionItem.TrackingItems)) {
                //   item.TrackingItems = JSON.stringify(item.TrackingItems);
                // }

                if (item !== actionItem) {
                  // Adds, updates, or deletes 'ASSIGN TO' Notifications records and adds AutoGeneratedEmail records
                  this.manageAssignToActionItemNotifications.postEmailsAndAddOrDeleteNotificaitonsForActionItems(this.activity, actionItem, actionItem.assignedTo, item.assignedTo, this.mode);

                  // Adds, updates, or deletes 'ACTION REQUIRED' tracking notifications (if any) to the Notifications Configuration SP list
                  this.addUpdateOrDeleteNotifications(
                    // this.actionItem,
                    actionItem,
                    this.mode,
                    AppConstants.ACTION_ITEM_TYPE,
                    Array.isArray(actionItem.TrackingItems) ? actionItem.TrackingItem : JSON.parse(actionItem.TrackingItems),
                    Array.isArray(item.TrackingItems) ? item.TrackingItems : JSON.parse(item.TrackingItems),
                    AppConstants.actionItemNotificationsToBeDeleted,
                    AppConstants.actionItemNotificationsToBeAdded,
                    AppConstants.actionItemNotificationsToBeEdited);
                }
              }
              // Reset lists
              AppConstants.actionItemNotificationsToBeDeleted = [];
              AppConstants.actionItemNotificationsToBeAdded = [];
              AppConstants.actionItemNotificationsToBeEdited = [];
              AppConstants.originalActionItemList = [];
            }

          });
        } else {
          if (Array.isArray(actionItemObj.TrackingItems)) {
            actionItemObj.TrackingItems = JSON.stringify(actionItemObj.TrackingItems);
          }
          this.restAPIService.saveActionItem(actionItemObj).subscribe(res => {
            // Creates new notifications as necessary if this is a new action item
            if (this.restAPIService.isSuccessResponse) {
              // Adds, updates, or deletes 'ASSIGN TO' Notifications records and adds AutoGeneratedEmail records
              const savedActionItem: any = res;
              let trackingItemsArray: any[] = [];
              if (savedActionItem.data && savedActionItem.data.TrackingItems && typeof savedActionItem.data.TrackingItems === 'string') {
                trackingItemsArray = JSON.parse(savedActionItem.data.TrackingItems);
              } else {
                trackingItemsArray = savedActionItem.TrackingItems;
              }

              actionItem.ID = savedActionItem.data.ID;
              // Adds, updates, or deletes 'ASSIGN TO' Notifications records and adds AutoGeneratedEmail records
              this.manageAssignToActionItemNotifications.postEmailsAndAddOrDeleteNotificaitonsForActionItems(this.activity, actionItem, actionItem.assignedTo, '', this.mode);

              // Adds 'ACTION REQUIRED' tracking notifications (if any) to the Notifications Configuration SP list
              for (let iterator = 0; iterator < trackingItemsArray.length; iterator++) {
                this.manageActionReqNotifications.saveNotificationRecord(
                  savedActionItem.data.ID,
                  trackingItemsArray[iterator],
                  this.mode,
                  AppConstants.ACTION_REQUIRED,
                  AppConstants.ACTION_ITEM_TYPE,
                  savedActionItem.data.Title,
                  savedActionItem.data.Description,
                  this.activity.Identifier,
                  '');
              }
              // Reset lists
              AppConstants.actionItemNotificationsToBeDeleted = [];
              AppConstants.actionItemNotificationsToBeAdded = [];
              AppConstants.actionItemNotificationsToBeEdited = [];
              AppConstants.originalActionItemList = [];
            }
          });
        }
      }));
    }
    if (observables.length) {
      forkJoin(observables).subscribe((res: any[]) => {
        this.saveUpdateOrDeleteDocumentsOnServer();
      });
    }

  }

  openNotesModal() {
    this.commonDialogService.openNotesModal({ Level: 'Activity', ParentId: String(this.activity.ID), Name: this.activity.Title }).subscribe((result: any) => {
      console.log('results', result);
    });
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

  getTeamNames() {
    this.teamsArr = [];
    const projectTeamNames = [];

    if (this.selectedProject && this.selectedProject.Team) {
      if (this.selectedProject.Team.requirementsowner !== '') {
        projectTeamNames.push(this.selectedProject.Team.requirementsowner);
      }
      if (this.selectedProject.Team.contractingOfficer !== '') {
        projectTeamNames.push(this.selectedProject.Team.contractingOfficer);
      }

      if (this.selectedProject.Team.assignedSupportContractor !== '') {
        projectTeamNames.push(this.selectedProject.Team.assignedSupportContractor);
      }
      if (this.selectedProject.Team.contractSpecialist !== '') {
        projectTeamNames.push(this.selectedProject.Team.contractSpecialist);
      }
      if (this.selectedProject.Team.contractingOfficerRepresentative !== '') {
        projectTeamNames.push(this.selectedProject.Team.contractingOfficerRepresentative);
      }
      if (this.selectedProject.Team.projectManager !== '') {
        projectTeamNames.push(this.selectedProject.Team.projectManager);
      }
      if (this.selectedProject.Team.teamMates.length) {
        for (const name of this.selectedProject.Team.teamMates) {
          projectTeamNames.push(name.name);
        }
      }
      if (projectTeamNames.length) {
        this.teamsArr = projectTeamNames.filter(this.onlyUnique);
      }
      else {
        this.teamsArr = [];
      }
    }
  }

  getTeamMates(term: string) {
    if (term === '') {
      return of([]);
    } else if (this.teamsArr && this.teamsArr.length > 0) {
      return of(this.commonService.searchObj(this.teamsArr, term));
    }
  }

  activityDropDown() {
    const activityDropOptions = document.getElementById('activityDropOptions');
    if (activityDropOptions.style.display === 'none') {
      activityDropOptions.style.display = 'block';
    } else {
      activityDropOptions.style.display = 'none';
    }
  }

  selectActivityFromNestedWorkCategories(data: any, activityObj: any) {
    activityObj.ActivityType = data.srcElement.text;
    const activityDropOptions = document.getElementById('activityDropOptions');
    if (activityDropOptions.style.display === 'none') {
      activityDropOptions.style.display = 'block';
    } else {
      activityDropOptions.style.display = 'none';
    }
    this.setWorkCategory(activityObj);
  }

  public searchPeopleWithinProject = (text$: Observable<string>) =>
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
}
