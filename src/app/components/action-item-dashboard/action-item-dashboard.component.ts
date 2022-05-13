import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponentParentComponent } from '../../page-component-parent.component';
import { CommonService } from '../../services/common.service';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonDialogService } from '../../services/common-dialog.service';
import { AppConstants } from '../../AppConstants';
import { RESTAPIService } from '../../services/REST-API.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

declare const _spPageContextInfo: any;

@Component({
  selector: 'app-action-item-dashboard',
  templateUrl: './action-item-dashboard.component.html'
})
export class ActionItemDashboardComponent extends PageComponentParentComponent {
  tempDate: any;
  navigation: any;
  mode: any;
  parentPageData: any;
  projectParams: any;
  isFormSubmitted = false;
  parentPage: any;
  parentPageDataId: any;
  fileNameDisplayArray: any[] = [];
  uploadedDocuments: any[];
  actionItem: any;
  actionItems: any[] = [];
  actionItemIndexForUpdate: any;
  origTrackingItems: any[] = [];
  title: string;
  actionItemUpdateForCreateMode = false;
  startDate = false;
  endDate = false;
  receiptDate = false;
  siteUsersList: any;
  assignedUser = false;
  isDialogShown = true;
  assignedUserInfo: any;
  assignedTo: any;
  projects: any;
  teamsArr: any = [];
  scheduledDateErrorInTrackingItems = false;
  actualReceiptDateErrorInTrackingItems = false;
  actionItemsList = [];
  index: number;
  actionItemId: number;

