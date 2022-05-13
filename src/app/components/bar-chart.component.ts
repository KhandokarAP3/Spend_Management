import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, NgZone, OnInit} from '@angular/core';
import {RESTAPIService} from "../services/REST-API.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-bar-chart',
  template: `<ngx-charts-bar-vertical
    [view]="view"
    [scheme]=colorScheme
    [results]="data"
    [xAxis]="true"
    [yAxis]="true"
    [showGridLines]="true"
    [rotateXAxisTicks]="true"
    [roundEdges]="false"
    [gradient]="true"
    [legend]="false"
    [showXAxisLabel]="true"
    [showYAxisLabel]="true"
    [xAxisLabel]=xAxisLabel
    [yAxisLabel]="'Business Days'"
    [barPadding]="50"
    [noBarWhenZero]="true"
    [yAxisTicks]="[0, 10, 20, 30, 40, 50, 60, 70]"
    [maxXAxisTickLength]="maxXAxisTickLength"
    (select)="onSelect($event)">
  </ngx-charts-bar-vertical>`
})
export class BarChartComponent implements AfterViewInit {

  constructor(private elementRef: ElementRef, private ngZone: NgZone, private cdr: ChangeDetectorRef, private router: Router) {
  }
  @HostBinding() class = 'chart-box';
  @HostBinding('style.width.%') width = 100;
  @Input() data = [];
  @Input() colorSchemeComp = [];
  @Input() xAxisLabel = '';
  @Input() maxXAxisTickLength = 0;

  view: any[] = [450, 190];
  colorScheme = {
    domain: this.colorSchemeComp
  };
  @HostListener('window:resize', ['$event.target'])
  onResize() {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.view = [this.elementRef.nativeElement.offsetWidth, this.elementRef.nativeElement.offsetHeight];
        this.cdr.detectChanges();
      });
    });
  }

  onSelect(event) {
    console.log(event);
    const filters = [];
    for (const identifier of event.extra.identifierArr) {
      filters.push(`(ID eq '${identifier}')`);
    }
    const filter = `(${filters.join(' or ')})`;
    this.router.navigate(['activities'], { queryParams: { filter }});
  }

  ngAfterViewInit() {
    this.view = [this.elementRef.nativeElement.offsetWidth, this.elementRef.nativeElement.offsetHeight];
    this.colorScheme.domain = this.colorSchemeComp;
    console.log('this.maxXAxisTickLength', this.maxXAxisTickLength)
    console.log('xAxisLabel', this.xAxisLabel)
    this.maxXAxisTickLength = this.maxXAxisTickLength;
    this.cdr.detectChanges();
  }
}
