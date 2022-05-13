import {Component, HostBinding} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {Router} from '@angular/router';
import * as moment from "moment";
import {AppConstants} from "../../AppConstants";

@Component({
  selector: 'app-avg-time-to-complete-metric-market-research',
  templateUrl: './avg-time-to-complete-metric-market-research.component.html'
})
export class AverageTimeToCompletionMarketResearchBarChartComponent {
  @HostBinding() class = 'data_table fixedMetrics m-0';
  @HostBinding() style = {display: 'block'};
  averageTimeToCompleteMetricArr: any[] = [];
  activityMapObj: any = {};
  colorSchemeComp = ['#72AC46', '#72AC46', '#72AC46'];
  xAxisLabel = 'Market Research Activities';

  constructor(private restAPIService: RESTAPIService, private router: Router) {
    this.restAPIService.getActivities(`WorkCategory eq 'Market Research' and Status eq 'Completed'`).subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        let totalActivities: any = response.data;
        if (totalActivities.length) {
          for (const activity of totalActivities) {
            if (!this.activityMapObj[activity.ActivityType]) {
              this.activityMapObj[activity.ActivityType] = [];
              this.activityMapObj[activity.ActivityType].push(activity);
            }
            else {
              this.activityMapObj[activity.ActivityType].push(activity);
            }
          }
          if (Object.keys(this.activityMapObj).length !== 0 && this.activityMapObj.constructor === Object) {
            for (let act in this.activityMapObj) {
              let numberOfDaysTotal = 0;
              let dataObj: any = {};
              let identifierArr: any = [];
              if (this.activityMapObj[act].length) {
                for (let actData of this.activityMapObj[act]) {
                  const activityCreateDate = new Date(actData.Created);
                  const activityCreateDateMoment = moment(activityCreateDate, AppConstants.AP3DateFormat).endOf('day')
                  const activityCompletedDate = moment(actData.ActivityMarkAsCompletedDate, AppConstants.AP3DateFormat).endOf('day');
                  numberOfDaysTotal += moment(activityCompletedDate).startOf('day').diff(activityCreateDateMoment, 'day');
                  identifierArr.push(actData.ID);
                }
                dataObj.name = act;
                dataObj.value = numberOfDaysTotal / this.activityMapObj[act].length;
                dataObj.extra = {identifierArr: identifierArr};
                this.averageTimeToCompleteMetricArr.push(dataObj);
              }
            }
          }
        }
        else {
          console.log('No Activities found in SP list');
        }

      }
      this.class = 'data_table fixedMetrics avg_timeToCompleteBarChart m-0';
    });
  }
}
