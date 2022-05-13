import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { RESTAPIService } from '../../services/REST-API.service';
import { forkJoin } from 'rxjs';
import { NotificationConfiguration } from '../../models/notification.model';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../AppConstants';
import { CommonDialogService } from '../../services/common-dialog.service';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from 'src/app/services/notification-service';
import { Pagination, SortAndFilterTopLevelObjects } from '../../pipes/pipes';
import {take} from 'rxjs/operators';

declare const _spPageContextInfo: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  exportAs: 'header'
})
export class HeaderComponent {
  @HostBinding() class = 'header_wrap';
  public showSideBar = false;
  mobileMenuOpen = false;
  notifications = [];
  approvals = [];
  profileSec = false;
  userInfo: any = _spPageContextInfo;
  imagePath: any;
  userData: any;
  firstName: any;
  menuItems: any[] = [
    {
      name: 'Planning Overview',
      url: '/acquisitions-overview',
      children: []
    },
    {
      name: 'Work Categories',
      children: [
        {name: 'Requirements Development', url: '/requirementsdevelopment'},
        {name: 'Market Research', url: '/marketresearch'},
        {name: 'Develop Acquisition Plan', url: '/developacquisitionsplan'},
        {name: 'Procurement Request Package', url: '/procurementrequestpackage'}
      ]
    },
    {
      name: 'Tutorials',
      url: '/tutorialspage',
      children: []
    },
    {
      name: 'Templates',
      url: '/templatesspage',
      children: []
    }
  ];

  siteAllUsers: any = [];

  // counter = 0;

  constructor(
    public commonService: CommonService,
    private commonDialogService: CommonDialogService,
    private router: Router,
    private restAPIService: RESTAPIService,
    private toastr: ToastrService,
    private sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    private pagination: Pagination) {
    console.log('fff', this.userInfo);

    // Ensures that when the user refreshes the page all in-app notifications are displayed and
    // the number above the notifications and approvals icons are displayed
    this.showNotifications(true);

    this.restAPIService.getAllSiteUsers().subscribe(users => {
      this.siteAllUsers = users;
    });
    this.getUserInfo();

    this.firstName = this.userInfo.userDisplayName.substr(0, this.userInfo.userDisplayName.indexOf(' '));

    this.restAPIService.refreshNotifications.subscribe({
      next: () => {
        // When this method is set to false, it only updates the number above the list and doesn't display an in-app notification toaster message
        this.showNotifications(false);
      }
    });

    if (this.userInfo.userDisplayName !== 'Head of Contracting Activity' && this.userInfo.userDisplayName !== 'Senior Procurement Executive' && this.userInfo.userDisplayName !== 'Program Director/Program Executive Officer') {
      const documentCollab: any = {
        name: 'Document Collaboration',
        url: '/documents',
        children: []
      };
      this.menuItems.push(documentCollab);
    }
  }

