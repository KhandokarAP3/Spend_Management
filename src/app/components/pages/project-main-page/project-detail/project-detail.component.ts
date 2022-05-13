import { AfterViewInit, Component, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { PageComponentParent } from '../../../../PageComponentParent';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../services/common.service';
import { RESTAPIService } from '../../../../services/REST-API.service';
import { forkJoin, Observable, Observer, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { ObjectOperationsService } from '../../../../services/object-operations.service';
import { AppConstants } from '../../../../AppConstants';
import * as moment from 'moment';
import { CommonDialogService } from '../../../../services/common-dialog.service';
declare var $;
import * as momentTZ from 'moment-timezone';
import { MyFilterPipe } from 'src/app/pipes/pipes';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent extends PageComponentParent implements OnDestroy, OnInit, AfterViewInit {
  activityIds: string[] = [];
  actionitemIds: string[] = [];
  isFormSubmitted = false;
  showLoader = false;
  isViewMode = true;
  isCreateProject = false;
  project: any;
  title: string;
  uploadDocuments: any = [];
  uploadedDocuments: any = [];
  isDeleteFileName: any[] = [];
  submitDocumentsForApprovalArr: any[] = [];
  mode: string;
  navigation: any;
  editableHeaderText = true;
  submissionFormData: Subscription;
  siteAllUsers: any = [];
  projectTitleList: string[] = [];
  tempDate;
  multipleActivitiesForSave: any[] = [];
  submitForApprovalSPData: any[] = [];
  documentApprovalTriggerMap = [];
  showActivityProgressBar = true;
  documentsPendingForApproval: any = {};
  slideConfig = { slidesToShow: 5, slidesToScroll: 1, infinite: false };
  workCategoryArr: any[] = [
    AppConstants.REQ_DEV,
    AppConstants.MARKET_RESEARCH,
    AppConstants.ACQ_PLAN,
    AppConstants.PROC_PCKG,
    AppConstants.COMPLETED
  ];
  allRepoDocumentsData: any[] = [];
  allActionItemsData: any[] = [];
  allNotesData: any[] = [];
  requestedAwardDate = false;
  prtocontractsdate = false;
  fileNameDisplayArray = [];
  projectFilesArr: any[] = [];
  // Holds the granular approver level 'received' records
  documentsArr: any[] = [];
  groupAttachDocNamesByWorkCategory: any;

  @ViewChild('submissionForm') public submissionForm: NgForm;
  @ViewChild('projectTitle') projectTitle: ElementRef;
  projectTitleAlreadyExists: boolean;

  // tslint:disable-next-line:max-line-length
  constructor(private route: ActivatedRoute,
              private router: Router,
              public commonService: CommonService,
              private restAPIService: RESTAPIService,
              private toaster: ToastrService,
              private commonDialogService: CommonDialogService,
              private myFilterPipe: MyFilterPipe,
              private cdr: ChangeDetectorRef) {
    super();
    this.navigation = this.router.getCurrentNavigation();

    this.route.params.subscribe((params) => {
      this.addProjectObject(params.projectid);
    });

    this.route.queryParams.subscribe(params => {
      if (params.mode) {
        this.mode = params.mode;
        if (params.mode === 'create') {
          this.isCreateProject = true;
          this.title = 'Create Project';
          this.addProjectObject();
          this.isViewMode = false;
        } else if (params.mode === 'edit') {
          // this.title = '(Edit)';
          this.title = 'Edit Project';
          this.isViewMode = false;
        } else if (params.mode === 'view') {
          // this.title = '(View)';
          this.title = 'View Project';
          this.isViewMode = true;
        }
      }
      // if (this.isCreateProject) {
      //   if (this.navigation?.extras?.state?.project) {
      //     this.project = this.navigation.extras.state?.project;
      //   } else {
      //     this.routeScreen();
      //   }
      // }
    });

    this.restAPIService.getAllSiteUsers().subscribe((users: any) => {
      this.siteAllUsers = users.data;
    });

    this.restAPIService.getDocumentForApproval().subscribe((approvalDocResp: any) => {
      if (this.restAPIService.isSuccessResponse(approvalDocResp)) {
        this.submitForApprovalSPData = approvalDocResp.data;
      }
    });

    this.restAPIService.getDocumentApprovalTriggerMapRecords().subscribe((docApprovalTriggerMapResp: any) => {
      this.documentApprovalTriggerMap = docApprovalTriggerMapResp.data;
    });

    this.restAPIService.getDocumentForApprovalList().subscribe((listOfApproversResp: any) => {
      this.documentsArr = listOfApproversResp.data;
    });

    this.restAPIService.getDocumentCategoryForAttachDocs().subscribe((listOfDocNamesByWorkCtegoryResp: any) => {
      this.groupAttachDocNamesByWorkCategory = listOfDocNamesByWorkCtegoryResp.data.reduce(function(r, a) {
        r[a.WorkCategory] = r[a.WorkCategory] || [];
        r[a.WorkCategory].push(a);
        return r;
      }, Object.create(null));
    });

    this.restAPIService.getAllProjects().subscribe((allProjectsResp: any) => {
      if (this.restAPIService.isSuccessResponse(allProjectsResp)){
        for (const project of allProjectsResp.data) {
          this.projectTitleList.push(project.Title);
        }
      }else{
        console.log('Could not retrieve project title information.');
      }
    });

    AppConstants.toBeModifiedActivityIdList = [];
    AppConstants.AttachedFilenames = [];
  }

  filterFn(filter: string) {
    const result = this.myFilterPipe.transform(this.projectTitleList, filter);
    if (result.length > 0)
    {
      this.projectTitleAlreadyExists = true;
    }
    else
    {
      this.projectTitleAlreadyExists = false;
    }
  }
  addProjectObject(id?) {
    const projectObj = {
      Identifier: '',
      Title: '',
      Description: '',
      ContractType: '',
      Sponsor: '',
      ProgramOffice: '',
      POC: '',
      EstimatedValue: '',
      CreationDate: moment().format(AppConstants.AP3DateFormat),
      Requested_Award_Date: null,
      Status: '',
      AreFundsExpiring: false,
      Funding_Status: '',
      prtocontractsdate: null,
      NAICS_Code: '',
      NAICS_Description: '',
      // ContractVehicle: '',
      PSC: '',
      // ContractVehicleTierRating: '',
      Team: ObjectOperationsService.getNewTeamObject(),
      ProjectFilenames: [],
      ID: id || ''
    };
    this.project = projectObj;
  }

  removePOC(projectPOC, index) {
    projectPOC.POC.splice(index, 1);
  }

  endDateFocus(date) {
    this.tempDate = date;
  }

  checkTypingDateForCalendar(fieldName, obj?) {
    this.commonService.validateDateOnBlur(obj, fieldName);
  }

  compareStartAndEndDates(period, fieldName) {
    if (!period.Requested_Award_Date) {
      return;
    }
    const comparisonOfDates = this.commonService.compareStartAndEndDates(period.CreationDate, period.Requested_Award_Date);
    if (!comparisonOfDates) {
      if (fieldName === 'Requested_Award_Date') {
        setTimeout(() => {
          period.Requested_Award_Date = this.tempDate;
          this.commonService.validateDateOnBlur(this.project, 'Requested_Award_Date');
          this.toaster.error('Requested Award Date must be on or after the Project Creation Date');
        }, 0);
      }
    }
  }

  compareStartAndEndDatesPR(period, fieldName) {
    if (!period.prtocontractsdate) {
      return;
    }
    if (!period.Requested_Award_Date) {
      this.toaster.error('Please select Requested Award Date');
      return;
    }

    const comparisonOfDates = this.commonService.compareStartAndEndDatesEarlier(period.Requested_Award_Date, period.prtocontractsdate);
    if (!comparisonOfDates) {
      if (fieldName === 'prtocontractsdate') {
        setTimeout(() => {
          period.prtocontractsdate = this.tempDate;
          this.commonService.validateDateOnBlur(this.project, 'prtocontractsdate');
          this.toaster.error('PR To Contracts Date must be on or before the Requested Award Date.');
        }, 0);
      }
    }
  }

  compareStartAndEndDatesForToggle(period, fieldName) {
    if (this.requestedAwardDate) {
      if (!period.Requested_Award_Date) {
        this.requestedAwardDate = false;
        return;
      }
      const comparisonOfDates = this.commonService.compareStartAndEndDates(period.CreationDate, period.Requested_Award_Date);
      if (!comparisonOfDates) {
        if (fieldName === 'Requested_Award_Date') {
          setTimeout(() => {
            period.Requested_Award_Date = this.tempDate;
            this.commonService.validateDateOnBlur(this.project, 'Requested_Award_Date');
            this.toaster.error('Requested Award Date must be on or after the Project Creation Date.');
            this.requestedAwardDate = false;
          }, 0);
        }
      }
    }
  }

  compareStartAndEndDatesForTogglePR(period, fieldName) {
    if (this.prtocontractsdate) {
      if (!period.prtocontractsdate) {
        this.prtocontractsdate = false;
        return;
      }
      if (!period.Requested_Award_Date) {
        this.toaster.error('Please select Requested Award Date');
        return;
      }
      const comparisonOfDates = this.commonService.compareStartAndEndDatesEarlier(period.Requested_Award_Date, period.prtocontractsdate);
      if (!comparisonOfDates) {
        if (fieldName === 'prtocontractsdate') {
          setTimeout(() => {
            period.prtocontractsdate = this.tempDate;
            this.commonService.validateDateOnBlur(this.project, 'prtocontractsdate');
            this.toaster.error('PR To Contracts Date must be on or before the Requested Award Date');
            this.prtocontractsdate = false;
          }, 0);
        }
      }
    }
  }

  endDateAllow() {
    this.requestedAwardDate = true;
  }

  endDateAllowPR() {
    this.prtocontractsdate = true;
  }

  routeScreen() {
    if (this.navigation?.extras?.state?.fromContractorPage === true) {
      this.router.navigate(['projects']);
    }
    else {
      this.router.navigate([`projects`]);
    }
  }

  cancel(form: NgForm) {
    if (this.navigation?.extras?.state?.fromContractorPage === true) {
      if (!form.form.pristine) {
        if (confirm('Are you sure you wish to exit this page without saving your data? All data will be lost.')) {
          this.router.navigate(['contractors']);
        }
      }
      else {
        this.router.navigate([`contractors`]);
      }
    }
    else if (this.navigation?.extras?.state?.fromDocumentApprovalPage === true) {
      this.router.navigate([`document-approval`]);
    }
    else {
      this.router.navigate([`projects`]);
      // if(!form.form.pristine){
      //   if (confirm('Are you sure you wish to exit this page without saving your data? All data will be lost.')) {
      //     this.router.navigate(['projects']);
      //   }
      // }else{
      //   this.router.navigate([`projects`]);
      // }
    }
  }

  createActivity(form) {
    if (this.isCreateProject) {
      if (form.invalid) {
        this.isFormSubmitted = true;
        this.toaster.error(this.commonService.validationErrorMessage);
        return;
      }
      this.saveProject(form);
      this.router.navigate(['activities/newactivity'], { queryParams: { mode: 'create' }, state: { Identifier: this.project.Identifier, mode: this.mode, projectId: this.project.ID, projectTitle: this.project.ProjectTitle } });
    } else {
      this.router.navigate(['activities/newactivity'], { queryParams: { mode: 'create' }, state: { Identifier: this.project.Identifier, mode: this.mode, projectId: this.project.ID, projectTitle: this.project.Title } });
    }
  }

  createInvoice(form) {
    // if (this.isCreateProject) {
    //   if (form.invalid) {
    //     this.isFormSubmitted = true;
    //     this.toaster.error(this.commonService.validationErrorMessage);
    //     return;
    //   }
    //   const observable = new Observable(observer => {
    //     this.saveProjectFn(observer);
    //   });
    //   observable.subscribe(() => {
    //     this.router.navigate(['invoices/createinvoice'], { queryParams: { mode: 'create' }, state: { contractNo: this.project.contractNo, mode: this.mode, projectId: this.project.ID, fromProjectPage: true}});
    //   });
    // }
    // else {
    //   this.router.navigate(['invoices/createinvoice'], { queryParams: { mode: 'create' }, state: { contractNo: this.project.contractNo, mode: this.mode, projectId: this.project.ID, fromProjectPage: true}});
    // }
  }

  createContractor(form) {
    // if (this.isCreateProject) {
    //   if (form.invalid) {
    //     this.isFormSubmitted = true;
    //     this.toaster.error(this.commonService.validationErrorMessage);
    //     return;
    //   }
    //   const observable = new Observable(observer => {
    //     this.saveProjectFn(observer);
    //   });
    //   observable.subscribe(() => {
    //     this.router.navigateByUrl('/contractors/editcontractor', {state: { ViewType: 'Edit', contractNo: this.project.contractNo, mode: this.mode, projectId: this.project.ID}});
    //   });
    // } else {
    //   this.router.navigateByUrl('/contractors/createcontractor', {state: { ViewType: 'Add', contractNo: this.project.contractNo, mode: this.mode, projectId: this.project.ID}});
    // }
  }

  editProjectTitle() {
    this.editableHeaderText = true;
    setTimeout(() => {
      this.projectTitle.nativeElement.focus();
    }, 0);
  }

  disableTextField() {
    this.editableHeaderText = false;
  }

  saveProject(form: NgForm) {
    this.toaster.clear();
    if (form.invalid) {
      this.isFormSubmitted = true;
      if(form.controls['POC'].valid == false || form.controls['team.requirementsowner'].valid == false || form.controls['team.contractingOfficer'].valid == false)
      {
        this.toaster.error('Please select the name for the Teammates or POC text input field’s from the drop down list.');
      }
      else
      {
        this.toaster.error(this.commonService.validationErrorMessage);
      }
      return;
    }
    this.commonService.isSomethingUnsaved = false;
    if (this.project.Title.length > 255) {
      this.isFormSubmitted = true;
      this.toaster.error('Project Title length should be less than 255 characters');
      return;
    }

    // The project.Requested_Award_DateERROR value only exists if the system has logged an error
    if (this.project.Requested_Award_DateERROR) {
      // If it does exist make sure that its not undefined, null, or empty
      if (this.isNotUndefinedNullOrEmpty(this.project.Requested_Award_DateERROR)) {
        this.isFormSubmitted = true;
        this.toaster.error('Requested Award date format is Incorrect');
        return;
      }
    }

    // The project.prtocontractsdateERROR value only exists if the system has logged an error
    if (this.project.prtocontractsdateERROR) {
      // If it does exist make sure that its not undefined, null, or empty
      if (this.isNotUndefinedNullOrEmpty(this.project.prtocontractsdateERROR)) {
        this.isFormSubmitted = true;
        this.toaster.error('PR to Contracts date format is Incorrect');
        return;
      }
    }

    // if (parseFloat(this.project.EstimatedValue as string) === 0){
    if (parseFloat(this.project.EstimatedValue as string) <= 0) {
      this.isFormSubmitted = true;
      this.toaster.error('Estimated Value amount must be greater than $0.00');
      return;
    }

    const getProjectObj = ObjectOperationsService.getProjectForSave(this.project);

    if (this.mode === 'create') {
      forkJoin([this.restAPIService.getDataFromProjectGeneral(`Identifier eq '${this.project.Identifier}'`, AppConstants.SELECTED_FIELD_PROJECT), this.restAPIService.getDataFromProjectGeneral(`Title eq '${this.project.Title}'`, AppConstants.SELECTED_FIELD_PROJECT)]).subscribe((projectResponses: any) => {
        console.log('projectResponses22', projectResponses);
        if (projectResponses[0].data.length) {
          this.isFormSubmitted = true;
          this.toaster.error('There is already a project/contract', '', { timeOut: 5000 });
          return;
        }
        if (projectResponses[1].data.length) {
          this.isFormSubmitted = true;
          this.toaster.error('This project name already exists', '', { timeOut: 5000 });
          return;
        }
        if (this.multipleActivitiesForSave.length) {
          let count = 0;
          for (const activityObj of this.multipleActivitiesForSave) {
            this.restAPIService.saveActivity(activityObj).subscribe((activityResponse: any) => {
              if (this.restAPIService.isSuccessResponse(activityResponse)) {
                count++;
                if (count === this.multipleActivitiesForSave.length) {
                  delete getProjectObj.activities;
                  this.restAPIService.saveProject(getProjectObj).subscribe((saveResponse: any) => {
                    if (this.restAPIService.isSuccessResponse(saveResponse)) {
                      this.saveUpdateOrDeleteDocumentsOnServer();
                    }
                  });
                }
              }
            });
          }
        }
        else {
          delete getProjectObj.activities;
          this.restAPIService.saveProject(getProjectObj).subscribe((saveResponse: any) => {
            if (this.restAPIService.isSuccessResponse(saveResponse)) {
              this.saveUpdateOrDeleteDocumentsOnServer();
            }
          });
        }
      });
    }

    if (this.mode === 'edit') {
      if (this.multipleActivitiesForSave.length) {
        let count = 0;
        for (const activityObj of this.multipleActivitiesForSave) {
          this.restAPIService.saveActivity(activityObj).subscribe((activityResponse: any) => {
            if (this.restAPIService.isSuccessResponse(activityResponse)) {
              count++;
              if (count === this.multipleActivitiesForSave.length) {
                delete getProjectObj.activities;
                this.restAPIService.updateProject(getProjectObj, this.project.ID).subscribe((saveResponse: any) => {
                  if (this.restAPIService.isSuccessResponse(saveResponse)) {
                    this.saveUpdateOrDeleteDocumentsOnServer();
                  }
                });
              }
            }
          });
        }
      }
      else {
        delete getProjectObj.activities;
        this.restAPIService.updateProject(getProjectObj, this.project.ID).subscribe((saveResponse: any) => {
          if (this.restAPIService.isSuccessResponse(saveResponse)) {
            this.saveUpdateOrDeleteDocumentsOnServer();
          }
        });
      }
    }
  }

  saveUpdateOrDeleteDocumentsOnServer() {
    let count = 0;
    if (this.mode === 'create') {
      if (this.uploadDocuments.length > 0) {
        const uploadFiles = () => {
          if (count < this.uploadDocuments.length) {
            this.restAPIService.uploadFile(this.uploadDocuments[count], this.project.Identifier).subscribe((fileRes: any) => {
              count++;
              uploadFiles();
            });
          }  else {
            if (this.submitDocumentsForApprovalArr.length) {
              let submitCount = 0;
              for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                  if (this.restAPIService.isSuccessResponse(submitDocResponse)) {
                    submitCount++;
                    if (submitCount === this.submitDocumentsForApprovalArr.length) {

                      // Call Powerautomate script to pull business rules and add approvers
                      this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.ID);

                      this.toaster.success('Project saved successfully.', '', { timeOut: 5000 });
                      this.router.navigate(['projects']);
                    }
                  }
                });
              }
            }
            else {
              this.toaster.success('Project saved successfully.', '', { timeOut: 5000 });
              this.router.navigate(['projects']);
            }
          }
        };
        uploadFiles();
      }
      else {
        if (this.submitDocumentsForApprovalArr.length) {
          let submitCount = 0;
          for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
            this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
              if (this.restAPIService.isSuccessResponse(submitDocResponse)) {
                submitCount++;
                if (submitCount === this.submitDocumentsForApprovalArr.length) {

                  this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.ID);

                  this.toaster.success('Project saved successfully.', '', { timeOut: 5000 });
                  this.router.navigate(['projects']);
                }
              }
            });
          }
        }
        else {
          this.toaster.success('Project saved successfully.', '', { timeOut: 5000 });
          this.router.navigate(['projects']);
        }
      }
    }
    else if (this.mode === 'edit') {
      if (this.uploadDocuments.length > 0) {
        for (const uploadedDoc of this.uploadDocuments) {
          this.restAPIService.uploadFile(uploadedDoc, this.project.Identifier).subscribe((fileRes: any) => {
            if (fileRes.status === 'success') {
              count++;
              if (count === this.uploadDocuments.length) {
                if (this.isDeleteFileName.length > 0) {
                  this.deleteProjectDocuments();
                }
                else {
                  if (this.submitDocumentsForApprovalArr.length) {
                    let submitCount = 0;
                    for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                      this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                        if (this.restAPIService.isSuccessResponse(submitDocResponse)) {

                          // Call Powerautomate script to pull business rules and add approvers
                          this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.data.ID);

                          submitCount++;
                          if (submitCount === this.submitDocumentsForApprovalArr.length) {
                            this.toaster.success('Project updated successfully.', '', { timeOut: 5000 });
                            this.router.navigate(['projects']);
                          }
                        }
                      });
                    }
                  }
                  else {
                    this.toaster.success('Project updated successfully.', '', { timeOut: 5000 });
                    this.router.navigate(['projects']);
                  }
                }
              }
            }
          });
        }
      }
      else {
        if (this.isDeleteFileName.length > 0) {
          this.deleteProjectDocuments();
        }
        else {
          if (this.submitDocumentsForApprovalArr.length) {
            let submitCount = 0;
            for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
              this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                if (this.restAPIService.isSuccessResponse(submitDocResponse)) {

                  // Call Powerautomate script to pull business rules and add approvers
                  this.restAPIService.requestDocumentApprovalWorkflowAddApprovers(submitDocResponse.data.ID);

                  submitCount++;
                  if (submitCount === this.submitDocumentsForApprovalArr.length) {
                    this.toaster.success('Project updated successfully.', '', { timeOut: 5000 });
                    this.router.navigate(['projects']);
                  }
                }
              });
            }
          }
          else {
            this.toaster.success('Project updated successfully.', '', { timeOut: 5000 });
            this.router.navigate(['projects']);
          }
        }
      }
    }
  }

  deleteProjectDocuments() {
    let count = 0;
    for (const toBeDeleted of this.isDeleteFileName) {
      if (AppConstants.fileMap.has(toBeDeleted)) {
        const filename = AppConstants.fileMap.get(toBeDeleted);
        this.restAPIService.deleteDocumentFromServer(filename).subscribe((deleteFileResponse: any) => {
          if (deleteFileResponse.status === 'success') {
            count++;
            if (count === this.isDeleteFileName.length) {
              this.isDeleteFileName = [];
              if (this.submitDocumentsForApprovalArr.length) {
                let submitCount = 0;
                for (const submitDocForApproval of this.submitDocumentsForApprovalArr) {
                  this.restAPIService.saveDocumentForApproval(submitDocForApproval).subscribe((submitDocResponse: any) => {
                    if (this.restAPIService.isSuccessResponse(submitDocResponse)) {
                      submitCount++;
                      if (submitCount === this.submitDocumentsForApprovalArr.length) {
                        this.toaster.success(this.mode === 'create' ? 'Project saved successfully' : 'Project updated successfully', '', { timeOut: 5000 });
                        this.router.navigate(['projects']);
                      }
                    }
                  });
                }
              }
              else {
                this.toaster.success(this.mode === 'create' ? 'Project saved successfully' : 'Project updated successfully', '', { timeOut: 5000 });
                this.router.navigate(['projects']);
              }
            }
          }
        });
      }
      else {
        console.log('ERROR: Document title listed in \'isDeletedFileName\' array could not be found as a key in AppConstants.fileMap map. The following document will not be deleted: ' + this.isDeleteFileName);
      }
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    $('.scrollablerow .form-group input').removeAttr('aria-multiline');
    this.cdr.detectChanges();

    if (this.mode !== 'create') {
      forkJoin([
        this.restAPIService.getDataFromProjectGeneral(`ID eq '${this.project.ID}'`, AppConstants.SELECTED_FIELD_PROJECT),
        this.restAPIService.getRepositoryData(null, 'ID,DocumentTitle,VersionComment,DocumentCategory,File/ServerRelativeUrl,Created,Title,DocumentType,Identifier,Category,Status,Modified,Editor/Title&$top=5000&$expand=Editor/Title,File')
      ]).subscribe((forkJoinResponses: any) => {
        if (forkJoinResponses[0].data.length) {
          this.project = forkJoinResponses[0].data[0];
          // Set active entry on timeline
          this.selectActivityInTimeline(this.project.Status);
          this.editableHeaderText = false;

          // Nested API call to get activities - can't use fork join because we need the project call to complete first
          this.restAPIService.getActivities(`Identifier eq '${this.project.Identifier}'`).subscribe((projectActivityResp: any) => {
            if (this.restAPIService.isSuccessResponse(projectActivityResp)) {
              this.project.activities = projectActivityResp.data;

              this.restAPIService.getDocumentForApproval().subscribe((approvalDocResp: any) => {
                if (this.restAPIService.isSuccessResponse(approvalDocResp)) {
                  this.submitForApprovalSPData = approvalDocResp.data;
                  for (const doc of this.submitForApprovalSPData) {
                    if (doc.OverAllStatus === 'Submitted') {
                      this.documentsPendingForApproval[doc.DocumentName] = doc;
                    }
                  }
                }
                for (const activity of this.project.activities) {
                  activity.addNotification = activity.addNotification === 'true';
                  if (activity.TrackingItems) {
                    activity.trackingItems = JSON.parse(activity.TrackingItems);
                  } else {
                    activity.TrackingItems = [];
                  }
                  if (activity.ActivityFileNames !== null) {
                    activity.ActivityFileNames = JSON.parse(activity.ActivityFileNames);
                    for (const fileName of activity.ActivityFileNames) {
                      if (this.documentsPendingForApproval[fileName]) {
                        activity.hasPendingDocumentApproval = true;
                      }
                    }
                  }
                }
              });

              // Nested API call to get action items - can't use fork join because we need project.activities to be populated to do comparisons
              this.restAPIService.getActionItems().subscribe((actionItemResp: any) => {
                if (this.restAPIService.isSuccessResponse(actionItemResp)) {
                  const actionItemArray: any[] = actionItemResp.data;
                  for (var iterator: number = 0; iterator < this.project.activities.length; iterator++) {
                    for (var counter: number = 0; counter < actionItemArray.length; counter++) {
                      if (this.project.activities[iterator].ID === parseInt(actionItemArray[counter].ParentId)){
                        this.allActionItemsData.push(actionItemArray[counter]);
                      }
                    }
                  }

                  // Nested API call to get action items - can't use fork join because we need project.activities, and allActionItemData to be populated to do comparisons
                  this.restAPIService.getNotes().subscribe((notesResp: any) => {
                    if (this.restAPIService.isSuccessResponse(notesResp)) {
                      const notesArray: any[] = notesResp.data;
                      if (notesArray.length > 0) {
                        this.sortNotes(notesArray);
                      }
                    }
                  });
                }
              });
            }
          });
        }

        if (forkJoinResponses[1].data.length) {
          this.allRepoDocumentsData = forkJoinResponses[1].data;
        }
      });
    }
    if (this.mode && this.mode !== 'view') {
      setTimeout(() => {
        this.submissionFormData = this.submissionForm.valueChanges.subscribe(selectedValue => {
          if (selectedValue && Object.keys(selectedValue).length) {
            this.commonService.isSomethingUnsaved = true;
          }
        });
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.submissionFormData) {
      this.submissionFormData.unsubscribe();
    }
  }

  sortNotes(notesArray: any[]) {
    // Add all project level notes to allNotesData
    for (var j: number = 0; j < notesArray.length; j++) {
      if (notesArray[j].Level === AppConstants.PROJECT_LEVEL) {
        if (parseInt(notesArray[j].ParentId) === this.project.ID) {
          this.allNotesData.push(notesArray[j]);
        }
      }
    }

    // Add all activity level notes to allNotesData
    for (var k: number = 0; k < notesArray.length; k++) {
      if (notesArray[k].Level === AppConstants.ACTIVITY_TYPE) {
        for (var counter: number = 0; counter < this.project.activities.length; counter++) {
          if (parseInt(notesArray[k].ParentId) === this.project.activities[counter].ID) {
            this.allNotesData.push(notesArray[k]);
          }
        }
      }
    }

    // Add all action item level notes to allNotesData
    for (var l: number = 0; l < notesArray.length; l++) {
      if (notesArray[l].Level === AppConstants.ACTION_ITEM_TYPE) {
        for (var iterator: number = 0; iterator < this.allActionItemsData.length; iterator++) {
          if (parseInt(notesArray[l].ParentId) === parseInt(this.allActionItemsData[iterator].ParentId)) {
            this.allNotesData.push(notesArray[l]);
          }
        }
      }
    }
  }

  openAttachFileModal() {
    this.commonDialogService.openAttachFileModel({ allRepoDocData: this.allRepoDocumentsData, groupAttachDocNamesByWorkCategory: this.groupAttachDocNamesByWorkCategory }).subscribe((result: any) => {
      if (result) {
        const today: any = (moment().startOf('day').format('YYYY-MM-DD')).replace(/-/g, '');
        const currentTime: any = momentTZ().tz('America/New_York').format('hh:mm A').replace(/\s/g, '');
        const timeZone: any =momentTZ().tz('America/New_York').format('z');

        if (this.mode && this.mode === 'create') {
          for (const file of result.documents) {
            result.title = `${this.project.Identifier}_${result.title}_${(today)}-${currentTime}${timeZone}`;
            this.uploadDocuments.push({ document: file, DocTitle: result.title, type: result.type, documentCategory: result.DocumentCategory, status: result.Status, versionComments: result.verComments });
            this.uploadedDocuments = this.uploadDocuments;
            if (!this.IsEmpty(file.name)) {
              this.project.ProjectFilenames.push(result.title);
              AppConstants.AttachedFilenames.push(result.title);
            } else {
              console.log('The system was not able to complete the document upload process. Could not remove the file extension from the incoming file name.');
            }
          }
        }
        else if (this.mode && this.mode === 'edit') {
          for (const file of result.documents) {
            result.title = `${this.project.Identifier}_${result.title}_${(today)}-${currentTime}${timeZone}`;
            this.uploadDocuments.push({ document: file, DocTitle: result.title, type: result.type, documentCategory: result.DocumentCategory, status: result.Status, versionComments: result.verComments });
            this.uploadedDocuments = this.uploadDocuments;
            if (this.project.ProjectFilenames) {
              const nameCheck = this.project.ProjectFilenames.filter(v => v.toLowerCase() === file.name.toLowerCase());
              if (!nameCheck.length) {
                this.project.ProjectFilenames.push(result.title);
              }

              // If not a duplicate, add file to the AttachedFilenames array
              const attachedFilesNameCheck = AppConstants.AttachedFilenames.filter(v => v.toLowerCase() === file.name.toLowerCase());
              if (!attachedFilesNameCheck.length) {
                AppConstants.AttachedFilenames.push(result.title);
              }
            } else {
              console.log('The system was not able to complete the document upload process. Could not remove the file extension from the incoming file name.');
            }
          }
        }
      }
    });
  }

  openViewAttachmentsModal() {
    AppConstants.AttachedFilenames = this.updateAttachedFileNamesArrayListValue();
    this.populateProjectFilesArr();
    this.commonDialogService.openViewAttachmentsModal({
      project: this.project,
      uploadDocuments: this.uploadDocuments,
      isDeleteFileName: this.isDeleteFileName,
      submitForApprovalSPData: this.submitForApprovalSPData,
      submitDocumentsForApprovalArr: this.submitDocumentsForApprovalArr,
      documentApprovalTriggerMap: this.documentApprovalTriggerMap,
      projectFilesArr: this.projectFilesArr,
      documentsArr: this.documentsArr,
      mode: this.mode
    }).subscribe((result: any) => {
      if (result.project) {
        this.project = result.project;
        this.uploadDocuments = result.uploadDocuments;
        this.isDeleteFileName = result.isDeleteFileName;
        this.submitDocumentsForApprovalArr = result.submitDocumentsForApprovalArr;
        this.mode = result.mode;
        this.projectFilesArr = [];
      }
    });
  }

  populateProjectFilesArr() {
    if (AppConstants.AttachedFilenames.length) {
      AppConstants.fileMap = new Map();
      for (const docTitle of AppConstants.AttachedFilenames) {
        for (const repoItem of this.allRepoDocumentsData) {
          if (docTitle === repoItem.DocumentTitle) {

            let docObj: any = {};
            docObj.title = docTitle;
            docObj.filePath = `https://seventh.sharepoint.us${repoItem.File.ServerRelativeUrl}`;
            docObj.DocumentCategory = repoItem.DocumentCategory;

            this.projectFilesArr.push(docObj);
            if (!AppConstants.fileMap.has(docTitle)) {
              AppConstants.fileMap.set(docTitle, repoItem.Title);
            }
          }
        }
      }
    }
  }

  updateAttachedFileNamesArrayListValue(): any[] {
    // Create array to hold unique file names
    const fileNameArray: string[] = [];
    if (!this.project.ProjectFilenames) {
      this.project.ProjectFilenames = [];
    }
    // Copy all existing file names attached at the project level into the array (if any)
    if (!this.IsEmpty(this.project.ProjectFilenames)) {
      for (let i = 0; i < this.project.ProjectFilenames.length; i++) {
        if (!this.IsEmpty(this.project.ProjectFilenames[i]) && - 1 === fileNameArray.indexOf(this.project.ProjectFilenames[i])) {
          fileNameArray.push(this.project.ProjectFilenames[i]);
        }
      }
    }
    // Copy all file names added to the activity into the list (if any)
    if (!this.IsEmpty(this.project.activities)) {
      // iterate through each activity
      for (let j = 0; j < this.project.activities.length; j++) {
        // iterate through each file name listed in each activity
        if (!this.IsEmpty(this.project.activities[j].ActivityFileNames)) {
          for (let k = 0; k < this.project.activities[j].ActivityFileNames.length; k++) {
            if (!this.IsEmpty(this.project.activities[j].ActivityFileNames[k]) && -1 === fileNameArray.indexOf(this.project.activities[j].ActivityFileNames[k])) {
              fileNameArray.push(this.project.activities[j].ActivityFileNames[k]);
            }
          }
        }
      }
    }
    // Copy all file names added to the financial data filenames list into the list (if any)
    if (!this.IsEmpty(this.project.financialDataFilenames)) {
      for (let i = 0; i < this.project.financialDataFilenames.length; i++) {
        if (!this.IsEmpty(this.project.financialDataFilenames[i]) && -1 === fileNameArray.indexOf(this.project.financialDataFilenames[i])) {
          fileNameArray.push(this.project.financialDataFilenames[i]);
        }
      }
    }
    return fileNameArray;
  }

  IsEmpty(val) {
    return val == null || !(Object.keys(val) || val).length;
  }

  addMultipleActivitiesModal() {
    this.commonDialogService.openAddMultipleActivitiesModal({ project: this.project, mode: this.mode }).subscribe((result: any) => {
      if (result) {
        this.project = result.project;
        if (this.mode === 'create' && result.activitiesFor && result.activitiesForSave.length) {
          if (!this.multipleActivitiesForSave.length) {
            this.multipleActivitiesForSave = result.activitiesForSave;
          }
          else {
            for (const addActivity of result.activitiesForSave) {
              this.multipleActivitiesForSave.push(addActivity);
            }
          }
        }
      }
    });
  }

  openViewActivitiesModal() {
    this.commonDialogService.openViewActivitiesModal({ project: this.project, mode: this.mode, multipleActivitiesForSave: this.multipleActivitiesForSave, approvalData: this.submitForApprovalSPData }).subscribe((result: any) => {
      if (this.mode === 'create' && result.activitiesToBeRemoved.length) {
        for (const idx of result.activitiesToBeRemoved) {
          this.multipleActivitiesForSave.splice(idx, 1);
        }
      }
    });
  }

  openNotesModal() {
    this.commonDialogService.openNotesModal({ mode: this.mode, Level: 'Project', ParentId: String(this.project.ID), Name: this.project.Title, ProjectIdentifier: this.project.Identifier }).subscribe((result: any) => {
      console.log('result', result);
    });
  }

  // selectExpiringFundsStatus(event: any) {
  //   this.project.AreFundsExpiring = String(event);
  //   this.areFundsExpiring = event;
  // }

  public getClassName(s) {
    return s.toLowerCase().replace('/', ' ').split(' ').join('-');
  }

  selectActivityInTimeline(activityWorkCategory: string) {

    let activeSlideClass = '';

    if (activityWorkCategory === AppConstants.SUBMITTED ||
      activityWorkCategory === AppConstants.INACTIVE ||
      activityWorkCategory === AppConstants.AWARDED) {
      activeSlideClass = this.getClassName(AppConstants.COMPLETED);
    } else {
      activeSlideClass = this.getClassName(activityWorkCategory);
    }

    $('.activity-tab-carousel').find('.active').removeClass('active');
    $('.activity-tab-carousel').find('.' + activeSlideClass).addClass('active');
    // let findIdx;
    // const selectedSlide: any = this.slickModal.slides.find((x: any, idx: number) => {
    //   if (x && x.el && x.el.nativeElement && x.el.nativeElement.innerText && x.el.nativeElement.innerText.toLowerCase() === activityWorkCategory.toLowerCase()) {
    //     findIdx = idx;
    //     return x;
    //   }
    // });
    // if (findIdx) {
    //   this.slickModal.slickGoTo(findIdx);
    // }
    this.cdr.detectChanges();
  }

  isNotUndefinedNullOrEmpty(object) {
    // false means that this object is either undefined, null, or empty
    var isUndefinedOrNull = false;
    if (object !== '') {
      if (object !== null) {
        if (object !== undefined) {
          isUndefinedOrNull = true; // true means that there is nothing wrong with this value
        }
      }
    }
    return isUndefinedOrNull;
  }

  // deleteUploadDec(fileName: any) {
  //   if (this.mode && this.mode === 'edit') {
  //     if (this.uploadDocuments.length > 0) {
  //       for (let a = 0; a < this.uploadDocuments.length; a++) {
  //         if (this.uploadDocuments[a].document.name === fileName) {
  //           this.uploadDocuments.splice(a, 1);
  //           this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(fileName), 1);
  //           break;
  //         }
  //       }
  //     }
  //     else {
  //       const nameCheck = this.project.ProjectFilenames.filter(v => v.toLowerCase() === fileName.toLowerCase());
  //       if (nameCheck.length > 0) {
  //         this.isDeleteFileName.push(fileName);
  //         this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(fileName), 1);
  //       }
  //     }
  //   }
  //   else if (this.mode && this.mode === 'create') {
  //     if (this.uploadDocuments.length) {
  //       for (let a = 0; a < this.uploadDocuments.length; a++) {
  //         if (this.uploadDocuments[a].document.name === fileName) {
  //           this.uploadDocuments.splice(a, 1);
  //           this.project.ProjectFilenames.splice(this.project.ProjectFilenames.indexOf(fileName), 1);
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }
  //
  // deleteActivity(index) {
  //   if (!confirm('Do you want to delete activity?')) {
  //     return;
  //   }
  //   this.restAPIService.deleteActivity(this.project.activities[index].ID).subscribe((res) => {
  //     if (this.restAPIService.isSuccessResponse(res)) {
  //       if (this.project.activities[index].ActivityFileName.length) {
  //         let count = 0;
  //         for (const fileName of this.project.activities[index].ActivityFileName) {
  //           this.restAPIService.deleteActivityDocument(fileName).subscribe((deleteFileResponse: any) => {
  //             if (deleteFileResponse.status === 'success') {
  //               count++;
  //               if (count === this.project.activities[index].ActivityFileName.length) {
  //                 if (this.project.activities[index].activityType === AppConstants.CONTRACT_CLOSEOUTS && this.project.activities[index].status === 'Completed') {
  //                   this.restAPIService.getProjects(`contractNo eq '${this.project.activities[index].ContractNo}'`).subscribe((projectResp: any) => {
  //                     if (this.restAPIService.isSuccessResponse(projectResp)) {
  //                       if (projectResp.data.length) {
  //                         this.restAPIService.updateProject({__metadata: { type: 'SP.Data.ProjectGeneralListItem' }, projectStatus: 'No'}, projectResp.data[0].ID).subscribe((updateProject: any) => {
  //                           if (this.restAPIService.isSuccessResponse(updateProject)) {
  //                             this.toaster.success('Activity deleted successfully.', '', { timeOut: 5000 });
  //                             this.project.activities.splice(index, 1);
  //                           }
  //                         });
  //                       }
  //                     }
  //                   });
  //                 }
  //                 else {
  //                   this.toaster.success('Activity deleted successfully.', '', { timeOut: 5000 });
  //                   this.project.activities.splice(index, 1);
  //                 }
  //               }
  //             }
  //           });
  //         }
  //       }
  //       else {
  //         if (this.project.activities[index].activityType === AppConstants.CONTRACT_CLOSEOUTS && this.project.activities[index].status === 'Completed') {
  //           this.restAPIService.getProjects(`contractNo eq '${this.project.activities[index].ContractNo}'`).subscribe((projectResp: any) => {
  //             if (this.restAPIService.isSuccessResponse(projectResp)) {
  //               if (projectResp.data.length) {
  //                 this.restAPIService.updateProject({__metadata: { type: 'SP.Data.ProjectGeneralListItem' }, projectStatus: 'No'}, projectResp.data[0].ID).subscribe((updateProject: any) => {
  //                   if (this.restAPIService.isSuccessResponse(updateProject)) {
  //                     this.toaster.success('Activity deleted successfully.', '', { timeOut: 5000 });
  //                     this.project.activities.splice(index, 1);
  //                   }
  //                 });
  //               }
  //             }
  //           });
  //         }
  //         else {
  //           this.toaster.success('Activity deleted successfully.', '', { timeOut: 5000 });
  //           this.project.activities.splice(index, 1);
  //         }
  //       }
  //     } else {
  //       this.toaster.success('Could not delete activity.', '', { timeOut: 5000 });
  //     }
  //   });
  // }
  //
  // deleteContractor(contractor, index) {
  //   console.log('contractor', contractor);
  //   if (!confirm('Are you sure you wish to remove this contractor from this project?')) {
  //     return;
  //   }
  //   // TODO: Ahmer! please make api call to delete the contractor from the server. also delete documents too.
  //   const obj = {
  //     __metadata: { type: 'SP.Data.ContractorsListItem' },
  //     contractNo: ''
  //   };
  //   this.restAPIService.updateContractor(obj, contractor.ID).subscribe((response: any) => {
  //     if (this.restAPIService.isSuccessResponse(response)) {
  //       if (response.status === 'success'){
  //         this.toaster.success('Contractor removed from this project successfully', '', { timeOut: 5000 });
  //         this.project.contractorPOC.splice(index, 1);
  //       }else {
  //         this.toaster.error('Unable to remove the contractor from this project');
  //       }
  //     }
  //   });
  // }
  //
  // goToActivity(activityObj) {
  //   this.router.navigate([`activities/${activityObj.ID}`], { queryParams: { mode: 'edit' }, state: { contractNo: this.project.contractNo, mode: this.mode, projectId: this.project.ID} });
  // }
  //
  // goToContractor(contractorData) {
  //   this.router.navigateByUrl('/contractors/editcontractor', {state: { ViewType: 'Edit', contractNo: this.project.contractNo, mode: 'edit', projectId: this.project.ID}});
  // }
}
