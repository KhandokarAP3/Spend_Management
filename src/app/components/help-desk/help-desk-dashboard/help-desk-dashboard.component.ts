import { Component,ViewChild } from '@angular/core';
import {SendEmailComponent} from '../send-email/send-email.component';
import {PageComponentParent} from '../../../PageComponentParent';
import {RESTAPIService} from '../../../services/REST-API.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RequestTicketComponent} from '../request-ticket/request-ticket.component';
import {AskExpertsComponent} from '../ask-experts/ask-experts.component';
import {AppConstants} from '../../../AppConstants';
import {OwlCarousel} from 'ngx-owl-carousel';

@Component({
  selector: 'app-help-desk-dashboard',
  templateUrl: './help-desk-dashboard.component.html'
})
export class HelpDeskDashboardComponent extends PageComponentParent {
  webAbsoluteUrl = AppConstants.spPageContextInfo.webAbsoluteUrl;
  filterValue = '';
  sortBy = '';
  reverse = false;
  filterByFields = ['Title'];
  showAllTutorials = false;
  slideConfig = {"slidesToShow": 3, adaptiveHeight: false
  ,  "slidesToScroll": 3,"autoplay": false, "centerMode": false };
  showSlider = false;
  searchVal = '';
  paginationParams = {
    itemsPerPage: 6,
    currentPage: 1,
    itemCount: 0,
  };
  articlesItem: any;

  // @ViewChild('owlCarousel', { static: false }) owlElement: OwlCarousel;

  constructor(
    private modalService: NgbModal,private restAPIService: RESTAPIService){
    super();
    // this.helpDeskArray = this.helpDeskArr
    this.restAPIService.getHelpDeskArticles().subscribe((item:any) =>{
      if (this.restAPIService.isSuccessResponse(item)) {
        this.articlesItem = item.data;
        this.paginationParams.itemCount = this.articlesItem.length;
        let a = 1;
        this.articlesItem.map(item=>{
          item['serial'] = a;
          a = a+1;
        })

        console.log(this.articlesItem);
      }
    })
  }

  ngAfterViewInit(){
    setTimeout(() => this.showSlider = true, 0);
  }

  clearSearch(){
    this.filterValue = '';
  }

  updateCurrentPageIndex(currentPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, currentPage};
    });
  }
  updateItemsPerPage(itemsPerPage) {
    setTimeout(() => {
      this.paginationParams = {...this.paginationParams, itemsPerPage};
    });
  }

  sendEmail(){
    this.modalService.open(SendEmailComponent, { windowClass: 'large-modal' });
  }

  requestTicket(){
    this.modalService.open(RequestTicketComponent, { windowClass: 'large-modal' } );
  }

  askExpert(){
    this.modalService.open(AskExpertsComponent, { windowClass: 'large-modal' });
  }

}
