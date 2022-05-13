import { Component, AfterViewInit, ViewChild, ChangeDetectorRef, ElementRef, } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppConstants } from 'src/app/AppConstants';
import { CommonService } from "../../services/common.service";
import { AppComponent } from '../app-component/app.component';
declare var $;

@Component({
  selector: 'app-attach-documents',
  templateUrl: './attach-documents.component.html'
})
export class AttachDocumentsComponent {
  fileUploadObj: any = {};
  data: any = {};
  showType = true;
  isReadOnly = true;
  documentTypes: any[] = [];
  documentCategoryArr = AppConstants.DOC_CAT_ARR;
  groupAttachDocNamesByWorkCategory: any;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private elementRef: ElementRef, public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef, private toastr: ToastrService, public commonService: CommonService) {
  }

  submitModalForm() {
    if (this.fileUploadObj.documents && this.fileUploadObj.documents[0].size > 5000000) {
      this.toastr.error("Your document has exceeded the maximum file size limit for document upload. Maximum limit is 5 MB.")
    } else {
      this.activeModal.close(this.fileUploadObj);
    }
  }

  cancel() {
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
    if (!(this.data && this.data.type == "activity")) {
      this.showType = false;
      let arr = [
        {
          value: 'Other',
          name: 'Other'
        }
      ];
      this.documentTypes = arr;
    }

    if (this.data && this.data.type == "activity") {
      this.fileUploadObj.type = this.data.activityType;
      this.groupAttachDocNamesByWorkCategory = this.data.groupAttachDocNamesByWorkCategory;
      this.showType = true;
      this.isReadOnly = true;
    }
    else {
      this.groupAttachDocNamesByWorkCategory = this.data.groupAttachDocNamesByWorkCategory;
      this.showType = false;
    }
  }

  onFileChange($event) {
    let name = $event.target.files[0].name? $event.target.files[0].name: '';
    var array: any[] = [];
    if (name){
      array = name.split(/\.(?=[^\.]+$)/);
    }else{
      console.log("$event does not have a name attribute.");
    }

    if (name.length > 0 && this.data.allRepoDocData && this.data.allRepoDocData.length) {//Checking to make sure there is repo data to check from
      if (array && array.length) {//Checking to make sure something didn't misfire and allow the user to upload a doc without all the required info
        //PREVIOUS: let findIfDocExistsInRepo: any = this.data.allRepoDocData.filter(x => x.DocumentTitle.toLowerCase() === array[0].toLowerCase() && x.DocumentType.toLowerCase() === array[1].toLowerCase());
        //Had to do the array the long way since if x.DocumentTitle is empty, undefined, or whatever (some of the titles are not available in the repo) this throws an error and won't let folks upload a doc
        var findIfDocExistsInRepo: any;
        for (const data of this.data.allRepoDocData) {
          if (data.Title && data.DocumentType) {
            let repoTitleArray = data.Title.split(/\.(?=[^\.]+$)/);
            if (repoTitleArray){
              if (repoTitleArray[0].toLowerCase() === array[0].toLowerCase() && data.DocumentType.toLowerCase() === array[1].toLowerCase()){
                findIfDocExistsInRepo = data;
                break;
              }
            }
          }
        }

        // var tempArray: any[] = [];
        // for (const fileName of this.data.fileNameDisplayArray){
        //   for(const repoData of this.data.allRepoDocData){
        //     if (fileName. === repoData.DocumentTitle){
        //       tempArray.push(fileName);
        //     }
        //   }
        // }
        //Check the files that are already on the page and make sure the user doesn't try to load the same one 2x's
        if (this.data.fileNameDisplayArray && this.data.fileNameDisplayArray.length){
          for (const data of this.data.fileNameDisplayArray){
            let inPageDocArray = data.documentName? data.documentName.split(/\.(?=[^\.]+$)/): [];
            if (inPageDocArray){
              if (inPageDocArray[0].toLowerCase() === array[0].toLowerCase()){
                findIfDocExistsInRepo = data;
                break;
              }
            }
          }
        }
        if (findIfDocExistsInRepo) {
          this.toastr.warning('A document with this name already exists in the system or has already been uploaded on this page. Either delete the old document or change the name of the document you wish to upload to continue', '', { timeOut: 5000 });
          this.fileInput.nativeElement.value = "";
          return;
        }
      }
    } else {
      console.log("No data was found in the repo.");
    }
    this.fileUploadObj.title = array[0];
    this.fileUploadObj.documents = $event.target.files;
  }

  categoryDropDown() {
    var activityDropOptions = document.getElementById("attachDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }

  selectDocNameFromNestedWorkCategories(data: any, activityObj: any) {
    activityObj.DocumentCategory = data.srcElement.text;
    var activityDropOptions = document.getElementById("attachDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }
}
