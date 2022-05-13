import { Component } from '@angular/core';
import { MainPageComponentParentComponent } from '../../../page-component-parent.component';
import { AppConstants } from '../../../AppConstants';
import { CommonService } from '../../../services/common.service';
import {RESTAPIService} from "../../../services/REST-API.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent extends MainPageComponentParentComponent{
  public readonly widgetNames = AppConstants.WidgetNames;
  widgetsControl = {};

  ganttChart1Cols = [
    {id: 'Task ID', type: 'string'},
    {id: 'Task Name', type: 'string'},
    {id: 'Start Date', type: 'date'},
    {id: 'End Date', type: 'date'},
    {id: 'Duration', type: 'number'},
    {id: 'Percent Complete', type: 'number'},
    {id: 'Dependencies', type: 'string'}
  ];
  ganttData1 = [
    [
      'Research',
      'Find sources',
      new Date(2015, 0, 1),
      new Date(2015, 0, 5),
      null,
      100,
      null
    ],
    [
      'Write',
      'Write paper',
      new Date(2015, 0, 4),
      new Date(2015, 0, 9),
      null,
      25,
      'Research'
    ]
  ];

  ganttChart2Cols = [
    {id: 'Task ID', type: 'string'},
    {id: 'Task Name', type: 'string'},
    {id: 'Resource', type: 'string'},
    {id: 'Start Date', type: 'date'},
    {id: 'End Date', type: 'date'},
    {id: 'Duration', type: 'number'},
    {id: 'Percent Complete', type: 'number'},
    {id: 'Dependencies', type: 'string'}
  ];
  ganttData2 = [
    ['2014Spring', 'Spring 2014', 'spring',
      new Date(2014, 2, 22), new Date(2014, 5, 20), null, 100, null],
    ['2014Summer', 'Summer 2014', 'summer',
      new Date(2014, 5, 21), new Date(2014, 8, 20), null, 100, null],
    ['2014Autumn', 'Autumn 2014', 'autumn',
      new Date(2014, 8, 21), new Date(2014, 11, 20), null, 100, null],
    ['2014Winter', 'Winter 2014', 'winter',
      new Date(2014, 11, 21), new Date(2015, 2, 21), null, 100, null],
    ['2015Spring', 'Spring 2015', 'spring',
      new Date(2015, 2, 22), new Date(2015, 5, 20), null, 50, null],
    ['2015Summer', 'Summer 2015', 'summer',
      new Date(2015, 5, 21), new Date(2015, 8, 20), null, 0, null],
    ['2015Autumn', 'Autumn 2015', 'autumn',
      new Date(2015, 8, 21), new Date(2015, 11, 20), null, 0, null],
    ['2015Winter', 'Winter 2015', 'winter',
      new Date(2015, 11, 21), new Date(2016, 2, 21), null, 0, null],
    ['Football', 'Football Season', 'sports',
      new Date(2014, 8, 4), new Date(2015, 1, 1), null, 100, null],
    ['Baseball', 'Baseball Season', 'sports',
      new Date(2015, 2, 31), new Date(2015, 9, 20), null, 14, null],
    ['Basketball', 'Basketball Season', 'sports',
      new Date(2014, 9, 28), new Date(2015, 5, 20), null, 86, null],
    ['Hockey', 'Hockey Season', 'sports',
      new Date(2014, 9, 8), new Date(2015, 5, 21), null, 89, null]
  ];

  options = {
    height: 400,
    gantt: {
      trackHeight: 30
    }
  };

  constructor(private commonService: CommonService, private restAPIService: RESTAPIService) {
    super();
    if (this.commonService.currentUserRole.indexOf('Administrator') >= 0 ) {
      for (const role in this.commonService.roleWiseAccess) {
        if (this.commonService.roleWiseAccess.hasOwnProperty(role)) {
          for (const widgetName of this.commonService.roleWiseAccess[role]) {
            this.widgetsControl[widgetName] = true;
          }
        }
      }
    } else {
      for (const role of this.commonService.currentUserRole) {
        if (this.commonService.roleWiseAccess[role]) {
          for (const widgetName of this.commonService.roleWiseAccess[role]) {
            this.widgetsControl[widgetName] = true;
          }
        }
      }
    }

    // this.restAPIService.anonymousGetCall().subscribe((getCallResp: any) => {
    //   console.log('getCallResp', getCallResp);
    // });
  }
}
