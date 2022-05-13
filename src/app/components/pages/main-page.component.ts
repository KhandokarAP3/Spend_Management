import {Component} from '@angular/core';
import {MainPageComponentParentComponent} from '../../page-component-parent.component';

@Component({
  selector: 'app-main-page',
  template: '<router-outlet></router-outlet>'
})
export class MainPageComponent extends MainPageComponentParentComponent {

}
