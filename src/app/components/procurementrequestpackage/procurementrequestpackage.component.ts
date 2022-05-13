import { Component, ViewChild, ElementRef } from '@angular/core';
import {PageComponentParentComponent} from "../../page-component-parent.component";
import {Router} from '@angular/router';
import {RESTAPIService} from '../../services/REST-API.service';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import {CommonService} from '../../services/common.service';
import {forkJoin, merge, Observable} from 'rxjs';
import { AppConstants } from 'src/app/AppConstants';

@Component({
  selector: 'app-procurementrequestpackage',
  templateUrl: './procurementrequestpackage.component.html'
})
export class ProcurementRequestPackageComponent extends PageComponentParentComponent {
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @ViewChild('videoPlayer1') videoplayer1: ElementRef;
  @ViewChild('templateSlickModal') slickTemplateModal: SlickCarouselComponent;
  @ViewChild('tutorialsSlickModal') slickTutorialModal: SlickCarouselComponent;
  isVideoPlay = false;
  activityArr: any[] = [];
  templateArr: any[] = [];
  tutorialsArr: any[] = [];
  templatesArray: any[] = [];
  tutorialsArray: any[] = [];
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
  slideConfig = {slidesToShow: 4, adaptiveHeight: false, slidesToScroll: 4, autoplay: false, centerMode: false, arrows: false };
  showSlider = false;
  searchVal = '';

  constructor(private router: Router, private restAPIService: RESTAPIService, public commonService: CommonService) {
    super();
    // this.restAPIService.getProcurementRequestPackageData().subscribe((response: any) => {
    //   if (this.restAPIService.isSuccessResponse(response)) {
    //     if (response.data.length) {
    //       response.data.map((result) => {
    //         if (result.ContractType === 'Activity') {
    //           this.activityArr.push(result);
    //         }
    //         else if (result.ContractType === 'Template') {
    //           this.templateArr.unshift(result);
    //         }
    //         else if (result.ContractType === 'Tutorial') {
    //           this.tutorialsArr.unshift(result);
    //         }
    //       });
    //       this.showSlider = true;
    //       this.templatesArray = this.templateArr;
    //       this.tutorialsArray =  this.tutorialsArr;
    //       this.templateArr = this.templateArr.slice(0, 4);
    //       this.tutorialsArr = this.tutorialsArr.slice(0, 4);
    //     }
    //   }
    // });

    let filter = `substringof('${AppConstants.PROC_PCKG}', WorkCategory)`;

    forkJoin([this.restAPIService.getProcurementRequestPackageData(), this.restAPIService.getFilteredTemplatesPageData(filter), this.restAPIService.getTutorialsPageData(filter)]).subscribe((forkJoinResponses: any) => {
      if (forkJoinResponses[0].data.length) {
        forkJoinResponses[0].data.map((result) => {
          if (result.ContractType === 'Activity') {
            this.activityArr.push(result);
          }
        });
      } else {
        console.log('Either no requirements development work category data was found in the SP list or the sysetm experienced an error.');
      }
      if (forkJoinResponses[1].data.length) {
        forkJoinResponses[1].data.map((result) => {
          this.templateArr.unshift(result);
          this.templatesArray = this.templateArr;
          // this.templateArr = this.templateArr.slice(0, 4);
        });
      } else {
        console.log('Either no templates data was found in the SP list or the sysetm experienced an error.');
      }
      if (forkJoinResponses[2].data.length) {
        forkJoinResponses[2].data.map((result) => {
          this.tutorialsArr.unshift(result);
          this.tutorialsArray =  this.tutorialsArr;
          // this.tutorialsArr = this.tutorialsArr.slice(0, 4);
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

  createActivity(value: string) {
    // this.router.navigate(['activities/newactivityprojectoversight'], { queryParams: { mode: 'createforprojectoversight', type: value } });
    if (!this.commonService.canCreateActivities()) {
      return;
    }
    this.router.navigate(['activities/newactivity'], { queryParams: { mode: 'create' }, state: { ActivityType: value}});
  }

  filterData(event){
    this.filterValue = event.target.value;
    this.showSlider = false;
    setTimeout((() => {
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
      }else{
        templateArr = this.templatesArray;
        tutorialsArr = this.tutorialsArray;
      }
      this.templateArr = templateArr;
      this.tutorialsArr = tutorialsArr;
      this.showSlider = true;
    }).bind(this));
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
