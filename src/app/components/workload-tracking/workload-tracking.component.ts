import {Component, HostBinding} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {CurrencyPipe} from '@angular/common';
import {Router} from '@angular/router';
declare const _spPageContextInfo;

@Component({
  selector: 'app-workload-tracking',
  templateUrl: './workload-tracking.component.html',
})
export class WorkloadTrackingComponent {
  @HostBinding() class = 'data_table spinner fixedMetrics';
  @HostBinding() style = {display: 'block'};
  Data: any = {
    headers: [
      { text: 'Name' }, {text: '# of Contracts'}, {text: 'Estimated Value'}
    ],
    rows: [
    ]
  };

  constructor(private restAPIService: RESTAPIService, private currencyPipe: CurrencyPipe, private router: Router) {
    this.Data.clickHandler = this.clickHandler.bind(this);

    this.restAPIService.getDataFromProjectGeneral().subscribe((res: any) => {
      if (this.restAPIService.isSuccessResponse(res)) {
        const projects: any[] = res.data;
        const requirementOwnerWiseProjects = {};
        for (const project of projects) {
          if (project.Status !== 'Completed') {
            if (project.Team.requirementsowner) {
              if (!requirementOwnerWiseProjects[project.Team.requirementsowner]) {
                requirementOwnerWiseProjects[project.Team.requirementsowner] = {
                  projects: [],
                  projectCount: 0,
                  totalEstimatedValue: 0
                };
              }
              requirementOwnerWiseProjects[project.Team.requirementsowner].projectCount++;
              requirementOwnerWiseProjects[project.Team.requirementsowner].totalEstimatedValue += project.EstimatedValue;
              requirementOwnerWiseProjects[project.Team.requirementsowner].projects.push(project);
            }
          }
        }
        this.Data.rows = [];
        for (const co in requirementOwnerWiseProjects) {
          if (requirementOwnerWiseProjects.hasOwnProperty(co)) {
            this.Data.rows.push([
              { value: co, clickHandler: true, projects: requirementOwnerWiseProjects[co].projects},
              { value: requirementOwnerWiseProjects[co].projectCount},
              { value: this.currencyPipe.transform(requirementOwnerWiseProjects[co].totalEstimatedValue, 'USD', true)}
            ]);
          }
        }
      }
      this.class = 'data_table fixedMetrics';
    });
  }

  clickHandler(columnObj, rowObj) {
    const filters = [];
    for (const reserved of columnObj.projects) {
      filters.push(`(Identifier eq '${reserved.Identifier}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['projects'], { queryParams: { filter }});
  }

}
