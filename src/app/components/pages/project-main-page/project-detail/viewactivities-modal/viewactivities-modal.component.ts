import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../services/common.service';
import { forkJoin, Observable } from 'rxjs';
import { RESTAPIService } from '../../../../../services/REST-API.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification-service';
import { AppConstants } from '../../../../../AppConstants';

@Component({
  selector: 'app-view-activities-modal',
  templateUrl: './viewactivities-modal.component.html'
})

export class ViewActivitiesModalComponent implements OnInit {
  data: any;
  isViewMode = false;
  project: any;
  mode: any;
  activitiesToBeRemoved: any[] = [];
  approvalData: any[] = [];
  manageNotifications: NotificationService;
  manageActionItemNotifications: NotificationService;

  constructor(private router: Router, public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService) {
    // Create Assign/Unassign To manage notifications object
    this.manageNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO);

    // Create Assign/Unassign To manage notifications object
    this.manageActionItemNotifications = new NotificationService(this.commonService, this.router, this.restAPIService, this.toastr, AppConstants.ASSIGN_TO_ACTION_ITEM);
  }

  ngOnInit(): void {
    console.log('this.data activities', this.data);
    this.project = this.data.project;
    this.mode = this.data.mode;
    this.approvalData = this.data.approvalData;
    if (this.mode === 'view') {
      this.isViewMode = true;
    }
    if (this.mode === 'create') {
      this.project.activities = this.data.multipleActivitiesForSave;
    }
  }

  cancel() {
    this.activeModal.close({ activitiesToBeRemoved: this.activitiesToBeRemoved });
  }

  goToActivity(activityObj) {
    if (this.mode === 'create') {
      this.toastr.warning('Please Save the project first to view activity details');
    }
    else {
      this.activeModal.dismiss();
      this.router.navigate([`activities/${activityObj.ID}`], { queryParams: { mode: 'edit' }, state: { Identifier: this.project.Identifier, mode: this.mode, projectId: this.project.ID, projectTitle: this.project.Title } });
    }
  }

  deleteActivity(index) {
    const hasApproval = this.project.activities[index].ActivityFileNames.some(element => {
      if (this.checkIfDocumentForApproval(this.approvalData, element))
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

    if (!this.commonService.canDeleteActivities(this.project.activities[index])) {
      console.log('User does not have the necessary permissions to delete this activity.');
      this.toastr.warning('You do not have the permissions required to delete this activity. Action has been aborted', '', { timeOut: 5000 });
      return;
    }

    if (!confirm('Are you sure you wish to delete this activity?')) {
      return;
    }

    if (this.mode === 'create') {
      this.activitiesToBeRemoved.push(index);
      this.project.activities.splice(index, 1);
      // this.toastr.success('Activity deleted successfully.', '', { timeOut: 5000 });
    }
    else {
      this.restAPIService.deleteActivity(this.project.activities[index].ID).subscribe((res) => {
        if (this.restAPIService.isSuccessResponse(res)) {

          // Sends Unassign emails to users listed in Assign To text input field of activity
          this.manageNotifications.postEmailsAndAddOrDeleteNotificaitonsForActivities(this.project.activities[index], this.project.activities[index].AssignedTo, '', AppConstants.DELETE);

          // Deletes any other notifications associated with this activity
          this.manageNotifications.deleteAllNotificationsForActivity(this.project.activities[index]);

          // Delete all files attached to this activity (if any)
          if (this.project.activities[index].ActivityFileNames.length) {

            // for (const toBeDeleted of this.isDeleteFileName) {
            for (const toBeDeleted of this.project.activities[index].ActivityFileNames) {
              this.restAPIService.getRepositoryData(`DocumentTitle eq '${toBeDeleted.trim()}'`, 'ID,DocumentTitle,DocumentCategory,VersionComment,File/ServerRelativeUrl,Created,Title,DocumentType,Category,Modified,Editor/Title&$expand=Editor/Title,File').subscribe((repoResponse: any) => {
                if (this.restAPIService.isSuccessResponse(repoResponse)) {
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
              });
            }

            // for (const fileName of this.project.activities[index].ActivityFileNames) {
            //   this.restAPIService.deleteActivityDocument(fileName).subscribe((deleteFileResponse: any) => {
            //     if (deleteFileResponse.status === 'success') {
            //       count++;
            //       if (count === this.project.activities[index].ActivityFileNames.length) {
            //         this.toastr.success('Activity deleted successfully.', '', { timeOut: 5000 });
            //         this.project.activities.splice(index, 1);
            //       }
            //     }
            //   });
            // }
          }

          // Delete any attached action items
          this.deleteActionItemsFromSPList(this.project.activities[index]);

          this.toastr.success('Activity deleted successfully.', '', { timeOut: 5000 });
          this.project.activities.splice(index, 1);
        } else {
          this.toastr.success('Could not delete activity.', '', { timeOut: 5000 });
        }
      });
    }
  }
  checkIfDocumentForApproval(array, value) {
    return array.some(function(entry) {
       return entry.DocumentName === value;
    });
  }

  /**
   * This method deletes the action item, all applicable notification configuration records, and sends out any necessary unassigned emails
   * @param activityObj - current activity object data needed to look up all associated action items
   */
  deleteActionItemsFromSPList(activityObj: any) {
    this.restAPIService.getActionItems(`ParentId eq '${activityObj.ID}'`).subscribe((actionItemResp: any) => {
      if (this.restAPIService.isSuccessResponse(actionItemResp)) {
        if (actionItemResp.data.length) {
          const observables = [];

          for (const actionItem of actionItemResp.data) {
            observables.push(new Observable(observer => {
              this.restAPIService.deleteActionItem(actionItem.ID).subscribe(res => {
                observer.next();
                observer.complete();

                // Sends 'UNASSIGN' AutoGeneratedEmail records
                this.manageActionItemNotifications.sendUnassignedToEmailForActionItem(activityObj, actionItem, actionItem.assignedTo);

                // Deletes all notifications associated with this action item
                this.manageActionItemNotifications.deleteAllNotificationsForActionItem(actionItem.ID);

                // Delete all files attached to this action item (if any)
                if (activityObj.ActivityFileNames.length) {
                  let count = 0;
                  for (const fileName of activityObj.ActivityFileNames) {
                    this.restAPIService.deleteActivityDocument(fileName).subscribe((deleteFileResponse: any) => {
                      if (deleteFileResponse.status === 'success') {
                        count++;
                        if (count === activityObj.ActivityFileNames.length) {
                          this.toastr.success('Activity deleted successfully.', '', { timeOut: 5000 });
                          this.project.activities.splice(activityObj.ID, 1);
                        }
                      }
                    });
                  }
                }
                else {
                  // this.toastr.success('Activity deleted successfully.', '', { timeOut: 5000 });
                  this.project.activities.splice(activityObj.ID, 1);
                }
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

}