  constructor(
    private restAPIService: RESTAPIService,
    private router: Router,
    public route: ActivatedRoute,
    public commonService: CommonService,
    private toastr: ToastrService,
    private commonDialogService: CommonDialogService) {
    super();

    this.route.queryParams.subscribe(params => {
      if (params.actionItemId) {
        let siteAllUsers;
        this.restAPIService.getAllSiteUsers().subscribe(users => {
          siteAllUsers = users;
        });
        this.actionItemId = parseInt(params.actionItemId, 10);

        forkJoin([this.restAPIService.getProjectsAsPerUserRole(null, AppConstants.SELECTED_FIELD_PROJECT),
        this.restAPIService.getActionItemsById(this.actionItemId)]).subscribe((responses: any[]) => {
          if (responses[0].data.length) {
            this.projects = [];
            for (const project of responses[0].data) {
              this.projects.push(project);
            }
          }

          if (responses[1].data) {
            this.actionItem = responses[1].data;
            this.actionItem.TrackingItems = JSON.parse(this.actionItem.TrackingItems);
            this.actionItem.title = this.actionItem.Title;
            this.actionItem.priority = this.actionItem.Priority;
            this.actionItem.description = this.actionItem.Description;
            this.actionItem.assignedTo = this.actionItem.AssignedTo;
            this.index = 0;

            // Now that we have the action item we also have the activity ID
            if (this.isNotUndefinedNullOrEmpty(this.actionItem.ParentId)) {
              this.restAPIService.getActivityById(this.actionItem.ParentId).subscribe((response: any) => {
                if (this.restAPIService.isSuccessResponse(response)) {
                  const activity = response.data;

                  // Update project info in the activity
                  if (this.projects.length) {
                    for (const project of this.projects) {
                      if (project.Identifier === activity.Identifier) {
                        // activity.project = project.contractNo;
                        activity.selectedProject = project;
                      }
                    }
                  }

                  this.navigation = this.router.getCurrentNavigation();
                  this.parentPageData = activity;
                  this.mode = params.mode || 'view';
                  this.projectParams = {};
                  this.parentPage = AppConstants.ACTIVITY_TYPE;
                  this.actionItems = this.actionItemsList;
                  this.siteUsersList = siteAllUsers;
                  this.getTeamNames();
                  this.getUserInfo();
                }
              });
            } else {
              console.log('Action Item Id is not available. Redirect will fail.');
            }
          }
        });
        // forkJoin([
        //   this.restAPIService.getProjectsAsPerUserRole(null, AppConstants.SELECTED_FIELD_PROJECT),
        //   this.restAPIService.getActivityById(params.ActivityId)]).subscribe((responses: any[]) => {
        //     if (responses[0].data.length) {
        //       this.projects = [];
        //       for (const project of responses[0].data) {
        //         this.projects.push({ Title: project.Title });
        //       }
        //     }

        //     responses[1].data.ActivityFileNames = JSON.parse(responses[1].data.ActivityFileNames);
        //     // responses[1].data.addNotification = JSON.parse(responses[1].data.addNotification);
        //     responses[1].data.TrackingItems = JSON.parse(responses[1].data.TrackingItems);

        //     this.parentPageData = responses[1].data;
        //     if (this.projects.length) {
        //       for (const project of this.projects) {
        //         if (project.Identifier === this.parentPageData.project) {
        //           this.parentPageData.selectedProject = project;
        //           this.getTeamNames();
        //         }
        //       }
        //     }
        //     this.mode = 'view';
        //     this.parentPage = 'Activity';
        //     this.actionItemUpdateForCreateMode = false;
        //     this.parentPageDataId = params.ActivityId;
        //     this.actionItemIndexForUpdate = params.Index;
        //     this.title = 'Viewing';
        //     this.actionItem = this.parentPageData.actionItemsObj[params.Index];
        //   });
      } else {
        this.navigation = this.router.getCurrentNavigation();
        this.parentPageData = this.navigation?.extras?.state.parentPageData;
        this.mode = this.navigation?.extras?.state.mode;
        this.projectParams = this.navigation?.extras?.state.projectParams;
        this.parentPage = this.navigation?.extras?.state.parentPage;
        this.fileNameDisplayArray = this.navigation?.extras?.state.parentFileNameDisplayArray;
        this.actionItems = this.navigation?.extras?.state.activityActionItems;
        this.siteUsersList = this.navigation?.extras?.state.siteUsersList;
        this.uploadedDocuments = this.navigation?.extras?.state.uploadedDocuments;
        this.getTeamNames();
        this.getUserInfo();

      }

      if (this.navigation?.extras?.state.actionItem) {
        if (this.mode === 'create') {
          this.actionItemUpdateForCreateMode = true;
        }
        this.actionItemIndexForUpdate = this.navigation?.extras?.state.index;
        this.actionItem = this.navigation?.extras?.state.actionItem;
        this.title = 'Update';
      }

      if (this.mode === 'create' && this.parentPage === 'Activity' && !this.navigation?.extras?.state.actionItem) {
        this.addActionItemObj();
        this.title = 'Create';
      }
      else {
        if (this.mode === 'edit' && this.parentPage === 'Activity' && !this.navigation?.extras?.state.actionItem) {
          this.addActionItemObj();
          this.title = 'Create';
        }
      }

      if (this.mode === 'edit' && this.navigation?.extras?.state.actionItem) {
        this.parentPageDataId = this.navigation?.extras?.state.parentPageDataId;
        this.actionItemIndexForUpdate = this.navigation?.extras?.state.index;
        this.title = 'Update';
        if (this.actionItems[this.actionItemIndexForUpdate].assignedTo !== '') {
          this.assignedUser = true;
          this.assignedTo = this.actionItems[this.actionItemIndexForUpdate].assignedTo;
        }
      }
      if (this.mode === 'view' && this.navigation?.extras?.state.actionItem) {
        this.parentPageDataId = this.navigation?.extras?.state.parentPageDataId;
        this.actionItemIndexForUpdate = this.navigation?.extras?.state.index;
        this.title = 'View';
      }
      // }

      if (this.actionItem) {
        // Use JSON functions to ensure there are no linkages with any data inside the array to other arrays, etc.
        AppConstants.originalActionItemList = JSON.parse(JSON.stringify(this.actionItems));
      }

      // If there is already an action item (meaning we are editing an existing one
      // then obtain its original tracking items for comparison later
      if (this.actionItem && this.actionItem.TrackingItems.length >= 1) {
        if (this.commonService.isNotUndefinedNullOrEmpty(this.actionItem.TrackingItems[0].scheduledDate)) {
          // Use JSON functions to ensure there are no linkages with any data inside the array to other arrays, etc.
          this.origTrackingItems = JSON.parse(JSON.stringify(this.actionItem.TrackingItems));
        }
      }
    });
  }

