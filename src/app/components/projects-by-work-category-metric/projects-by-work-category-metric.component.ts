import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, NgZone } from '@angular/core';
import { RESTAPIService } from '../../services/REST-API.service';
import { CommonService } from '../../services/common.service';
import { AppConstants } from 'src/app/AppConstants';


@Component({
  selector: 'app-projects-by-work-category-metric',
  template: `
    <div class="title_wrap">
      <div class="title">
        <h2>Projects by work category ({{projectCounter}})</h2>
      </div>
    </div>
    <div class="chart_wrap" *ngIf="data[0].series.length > 0" style="padding-right: 0px; margin-right: 10px; width: 90%">
      <ngx-charts-line-chart
        [view]="view"
        [scheme]="colorScheme"
        [legend]="legend"
        [showXAxisLabel]="showXAxisLabel"
        [showYAxisLabel]="showYAxisLabel"
        [xAxis]="xAxis"
        [yAxis]="yAxis"
        [xAxisLabel]="xAxisLabel"
        [yAxisLabel]="yAxisLabel"
        [timeline]="timeline"
        [results]="data"
        [showGridLines]="false"
        [trimXAxisTicks]=true
        [maxXAxisTickLength]="16"
        [rotateXAxisTicks]="100"
      >
        <ng-template #tooltipTemplate let-model="model">
          <div class='doughnutChartToolTip'><pre style="color:#fff"><span style="color:#fff">{{model.name + ':' + model.value}}</span></pre></div>
        </ng-template>
        <ng-template #seriesTooltipTemplate let-model="model">
          <div class='doughnutChartToolTip'><pre style="color:#fff"><span style="color:#fff">{{model[0].name + ':' + model[0].value}}</span></pre></div>
        </ng-template>

      </ngx-charts-line-chart>
    </div>
    `,
})
export class ProjectsByWorkCategoryMetricComponent implements AfterViewInit{
  @HostBinding() class = 'data_table fixedMetrics m-0';
  @HostBinding() style = {display: 'block'};
  projectCounter = 0;
  data: any[] = [
    {
      name: 'Work Category',
      series: [
      ],
    }
  ];

  view: any[] = [480, 280];
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = false;
  showYAxisLabel = false;
  showXAxisLabel = false;
  xAxisLabel = 'Country';
  yAxisLabel = 'Population';
  timeline = true;
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
  rolesToShowAllProjects = [
    'Head of Contracting Activity',
    'Senior Procurement Executive',
    'Program Director',
    'Program Executive Officer',
    'First Line Manager(s)',
    'Financial Management (Budget Execution)',
    'Quality Assurance/Compliance'
  ];
  alternateCategoryNames = {
    [AppConstants.REQ_DEV]: 'Requirements',
    [AppConstants.MARKET_RESEARCH]: 'Market Research',
    [AppConstants.ACQ_PLAN]: 'Acquisition Plan',
    [AppConstants.PROC_PCKG]: 'PR Package'
  };
  constructor(private commonService: CommonService, private elementRef: ElementRef, private ngZone: NgZone, private cdr: ChangeDetectorRef, private restAPIService: RESTAPIService) {
    this.setComponentWidth();
    this.restAPIService.getDataFromProjectGeneral().subscribe(res => {
      if (this.restAPIService.isSuccessResponse(res)) {
        const series = [];
        const projectCategoryWiseCount: any = {};
        let showAllProjects = false;
        for (const role of this.rolesToShowAllProjects) {
          if (this.commonService.isCurrentUserRole(role)) {
            showAllProjects = true;
            break;
          }
        }
        for (const project of res.data) {
          if (!showAllProjects) {
            if (!project.isTeamProject) {
              continue;
            }
          }
          if (!projectCategoryWiseCount[project.Status]) {
            projectCategoryWiseCount[project.Status] = 0;
          }
          projectCategoryWiseCount[project.Status]++;
        }
        for (const category of commonService.status) {
          if (category.toLowerCase() === AppConstants.AWARDED.toLowerCase() ||
              category.toLowerCase() === AppConstants.INACTIVE.toLowerCase() ||
              category.toLowerCase() === AppConstants.SUBMITTED.toLowerCase()
          ) {
            continue;
          }
          const obj: any = { name: this.alternateCategoryNames[category], value: 0};
          if (projectCategoryWiseCount[category]) {
            obj.value = projectCategoryWiseCount[category];
          }
          this.projectCounter = this.projectCounter + obj.value;
          series.push(obj);
        }
        this.data[0].series = series;
      }
    });
  }

  ngAfterViewInit() {
    this.setComponentWidth(300);
  }

  @HostListener('window:resize', ['$event.target'])
  onResize() {
    this.setComponentWidth();
  }

  setComponentWidth(timeout = 0) {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.view[0] = (this.elementRef.nativeElement.offsetWidth - 32);
        this.cdr.detectChanges();
      });
    }, timeout);
  }
}
