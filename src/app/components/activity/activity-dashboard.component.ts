import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageComponentParent } from '../../PageComponentParent';
import { RESTAPIService } from '../../services/REST-API.service';
import { forkJoin, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../AppConstants';
import { ExportToCsv } from 'export-to-csv';
import { CommonService } from '../../services/common.service';
import { ObjectOperationsService } from '../../services/object-operations.service';
import { CommonDialogService } from '../../services/common-dialog.service';
import { NotificationService } from 'src/app/services/notification-service';

declare const _spPageContextInfo: any;

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html'
})
export class ActivityDashboardComponent extends PageComponentParent {
  tabs: any = {
    MyActivities: 'MyActivities',
    TeamActivities: 'TeamActivities',
    AllActivities: 'AllActivities'
  };
  projects: any[] = [];
  submitForApprovalSPData: any[] = [];
  sortInfoObj = {};
  public readonly widgetNames = AppConstants;
  public filterValue = '';
  filterProjectsBy = ['Title', 'Identifier', 'CreationDate', 'Requested_Award_Date'];
  filterActivitiesBy = ['ActivityType', 'Title', 'ScheduledDate'];
  filterItemCountTracker: any = {};
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  public selectedTab = this.tabs.MyActivities;
  showMyActivitiesTab = false;
  showTeamActivitiesTab = false;
  showAllActivities = false;
  allTabHidden = false;
  readonly csvOptions = {
    filename: 'Activities list',
    showLabels: true,
    headers: []
  };
  columnNames = [
    { av: 'Identifier', dv: 'Project Identifier' },
    { av: 'Title', dv: 'Project Name' },
    { av: 'CreationDate', dv: 'Project Creation Date' },
    { av: 'Requested_Award_Date', dv: 'Requested Award Date' },
    { av: 'ActivityType', dv: 'Activity Type' },
    { av: 'Title', dv: 'Activity Title' }
  ];
  totalActivitiesCount = 0;
  userInfo: any;
  active = 5;

  constructor(private restAPIService: RESTAPIService, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, public commonService: CommonService, private commonDialogService: CommonDialogService, private cdRef: ChangeDetectorRef) {
    super();


    this.route.queryParams.subscribe((params) => {
      let columnFilterString;
      if (params.filterBy && params.filterValue) {
        columnFilterString = `${params.filterBy} eq '${params.filterValue}'`;
      } else if (params.filter) {
        columnFilterString = params.filter;
      }

      for (const column of this.columnNames) {
        this.csvOptions.headers.push(column.dv);
      }
      this.userInfo = {
        name: _spPageContextInfo.userDisplayName,
        email: _spPageContextInfo.userEmail
      };
      forkJoin([this.restAPIService.getDataFromProjectGeneral(null, AppConstants.SELECTED_FIELD_PROJECT),
        this.restAPIService.getActivities(columnFilterString, AppConstants.SELECTED_FIELD_ACTIVITY_LIST),
        this.restAPIService.getDocumentForApproval()]).subscribe((response: any) => {
        const projectsMap = {};
        if (this.restAPIService.isSuccessResponse(response[0])) {
          this.projects = [];
          for (const projectObj of response[0].data) {
            const project = projectObj;
            project.activities = [];
            project.isTeamProject = ObjectOperationsService.isTeamMate(_spPageContextInfo.userDisplayName, project.Team);
            projectsMap[project.Identifier] = project;
          }
        }

        if (this.restAPIService.isSuccessResponse(response[1])) {
          // this.totalActivitiesCount = response[1].data.length;
          for (const activityObj of response[1].data) {
            const activity = ObjectOperationsService.parseActivityList(activityObj);

            if (projectsMap[activity.Identifier]) {
              projectsMap[activity.Identifier].activities.push(activity);
              activity.isMyactivity = false;
              activity.isTeamActivity = false;
              if (activity.AssignedTo === this.userInfo.name) {
                activity.isMyactivity = true;
                this.showMyActivitiesTab = true;
                this.selectedTab = this.tabs.MyActivities;
              }
              // else if (activity.actionItemsObj) {
              //   for (const item of activity.actionItemsObj) {
              //     if (item.AssignedTo === this.userInfo.name){
              //       activity.isMyactivity = true;
              //       this.showMyActivitiesTab = true;
              //       this.selectedTab = this.tabs.MyActivities;
              //       break;
              //     }
              //   }
              // }
              if (projectsMap[activity.Identifier].isTeamProject) {
                activity.isTeamActivity = true;
                this.showTeamActivitiesTab = true;
                this.selectedTab = this.tabs.TeamActivities;
              }
              this.totalActivitiesCount++;
            }
          }
        }

        if (this.restAPIService.isSuccessResponse(response[2])) {
          this.submitForApprovalSPData = response[2].data;
        }

        for (const identifier in projectsMap) {
          if (projectsMap.hasOwnProperty(identifier) && projectsMap[identifier].activities.length > 0) {
            this.projects.push(projectsMap[identifier]);
          }
        }

        this.paginationParams.itemCount = this.projects.length;
        this.showAllActivities = this.commonService.isUserSSCAdministrator() || this.commonService.isUserHeadOfContractingActivity() || this.commonService.isUserSeniorProcurementExecutive() || this.commonService.isUserProgramDirector() || this.commonService.isUserCPIAdministrator() || this.commonService.isUserQualityAssuranceCompliance();
        if (this.showAllActivities) {
          this.selectedTab = this.tabs.AllActivities;
        }
        if (this.showAllActivities || this.showMyActivitiesTab || this.showTeamActivitiesTab) {
          this.allTabHidden = false;
        } else {
          this.allTabHidden = true;
          this.totalActivitiesCount = 0;
          alert('You have no activities to view.');
        }
        if (this.projects.length > 0) {
          for (const a of this.projects) {
            if (a.activities.length > 0) {
              a.activities = a.activities.reduce((r, at) => {
                r[at.ActivityType] = r[at.ActivityType] || [];
                r[at.ActivityType].push(at);
                return r;
              }, Object.create(null));
            }
          }
        }
        this.cdRef.detectChanges();
      });
    });
  }

