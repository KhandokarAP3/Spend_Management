import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, NgZone} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-pie-chart',
  template: `
    <div>
      <ngx-charts-pie-chart
        [view]="view"
        [tooltipDisabled]="false"
        [scheme]="colorScheme"
        [legendPosition]="legendPosition"
        [labels]="showLabels"
        [doughnut]="isDoughnut"
        [legend]="showLegends"
        [results]="data"
        (select)="onSelect($event)"
        (window:resize)="onResize($event)"
        >
        <ng-template *ngIf="data && data.length" #tooltipTemplate let-model="model">
          <div class='doughnutChartToolTip'><pre style="color:#fff"><span style="color:#fff">{{model.value}}</span></pre></div>
          <div class='doughnutChartToolTip'><pre style="color:#fff"><span style="color:#fff">{{secondaryTooltipInfoMap[model.name]}}%</span></pre></div>
        </ng-template>
      </ngx-charts-pie-chart>
    </div>`,
})


// https://stackoverflow.com/questions/54079031/angular-ngx-charts-using-a-custom-legend
export class PieChartComponent implements AfterViewInit {

  constructor(private router: Router, private elementRef: ElementRef, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
  }

  showLegends = true;
  @HostBinding() class = 'chart-box';
  @HostBinding('style.width.%') width = 100;
  @Input() data = [];
  @Input() isDoughnut = false;
  @Input() legendPosition = 'right';
  @Input() showLabels = false;
  @Input() colorScheme = {};
  @Input() legendWidth = 190;
  @Input() secondaryTooltipInfoMap = null;
  view: any[] = [520 - this.legendWidth, 190];

  legendData = [];
  @HostListener('window:resize', ['$event.target'])
  onResize(event) {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.view = [this.elementRef.nativeElement.offsetWidth, this.elementRef.nativeElement.offsetHeight];
        this.cdr.detectChanges();
      });
    });
  }
  onSelect(event) {
    this.router.navigate(['invoices'], { queryParams: { data: event.name} });
  }
  ngAfterViewInit() {
    this.view = [this.elementRef.nativeElement.offsetWidth, this.elementRef.nativeElement.offsetHeight];
    this.legendData = this.data.map(d => d.name);
    this.cdr.detectChanges();
  }

  getSecondaryTooltipInfo() {

  }
}
