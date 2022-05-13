import { Component } from '@angular/core';
import {PageComponentParent} from '../../../PageComponentParent';
import {Router} from '@angular/router';
import {RESTAPIService} from '../../../services/REST-API.service';
import {Pagination, SortAndFilterTopLevelObjects} from '../../../pipes/pipes';
import * as moment from 'moment';
import {AppConstants} from '../../../AppConstants';
import {ExportToCsv} from 'export-to-csv';
import {CommonService} from '../../../services/common.service';

@Component({
  selector: 'app-tutorials-page-dashboard',
  templateUrl: './tutorials-page-dashboard.component.html'
})
export class TutorialsPageDashboardComponent extends PageComponentParent {
  readonly csvOptions = {
    filename: 'tutorialsExport',
    showLabels: true,
    headers: []
  };
  allTutorialsArr: any[] = [];
  tutorialsArr: any[] = [];
  groupDataByWK: any;
  sortBy = 'Title';
  reverse = true;
  work_Category = 'All';
  public selectedValue = 'Both';
  state: any;
  filterValue = '';
  filterByFields = ['Title', 'Modified'];
  pageTitle = 'Video Tutorials';
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  page = 1;
  previosPage: any;
  nextPage: any;
  collectionSize: any;
  view_Template_List = false;
  columnNames = [
    { av: 'Title', dv: 'Title', columnStyle: { textAlign: 'left'}},
    { av: 'Body', dv: 'Description', columnStyle: { textAlign: 'left', margin: 'auto', display: 'inline-block'}},
    { av: 'Modified', dv: 'Modified', columnStyle: { textAlign: 'center'}},
  ];

