import {Component} from '@angular/core';
import {MainPageComponentParent} from '../../PageComponentParent';

@Component({
  selector: 'app-main-page',
  template: '<router-outlet></router-outlet>'
})
export class MainPageComponent extends MainPageComponentParent {

}
