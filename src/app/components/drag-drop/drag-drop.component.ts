import {Component, ChangeDetectorRef, HostBinding} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {forkJoin} from 'rxjs';
import {AppConstants} from '../../AppConstants';
import {ObjectOperationsService} from '../../services/object-operations.service';
import {RESTAPIService} from '../../services/REST-API.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-drag-drop',
  templateUrl: './drag-drop.component.html',
})
export class DragDropComponent {
  @HostBinding() class = 'data_table spinner m-0';
  @HostBinding() style = {display: 'block', paddingBottom: '10px'};
  activityCount = {
    todo: 0,
    inProgress: 0,
    managerReview: 0,
    complete: 0
  };
  projects: any = {};
  toggleEllipsisClassToDo: any[] = [];
  toggleEllipsisClassInProgress: any[] = [];
  toggleEllipsisClassManagerReview: any[] = [];
  toggleEllipsisClassCompleted: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private restAPIService: RESTAPIService, private router: Router) {
    forkJoin([this.restAPIService.getDataFromProjectGeneral(), this.restAPIService.getActivities(`AssignedTo eq '${AppConstants.spPageContextInfo.userDisplayName}'`)]).subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response[0]) && this.restAPIService.isSuccessResponse(response[1])) {
        for (const activityObj of response[1].data) {
          const activity = ObjectOperationsService.parseActivityList(activityObj);
          if (!this.projects[activity.Identifier]) {
            this.projects[activity.Identifier] = {
              activityCount: 0,
              todo: [],
              inProgress: [],
              managerReview: [],
              complete: []
            };
          }
          if (activity.Status && activity.Status.toLowerCase() === 'to-do') {
            this.projects[activity.Identifier].todo.push(activity);
            this.activityCount.todo++;
            this.projects[activity.Identifier].activityCount++;
          } else if (activity.Status && activity.Status.toLowerCase() === 'in-progress') {
            this.projects[activity.Identifier].inProgress.push(activity);
            this.activityCount.inProgress++;
            this.projects[activity.Identifier].activityCount++;
          } else if (activity.Status && activity.Status.toLowerCase() === 'manager review') {
            this.projects[activity.Identifier].managerReview.push(activity);
            this.activityCount.managerReview++;
            this.projects[activity.Identifier].activityCount++;
          } else if (activity.Status && activity.Status.toLowerCase() === 'completed') {
            this.projects[activity.Identifier].complete.push(activity);
            this.activityCount.complete++;
            this.projects[activity.Identifier].activityCount++;
          }
        }
        for (const project of response[0].data) {
          if (this.projects[project.Identifier]) {
            this.projects[project.Identifier].project = project;
          }
        }
      }
      this.class = 'data_table m-0';
    });
  }

  onItemDrop(event: CdkDragDrop<string[]>, targetStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      this.class = 'data_table spinner m-0';
      const activity = event.item.data;
      const previousStatus = activity.Status;
      activity.Status = targetStatus;
      // tslint:disable-next-line:max-line-length
      this.restAPIService.updateActivity({Status: targetStatus, __metadata: { type: 'SP.Data.ActivityListListItem' }}, activity.Id).subscribe(res => {
        if (this.restAPIService.isSuccessResponse(res)) {
          this.updateActivityStatusCount(previousStatus, targetStatus);
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        }
        this.class = 'data_table m-0';
      });
    }
  }

  updateActivityStatusCount(reducingStatus, increasingStatus) {
    if (reducingStatus.toLowerCase() === 'to-do') {
      this.activityCount.todo--;
    } else if (reducingStatus.toLowerCase() === 'in-progress') {
      this.activityCount.inProgress--;
    } else if (reducingStatus.toLowerCase() === 'manager review') {
      this.activityCount.managerReview--;
    } else if (reducingStatus.toLowerCase() === 'completed') {
      this.activityCount.complete--;
    }
    if (increasingStatus.toLowerCase() === 'to-do') {
      this.activityCount.todo++;
    } else if (increasingStatus.toLowerCase() === 'in-progress') {
      this.activityCount.inProgress++;
    } else if (increasingStatus.toLowerCase() === 'manager review') {
      this.activityCount.managerReview++;
    } else if (increasingStatus.toLowerCase() === 'completed') {
      this.activityCount.complete++;
    }
  }

  public toggleEllipsisToDo(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassToDo.length) {
      for (let item = 0; item < this.toggleEllipsisClassToDo.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassToDo[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassToDo.length) {
          this.toggleEllipsisClassToDo[index] = !this.toggleEllipsisClassToDo[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassToDo[index] = !this.toggleEllipsisClassToDo[index];
    }
  }

  public toggleEllipsisInProgress(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassInProgress.length) {
      for (let item = 0; item < this.toggleEllipsisClassInProgress.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassInProgress[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassInProgress.length) {
          this.toggleEllipsisClassInProgress[index] = !this.toggleEllipsisClassInProgress[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassInProgress[index] = !this.toggleEllipsisClassInProgress[index];
    }
  }

  public toggleEllipsisManagerReview(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassManagerReview.length) {
      for (let item = 0; item < this.toggleEllipsisClassManagerReview.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassManagerReview[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassManagerReview.length) {
          this.toggleEllipsisClassManagerReview[index] = !this.toggleEllipsisClassManagerReview[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassManagerReview[index] = !this.toggleEllipsisClassManagerReview[index];
    }
  }

  public toggleEllipsisCompleted(index: any) {
    let count = 0;
    if (this.toggleEllipsisClassCompleted.length) {
      for (let item = 0; item < this.toggleEllipsisClassCompleted.length; item++) {
        if (index !== item) {
          this.toggleEllipsisClassCompleted[item] = false;
        }
        count++;
        if (count === this.toggleEllipsisClassCompleted.length) {
          this.toggleEllipsisClassCompleted[index] = !this.toggleEllipsisClassCompleted[index];
        }
      }
    }
    else {
      this.toggleEllipsisClassCompleted[index] = !this.toggleEllipsisClassCompleted[index];
    }
  }

  viewActivity(activity) {
    this.router.navigate([`activities/${activity.ID}`], { queryParams: { mode: 'edit' } });
  }

}