  constructor(
    private router: Router,
    public sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    private restAPIService: RESTAPIService,
    public commonService: CommonService,
    public pagination: Pagination) {
    super();
    const navigation = this.router.getCurrentNavigation();
    let tutorialFilter = '';
    if (navigation?.extras?.state) {
      this.state = navigation.extras.state;
      if (this.state?.activity) {
        this.pageTitle = `${this.state.activity.activityType} ${this.pageTitle}`;
        tutorialFilter = `substringof('${this.state.activity.activityType}', ActivityType)`;
      }
    }

    // for (const column of this.columnNames) {
    //   this.csvOptions.headers.push(column.dv);
    // }

    this.csvOptions.headers.push('Title');
    this.csvOptions.headers.push('Work Category');
    this.csvOptions.headers.push('Description');
    this.csvOptions.headers.push('Modified');

    this.restAPIService.getTutorialsPageData(tutorialFilter).subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        if (response.data.length) {
          // this.allTutorialsArr = response.data;
          console.log('response.data', response.data);
          for (var i: number = 0; i < response.data.length; i++) {
            response.data[i].Modified = moment(response.data[i].Modified).format(AppConstants.AP3DateFormat);
          }

          let findSingleWK: any = response.data.filter(x => x.WorkCategory !== null && !x.WorkCategory.includes(','));
          if (findSingleWK.length) {
            this.groupDataByWK = findSingleWK.reduce(function (r, a) {
              r[a.WorkCategory] = r[a.WorkCategory] || [];
              r[a.WorkCategory].push(a);
              return r;
            }, Object.create(null));
          }
          else {
            this.groupDataByWK = {};
          }
          let findMultipleWK: any = response.data.filter(x => x.WorkCategory !== null && x.WorkCategory.includes(','));
          if (findMultipleWK.length) {
            for (const mWK of findMultipleWK) {
              let splitWK: any = mWK.WorkCategory.split(',');
              if (splitWK.length) {
                for (const a of splitWK) {
                  let trimWK: any = a.trim();
                  if (this.groupDataByWK[trimWK] && this.groupDataByWK[trimWK].length) {
                    this.groupDataByWK[trimWK].push(mWK);
                  }
                  else {
                    this.groupDataByWK[trimWK] = [mWK];
                  }
                }
              }
            }
          }
          this.allTutorialsArr = [...this.groupDataByWK[AppConstants.REQ_DEV], ...this.groupDataByWK[AppConstants.MARKET_RESEARCH], ...this.groupDataByWK[AppConstants.ACQ_PLAN], ...this.groupDataByWK[AppConstants.PROC_PCKG]];
          this.tutorialsArr = this.allTutorialsArr;
          // response.data.map((result) => {
          //     this.tutorialsArr.push(result);
          // });
          console.log(response.data.length);
          console.log('this.allTutorialsArr.length', this.allTutorialsArr.length);
          this.paginationParams.itemCount = this.allTutorialsArr.length;
          // logic to select a card to be shown.
          // if (this.state.activity?.activityType) {
          //   this.tutorialsArr = [this.tutorialsArr[this.state.activity.activityType.length % this.tutorialsArr.length]];
          // }
        }
      }
    });
  }

  goBackToActivity() {
    if (this.state?.activity) {
      if (this.state.activity.ID || this.state.activity.ActivityId) {
        this.router.navigate([`activities/${this.state.activity.ID}`], { queryParams: { mode: this.state.mode }, state: {projectParams: this.state.projectParams} });
      }
      else {
        this.router.navigate(['activities/newactivity'], { queryParams: { mode: 'create' }, state: { activity: this.state.activity, projectParams: this.state.projectParams}});
      }
    }
  }

  sortTableBy(key) {
    if (this.sortBy === key) {
      this.reverse = !this.reverse;
    }
    this.sortBy = key;
  }

  updateCurrentPageIndex(currentPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, currentPage};
    });
  }

  updateItemsPerPage(itemsPerPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, itemsPerPage};
    });
  }

  exportToCSV() {
    const csvExporter = new ExportToCsv(this.csvOptions);
    const filteredList = this.filterDataFn(this.tutorialsArr, this.filterValue, false);
    const data = filteredList.map((document) => {
      // const obj = {};
      // for (const column of this.columnNames) {
      //   obj[column.dv] = document[column.av] || '';
      // }
      // return obj;
      return {
        Title: document.Title || '',
        'Work Category': document.WorkCategory || '',
        Description: document.Body || '',
        Modified: document.Modified || ''
      };
    });
    csvExporter.generateCsv(data);
  }

  // exportToCSV() {
  //   const csvExporter = new ExportToCsv(this.csvOptions);
  //   const filteredList = this.filterFn(this.projects, this.filterValue, false);
  //   const data = filteredList.map((project) => {
  //     return {
  //       'Project Identifier': project.Identifier,
  //       Title: project.Title || '',
  //        POC: project.POC,
  //       'Estimated Value': project.EstimatedValue,
  //       'Creation Date': project.CreationDate || '',
  //       'Requested Award Date': project.Requested_Award_Date || '',
  //       Status: project.Status || ''
  //     };
  //   });
  //   csvExporter.generateCsv(data);
  // }

  // selectCategoryFN() {
  //   if (this.selectedValue === 'Tutorials') {
  //     this.tutorialsArr = [];
  //     this.allTutorialsArr.map((result) => {
  //       if (result.IsDocumentTutorial == null || result.IsDocumentTutorial === false) {
  //         this.tutorialsArr.push(result);
  //       }
  //     });
  //   }
  //   else if (this.selectedValue === 'Templates') {
  //     this.tutorialsArr = [];
  //     this.allTutorialsArr.map((result) => {
  //       if (result.IsDocumentTutorial) {
  //         this.tutorialsArr.push(result);
  //       }
  //     });
  //   }
  //   else if (this.selectedValue === 'Both') {
  //     this.tutorialsArr = [];
  //     this.allTutorialsArr.map((result) => {
  //       // if (result.ContractType === 'Tutorial') {
  //         this.tutorialsArr.push(result);
  //       // }
  //     });
  //   }
  // }

  selectCategoryFN() {
    if (this.work_Category === AppConstants.REQ_DEV) {
      this.tutorialsArr = this.groupDataByWK[AppConstants.REQ_DEV];
      // this.allTutorialsArAfterGrouping.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)) {
      //     if (result.WorkCategory === AppConstants.REQ_DEV)
      //     this.tutorialsArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.MARKET_RESEARCH) {
      this.tutorialsArr = this.groupDataByWK[AppConstants.MARKET_RESEARCH];
      // this.allTutorialsArAfterGrouping.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)) {
      //     if (result.WorkCategory === AppConstants.MARKET_RESEARCH)
      //     this.tutorialsArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.ACQ_PLAN) {
      this.tutorialsArr = this.tutorialsArr = this.groupDataByWK[AppConstants.ACQ_PLAN];
      // this.allTutorialsArAfterGrouping.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.ACQ_PLAN)
      //     this.tutorialsArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.PROC_PCKG) {
      this.tutorialsArr = this.tutorialsArr = this.groupDataByWK[AppConstants.PROC_PCKG];
      // this.allTutorialsArAfterGrouping.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.PROC_PCKG)
      //     this.tutorialsArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.ALL) {
      this.tutorialsArr = [];
      this.allTutorialsArr.map((result) => {
        this.tutorialsArr.push(result);
      });
    }
  }

  clearSearch(){
    this.filterValue = '';
  }

  // public filterDataFn(items, searchString) {
  //   const result = [];
  //   for (const item of items) {
  //     if (item.Title.includes(searchString) && this.selectedValue === 'Tutorials'){
  //       if (item.IsDocumentTutorial == null || item.IsDocumentTutorial === false) {
  //         result.push(item);
  //       }
  //     }else if (item.Title.includes(searchString) && this.selectedValue === 'Templates'){
  //       if (item.IsDocumentTutorial) {
  //         result.push(item);
  //       }
  //     }else if (item.Title.includes(searchString) && this.selectedValue === 'Both'){
  //         result.push(item);
  //     }
  //   }
  //   return result;
  // }

  public filterDataFn(items: any[], filterValue: string, usePagination: boolean = true) {
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);
    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }
    return tempResult;
  }

}
