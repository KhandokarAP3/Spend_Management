import {
  Directive,
  ElementRef,
  HostListener,
  HostBinding,
  OnDestroy,
  Input,
  Pipe,
  PipeTransform,
  OnInit
} from '@angular/core';
import {Subject} from 'rxjs';
declare var $;

@Directive({
  selector: '[appToggleFocus]'
})
export class ToggleFocusDirective {
  @HostBinding('attr.tabindex')  tabindex = (Math.random() * 100) / 10;
  private isFocused = false;
  constructor(private host: ElementRef) {}
  @HostListener('click', ['$event']) onClick(event) {
    if (event.target.tagName === 'A') {
      return;
    }
    if (this.isFocused) {
      this.host.nativeElement.blur();
      this.isFocused = false;
    } else {
      this.host.nativeElement.focus();
      this.isFocused = true;
    }
  }
  @HostListener('blur', ['$event']) onblur(e) {
    this.isFocused = false;
  }
}

@Directive({
  selector: '[appNiceScroll]',
  exportAs: 'niceScroll'
})
export class NiceScrollDirective implements OnDestroy {
  public subject: Subject<any> = new Subject<any>();
  constructor(private host: ElementRef) {
    $(host.nativeElement).niceScroll({
      cursorcolor: '#0F6FFF',
      cursoropacitymin: 0.6,
      background: 'rgba(196, 196, 196, 0.2)',
      cursorborder: '0',
      autohidemode: false,
      cursorminwidth: 5,
      cursorwidth: '5px',
      cursorheight: '15px',
      cursorborderradius: '5px'
    });
    this.subject.subscribe(() => {
      setTimeout(() => {
        this.resizeNiceScroll();
      });
    });
  }

  ngOnDestroy(): void {
    $(this.host.nativeElement).getNiceScroll().remove();
  }

  public resizeNiceScroll(): void {
    $(this.host.nativeElement).getNiceScroll().resize();
  }
}

@Directive({
  selector: '[appToggleMenu]',
  exportAs: 'menu'
})
export class ExpandToggleButtonDirective {
  public showChild = false;
  @Input() notifier: Subject<any> = new Subject<any>();
  @HostListener('click', ['$event']) onClick(event) {
    this.showChild = !this.showChild;
    this.notifier.next();
  }
}

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective {

  @Input()
  public set appAutoFocus(value) {
    if (!!value) {
      this.host.nativeElement.focus();
    }
  }

  public constructor(private host: ElementRef) {
  }
}

@Pipe({
  name: 'thousandSuff'
})
export class ThousandSuffixesPipe implements PipeTransform {

  transform(input: any, args?: any): any {
    if (input === 0) {
      return 0;
    } else {
      // hundreds
      if (input <= 999){
        return input ;
      }
      // thousands
      else if (input >= 1000 && input <= 999999){
        return (input / 1000).toFixed(2) + 'K';
      }
      // millions
      else if (input >= 1000000 && input <= 999999999){
        return (input / 1000000).toFixed(2) + 'M';
      }
      // billions
      else if (input >= 1000000000 && input <= 999999999999){
        return (input / 1000000000).toFixed(2) + 'B';
      }
      else {
        return input ;
      }
    }
  }
}
