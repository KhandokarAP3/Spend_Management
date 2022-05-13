import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {

  @Input() collectionSize = 0;
  @Input() paginationType;
  @Input() itemsPerPage = 10;
  @Output() itemsPerPageChange = new EventEmitter<number>();

  @Input() currentPageIndex = 1;
  @Output() currentPageIndexChange = new EventEmitter<number>();

  onCurrentPageIndexChange(pageNumber) {
    console.log(pageNumber);
    this.currentPageIndexChange.emit(pageNumber);
  }

  onItemsPerPageChanged(itemsPerPage) {
    console.log(itemsPerPage);
    this.itemsPerPageChange.emit(itemsPerPage);
  }
}
