import {Component, HostBinding} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {forkJoin} from 'rxjs';
import * as moment from 'moment';
import {AppConstants} from '../../AppConstants';
import {Router} from "@angular/router";
import {CommonService} from '../../services/common.service';

@Component({
  selector: 'app-active-projects-metric',
  template: `
    <div style="cursor: pointer" (click)="totalActiveProjectsClickHandler()">
      <h4 [innerHTML]="title"></h4>
      <h3>{{value}}</h3>
    </div>
  `
})
export class ActiveProjectsMetricComponent {
  @HostBinding() class = 'top-level-metrics';
  title = '# of Active Projects';
  value = '';
  totalActiveProjectsArr = [];

  constructor(private restAPIService: RESTAPIService, private router: Router, private commonService: CommonService) {
    this.restAPIService.getDataFromProjectGeneral().subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        let activeProjectCounter = 0;
        let useIfTeamProject = false;
        for (const role of this.commonService.topLevelMetricTeammateFilterRoles) {
          if (this.commonService.isCurrentUserRole(role)) {
            useIfTeamProject = true;
            break;
          }
        }
        for (const project of response.data) {
          if (useIfTeamProject) {
            if (!project.isTeamProject) {
              continue;
            }
          }
          if (project.Funding_Status === 'Budgeted' || project.Funding_Status === 'In-Progress' || project.Funding_Status === 'Committed') {
            this.totalActiveProjectsArr.push(project.Identifier);
            activeProjectCounter++;
          }
        }
        this.value = String (activeProjectCounter);
      }
    });
  }

  totalActiveProjectsClickHandler() {
    const filters = [];
    if (this.totalActiveProjectsArr.length) {
      for (const averageTime of this.totalActiveProjectsArr) {
        filters.push(`(Identifier eq '${averageTime}')`);
      }
      const filter = `(${filters.join(' or ')})`;
      this.router.navigate(['projects'], { queryParams: { filter }});
    }
  }
}
