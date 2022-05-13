import {Component, HostBinding } from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {forkJoin} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-fund-progress',
  templateUrl: './fund-progress.component.html'
})
export class FundProgressComponent {
  UnfundedRequirementArr = [];
  BudgetedArr = [];
  ReservedArr = [];
  CommittedArr = [];

  @HostBinding() class = 'fund_progress spinner';
  @HostBinding() style = {display: 'block'};
  chartData = {
    estimatedValue: 0,
    'Unfunded Requirement': {
      name: 'Unfunded Requirement',
      value: 0,
      width: 0,
      color: '#000000b3'
    },
    Budgeted: {
      name: 'Budgeted',
      value: 0,
      width: 0,
      color: '#004990'
    },
    Reserved: {
      name: 'Reserved',
      value: 0,
      width: 0,
      color: '#0071bcb3'
    },
    Committed: {
      name: 'Committed',
      value: 0,
      width: 0,
      color: '#2DC84D'
    }
  };
  constructor(private restAPIService: RESTAPIService, private router: Router) {
    this.restAPIService.getDataFromProjectGeneral().subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        const dataByFundingStatus: any = {};
        for (const project of response.data) {
          this.chartData.estimatedValue += parseFloat(project.EstimatedValue);
          if (!project.Funding_Status) {
            continue;
          }
          if (!dataByFundingStatus[project.Funding_Status]) {
            dataByFundingStatus[project.Funding_Status] = {value: 0};
          }
          dataByFundingStatus[project.Funding_Status].value += parseFloat(project.EstimatedValue);
          if (project.Funding_Status === 'Budgeted') {
            this.BudgetedArr.push(project.Identifier);
          }
          else if (project.Funding_Status === 'Committed') {
            this.CommittedArr.push(project.Identifier);
          }
          else if (project.Funding_Status === 'Reserved') {
            this.ReservedArr.push(project.Identifier);
          }
          else if (project.Funding_Status === 'Unfunded Requirement') {
            this.UnfundedRequirementArr.push(project.Identifier);
          }
        }
        const maxWidthCategoryInfo: any = {
          width: 0
        };
        let percentSum = 0;
        for (const category in this.chartData) {
          if (dataByFundingStatus[category]) {
            this.chartData[category].value = parseInt(dataByFundingStatus[this.chartData[category].name].value + '', 10);
            this.chartData[category].width = ((this.chartData[category].value * 100) / this.chartData.estimatedValue).toFixed(2);
            percentSum += parseFloat(this.chartData[category].width);
            if (maxWidthCategoryInfo.width < this.chartData[category].width) {
              maxWidthCategoryInfo.category = category;
              maxWidthCategoryInfo.width = this.chartData[category].width;
            }
          }
        }
        if (percentSum > 100) {
          this.chartData[maxWidthCategoryInfo.category].width = this.chartData[maxWidthCategoryInfo.category].width - (percentSum - 100);
        }
      }
      this.class = 'fund_progress';
    });
  }

  totalUnfundedRequirementsClickHandler() {
    const filters = [];
    for (const unfunded of this.UnfundedRequirementArr) {
      filters.push(`(Identifier eq '${unfunded}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['projects'], { queryParams: { filter }});
  }

  totalBudgetedClickHandler() {
    const filters = [];
    for (const budget of this.BudgetedArr) {
      filters.push(`(Identifier eq '${budget}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['projects'], { queryParams: { filter }});
  }

  totalReservedClickHandler() {
    const filters = [];
    for (const reserved of this.ReservedArr) {
      filters.push(`(Identifier eq '${reserved}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['projects'], { queryParams: { filter }});
  }

  totalCommittedClickHandler() {
    const filters = [];
    for (const committed of this.CommittedArr) {
      filters.push(`(Identifier eq '${committed}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['projects'], { queryParams: { filter }});
  }

}
