import {Component, HostBinding} from '@angular/core';
import {RESTAPIService} from '../../services/REST-API.service';
import {Router} from '@angular/router';
import * as moment from "moment";
import {AppConstants} from "../../AppConstants";

@Component({
  selector: 'app-avg-time-to-complete-metric-procurement-request-package',
  templateUrl: './avg-time-to-complete-metric-market-procurement-request-package.html'
})
export class AverageTimeToCompletionProcurementRequestPackageBarChartComponent {
  @HostBinding() class = 'data_table fixedMetrics m-0';
  @HostBinding() style = {display: 'block'};
  averageTimeToCompleteMetricArr: any[] = [];
  activityMapObj: any = {};
  colorSchemeComp = ['#A5A5A5', '#A5A5A5', '#A5A5A5'];
  xAxisLabel = 'Procurement Request Package';

  constructor(private restAPIService: RESTAPIService, private router: Router) {
    this.restAPIService.getActivities(`WorkCategory eq 'Procurement Request Package' and Status eq 'Completed'`).subscribe((response: any) => {
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
