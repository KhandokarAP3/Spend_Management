import { Component, HostBinding } from '@angular/core';
import { RESTAPIService } from '../../services/REST-API.service';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { AppConstants } from '../../AppConstants';
import { CommonService } from '../../services/common.service';
declare const _spPageContextInfo;


@Component({
  selector: 'app-projects-metric',
  templateUrl: './projects-metric.component.html'
})
export class ProjectsMetricComponent {
  @HostBinding() class = 'data_table spinner m-0';
  @HostBinding() style = { display: 'block' };
  projectMetrics: any = {
    headers: [{ text: 'Title' }, { text: 'Work Category' }, { text: 'Days Old' }, { text: 'Planned Award' }, { text: 'PR to Contracts Date' }],
    rows: [
    ]
  };
  projectCount = 0;
  finalData: any = [];

  constructor(private restAPIService: RESTAPIService, public commonService: CommonService) {
    forkJoin([this.restAPIService.getDataFromProjectGeneral()]).subscribe((response: any) => {
      console.log('project metrics Response', response);
      for (const a of response[0].data) {
        const finalDataObj: any = {};
        if (
          commonService.isNotUndefinedNullOrEmpty(a.Team.requirementsowner) &&
          commonService.isNotUndefinedNullOrEmpty(a.Team.contractingOfficer) &&
          commonService.isNotUndefinedOrNull(a.Team.contractingOfficerRepresentative) &&
          commonService.isNotUndefinedOrNull(a.Team.projectManager) &&
          commonService.isNotUndefinedOrNull(a.Team.contractSpecialist)
        ) {
          // if (
          // (a.Team.requirementsowner !== '' || a.Team.contractingOfficer !== '' || a.Team.contractingOfficer !== null) &&
          // (a.Team.contractingOfficerRepresentative !== '' || a.Team.contractingOfficerRepresentative !== null) &&
          // (a.Team.projectManager !== '' || a.Team.projectManager !== null) &&
          // (a.Team.contractSpecialist !== '' || a.Team.contractSpecialist !== null)) {
          if ((a.Team.requirementsowner.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) ||
            (a.Team.contractingOfficer.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) ||
            (a.Team.contractingOfficerRepresentative.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) ||
            (a.Team.projectManager.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) ||
            (a.Team.contractSpecialist.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase())) {
            const projectCreateDate = moment(a.CreationDate, AppConstants.AP3DateFormat).endOf('day');
            const projectCurrentDate = moment().startOf('day');

            finalDataObj.Id = a.ID;
            finalDataObj.Title = a.Title;
            finalDataObj.WorkCategoryStatus = a.Status;
            finalDataObj.DaysOld = moment(projectCurrentDate).startOf('day').diff(projectCreateDate, 'day');
            finalDataObj.PlannedAward = a.Requested_Award_Date;
            finalDataObj.PRtoContractsDate = a.PR_to_Contracts_Date;
            this.finalData.push(finalDataObj);
          }
          else {
            if (a.Team.teamMates.length) {
              for (const b of a.Team.teamMates) {
                if (b.name !== '' || b.name !== null) {
                  if (b.name.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) {
                    const projectCreateDate = moment(a.CreationDate, AppConstants.AP3DateFormat).endOf('day');
                    const projectCurrentDate = moment().startOf('day');

                    finalDataObj.Id = a.ID;
                    finalDataObj.Title = a.Title;
                    finalDataObj.WorkCategoryStatus = a.Status;
                    finalDataObj.DaysOld = moment(projectCurrentDate).startOf('day').diff(projectCreateDate, 'day');
                    finalDataObj.PlannedAward = a.Requested_Award_Date;
                    finalDataObj.PRtoContractsDate = a.PR_to_Contracts_Date;
                    this.finalData.push(finalDataObj);
                  }
                }
              }
            }
          }
        }
        else {
          if (a.Team.teamMates.length) {
            for (const b of a.Team.teamMates) {
              if (b.name !== '' || b.name !== null) {
                if (b.name.toLowerCase() === _spPageContextInfo.userDisplayName.toLowerCase()) {
                  const projectCreateDate = moment(a.CreationDate, AppConstants.AP3DateFormat).endOf('day');
                  const projectCurrentDate = moment().startOf('day');

                  finalDataObj.Id = a.ID;
                  finalDataObj.Title = a.Title;
                  finalDataObj.WorkCategoryStatus = a.Status;
                  finalDataObj.DaysOld = moment(projectCurrentDate).startOf('day').diff(projectCreateDate, 'day');
                  finalDataObj.PlannedAward = a.Requested_Award_Date;
                  finalDataObj.PRtoContractsDate = a.PR_to_Contracts_Date;
                  this.finalData.push(finalDataObj);
                }
              }
            }
          }
        }
      }

      if (this.finalData.length) {
        // let finalDataArr: any[] = this.getUniqueListBy(this.finalData, 'Title');
        let finalDataArr: any[] = this.finalData;
        console.log('finalDataArr', finalDataArr)
        for (const data of finalDataArr) {
          this.projectCount++;
          this.projectMetrics.rows.push([
            { value: data.Id }, { value: data.Title }, { value: data.WorkCategoryStatus }, { value: data.DaysOld }, { value: data.PlannedAward }, { value: data.PRtoContractsDate }
          ]);
        }
      }
      else {
        console.log('No Projects found against this user');
      }
      this.class = 'data_table fixedMetrics m-0';
    });
  }

  getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()];
  };

}