  endDateFocus(date) {
    this.tempDate = date;
  }

  compareStartAndEndDates(period, fieldName) {
    if (!period.dueDate) {
      return;
    }
    const comparisonOfDates = this.commonService.compareStartAndEndDates(period.startDate, period.dueDate);
    if (!comparisonOfDates) {
      if (fieldName === 'dueDate') {
        setTimeout(() => {
          period.dueDate = this.tempDate;
          this.toastr.error('Due Date must be on or after the Start Date');
        }, 0);
      }
      else {
        setTimeout(() => {
          period.startDate = this.tempDate;
          this.toastr.error('Start Date must be less than Due Date');
        }, 0);
      }
    }
  }

  setAssignedToUser() {
    this.assignedUser = false;
  }

  getUserInfo() {
    this.isDialogShown = true;
    const email = _spPageContextInfo.userEmail;
    if (email) {
      this.restAPIService.getUserProfile(`UserID eq '${email}'`).subscribe((response: any) => {
        if (this.restAPIService.isSuccessResponse(response)) {
          if (response && response.data.length) {
            const items = response.data.find(item => JSON.parse(item.isDialogShown));
            if (items && items.isDialogShown) {
              this.isDialogShown = false;
              this.assignedUserInfo = items;
            }
          }
        }
      });
    }
  }

  calculateActivityDays(item, type) {
    const a = moment(item.startDate, AppConstants.AP3DateFormat);
    const b = moment(item.dueDate, AppConstants.AP3DateFormat);
    const days = b.diff(a, 'days');
    if (item.durationIn === 'Days') {
      if (type === 'duration') {
        if (item.duration === 0) {
          item.duration = '';
        }
        if (item.duration > days) {
          // item.duration = days;
          this.toastr.error('Please enter a value less than the number of days between the Start and Due date.');
          this.actionItem.duration = '';
          this.actionItem.SelectTrigger = null;
          return;
        }
        else {
          // item.duration = days;
        }
      } else {
        if (days > 0) {
          // item.duration = days;
        } else {
          item.duration = '';
        }
      }
    }
  }

  addActionItemObj() {
    this.actionItem = {};
    this.actionItem.title = '';
    this.actionItem.priority = '';
    this.actionItem.assignedTo = '';
    // this.actionItem.status = 'Requirements Development';
    this.actionItem.TrackingItems = [{ addNotification: false, actualReceiptDate: '', scheduledDate: '' }];
    // this.actionItem.addNotification = '';
    // this.actionItem.durationIn = '';
    // this.actionItem.duration = '';
    // this.actionItem.SelectTrigger = '';
    // this.actionItem.recipients = '';
    this.actionItem.description = '';
  }

  validatePageClosure() {
    this.returnToMainPage();
  }

  returnToMainPage() {
    if (this.parentPage === 'Activity' && this.mode === 'create') {
      this.router.navigate(['activities', 'newactivity'], {
        queryParams: { mode: this.mode },
        state: {
          Activity: this.parentPageData,
          mode: this.mode,
          projectParams: this.projectParams,
          actionItem: this.actionItems,
          parentFileNameDisplayArray: this.fileNameDisplayArray,
          uploadedDocuments: this.uploadedDocuments
        }
      });
    }
    else {
      this.router.navigate([`activities/${this.parentPageDataId !== undefined ? this.parentPageDataId : this.parentPageData.ID}`], {
        queryParams: { mode: this.mode },
        state: {
          Activity: this.parentPageData,
          mode: this.mode, projectParams:
            this.projectParams, actionItem:
            this.actionItems,
          parentFileNameDisplayArray: this.fileNameDisplayArray,
          uploadedDocuments: this.uploadedDocuments
        }
      });
    }
  }