  clearSearch() {
    this.filterValue = '';
  }

  createNewActivity() {
    if (!this.commonService.canCreateActivities()) {
      return;
    }
    this.router.navigate(['activities/newactivity'], { queryParams: { mode: 'create' } });
  }

  goToActivity(activityObj, isEdit?) {
    if (isEdit && !this.commonService.canEditActivities(activityObj)) {
      return;
    }
    this.router.navigate([`activities/${activityObj.ID}`], { queryParams: { mode: isEdit ? 'edit' : 'view' } });
  }

  deleteActivity(activityObj, project, objName) {

    const hasApproval = activityObj.ActivityFileNames.some(element => {
        if (this.checkIfDocumentForApproval(this.submitForApprovalSPData, element))
        {
          return true;
        }
    });

    if (hasApproval)
    {
      console.log('The system cannot delete this activity because there are one or more document workflow requests attached to it. Please delete all document workflow requests attached to this activity and try again.');
      this.toastr.warning('The system cannot delete this activity because there are one or more document workflow requests attached to it. Please delete all document workflow requests attached to this activity and try again', '', { timeOut: 5000 });
      return;
    }

    if (!this.commonService.canDeleteActivities(activityObj)) {
      console.log('User does not have the necessary permissions to delete this activity.');
      this.toastr.warning('You do not have the permissions required to delete this activity. Action has been aborted', '', { timeOut: 5000 });
      return;
    }

    // Create Assign/Unassign To manage notifications object
    const manageNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO);

