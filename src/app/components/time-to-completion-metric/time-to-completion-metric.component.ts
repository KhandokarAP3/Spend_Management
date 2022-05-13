import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {forkJoin} from 'rxjs';
import * as moment from 'moment';
import {AppConstants} from '../../AppConstants';
import {Router} from '@angular/router';
import {CommonService} from '../../services/common.service';

@Component({
  selector: 'app-time-to-completion-metric',
  template: `
    <div style="cursor: pointer" (click)="totalAverageTimeClickHandler()">
      <h4 [innerHTML]="title"></h4>
      <h3>{{value}}</h3>
    </div>
  `
})
export class TimeToCompletionMetricComponent {
  @HostBinding() class = 'top-level-metrics';
  title = 'Avg. Time to Completion <br>(days)';
  value = '0';
  averageTimeToCompletionProjectArr = [];

  constructor(private restAPIService: RESTAPIService, private router: Router, private commonService: CommonService) {
    forkJoin([this.restAPIService.getDataFromProjectGeneral(), this.restAPIService.getActivities()]).subscribe((responses: any[]) => {
      let numberOfDaysTotal = 0;
      const projects = {};
      let useIfTeamProject = false;
      for (const role of this.commonService.topLevelMetricTeammateFilterRoles) {
        if (this.commonService.isCurrentUserRole(role)) {
          useIfTeamProject = true;
          break;
        }
      }
      if (this.restAPIService.isSuccessResponse(responses[0]) && this.restAPIService.isSuccessResponse(responses[1])) {
        for (const project of responses[0].data) {
          if (useIfTeamProject) {
            if (!project.isTeamProject) {
              continue;
            }
          }
          projects[project.Identifier] = project;
        }
        for (const activity of responses[1].data) {
          if (projects[activity.Identifier] && activity.Status === 'Completed' && activity.ActivityType.toLowerCase() === 'process pr to contracts') {
            const projectCreationDate = moment(projects[activity.Identifier].CreationDate, AppConstants.AP3DateFormat).endOf('day');
            numberOfDaysTotal += moment(activity.Created).startOf('day').diff(projectCreationDate, 'day');
            this.averageTimeToCompletionProjectArr.push(activity.Identifier);
          }
        }
        this.value = parseFloat(String(numberOfDaysTotal / responses[0].data.length)).toFixed(0);
      }
    });
  }

  totalAverageTimeClickHandler() {
    const filters = [];
    if (this.averageTimeToCompletionProjectArr.length) {
      for (const averageTime of this.averageTimeToCompletionProjectArr) {
        filters.push(`(Identifier eq '${averageTime}')`);
      }
      const filter = `(${filters.join(' or ')})`;
      this.router.navigate(['projects'], { queryParams: { filter }});
    }
  }
}
