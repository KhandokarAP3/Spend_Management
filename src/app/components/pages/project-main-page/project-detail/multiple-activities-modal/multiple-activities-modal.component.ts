import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../../../services/common.service';
import {RESTAPIService} from '../../../../../services/REST-API.service';
import {Router} from '@angular/router';
import * as jexcel from 'jexcel';
import {forkJoin, Observable} from 'rxjs';
import {AppConstants} from "../../../../../AppConstants";

@Component({
  selector: 'multiple-activities-modal',
  templateUrl: './multiple-activities-modal.component.html'
})

export class MultipleActivitiesModalComponent implements OnInit, AfterViewInit {
  isSavingActivities = false;
  @ViewChild('spreadsheet') spreadsheet: ElementRef;
  data: any;
  project: any;
  mode: any;
  activitiesForSave: any[] = [];
  excelSpreadSheet: any;
  dimensions: any = [4, 10];
  activityTypeDropdown: any[] = [];
  activityTypeData: any = [];
  activityWorkFlowObjData: any = [];

    constructor(private ngZone: NgZone, private router: Router, public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService) {
      forkJoin([this.restAPIService.getActivityTypes(null, AppConstants.ACTIVITY_TYPES), this.restAPIService.getActivityWorkFlows(null, AppConstants.ACTIVITY_WORKFLOWS)]).subscribe((forkJoinResponses: any) => {
        if (forkJoinResponses[0].data.length) {
          this.activityTypeData = forkJoinResponses[0].data;
          for (const type of forkJoinResponses[0].data) {
            this.activityTypeDropdown.push(type.Title);
          }
        }
        if (forkJoinResponses[1].data.length) {
          this.activityWorkFlowObjData = forkJoinResponses[1].data;
        }
      });
  }

  ngOnInit() {
    this.project = this.data.project;
    this.mode = this.data.mode;
  }

  ngAfterViewInit() {
    this.excelSpreadSheet = jexcel(this.spreadsheet.nativeElement, {
      data: [[]],
      columns: [
        { type: 'dropdown', width: '270px', title: 'Activity Type', source: this.activityTypeDropdown },
        { type: 'text', width: '270', title: 'Title', render: 'square' },
        { type: 'text', width: '220px', title: 'Work Category', render: 'square' },
        { type: 'dropdown', width: '100px', title: 'Status', source: this.commonService.activityStatus },
        { type: 'dropdown', width: '100px', title: 'Priority', source: this.commonService.activityPriority }
      ],
      contextMenu: () => {
        return false;
      },
      onchange: (instance, cell, c, r, value) => {
        if (c === '0') {
          const columnName = jexcel.getColumnNameFromId([c + 2, r]);
          const disableCell = this.getCell(columnName);
          disableCell.classList.remove('readonly');
          if (value) {
            let findWorkCategory: any = this.activityTypeData.find(x => x.Title === value);
            if (findWorkCategory) {
              this.excelSpreadSheet.setValueFromCoords(2, r, findWorkCategory.WorkCategory);
              disableCell.classList.add('readonly');
            }
          }
        }
      },
      minDimensions: this.dimensions,
      allowInsertColumn: false,
      allowManualInsertColumn: false
    });
  }

  getCell(columnName) {
    const getCell = this.excelSpreadSheet.getCell(columnName);
    return getCell;
  }

  cancel() {
    this.activeModal.dismiss();
  }

  saveMultipleActivities() {
    if (this.isSavingActivities) {
      return;
    }
    const observables = [];
    this.isSavingActivities = true;
    const excelData = this.excelSpreadSheet.getData();
    const activitiesRawData: any = [];
    for (const [index, value] of excelData.entries()) {
      // tslint:disable-next-line:triple-equals
      if (value[0] != '' || value[1] != '' || value[2] != '' || value[3] != '') {
        activitiesRawData.push(value);
      }
    }
    if (activitiesRawData.length) {
      const checkArrValues = this.hasEmptyElement(activitiesRawData);
      if (!checkArrValues) {
        this.toastr.error('Activity Type is a required fields');
        this.isSavingActivities = false;
        return;
      }
      else {
        let count = 0;
        for (const w of activitiesRawData) {
          const activityObj: any = {};
          let findWorkFlowObj: any = this.activityWorkFlowObjData.find(x => x.ActivityTitle.toLowerCase() === w[0].toLowerCase());
          activityObj.ActivityType = w[0];
          activityObj.WorkCategory = w[2];
          activityObj.Identifier = this.project.Identifier;
          activityObj.Title = w[1];
          activityObj.ProjectTitle = this.project.Title;
          activityObj.Status = w[3];
          activityObj.Priority = w[4];
          activityObj.WorkflowObj = findWorkFlowObj ? JSON.stringify(findWorkFlowObj.workflowObj) : JSON.stringify([]);
          activityObj.ActivityFileNames = JSON.stringify([]);
          activityObj.TrackingItems = JSON.stringify([{
            addNotification: false,
            actualReceiptDate: '',
            scheduledDate: '',
          }]);
          activityObj.__metadata = { type: 'SP.Data.ActivityListListItem' };

          if (this.mode === 'create') {
            this.activitiesForSave.push(activityObj);
            count++;
            if (count === activitiesRawData.length) {
              this.toastr.success('Activities added in project successfully', '', { timeOut: 5000 });
              this.activeModal.close({project: this.project, activitiesForSave: this.activitiesForSave});
            }
          }
          else {
            observables.push( new Observable(observer => {
              this.restAPIService.saveActivity(activityObj).subscribe((res: any) => {
                observer.next(res);
                observer.complete();
              });
            }));
          }
        }
        forkJoin(observables).subscribe((res: any[]) => {
          let succeeded = false;
          for (const response of res) {
            if (this.restAPIService.isSuccessResponse(response)) {
              this.project.activities.push(response.data);
              count++;
              if (count === activitiesRawData.length) {
                succeeded = true;
                this.toastr.success('Activities saved successfully', '', { timeOut: 5000 });
                this.activeModal.close({project: this.project});
              }
            }
          }
          if (!succeeded) {
            this.isSavingActivities = false;
          }
        });
      }
    }
    else {
      this.isSavingActivities = false;
      this.toastr.error('No Data found in Excel Sheet');
    }
  }

  hasEmptyElement(array){
    for (const val of array) {
      if (val[0] === '') {
        return false;
      }
    }
    return true;
  }

}
