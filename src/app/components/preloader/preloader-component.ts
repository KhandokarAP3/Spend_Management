import {Component, ElementRef, HostBinding} from '@angular/core';
declare var $;

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader-component.html'
})
export class PreloaderComponent {
  @HostBinding() class = 'preloader';
  constructor(private element: ElementRef) {
    $(element.nativeElement).delay(500).fadeOut(500);
  }
}
