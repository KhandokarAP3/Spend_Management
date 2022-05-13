import { Pipe, PipeTransform } from '@angular/core';
import { OrderPipe } from 'ngx-order-pipe';
import { environment } from '../../environments/environment';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'myfilter',
  pure: false
})
export class MyFilterPipe implements PipeTransform {
  transform(items: any[], search: string): any {
    if (!items || !search) {
      return items;
    }
    search = search.toLowerCase();
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => item.toLowerCase().indexOf(search) !== -1);
  }
}

@Pipe({
  name: 'updateImageURL',
  pure: false
})
export class UpdateImageURL implements PipeTransform {
  transform(input: string): any {
    return `${environment.assetsBaseUrl}assets/${input}`;
  }
}

@Pipe({
  name: 'sortFilterPaginate'
})
export class SortAndFilterAndPaginateTopLevelObjects implements PipeTransform {
  constructor(private sortAndFilterTopLevelObjects: SortAndFilterTopLevelObjects, private pagination: Pagination) {
  }
  transform(items: any[], filterFields: string | string[], filterValue: string, orderByField: string, reverse = false, isCaseInsensitive = true, paginationParams?): any[] {
    const result = this.sortAndFilterTopLevelObjects.transform(items, filterFields, filterValue, orderByField, reverse, isCaseInsensitive);
    return this.pagination.transform(result, paginationParams);
  }
}

@Pipe({
  name: 'sortFilterPaginateObjects'
})
export class SortAndFilterAndPaginateObjects implements PipeTransform {
  constructor(private sortAndFilterObjects: SortAndFilterObjects, private pagination: Pagination) {
  }
  transform(items = [], filterValue = '', filterFn: (array, searchText) => any[], paginationParams): any[] {
    const result = this.sortAndFilterObjects.transform(items, filterValue, filterFn, true);
    return this.pagination.transform(result, paginationParams);
  }
}

@Pipe({
  name: 'ObjectFilter'
})
export class ObjectFilterPipe implements PipeTransform {
  constructor() {}

  transform(items: any[], fields: string | string[], value: string): any[] {
    if (!items) { return []; }
    if (!value || value.length === 0) { return items; }
    if (!fields || fields.length === 0) {
      return items;
    }
    return items.filter(it => {
      if (typeof fields === 'object') {
        for (const field of fields) {
          if (isNaN(it[field])) {
            if (field !== 'CreationDate' && field !== 'Requested_Award_Date' && field !== 'PR_to_Contracts_Date') {
              if (it[field] && it[field].toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                return true;
              }
            }
            else {
              if (it[field] && it[field].indexOf(value) !== -1) {
                return true;
              }
            }
          }
          else {
            if (it[field] !== null && !isNaN(it[field])) {
              if (it[field] && it[field].toString().indexOf(value) !== -1) {
                return true;
              }
            }
          }
        }
      } else {
        return it[fields] && it[fields].toLowerCase().indexOf(value.toLowerCase()) !== -1;
      }
    });
  }
}

@Pipe({
  name: 'sortAndFilterObjects'
})
export class SortAndFilterObjects implements PipeTransform {
  constructor() {
  }
  transform(items: any[], filterValue: string, filterFn: (array, searchText) => any[], searchWhenEmptySearchText = false) {
    if (!items) { return []; }
    if (!searchWhenEmptySearchText && !filterValue) {
      return items;
    }
    if (!searchWhenEmptySearchText && (!filterValue || filterValue.length === 0)) { return items; }
    return filterFn(items, filterValue);
  }
}

@Pipe({
  name: 'paginate'
})
export class Pagination implements PipeTransform {
  constructor(private sortAndFilterObjects: SortAndFilterObjects) {
  }
  transform(items: any[], paginationParams): any[] {
    const result = items.slice((paginationParams.currentPage - 1) * paginationParams.itemsPerPage, paginationParams.currentPage * paginationParams.itemsPerPage);
    paginationParams.itemCount = items.length;
    return result;
  }
}

@Pipe({
  name: 'sortAndFilter'
})
export class SortAndFilterTopLevelObjects implements PipeTransform {
  constructor(private orderPipe: OrderPipe, private objectFilter: ObjectFilterPipe) {
  }
  transform(items: any[], filterFields: string | string[], filterValue: string, orderByField: string, reverse = false, isCaseInsensitive = true): any[] {
    if (!items) { return []; }
    // if (!filterValue || filterValue.length === 0) { return items; }
    const filteredItems = this.objectFilter.transform(items, filterFields, filterValue);
    if (orderByField && filteredItems.length > 1) {
      return this.orderPipe.transform(filteredItems, orderByField, reverse, isCaseInsensitive);
    }
    return filteredItems;
  }
}

@Pipe({
  name: 'sortAndFilterObjectsForActivities'
})
export class SortAndFilterObjectsForActivities implements PipeTransform {
  constructor() {
  }
  transform(items: any[], filterValue: string, filterFn: (array, searchText) => any[]) {
    // if (!items) { return []; }
    // if (!filterValue) {
    //   return items;
    // }
    // if (!filterValue || filterValue.length === 0) { return items; }
    return filterFn(items, filterValue);
  }
}

@Pipe({
  name: 'ap3Date'
})
export class AP3DatePipe implements PipeTransform {
  constructor() {
  }
  transform(date: any, format): any {
    if (date === null) {
      return;
    }
    return moment(date, 'MM-DD-YYYY').format('ll');
  }
}

@Pipe({
  name: 'filterAttachDocs',
  pure: false
})
export class FilterAttachDocsPipe implements PipeTransform {
  transform(items: any[], dataRequired: any): any {
    if (!items || !dataRequired) {
      return items;
    }
    if (dataRequired.from && dataRequired.activeTab === 1) {
      return items.filter(item => item.Status !== 'Submitted' && item.Status !== 'Awarded' && item.Status !== 'Inactive');
    }
    if (dataRequired.from && dataRequired.activeTab === 2) {
      return items.filter(item => item.Status === 'Submitted' || item.Status === 'Awarded' || item.Status === 'Inactive');
    }

    if (!dataRequired.from && dataRequired.activeTab === 1) {
      return items.filter(item => item.Status !== 'Completed');
    }
    if (!dataRequired.from && dataRequired.activeTab === 2) {
      return items.filter(item => item.Status === 'Completed');
    }
  }
}