  getUserInfo() {
    this.restAPIService.getUserProfile(`UserID eq '${_spPageContextInfo.userEmail}'`).subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        // let arr = response.data.reverse();
        if (response.data.length > 0) {
          const lastUpdatedItem = response.data.slice(-1);
          this.userData = lastUpdatedItem[0];
          this.imagePath = `${this.userInfo.webAbsoluteUrl}/UserProfileData/${this.userData.ProfilePictureName}`;
        } else {
          this.imagePath = `${environment.assetsBaseUrl}assets/images/user_profile_256.png`;
        }
      }
    });
  }

  editUserProfile() {
    const obj = {
      UserID: this.userInfo.userEmail,
      bio: this.userData && this.userData.Bio ? this.userData.Bio : ''
    };
    // const modalRef = this.modalService.open(EditUserProfileComponent, { windowClass: 'large-modal' });
    // modalRef.componentInstance.anyDataForm = obj;
    // let obj = {
    //   id: item.ID,
    //   title: item.DocumentTitle,
    //   type: item.Category,
    //   verComments : "",
    // }
    this.commonDialogService.openEditProfileModelModel(obj).subscribe((result: any) => {
      this.getUserInfo();
      if (result) {
        console.log('result', result);
      }
    });
  }

  showProfileSec() {
    this.profileSec = !this.profileSec;
  }

  showNotifications(showToaster: boolean) {
    forkJoin([
      this.restAPIService.getSettingsConfigurations(),
      this.restAPIService.getNotificationConfiguration(this.commonService.getUserNotificationRequestFilter()),
      this.restAPIService.getDocumentForApprovalList()]).subscribe((response) => {
        this.notifications = [];
        this.approvals = [];
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
        // const upcomingBoundDate = moment().endOf('day').add(upComing, 'day');
        // Subtracts policy retention number of days from current day (e.g. adds 7 days to current date)
        // const previousBoundDate = moment().startOf('day').subtract(previous, 'day');
        // console.log(today, upcomingBoundDate, previousBoundDate);

        if (this.restAPIService.isSuccessResponse(response[1])) {
          const notificationConfigurations: NotificationConfiguration[] = response[1].data;
          // const notificationType = response[2].data;
          for (const notification of notificationConfigurations) {
            const dueDate = moment(notification.Due_Date).endOf('day');
            const afterReceiptDate = moment(notification.ReceiptDate).endOf('day');

            notification.dueDateForShow = moment(notification.Due_Date).startOf('day').add(notification.number, 'day').format('MM-DD-YYYY');
            notification.afterReceiptDateForShow = moment(notification.ReceiptDate).startOf('day').subtract(notification.number, 'day').format('MM-DD-YYYY');

            if ((notification.trigger_type === 'Before Due Date' || notification.trigger_type === 'Before Scheduled Date')) {
              if (dueDate.format('MM-DD-YYYY') === today.format('MM-DD-YYYY')) {
                const valueCheck = this.notifications.filter(v => v.NotificationIdentifier.toLowerCase() === notification.NotificationIdentifier.toString().toLowerCase());
                if (!valueCheck.length) {
                  this.notifications.push(notification);
                  if (showToaster) {
                    if (notification.Types === AppConstants.ASSIGN_TO ||
                      notification.Types === AppConstants.ASSIGN_TO_ACTION_ITEM) {
                      this.toastr.warning(AppConstants.ASSIGN_TO_TEXT)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId, 10)));
                    } else if (notification.Types === AppConstants.PROCESS_PR_TO_CONTRACTS) {
                      this.toastr.warning(AppConstants.PR_PCKG_APPROVAL)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId)));
                    } else if (notification.Types === AppConstants.ACTION_REQUIRED) {
                      this.toastr.warning(notification.Title)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId)));
                    } else {
                      this.toastr.warning(notification.Title);
                    }
                  }
                }
              }
            } else if (notification.trigger_type === 'After Receipt Date') {
              if (afterReceiptDate.format('MM-DD-YYYY') === today.format('MM-DD-YYYY')) {
                const valueCheck = this.notifications.filter(v => v.toLowerCase() === notification.toString().toLowerCase());
                if (!valueCheck.length) {
                  this.notifications.push(notification);
                  if (showToaster) {
                    if (notification.Types === AppConstants.ASSIGN_TO ||
                      notification.Types === AppConstants.ASSIGN_TO_ACTION_ITEM) {
                      this.toastr.warning(AppConstants.ASSIGN_TO_TEXT)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId, 10)));
                    } else if (notification.Types === AppConstants.PROCESS_PR_TO_CONTRACTS) {
                      this.toastr.warning(AppConstants.PR_PCKG_APPROVAL)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId)));
                    } else if (notification.Types === AppConstants.ACTION_REQUIRED) {
                      this.toastr.warning(notification.Title)
                        .onTap
                        .subscribe(() => this.toasterRedirectdHandler(notification, notification.ParentType, parseInt(notification.ParentId)));
                    } else {
                      this.toastr.warning(notification.Title);
                    }
                  }
                }
              }
            }
          }
        }
        if (this.restAPIService.isSuccessResponse(response[2])) {
          const myApprovalList: any[] = response[2].data;
          for (const approval of myApprovalList) {
            const incomingEmail: string = approval.Approver ? approval.Approver : '';
            const currentUserEmail: string = this.userInfo.userEmail ? this.userInfo.userEmail : '';
            if (incomingEmail.trim() === currentUserEmail.trim()) {
              if (approval.Status === AppConstants.PENDING) {
                this.approvals.push(approval);
                if (showToaster) {
                  this.toastr.warning(approval.Title)
                    .onTap
                    .pipe(take(1))
                    .subscribe(() => this.goToDocApprovalPage());
                }
              }
            }
          }
        }
      });
    }

  toasterRedirectdHandler(notification, parentType: string, objectID: number) {
    console.log('Toastr clicked');
    // Create manage notifications object
    const manageNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ACTION_REQUIRED);

    if (
      this.commonService.isNotUndefinedNullOrEmpty(parentType) &&
      this.commonService.isNotUndefinedNullOrEmpty(objectID)) {
      if (parentType === AppConstants.ACTIVITY_TYPE) {
        this.router.navigate(['activities', objectID], { queryParams: { mode: 'edit' } });
      } else if (parentType === AppConstants.ACTION_ITEM_TYPE) {
        manageNotifications.goToSource(notification, 'edit');
      }
      // TODO
      // Need to go in and add support for redirect of all notification types
    } else {
      console.log('On-click cannot be called since notification type, object parent type, or object id is undefined, null, or empty.');
    }
  }

  menuItemClicked(event, clickedItem) {
    console.log(clickedItem);
    if (clickedItem === 'setting.logout' && confirm('Are you sure you wish to logout of the system?')) {
      window.location.href = _spPageContextInfo.webServerRelativeUrl + AppConstants.logoutPath;
    } else if (clickedItem === 'setting.administrationSettings') {
      this.router.navigate(['user-settings']);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleSideBar() {
    this.showSideBar = !this.showSideBar;
  }

  navigateToUrl(url: any) {
    if (url !== '') {
      this.router.navigateByUrl(url);
    }
  }

  goToDocApprovalPage() {
    this.router.navigate(['document-approval']);
  }

  goToNotifications() {
    this.router.navigate(['notifications']);
  }

  // Object comparators
  deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = this.isObject(val1) && this.isObject(val2);
      if (
        areObjects && !this.deepEqual(val1, val2) ||
        !areObjects && val1 !== val2
      ) {
        return false;
      }
    }

    return true;
  }

  // comparator object helper method
  isObject(object) {
    return object != null && typeof object === 'object';
  }

}
