import { Component } from '@angular/core';
import {PageComponentParent} from '../../../PageComponentParent';
import {RESTAPIService} from '../../../services/REST-API.service';
import {Pagination, SortAndFilterTopLevelObjects} from '../../../pipes/pipes';
import {ExportToCsv} from 'export-to-csv';
import {CommonService} from '../../../services/common.service';
import {AppConstants} from '../../../AppConstants';
import * as moment from 'moment';

@Component({
  selector: 'app-template-page-dashboard',
  templateUrl: './template-page-dashboard.component.html'
})
export class TemplatePageDashboardComponent extends PageComponentParent {
  readonly csvOptions = {
    filename: 'templatesExport',
    showLabels: true,
    headers: []
  };
  allTemplatesArr: any[] = [];
  work_Category = 'All';
  templatesArr: any = [];
  groupDataByWK: any;
  sortBy = 'Title';
  reverse = true;
  filterValue = '';
  filterByFields = ['Title', 'Modified'];
  paginationParams = {
    itemsPerPage: 10,
    currentPage: 1,
    itemCount: 0,
  };
  view_Template_List = false;
  columnNames = [
    { av: 'Title', dv: 'Title', columnStyle: { textAlign: 'left'}},
    { av: 'Body', dv: 'Description', columnStyle: { textAlign: 'left', margin: 'auto', display: 'inline-block'}},
    { av: 'Modified', dv: 'Modified', columnStyle: { textAlign: 'center'}},
  ];

  constructor(
    private restAPIService: RESTAPIService,
    public sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects,
    public commonService: CommonService,
    public pagination: Pagination) {
    super();

    this.csvOptions.headers.push('Title');
    this.csvOptions.headers.push('Work Category');
    this.csvOptions.headers.push('Description');
    this.csvOptions.headers.push('Modified');

    this.restAPIService.getTemplatesPageData().subscribe((response: any) => {
      if (this.restAPIService.isSuccessResponse(response)) {
        if (response.data.length) {
          // this.templatesArr = response.data;
          // this.paginationParams.itemCount = this.templatesArr.length;
          // this.allTemplatesArr = response.data;
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

          this.allTemplatesArr = [...this.groupDataByWK[AppConstants.REQ_DEV], ...this.groupDataByWK[AppConstants.MARKET_RESEARCH], ...this.groupDataByWK[AppConstants.ACQ_PLAN], ...this.groupDataByWK[AppConstants.PROC_PCKG]];
          this.templatesArr = this.allTemplatesArr;
          this.paginationParams.itemCount = this.allTemplatesArr.length;
        }
        else {
          // this.templatesArr = [];
          this.allTemplatesArr = [];
        }
      }
    });
  }

  clearSearch(){
    this.filterValue = '';
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
    const filteredList = this.filterFn(this.templatesArr, this.filterValue, false);
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

  filterFn(items: any[], filterValue: string, usePagination: boolean = true) {
    let tempResult = this.sortAndFilterTopLevelObjects.transform(items, this.filterByFields, filterValue, this.sortBy, this.reverse, true);
    if (usePagination) {
      tempResult = this.pagination.transform(tempResult, this.paginationParams);
    }
    return tempResult;
  }

  selectCategoryFN() {
    if (this.work_Category === AppConstants.REQ_DEV) {
      this.templatesArr = this.groupDataByWK[AppConstants.REQ_DEV];
      // this.templatesArr = [];
      // this.allTemplatesArr.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.REQ_DEV)
      //     this.templatesArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.MARKET_RESEARCH) {
      this.templatesArr = this.groupDataByWK[AppConstants.MARKET_RESEARCH];
      // this.templatesArr = [];
      // this.allTemplatesArr.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.MARKET_RESEARCH)
      //     this.templatesArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.ACQ_PLAN) {
      this.templatesArr = this.groupDataByWK[AppConstants.ACQ_PLAN];
      // this.templatesArr = [];
      // this.allTemplatesArr.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.ACQ_PLAN)
      //     this.templatesArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.PROC_PCKG) {
      this.templatesArr = this.groupDataByWK[AppConstants.PROC_PCKG];
      // this.templatesArr = [];
      // this.allTemplatesArr.map((result) => {
      //   if (this.commonService.isNotUndefinedNullOrEmpty(result.WorkCategory)){
      //     if (result.WorkCategory === AppConstants.PROC_PCKG)
      //     this.templatesArr.push(result);
      //   }
      // });
    }
    else if (this.work_Category === AppConstants.ALL) {
      this.templatesArr = [];
      this.allTemplatesArr.map((result) => {
        this.templatesArr.push(result);
      });
    }
  }
}
