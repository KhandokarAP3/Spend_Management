import {Component, HostBinding, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  template: ''
})
export class TableComponent {
  constructor(private router: Router){}
  @HostBinding() style = {display: 'block'};
  @Input() additionalClass = '';
  @Input() tableData: any = {
    headers: [],
    rows: []
  };
  @Input() tableType: any = '';

  goToLink(cellData) {
    if (cellData.hasOwnProperty('queryParams')){
      this.router.navigate(['action-item'], cellData.queryParams);
    }else{
      if (this.tableData.clickHandler) {
        this.tableData.clickHandler(cellData);
      }
    }
  }
}

@Component({
  selector: 'app-table-v1',
  templateUrl: './table.component.html'
})
export class TableV1Component extends TableComponent {
  @HostBinding() class = 'dash_table v1';
}

@Component({
  selector: 'app-table-v2',
  templateUrl: './table.component.html'
})
export class TableV2Component extends TableComponent {
  @HostBinding() class = 'dash_table v2';
}

@Component({
  selector: 'app-table-v3',
  templateUrl: './table.component.html'
})
export class TableV3Component extends TableComponent {
  @HostBinding() class = 'dash_table v3';
}

@Component({
  selector: 'app-table-v4',
  templateUrl: './table.component.html'
})
export class TableV4Component extends TableComponent {
  @HostBinding() class = 'dash_table v4';
}
