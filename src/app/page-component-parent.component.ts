import {Component, HostBinding} from '@angular/core';

@Component({
  template: ''
})
export class PageComponentParentComponent {
  @HostBinding() class = 'container-fluid px-0 d-block';
}

@Component({
  template: ''
})
export class MainPageComponentParentComponent {
  @HostBinding() class = 'content_box v2 d-block';
}
