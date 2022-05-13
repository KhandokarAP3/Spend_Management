import { Component, AfterViewInit, ViewChild, ChangeDetectorRef, ElementRef, } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {AppConstants} from '../../../AppConstants';
import {RESTAPIService} from '../../../services/REST-API.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
declare const $;

@Component({
  selector: 'app-attach-documents',
  templateUrl: './create-documents.component.html'
})
export class CreateDocumentsComponent implements AfterViewInit{
  showLoader = false;
  fileUploadObj: any = {
    Version: '',
    Template: 'N/A'
  };
  docFileFormats: any[] = ['Ms Word', 'Ms Excel'];
  documentCategoryArr = AppConstants.DOC_CAT_ARR;

  data: any = {};

  constructor(private http: HttpClient, private restAPIService: RESTAPIService, private elementRef: ElementRef, public activeModal: NgbActiveModal, private cdr: ChangeDetectorRef, private toastr: ToastrService, public commonService: CommonService) {
  }

  submitModalForm() {
    const createDocumentObj = {...this.fileUploadObj, Status: 'Final', DocumentCreator: AppConstants.spPageContextInfo.userDisplayName};
    if (!createDocumentObj.Version) {
      createDocumentObj.Version = '';
    }
    if (!createDocumentObj.Template) {
      createDocumentObj.Template = 'N/A';
    }
    this.showLoader = true;
    this.http.post(AppConstants.WORKFLOW_URLS.CREATE_DOCUMENT_URL, createDocumentObj).subscribe((res: any) => {
      // console.log(res);
      this.showLoader = false;
      this.toastr.success(res.Response);
      this.activeModal.close(true);
    }, error => {
      this.showLoader = false;
      this.toastr.error(error.error || 'Could not create document, Please contact your administrator');
    });
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

  changeExistingTemplate(templateType: any) {
    // if (templateType !== 'N/A') {
    if (templateType !== 'Other') {
      let getTemplateType: any = this.data.documentTemplateRecordsList.filter(x => x.TemplateType.toLowerCase() === templateType.toLowerCase());
      if (getTemplateType.length) {
        if (getTemplateType[0].DocumentType === '.docx' || getTemplateType[0].DocumentType === '.doc') {
          this.fileUploadObj.Format = this.docFileFormats[0];
        }
        else {
          this.fileUploadObj.Format = this.docFileFormats[1];
        }
      }
      else {
        console.log('Existing Template Type not found in SP db');
      }
    }
  }

  categoryDropDown() {
    var activityDropOptions = document.getElementById("createDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }

  selectDocNameFromNestedWorkCategories(data: any, templateObj: any) {
    templateObj.Template = data.srcElement.text;
    this.changeExistingTemplate(templateObj.Template);
    var activityDropOptions = document.getElementById("createDocDropOptions");
    if (activityDropOptions.style.display === "none") {
      activityDropOptions.style.display = "block";
    } else {
      activityDropOptions.style.display = "none";
    }
  }
}
