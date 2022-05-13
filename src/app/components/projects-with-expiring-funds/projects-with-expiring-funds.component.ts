import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {Router} from "@angular/router";
import {CommonService} from '../../services/common.service';

@Component({
  selector: 'app-projects-with-expiring-funds-metric',
  template: `
    <div style="cursor: pointer" (click)="expiringFundsClickHandler()">
      <h4 [innerHTML]="title"></h4>
      <h3>{{value}}</h3>
    </div>
  `
})
export class ProjectsWithExpiringFundsComponent {
  @HostBinding() class = 'top-level-metrics';
  title = '# of Projects with Expiring Funds';
  value = '0';
  expiringFundsArr = [];

  constructor(private restAPIService: RESTAPIService, private router: Router, private commonService: CommonService) {
    this.restAPIService.getDataFromProjectGeneral().subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        let fundExpiringCounter = 0;
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
          if (project.AreFundsExpiring === 'true' || project.AreFundsExpiring === true) {
            fundExpiringCounter++;
            this.expiringFundsArr.push(project.Identifier);
          }
        }
        this.value = String(fundExpiringCounter);
      }
    });
  }

  expiringFundsClickHandler() {
    const filters = [];

    if (this.expiringFundsArr.length) {
      for (const expiring of this.expiringFundsArr) {
        filters.push(`(Identifier eq '${expiring}')`);
      }
      const filter = `(${filters.join(' or ')})`;
      this.router.navigate(['projects'], { queryParams: { filter }});
    }
  }
}
