import {HostBinding} from '@angular/core';

export class PageComponentParent {
  @HostBinding() class = 'container-fluid px-0 d-block';
}
export class MainPageComponentParent {
  @HostBinding() class = 'content_box v2 d-block';
}