    if (confirm('Are you sure you want to delete this activity?')) {

      if (activityObj.ActivityFileNames !== null && activityObj.ActivityFileNames.length > 0) {

        this.restAPIService.deleteActivity(activityObj.ID).subscribe(response => {
          if (this.restAPIService.isSuccessResponse(response)) {
            const idx = project.activities[objName].findIndex(x => x.ID === activityObj.ID);
            project.activities[objName].splice(idx, 1);
            if (!project.activities[objName].length) {
              delete project.activities[objName];
            }
            if (Object.keys(project.activities).length === 0) {
              this.projects.splice(this.projects.indexOf(project), 1);
            }

            this.deleteDocumentsFromRepository(activityObj, project, objName);

            // Sends Unassign emails to users listed in Assign To text input field of activity
            manageNotifications.postEmailsAndAddOrDeleteNotificaitonsForActivities(activityObj, activityObj.AssignedTo, '', AppConstants.DELETE);

            // Deletes any other notifications associated with this activity
            manageNotifications.deleteAllNotificationsForActivity(activityObj);

            this.deleteActionItemsFromSPList(activityObj);

            this.totalActivitiesCount = this.totalActivitiesCount - 1;

            this.toastr.success('Activity deleted successfully.');
          } else {
            this.toastr.error('The system was not able to delete the activity.');
          }
        });
      }
      else {
        this.restAPIService.deleteActivity(activityObj.ID).subscribe(response => {
          if (this.restAPIService.isSuccessResponse(response)) {
            const idx = project.activities[objName].findIndex(x => x.ID === activityObj.ID);
            project.activities[objName].splice(idx, 1);
            if (!project.activities[objName].length) {
              delete project.activities[objName];
            }
            if (Object.keys(project.activities).length === 0) {
              this.projects.splice(this.projects.indexOf(project), 1);
            }

            this.toastr.success('Activity deleted successfully.');
            this.totalActivitiesCount = this.totalActivitiesCount - 1;

            // Sends Unassign emails to users listed in Assign To text input field of activity
            manageNotifications.postEmailsAndAddOrDeleteNotificaitonsForActivities(activityObj, activityObj.AssignedTo, '', AppConstants.DELETE);

            // Deletes any other notifications associated with this activity
            manageNotifications.deleteAllNotificationsForActivity(activityObj);

            this.deleteActionItemsFromSPList(activityObj);

          } else {
            this.toastr.error('The system was not able to delete the activity.');
          }
        });
      }
    }
  }

  deleteDocumentsFromRepository(activityObj: any, project: any, objName: any) {
    for (const item of activityObj.ActivityFileNames) {
      //      this.restAPIService.getRepositoryData(`DocumentTitle eq '${item.trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,ContractNo,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((repoResponse: any) => {
      this.restAPIService.getRepositoryData(`DocumentTitle eq '${item.trim()}'`, 'ID,DocumentTitle,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((repoResponse: any) => {
        if (this.restAPIService.isSuccessResponse(repoResponse)) {
          // If we go in here when there is no data the system throws multiple errors
          if (repoResponse.data.length > 0) {
            // Since the system can return 1 or more documents - ensure that we delete all (edge case since it "should" return just 1)
            for (const doc of repoResponse.data) {
              this.restAPIService.deleteDocumentFromServer(doc.Title).subscribe((deleteFileResponse: any) => {
                if (deleteFileResponse.status === 'success') {
                  console.log('The following document was successfully deleted from the system:' + doc.Title);
                } else {
                  console.log('The following document was NOT deleted from the system:' + doc.Title);
                }
              });
            }
          }
        }
      });
    }
  }

  checkIfDocumentForApproval(array, value) {
    return array.some(function(entry) {
       return entry.DocumentName === value;
    });
  }

  /*
  * This method deletes the action item, all applicable notification configuration records, and sends out any necessary unassigned emails
  * @param activityObj - current activity object data needed to look up all associated action items
  */
  deleteActionItemsFromSPList(activityObj: any) {
    this.restAPIService.getActionItems(`ParentId eq '${activityObj.ID}'`).subscribe((actionItemResp: any) => {
      if (this.restAPIService.isSuccessResponse(actionItemResp)) {
        if (actionItemResp.data.length) {
          const observables = [];

          // Create Assign/Unassign To manage notifications object
          const manageNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO_ACTION_ITEM);

          for (const actionItem of actionItemResp.data) {
            observables.push(new Observable(observer => {
              this.restAPIService.deleteActionItem(actionItem.ID).subscribe(res => {
                observer.next();
                observer.complete();

                // Sends 'UNASSIGN' AutoGeneratedEmail records
                manageNotifications.sendUnassignedToEmailForActionItem(activityObj, actionItem, actionItem.assignedTo);

                // Deletes all notifications associated with this action item
                manageNotifications.deleteAllNotificationsForActionItem(actionItem.ID);
              });
            }));
          }
          if (observables.length) {
            forkJoin(observables).subscribe((res: any[]) => {
              console.log('all action Items Deleted', res);
            });
          }
        }
        else {
          console.log('No action Items found against this activity - ', activityObj.Title);
        }
      }
    });
  }

  public filterDataFn(items, searchString) {
    this.totalActivitiesCount = 0;
    if (this.allTabHidden) {
      return;
    }
    searchString = searchString.toLowerCase();
    this.filterItemCountTracker = {};
    for (const project of items) {
      this.filterItemCountTracker[project.Title] = {};
      project.showProject = false;
      if (this.selectedTab === this.tabs.AllActivities) {
        for (const projectKey of this.filterProjectsBy) {
          if (project[projectKey] && project[projectKey].toLowerCase().indexOf(searchString) !== -1) {
            // tslint:disable-next-line: forin
            for (const activityType in project.activities) {
              this.filterItemCountTracker[project.Title][activityType] = 0;
              for (const activity of project.activities[activityType]) {
                activity.showActivity = false;
                if (this.active === 1 && activity.Status === AppConstants.TODO) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 2 && activity.Status === AppConstants.IN_PROG) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 3 && activity.Status === AppConstants.MGR_REVIEW) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (
                  this.active === 4 && activity.Status === AppConstants.AWARDED ||
                  this.active === 4 && activity.Status === AppConstants.INACTIVE ||
                  this.active === 4 && activity.Status === AppConstants.SUBMITTED
                ) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 5) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                }
              }
            }
            break;
          }
        }
      }
      if (!project.showProject) {
        // tslint:disable-next-line:forin
        for (const activityType in project.activities) {
          this.filterItemCountTracker[project.Title][activityType] = 0;
          for (const activity of project.activities[activityType]) {
            activity.showActivity = false;
            if (this.selectedTab === this.tabs.MyActivities) {
              if (!activity.isMyactivity) {
                continue;
              }
            } else if (this.selectedTab === this.tabs.TeamActivities) {
              if (!activity.isTeamActivity) {
                continue;
              }
            }
            // for (const activityKey of this.filterActivitiesBy) {
            //   if (activity[activityKey] && activity[activityKey]?.toLowerCase().indexOf(searchString) !== -1) {
            //     if (this.active === 1 && activity.Status !== 'Completed'){
            //       activity.showActivity = true;
            //       project.showProject = true;
            //       this.totalActivitiesCount++;
            //       this.filterItemCountTracker[project.Title][activityType]++;
            //     }else if (this.active === 2 && activity.Status === 'Completed'){
            //       activity.showActivity = true;
            //       project.showProject = true;
            //       this.totalActivitiesCount++;
            //       this.filterItemCountTracker[project.Title][activityType]++;
            //     }else if (this.active === 3){
            //       activity.showActivity = true;
            //       project.showProject = true;
            //       this.totalActivitiesCount++;
            //       this.filterItemCountTracker[project.Title][activityType]++;
            //     }
            //     break;
            //   }
            // }
            for (const activityKey of this.filterActivitiesBy) {
              if (activity[activityKey] && activity[activityKey]?.toLowerCase().indexOf(searchString) !== -1) {
                if (this.active === 1 && activity.Status === AppConstants.TODO) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 2 && activity.Status === AppConstants.IN_PROG) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 3 && activity.Status === AppConstants.MGR_REVIEW) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (
                  this.active === 4 &&
                  activity.Status === AppConstants.AWARDED ||
                  activity.Status === AppConstants.INACTIVE ||
                  activity.Status === AppConstants.SUBMITTED
                ) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                } else if (this.active === 5) {
                  activity.showActivity = true;
                  project.showProject = true;
                  this.totalActivitiesCount++;
                  this.filterItemCountTracker[project.Title][activityType]++;
                }
                break;
              }
            }
          }
        }
      }
    }
    return items;
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

  exportToCSV() {
    const csvExporter = new ExportToCsv(this.csvOptions);
    const exportData: any = [];
    for (const activity of this.projects) {
      if (activity.showProject !== true) {
        continue;
      }
      // tslint:disable-next-line:forin
      for (const actDetail in activity.activities) {
        for (const actVal of activity.activities[actDetail]) {
          if (actVal.showActivity !== true) {
            continue;
          }
          const activityObj: any = {};
          activityObj['Project Identifier'] = activity.Identifier || '';
          activityObj['Project Name'] = activity.Title || '';
          activityObj['Project Creation Date'] = activity.CreationDate || '';
          activityObj['Requested Award Date'] = activity.Requested_Award_Date || '';
          activityObj['Activity Type'] = actVal.ActivityType || '';
          activityObj['Activity Title'] = actVal.Title || '';
          exportData.push(activityObj);
        }
      }
    }
    if (exportData.length) {
      csvExporter.generateCsv(exportData);
    }
  }
}
