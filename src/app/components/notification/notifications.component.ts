import { Component } from '@angular/core';
import { PageComponentParent } from '../../PageComponentParent';
import { RESTAPIService } from '../../services/REST-API.service';
import { NotificationConfiguration } from '../../models/notification.model';
import { Pagination, SortAndFilterTopLevelObjects } from "../../pipes/pipes";
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { forkJoin } from 'rxjs';
import { AppConstants } from 'src/app/AppConstants';
// import { count } from 'console';
declare const _spPageContextInfo: any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent extends PageComponentParent {
  public readonly tabs = ['Current', 'UpComing', 'Previous'];
  notifications = {
    Current: [],
    UpComing: [],
    Previous: []
  };
  filterValue = '';
  sortBy = 'Due Date/Receipt Date';
  reverse = true;
  actionItem: any;
  index: number;
  actionItemsList: any[];
  filterByFields = ['Type', 'Subject', 'Activity Title', 'Tirgger', 'Created Date', 'Due Date/Receipt Date'];
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  projects: any;
  project: any;

  constructor(
    private commonService: CommonService,
    private restAPIService: RESTAPIService,
    private router: Router,
    private sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    private pagination: Pagination) {

    super();

    forkJoin([
      this.restAPIService.getSettingsConfigurations(),
      this.restAPIService.getNotificationConfiguration(this.commonService.getUserNotificationRequestFilter(), '*&$top=5000')]).subscribe((response) => {
        let upComing = 0;
        let previous = 0;
        if (this.restAPIService.isSuccessResponse(response[0])) {
          // Pulls in the number of days set for policy retention from admin settings page
          upComing = response[0].data[0].w5sx;
          previous = response[0].data[1].w5sx;
        }
        // Pulls in today (e.g. Tue May 25 2021 00:00:00 GMT-0400 (Eastern Daylight Time))
        const today = moment().startOf('day');
        // Adds policy retention number of days from current day (e.g. adds 7 days to current date)
        const upcomingBoundDate = moment().endOf('day').add(upComing, 'day');
        // Subtracts policy retention number of days from current day (e.g. adds 7 days to current date)
        const previousBoundDate = moment().startOf('day').subtract(previous, 'day');
        // console.log(today, upcomingBoundDate, previousBoundDate);
        if (this.restAPIService.isSuccessResponse(response[1])) {
          const notificationConfigurations: NotificationConfiguration[] = response[1].data;

          this.paginationParams.itemCount = notificationConfigurations.length;

          for (const notification of notificationConfigurations) {
            const dueDate = moment(notification.Due_Date).endOf('day');
            const afterReceiptDate = moment(notification.ReceiptDate).endOf('day');

            notification.dueDateForShow = moment(notification.Due_Date).startOf('day').add(notification.number, 'day').format('MM-DD-YYYY');
            notification.afterReceiptDateForShow = moment(notification.ReceiptDate).startOf('day').subtract(notification.number, 'day').format('MM-DD-YYYY');

            if ((notification.trigger_type === 'Before Due Date' || notification.trigger_type === 'Before Scheduled Date')) {
              if (dueDate.format('MM-DD-YYYY') === today.format('MM-DD-YYYY')) {
                this.notifications.Current.push(notification);
              }
              else if (dueDate.isAfter(today) && dueDate.isSameOrBefore(upcomingBoundDate)) {
                if (notification.isCurrentNotification === 'No') {
                  this.notifications.UpComing.push(notification);
                }
              }
              else if (dueDate.isBefore(today) && dueDate.isSameOrAfter(previousBoundDate)) {
                if (notification.isCurrentNotification === 'No') {
                  this.notifications.Previous.push(notification);
                }
              }
            }
            else if (notification.trigger_type === 'After Receipt Date') {
              if (afterReceiptDate.format('MM-DD-YYYY') === today.format('MM-DD-YYYY')) {
                this.notifications.Current.push(notification);
              }
              else if (afterReceiptDate.isAfter(today) && afterReceiptDate.isSameOrBefore(upcomingBoundDate)) {
                if (notification.isCurrentNotification === 'No') {
                  this.notifications.UpComing.push(notification);
                }
              }
              else if (afterReceiptDate.isBefore(today) && afterReceiptDate.isSameOrAfter(previousBoundDate)) {
                if (notification.isCurrentNotification === 'No') {
                  this.notifications.Previous.push(notification);
                }
              }
            }
          }
        }
      });
  }

  filterFn(items: any[], filterValue: string, usePagination: boolean = true) {
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);
    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }
    const result = [];
    for (const project of tempResult) {
      result.push(project);
    }
    return result;
  }

  clearSearch() {
    this.filterValue = '';
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

  isNotUndefinedNullOrEmpty(object) {
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

  goToSource(notification, isEdit: string) {
    if (notification.ParentType === AppConstants.ACTIVITY_TYPE) {
      this.router.navigate(['activities', notification.ParentId], { queryParams: { mode: isEdit } });
    } else if (notification.ParentType === AppConstants.ACTION_ITEM_TYPE) {
      let siteAllUsers;
      this.restAPIService.getAllSiteUsers().subscribe((users: any) => {
        siteAllUsers = users.data;
      });
      forkJoin([this.restAPIService.getProjectsAsPerUserRole(null, AppConstants.SELECTED_FIELD_PROJECT),
      this.restAPIService.getActionItems(`ID eq '${notification.ParentId}'`)]).subscribe((responses: any[]) => {
        //this.restAPIService.getActivityById(notification.ParentId)]).subscribe((responses: any []) => {
        if (responses[0].data.length) {
          this.projects = [];
          for (const project of responses[0].data) {
            this.projects.push(project);
          }
        }

        // For whatever reason data returned is a list despite the fact that we perform a lookup by ActionItem ID
        if (responses[1].data) {
          this.actionItem = responses[1].data[0];
          this.index = 0;

          //Now that we have the action item we also have the activity ID
          if (this.isNotUndefinedNullOrEmpty(this.actionItem) && (this.isNotUndefinedNullOrEmpty(this.actionItem.ParentId))) {
            this.restAPIService.getActivityById(this.actionItem.ParentId).subscribe((response: any) => {
              if (this.restAPIService.isSuccessResponse(response)) {
                this.restAPIService.getActionItems(`ParentId eq '${this.actionItem.ParentId}'`).subscribe((getAllActionItemsResponse: any) => {
                  if (this.restAPIService.isSuccessResponse(getAllActionItemsResponse)) {
                    this.actionItemsList = [];
                    this.actionItemsList = getAllActionItemsResponse.data;

                    let activity = response.data;
                    activity.ActivityFileNames = JSON.parse(activity.ActivityFileNames);
                    activity.TrackingItems = JSON.parse(activity.TrackingItems);

                    //Update project info in the activity
                    if (this.projects.length) {
                      for (const project of this.projects) {
                        if (project.Title.toLowerCase() === notification.ContractNo.toLowerCase()) {
                          // activity.project = project.contractNo;
                          activity.selectedProject = project;
                        }
                      }
                    }

                    this.router.navigate(['action-item'], {
                      state: {
                        parentPageData: activity,
                        mode: isEdit,
                        projectParams: {},
                        parentPage: AppConstants.ACTIVITY_TYPE,
                        parentPageDataId: activity.ID,
                        activityActionItems: this.actionItemsList,
                        siteUsersList: siteAllUsers,
                        index: this.index,
                        actionItem: this.actionItem
                      }
                    });
                  }
                  else {
                    console.log('No Action Items found');
                  }
                });
              }
            });
          } else {
            console.log('Activity Id is not available in Action Item. Redirect will fail.');
          }
        }
      });
    }
  }
}
