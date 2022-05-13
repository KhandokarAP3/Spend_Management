import { Component, AfterViewInit, ViewChild, ChangeDetectorRef, ElementRef, } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";
import {CommonService} from "../../../services/common.service";
import {AppConstants} from '../../../AppConstants';
declare var $;

@Component({
  selector: 'app-attach-documents',
  templateUrl: './upload-documents.component.html'
})
export class UploadDocumentsComponent {
  fileUploadObj: any = {};
  data: any = {};
  documentTypes: any[] = [];
  documentCategoryArr = AppConstants.DOC_CAT_ARR;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private elementRef: ElementRef,public activeModal: NgbActiveModal,private cdr: ChangeDetectorRef, private toastr: ToastrService, public commonService: CommonService) {
  }

  submitModalForm() {
    if(this.fileUploadObj.documents && this.fileUploadObj.documents[0].size > 5000000){
      this.toastr.error("Your document has exceeded the maximum file size limit for document upload. Maximum limit is 5 MB.")
    }else{
      this.activeModal.close(this.fileUploadObj);
    }
  }

  cancel () {
    this.activeModal.dismiss();
  }

  ngAfterViewInit() {
    $('.ng-select-container .ng-value-container .ng-input input').removeAttr('aria-expanded');
    $('.ng-select-container .ng-value-container .ng-input input').removeAttr('autocomplete');
    $('.ng-select-container .ng-value-container .ng-input input').attr('aria-label', 'Type');
    $('.ng-select-container .ng-value-container .ng-input input').attr('aria-labelledby', 'Type');
    $('.ng-select-container .ng-value-container .ng-input input').attr('role', 'option');
    this.cdr.detectChanges();
  }

  ngOnInit() {
  }

  onFileChange($event) {
    let name = $event.target.files[0].name;
    let array = name.split(/\.(?=[^\.]+$)/);

    if (this.data.allRepoDocData.length) {
      let findIfDocExistsInRepo: any = this.data.allRepoDocData.filter(x => x.DocumentTitle.toLowerCase() === array[0].toLowerCase() && x.DocumentType.toLowerCase() === array[1].toLowerCase());
      if (findIfDocExistsInRepo.length) {
        this.toastr.warning('A document with this name already exists in the system. Either delete the old document or change the name of the document you wish to upload to continue', '', { timeOut: 5000 });
        this.fileInput.nativeElement.value = "";
        return;
      }
    }
    this.fileUploadObj.title = array[0];
    this.fileUploadObj.documents = $event.target.files;
  }

  categoryDropDown() {
    var activityDropOptions = document.getElementById("uploadDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }

  selectDocNameFromNestedWorkCategories(data: any, templateObj: any) {
    templateObj.DocumentCategory = data.srcElement.text;
    var activityDropOptions = document.getElementById("uploadDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }
}