  checkTypingDateForCalendar(fieldName, obj) {
    this.commonService.isSomethingUnsaved = true;
    if (!obj) {
      obj = this.actionItem;
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

  cancel() {
    if (this.parentPage === 'Activity' && this.mode === 'create') {
      this.router.navigate(['activities', 'newactivity'], { queryParams: { mode: this.mode }, state: { Activity: this.parentPageData, mode: this.mode, projectParams: this.projectParams, actionItem: this.actionItem } });
    }
    else {
      this.router.navigate([`activities/${this.parentPageData.ID}`], { queryParams: { mode: this.mode }, state: { Activity: this.parentPageData, mode: this.mode, projectParams: this.projectParams, actionItem: this.actionItems } });
    }
  }

  startDateAllow() {
    this.startDate = true;
  }

  saveActionItemInMainPageData(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toastr.error(this.commonService.validationErrorMessage);
      return;
    }

    // Ensure that we do not use JSON.stringfy 2x's on the same array - results in malformatted JSON errors
    let temp: any;
    if (this.commonService.isNotUndefinedNullOrEmpty(this.actionItem) &&
      this.commonService.isNotUndefinedNullOrEmpty(this.actionItem.TrackingItems) &&
      Array.isArray(this.actionItem.TrackingItems)) {
      temp = JSON.stringify(this.actionItem.TrackingItems);
      // this.actionItem.TrackingItems = JSON.stringify(this.actionItem.TrackingItems);
    } else if (typeof this.actionItem.TrackingItems === 'string') {
      temp = this.actionItem.TrackingItems;
      // this.actionItem.TrackingItems = this.actionItem.TrackingItems;
    }


    // Update tracking information
    this.actionItem.TrackingItems = JSON.parse(this.removeEmptyTrackingItems(temp));
    // this.actionItem.TrackingItems = JSON.parse(this.removeEmptyTrackingItems(this.actionItem.TrackingItems));

    if (this.mode === 'create' && !this.navigation?.extras?.state.actionItem) {
      if (this.actionItemUpdateForCreateMode) {
        this.parentPageData.actionItemsObj.splice(this.actionItemIndexForUpdate, 1);
        this.parentPageData.actionItemsObj.splice(this.actionItemIndexForUpdate, 0, this.actionItem);
      }
      else {
        this.actionItems.push(this.actionItem);
      }
      console.log('this.parentPageData', this.parentPageData);
      this.actionItemUpdateForCreateMode = false;
      this.toastr.success('This action item has been attached to your Activity', '', { timeOut: 5000 });
      this.commonService.isSomethingUnsaved = false;
      this.returnToMainPage();
    }
    else if (this.mode === 'edit' && this.navigation?.extras?.state.actionItem) {
      if (this.actionItemUpdateForCreateMode) {
        this.actionItems.splice(this.actionItemIndexForUpdate, 1);
        this.actionItems.splice(this.actionItemIndexForUpdate, 0, this.actionItem);
      }
      else {
        this.actionItems[this.actionItemIndexForUpdate] = this.actionItem;
      }
      this.actionItemUpdateForCreateMode = false;
      this.toastr.success('This action item has been attached to your Activity', '', { timeOut: 5000 });
      this.commonService.isSomethingUnsaved = false;
      this.returnToMainPage();
    }
    else {
      if (this.mode === 'edit') {
        this.actionItems.push(this.actionItem);
      }
      else {
        this.actionItems[this.actionItemIndexForUpdate] = this.actionItem;
      }
      this.toastr.success('Action Item updated successfully', '', { timeOut: 5000 });
      this.commonService.isSomethingUnsaved = false;
      this.returnToMainPage();
    }
  }

  onAddNotification(trackingItem: any, val?) {
    if (trackingItem.scheduledDate === '') {
      this.toastr.error('You must enter a valid Scheduled Date before scheduling a notification.');
      return;
    }
    if (val === 'view') {
      trackingItem.mode = val;
    }
    // trackingItem.fromInvoicePage = true;

    const projectTeamNames = [];
    let finalProjectTeamNames;

    projectTeamNames.push(this.parentPageData.selectedProject.Team.requirementsowner);
    projectTeamNames.push(this.parentPageData.selectedProject.Team.contractingOfficer);
    if (this.parentPageData.selectedProject.Team.assignedSupportContractor !== '') {
      projectTeamNames.push(this.parentPageData.selectedProject.Team.assignedSupportContractor);
    }
    if (this.parentPageData.selectedProject.Team.contractSpecialist !== '') {
      projectTeamNames.push(this.parentPageData.selectedProject.Team.contractSpecialist);
    }
    if (this.parentPageData.selectedProject.Team.contractingOfficerRepresentative !== '') {
      projectTeamNames.push(this.parentPageData.selectedProject.Team.contractingOfficerRepresentative);
    }
    if (this.parentPageData.selectedProject.Team.projectManager !== '') {
      projectTeamNames.push(this.parentPageData.selectedProject.Team.projectManager);
    }
    if (this.parentPageData.selectedProject.Team.teamMates.length) {
      for (const name of this.parentPageData.selectedProject.Team.teamMates) {
        projectTeamNames.push(name.name);
      }
    }
    if (projectTeamNames.length) {
      finalProjectTeamNames = projectTeamNames.filter(this.onlyUnique);
    }
    else {
      finalProjectTeamNames = [];
    }

    this.commonDialogService.openTrackingItemDialog({ trackingItem, teams: finalProjectTeamNames, siteAllUsers: this.siteUsersList }).subscribe((result: any) => {
      if (result) {
        this.commonService.isSomethingUnsaved = true;
        trackingItem.category = result.category;
        trackingItem.numberOfDays = result.numberOfDays;
        trackingItem.recipient = result.recipient;
        trackingItem.email = result.email;
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
                AppConstants.actionItemNotificationsToBeEdited.push(revisedItem);
              }
            }
          }
        } else {
          // trackingItem.NotificationIdentifier = this.restAPIService.getUniqueId();
          const revisedItem = this.addAdditionalTrackingAttributesToItem(trackingItem);
          AppConstants.actionItemNotificationsToBeAdded.push(revisedItem);
        }

        // if (this.isNotUndefinedNullOrEmpty(result.NotificationIdentifier)) {
        //   for (var counter: number = 0; counter < this.origTrackingItems.length; counter++) {
        //     if (this.origTrackingItems[counter].NotificationIdentifier === result.NotificationIdentifier) {
        //       //check to see if the existing notification has been changed
        //       if (
        //         this.origTrackingItems[counter].Due_Date !== result.Due_Date ||
        //         this.origTrackingItems[counter].category !== result.category ||
        //         parseInt(this.origTrackingItems[counter].numberOfDays) !== parseInt(result.numberOfDays) ||
        //         JSON.stringify(this.origTrackingItems[counter].recipient) !== JSON.stringify(result.recipient)) {

        //         AppConstants.actionItemNotificationsToBeEdited.push(trackingItem);
        //       }
        //     }
        //   }
        // } else {
        //   trackingItem.NotificationIdentifier = this.restAPIService.getUniqueId();
        //   AppConstants.actionItemNotificationsToBeAdded.push(trackingItem);
        // }
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
    delete trackingItem.email;
    delete trackingItem.allTeamMates;
    delete trackingItem.Due_Date;
    delete trackingItem.NotificationIdentifier;
    trackingItem.addNotification = false;
    if (trackingItem.mode) {
      delete trackingItem.mode;
    }

    // Iterate through original notification configuration list and get the id to be deleted
    for (let iterator = 0; iterator < this.origTrackingItems.length; iterator++) {
      if (trackingItem.NotificationIdentifier === this.origTrackingItems[iterator].NotificationIdentifier) {
        AppConstants.actionItemNotificationsToBeDeleted.push(this.origTrackingItems[iterator].NotificationIdentifier);
      }
    }

    // Ensure that if the item to be deleted was added in this current session we remove it from the to be added list
    for (let counter = 0; counter < AppConstants.actionItemNotificationsToBeAdded.length; counter++) {
      if (trackingItem.NotificationIdentifier === AppConstants.actionItemNotificationsToBeAdded[counter].NotificationIdentifier) {
        AppConstants.actionItemNotificationsToBeAdded.splice(counter);
      }
    }
  }

