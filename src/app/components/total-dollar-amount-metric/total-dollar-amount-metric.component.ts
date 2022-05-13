import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {Router} from '@angular/router';
import {CommonService} from '../../services/common.service';

@Component({
  selector: 'app-total-dollar-amount-metric',
  templateUrl: './total-dollar-amount-metric.component.html'
})
export class TotalDollarAmountMetricComponent {
  @HostBinding() class = 'top-level-metrics';
  title = 'Total Dollar Amt<br/>(Active Projects)';
  value = '0';
  totalDollarAmountArr = [];

  constructor(private restAPIService: RESTAPIService, private router: Router, private commonService: CommonService) {
    this.restAPIService.getDataFromProjectGeneral().subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        let totalDollarSum = 0;
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
            totalDollarSum += parseFloat(project.EstimatedValue);
            this.totalDollarAmountArr.push(project.Identifier);
          }
        }
        this.value = totalDollarSum.toFixed(2);
      }
    });
  }

  totalDollarAmountClickHandler() {
    const filters = [];
    if (this.totalDollarAmountArr.length) {
      for (const totalDollar of this.totalDollarAmountArr) {
        filters.push(`(Identifier eq '${totalDollar}')`);
      }
      const filter = `(${filters.join(' or ')})`;
      this.router.navigate(['projects'], { queryParams: { filter }});
    }
  }
}
