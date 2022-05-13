import {Component, ElementRef, HostBinding} from '@angular/core';
declare var $;

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html'
})
export class ScrollToTopComponent {
  @HostBinding() class = 'back-to-top';
  constructor(private element: ElementRef) {
    // Show or hide the sticky footer button
    $(window).on('scroll', () => {
      if ($(window).scrollTop() > 600) {
        $(element.nativeElement).fadeIn(200);
      } else {
        $(element.nativeElement).fadeOut(200);
      }
    });

    // Animate the scroll to yop
    $(element.nativeElement).on('click', (event) => {
      event.preventDefault();
      $('html, body').animate({
        scrollTop: 0,
      }, 1500);
    });
  }
}
