import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChildren,
  ElementRef,
  QueryList,
  ViewChild
} from '@angular/core';
import { RESTAPIService } from '../../services/REST-API.service';
import { CommonService } from '../../services/common.service';
import { PageComponentParent } from '../../PageComponentParent';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import {forkJoin, merge, Observable} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AppConstants } from 'src/app/AppConstants';

declare const _spPageContextInfo: any;
declare const $;

@Component({
  selector: 'app-acquisitions-overview',
  templateUrl: './acquisitions-overview.component.html'
})

export class AcquisitionsOverviewComponent extends PageComponentParent {
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @ViewChild('videoPlayer1') videoplayer1: ElementRef;
  @ViewChild('templateSlickModal') slickTemplateModal: SlickCarouselComponent;
  @ViewChild('tutorialsSlickModal') slickTutorialModal: SlickCarouselComponent;
  @ViewChildren('inputsDiv') inputsDivView: QueryList<ElementRef>;
  @ViewChildren('taskDiv') taskDivView: QueryList<ElementRef>;
  @ViewChildren('finalStepDiv') finalStepDivView: QueryList<ElementRef>;
  isVideoPlay = false;
  templateArr: any[] = [];
  tutorialsArr: any[] = [];
  origTemplateArr: any[] = [];
  origTutorialsArr: any[] = [];
  templatesArray: any[] = [];
  tutorialsArray: any[] = [];
  overviewArray:any[] = [];
  showAllTemplates = false;
  showAllTutorials = false;
  templatesOptions = {
    items: 4,
    dots: false,
    nav: true,
    responsive: {
      0: {
        items: 1
      },
      480: {
        items: 2
      },
      768: {
        items: 2
      },
      991: {
        items: 4
      },
      1200: {
        items: 4
      }
    }
  };
  filterValue = '';
  sortBy = '';
  reverse = false;
  filterByFields = ['Title'];
  slideConfigBar = {slidesToShow: 4, slidesToScroll: 1, infinite: false};
  slideConfig = {slidesToShow: 4, adaptiveHeight: false, slidesToScroll: 4, autoplay: false, centerMode: false, arrows: false };
  showSlider = false;
  searchVal = '';
  overviewText = '';
  workCategoryArr: any[] = [AppConstants.REQ_DEV, AppConstants.MARKET_RESEARCH, AppConstants.ACQ_PLAN, AppConstants.PROC_PCKG];

  constructor(private router: Router, private restAPIService: RESTAPIService, public commonService: CommonService, private cdRef: ChangeDetectorRef) {
    super();

    let filter = `substringof('${AppConstants.OVERVIEW}', WorkCategory)`;

    forkJoin([this.restAPIService.getAcquisitionsOverviewData(), this.restAPIService.getFilteredTemplatesPageData(filter), this.restAPIService.getTutorialsPageData(filter)]).subscribe((forkJoinResponses: any) => {
      if (forkJoinResponses[0].data.length) {
        this.overviewArray = forkJoinResponses[0].data;
        for (const overview of this.overviewArray){
          console.log('Aquisition overview data: ', overview);
          //AcquisitionsOverview SP list only contains one variable
          if (overview.Category === 'Description') {
            this.overviewText = overview.Body;
          }
        }
      } else {
        console.log('Either no acquisitions overview work category data was found in the SP list or the sysetm experienced an error.');
      }
      if (forkJoinResponses[1].data.length) {
        forkJoinResponses[1].data.map((result) => {
          this.templateArr.unshift(result);
          this.templatesArray = this.templateArr;
          // this.templateArr = this.templateArr.slice(0, 4);
          this.origTemplateArr = this.templateArr;
        });
      } else {
        console.log('Either no templates data was found in the SP list or the sysetm experienced an error.');
      }
      if (forkJoinResponses[2].data.length) {
        forkJoinResponses[2].data.map((result) => {
          this.tutorialsArr.unshift(result);
          this.tutorialsArray =  this.tutorialsArr;
          // this.tutorialsArr = this.tutorialsArr.slice(0, 4);
          this.origTutorialsArr = this.tutorialsArr;
        });
      } else {
        console.log('Either no tutorials data was found in the SP list or the sysetm experienced an error.');
      }
      this.showSlider = true;
    });
  }

  clearSearch(){
    this.searchVal = '';
    this.filterData({target:{value: this.searchVal}});
  }

  toggleVideo() {
    const video = this.videoplayer.nativeElement as HTMLVideoElement;
    if (video.paused) {
      video.play();
      this.isVideoPlay = true;
    }
    else {
      video.pause();
      this.isVideoPlay = false;
    }
  }

  toggleVideo1() {
    const video = this.videoplayer1.nativeElement as HTMLVideoElement;
    if (video.paused) {
      video.play();
      this.isVideoPlay = true;
    }
    else {
      video.pause();
      this.isVideoPlay = false;
    }
  }

  viewAllTemplates(){
    this.showSlider = false;
    this.templateArr = this.templatesArray;
    this.showSlider = true
  }

  viewAllTutorials(){
    this.showSlider = false;
    this.tutorialsArr = this.tutorialsArray;
    this.showSlider = true;
  }

  goToResource(item: any){
    this.selectActivityInTimeline(item);
    if (item === AppConstants.REQ_DEV){
      this.router.navigate(['marketresearch']);
    }else if (item === AppConstants.MARKET_RESEARCH){
      this.router.navigate(['requirementsdevelopment']);
    }else if (item === AppConstants.ACQ_PLAN){
      this.router.navigate(['developacquisitionsplan']);
    }else if (item === AppConstants.PROC_PCKG){
      this.router.navigate(['procurementrequestpackage']);
    }
  }

  filterData(event){
    this.filterValue = event.target.value;
    let templateArr = [];
    let tutorialsArr = [];
    if (this.filterValue){
      const filterValue = this.filterValue.toLowerCase();
      templateArr = this.templatesArray.filter((item) => {
        const titleLowerCase = item.Title.toLowerCase();
        return titleLowerCase.includes(filterValue);
      });
      tutorialsArr = this.tutorialsArray.filter((item) => {
        const titleLowerCase = item.Title.toLowerCase();
        return titleLowerCase.includes(filterValue);
      });
      console.log('filtering done');
    }else{
      this.showSlider = false;
      templateArr = this.templatesArray;
      tutorialsArr = this.tutorialsArray;
      setTimeout((() => this.showSlider = true).bind(this), 0);
      console.log('showing the whole');
    }
    this.templateArr = templateArr;
    this.tutorialsArr = tutorialsArr;
  }

  public getClassName(s) {
    return s.toLowerCase().replace('/', ' ').split(' ').join('-');
  }

  selectActivityInTimeline(activityWorkCategory: string) {
    const activeSlideClass = this.getClassName(activityWorkCategory);
    $('.activity-tab-carousel').find('.active').removeClass('active');
    $('.activity-tab-carousel').find('.' + activeSlideClass).addClass('active');
    // this.cdRef.detectChanges();
  }

  slickTemplatePreviousBtn() {
    this.slickTemplateModal.slickPrev();
  }

  slickTemplateNextBtn() {
    this.slickTemplateModal.slickNext();
  }

  slickTutorialPreviousBtn() {
    this.slickTutorialModal.slickPrev();
  }

  slickTutorialNextBtn() {
    this.slickTutorialModal.slickNext();
  }
}