  addTrackingItem(actionItem?) {
    this.actionItem.TrackingItems.push({
      addNotification: false,
      actualReceiptDate: '',
      scheduledDate: '',
    });
    this.commonService.isSomethingUnsaved = true;
  }

  deleteTrackingItem(actionItem, trackingItemIndex) {
    if (confirm('Are you sure you wish to delete this tracking item?')) {
      actionItem.TrackingItems.splice(trackingItemIndex, 1);
      this.commonService.isSomethingUnsaved = true;
    }
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  openNotesModal() {
    this.commonDialogService.openNotesModal({ Level: 'Action Item', ParentId: String(this.actionItem.ID), Name: this.actionItem.title }).subscribe((result: any) => {
      console.log('result', result);
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

    // If there is no data we should try to perform functions
    if (this.parentPageData && this.parentPageData.selectedProject && this.parentPageData.selectedProject.Team) {
      if (this.parentPageData.selectedProject.Team.requirementsowner !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.requirementsowner);
      }
      if (this.parentPageData.selectedProject.Team.contractingOfficer !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.contractingOfficer);
      }
      if (this.parentPageData.selectedProject.Team.assignedSupportContractor !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.assignedSupportContractor);
      }
      if (this.parentPageData.selectedProject.Team.contractSpecialist !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.contractSpecialist);
      }
      if (this.parentPageData.selectedProject.Team.contractingOfficerRepresentative !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.contractingOfficerRepresentative);
      }
      if (this.parentPageData.selectedProject.Team.projectManager !== '') {
        projectTeamNames.push(this.parentPageData.selectedProject.Team.projectManager);
      }
      if (this.parentPageData.selectedProject.Team.teamMates.length) {
        for (const name of this.parentPageData.selectedProject.Team.teamMates) {
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
  //     const temp = JSON.parse(trackingItems);
  //     for (const item of temp) {
  //       // if (trackingItems !== emptyArrayValue) {//checks to see if the trackig info is empty
  //       if (!item.hasOwnProperty('category')) {
  //         item.category = '';
  //       }
  //       if (!item.hasOwnProperty('numberOfDays')) {
  //         item.numberOfDays = '';
  //       }
  //       if (!item.hasOwnProperty('recipient')) {
  //         item.recipient = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //       }
  //       if (!item.hasOwnProperty('allTeamMates')) {
  //         item.allTeamMates = '';
  //       }
  //       if (!item.hasOwnProperty('processStage')) {
  //         item.processStage = '';
  //       }
  //       if (!item.hasOwnProperty('email')) {
  //         item.email = []; //Needs to be array otherwise Powerautomate script JSON parser throws error
  //       }
  //       // TODO - need to clean this up and ensure that that we check to make sure there isn't already a notification id with this value already in the system
  //       if (!item.hasOwnProperty('NotificationIdentifier')) {
  //         item.NotificationIdentifier = this.restAPIService.getUniqueId();
  //       }
  //       if (item.scheduledDate !== '' && item.category !== '') {
  //         if (this.sendOutNotificationToday(item)) {
  //           item.isScheduled = 'No';
  //         } else {
  //           item.isScheduled = 'Yes';
  //         }
  //       } else {
  //         item.isScheduled = 'Yes';
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

  getTeamMates(term: string) {
    if (term === '') {
      return of([]);
    } else if (this.teamsArr && this.teamsArr.length > 0) {
      return of(this.commonService.searchObj(this.teamsArr, term));
    }
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
