import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import {NgbDateAdapter, NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faAngleUp,
  faAngleRight,
  faAngleLeft,
  faCog,
  faPlus,
  faFileExcel,
  faMinus,
  faPencilAlt,
  faTrash,
  faCalendarAlt,
  faCheck,
  faUpload,
  faTimesCircle,
  faSort,
  faSortUp,
  faSortDown,
  faPaperclip,
  faFileUpload,
  faExclamationTriangle,
  faSpinner,
  faStickyNote,
  faTimes, faDownload, faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { faBell, faCalendar, faCalendarPlus, faCheckCircle, faEye, faEnvelope, faUser, faSave, faPaperPlane, faFileAlt} from '@fortawesome/free-regular-svg-icons';
import {
  AutoFocusDirective,
  ExpandToggleButtonDirective,
  NiceScrollDirective,
  ThousandSuffixesPipe,
  ToggleFocusDirective
} from './directives/common-directives';
import {AppComponent} from './components/app-component/app.component';
import { TestComponent } from './test.component';
import {PreloaderComponent} from './components/preloader/preloader-component';
import {ScrollToTopComponent} from './components/scroll-to-top/scroll-to-top.component';
import {HeaderComponent} from './components/header/header.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {HomeComponent} from './components/pages/home/home.component';
import {MainPageComponent} from './components/pages/main-page.component';
import {ProjectListingComponent} from './components/pages/project-main-page/project-listing/project-listing.component';
import {ProjectDetailComponent} from './components/pages/project-main-page/project-detail/project-detail.component';
import {FundProgressComponent} from './components/fund-progress/fund-progress.component';
import {FooterComponent} from './components/footer/footer.component.js';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TableV1Component, TableV2Component, TableV3Component, TableV4Component} from './components/tables/table.component';
import {CommonService} from './services/common.service';
import { TutorialsPageDashboardComponent } from './components/tutorials-page/tutorials-page-dashboard/tutorials-page-dashboard.component';
import { EditUserProfileComponent } from './components/user-profile/edit-profile/edit-user-profile/edit-user-profile.component';
import { BarChartComponent } from './components/bar-chart.component';
import { AverageTimeToCompletionBarChartComponent } from './components/avg-time-to-complete-metric/avg-time-to-complete-metric.component';
import { AverageTimeToCompletionMarketResearchBarChartComponent } from './components/avg-time-to-complete-metric-market-research/avg-time-to-complete-metric-market-research.component';
import { AverageTimeToCompletionRequirementsDevelopmentBarChartComponent } from './components/avg-time-to-complete-metric-requirements-development/avg-time-to-complete-metric-requirements-development.component';
import { AverageTimeToCompletionProcurementRequestPackageBarChartComponent } from './components/avg-time-to-complete-metric-procurement-request-package/avg-time-to-complete-metric-procurement-request-package.component';
import { ProjectsMetricComponent } from './components/projects-metric/projects-metric.component';
import { WorkloadTrackingComponent } from './components/workload-tracking/workload-tracking.component';
// tslint:disable-next-line:max-line-length
import {
  MyFilterPipe,
  UpdateImageURL,
  ObjectFilterPipe,
  SortAndFilterObjects,
  Pagination,
  SortAndFilterTopLevelObjects,
  SortAndFilterObjectsForActivities,
  SortAndFilterAndPaginateTopLevelObjects,
  AP3DatePipe,
  SortAndFilterAndPaginateObjects,
  FilterAttachDocsPipe
} from './pipes/pipes';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {UniversalDeviceDetectorService} from './services/universal-device-detector.service';
import {AppRouteGuard, BackButtonEventtGuard, NavigationConfirmationGuard} from '../app-route-guard';
import {RESTAPIService} from './services/REST-API.service';
import {CommonDialogService} from './services/common-dialog.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {AP3DateAdapter, AP3DateParserFormatter} from './custom-input/date-formater-adapter';
import {TokenInterceptor} from './services/http.interceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {GoogleChartsModule} from 'angular-google-charts';
import {NgSelectModule} from '@ng-select/ng-select';
import {OrderModule} from 'ngx-order-pipe';
import {SlickCarouselModule} from 'ngx-slick-carousel';
import {ToastrModule} from 'ngx-toastr';
import {CurrencyPipe, DatePipe} from '@angular/common';
import { PaginationComponent } from './components/pagination/pagination.component';
import {CurrencyInputComponent} from './custom-input/currency-input.component';
import {ObjectOperationsService} from './services/object-operations.service';
import {TeamComponent} from './components/team/team.component';
import {TeamsModalComponent} from './components/team/teams-modal/teams-modal.component';
import {ActivityDashboardComponent} from './components/activity/activity-dashboard.component';
import {CreateActivityComponent} from './components/activity/create-activity.component';
import { MarketResearchComponent } from './components/market-research/market-research.component';
import { RequirementsDevelopmentComponent } from './components/requirementsdevelopment/requirementsdevelopment.component';
import {ProcurementRequestPackageComponent} from './components/procurementrequestpackage/procurementrequestpackage.component';
import {AcquisitionsOverviewComponent} from './components/acquisitions-overview/acquisitions-overview.component';
import {DevelopAcquisitionsPlanComponent} from './components/developacquisitionsplan/developacquisitionsplan.component';
import { TrackingItemDetailComponent } from './components/tracking-item/tracking-item-detail.component';
import {DocumentServerComponent} from './components/document-server/document-server.component';
import {DocumentApprovalComponent} from './components/document-approval/document-approval.component';
import {CometChatComponent} from './components/comet-chat/comet-chat.component';
import { AttachDocumentsComponent } from './components/attach-documents/attach-documents.component';
import { SubmitForApprovalModalComponent } from './components/submit-for-approval-modal/submit-for-approval-modal.component';
import {ViewAttachmentsModalComponent} from './components/pages/project-main-page/project-detail/viewattachments-modal/viewattachments-modal.component';
import { TemplatePageDashboardComponent } from './components/templates-page/template-page-dashboard/template-page-dashboard.component';
import { HelpDeskDashboardComponent } from './components/help-desk/help-desk-dashboard/help-desk-dashboard.component';
import { SendEmailComponent } from './components/help-desk/send-email/send-email.component';
import { RequestTicketComponent } from './components/help-desk/request-ticket/request-ticket.component';
import { AskExpertsComponent } from './components/help-desk/ask-experts/ask-experts.component';
import {EmailTemplateComponent} from './components/email-template/email-template.component';
import {NotificationTypeTemplateComponent} from './components/notification-type/notification-type-template.component';
import {NotificationTypeAddReceipientModalComponent} from './components/notification-type/notification-type-addReicpient-modal/notification-type-addReicpient-modal.component';
import {PRSubmittalModalComponent} from './components/pr-submittal/pr-submittal-modal.component';
import {NotificationTypeRecurrenceModalComponent} from './components/notification-type/notification-type-recurrence-modal/notification-type-recurrence-modal.component';
import {NotificationTypesModalComponent} from './components/notification-type/notification-type-modal/notification-type-modal.component';
import {EditorModule} from '@tinymce/tinymce-angular';
import {MultipleActivitiesModalComponent} from './components/pages/project-main-page/project-detail/multiple-activities-modal/multiple-activities-modal.component';
import {ViewActivitiesModalComponent} from './components/pages/project-main-page/project-detail/viewactivities-modal/viewactivities-modal.component';
import {RepositoryDashboardComponent} from './components/repository/repository-dashboard/repository-dashboard.component';
import {RepositoryPopupComponent} from './components/repository/repository-popup/repository-popup.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import {TimeToCompletionMetricComponent} from './components/time-to-completion-metric/time-to-completion-metric.component';
import {ActiveProjectsMetricComponent} from './components/active-projects-metric/active-projects-metric.component';
import {ProjectsWithExpiringFundsComponent} from './components/projects-with-expiring-funds/projects-with-expiring-funds.component';
import {TotalDollarAmountMetricComponent} from './components/total-dollar-amount-metric/total-dollar-amount-metric.component';
import {DocumentApprovalsMetricComponent} from './components/document-approvals-metric/document-approvals-metric.component';
import {PieChartComponent} from './components/pie-chart.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DragDropComponent} from './components/drag-drop/drag-drop.component';
import {ProjectsByWorkCategoryMetricComponent} from './components/projects-by-work-category-metric/projects-by-work-category-metric.component';
import {NotificationsComponent} from './components/notification/notifications.component';
import {ActionItemDashboardComponent} from './components/action-item-dashboard/action-item-dashboard.component';
import {UserAssignConfirmationModalComponent} from './components/user-assign-confirmation-modal/user-assign-confirmation-modal.component';
import {PreviousRouteService} from './services/PreviousRouteService';
import {NotesComponent} from './components/notes-component/notes.component';
import {CreateDocumentsComponent} from './components/document-server/create-documents/create-documents.component';
import {UploadDocumentsComponent} from './components/document-server/upload-documents/upload-documents.component';
import {ShareDocumentDialogComponent} from './components/document-server/share-document-dialog/share-document-dialog.component';
import {DocumentSharingStatusComponent} from './components/document-sharing-status/document-sharing-status.component';
import {AttachDocumentProjectActivitiesComponent} from './components/document-server/attach-documents-project-activities/attach-documents-project-activities.component';

@NgModule({
  declarations: [
    AppComponent,
    PreloaderComponent,
    ScrollToTopComponent,
    HeaderComponent,
    ToggleFocusDirective,
    NiceScrollDirective,
    ExpandToggleButtonDirective,
    AutoFocusDirective,
    MyFilterPipe,
    FilterAttachDocsPipe,
    UpdateImageURL,
    ObjectFilterPipe,
    SortAndFilterObjects,
    Pagination,
    SortAndFilterTopLevelObjects,
    SortAndFilterObjectsForActivities,
    AP3DatePipe,
    SortAndFilterAndPaginateTopLevelObjects,
    SortAndFilterAndPaginateObjects,
    SidebarComponent,
    TestComponent,
    FundProgressComponent,
    FooterComponent,
    TableV1Component,
    TableV2Component,
    TableV3Component,
    TableV4Component,
    HomeComponent,
    ProjectListingComponent,
    ProjectDetailComponent,
    MainPageComponent,
    TeamComponent,
    TeamsModalComponent,
    ActivityDashboardComponent,
    CreateActivityComponent,
    PaginationComponent,
    CurrencyInputComponent,
    MarketResearchComponent,
    RequirementsDevelopmentComponent,
    ProcurementRequestPackageComponent,
    AcquisitionsOverviewComponent,
    DevelopAcquisitionsPlanComponent,
    TrackingItemDetailComponent,
    DocumentServerComponent,
    CometChatComponent,
    AttachDocumentsComponent,
    CreateDocumentsComponent,
    UploadDocumentsComponent,
    SubmitForApprovalModalComponent,
    ViewAttachmentsModalComponent,
    TemplatePageDashboardComponent,
    TutorialsPageDashboardComponent,
    HelpDeskDashboardComponent,
    SendEmailComponent,
    RequestTicketComponent,
    AskExpertsComponent,
    EmailTemplateComponent,
    NotificationTypeTemplateComponent,
    NotificationTypeAddReceipientModalComponent,
    PRSubmittalModalComponent,
    NotificationTypeRecurrenceModalComponent,
    NotificationTypesModalComponent,
    NotificationsComponent,
    MultipleActivitiesModalComponent,
    ViewActivitiesModalComponent,
    RepositoryDashboardComponent,
    RepositoryPopupComponent,
    UserProfileComponent,
    EditUserProfileComponent,
    TimeToCompletionMetricComponent,
    ActiveProjectsMetricComponent,
    ProjectsWithExpiringFundsComponent,
    TotalDollarAmountMetricComponent,
    ThousandSuffixesPipe,
    DocumentApprovalComponent,
    DocumentApprovalsMetricComponent,
    PieChartComponent,
    DragDropComponent,
    BarChartComponent,
    AverageTimeToCompletionBarChartComponent,
    ProjectsByWorkCategoryMetricComponent,
    AverageTimeToCompletionMarketResearchBarChartComponent,
    AverageTimeToCompletionRequirementsDevelopmentBarChartComponent,
    AverageTimeToCompletionProcurementRequestPackageBarChartComponent,
    ProjectsMetricComponent,
    WorkloadTrackingComponent,
    ActionItemDashboardComponent,
    UserAssignConfirmationModalComponent,
    NotesComponent,
    ShareDocumentDialogComponent,
    DocumentSharingStatusComponent,
    AttachDocumentProjectActivitiesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    DragDropModule,
    NgbModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    GoogleChartsModule,
    NgSelectModule,
    OrderModule,
    SlickCarouselModule,
    ToastrModule.forRoot({
      tapToDismiss: true,
      newestOnTop: true,
      disableTimeOut: false,
      positionClass: 'toast-top-center',
      timeOut: 5000
    }),
    EditorModule,
  ],
  providers: [AppRouteGuard, BackButtonEventtGuard, NavigationConfirmationGuard, ToggleFocusDirective, NiceScrollDirective,
    // tslint:disable-next-line:max-line-length
    ExpandToggleButtonDirective, AutoFocusDirective, CommonService, PreviousRouteService, ObjectOperationsService, MyFilterPipe, FilterAttachDocsPipe, CurrencyPipe, DatePipe, RESTAPIService, CommonDialogService, UpdateImageURL,
    ObjectFilterPipe, SortAndFilterObjects, Pagination, SortAndFilterTopLevelObjects, SortAndFilterObjectsForActivities, AP3DatePipe,
    { provide: NgbDateAdapter, useClass: AP3DateAdapter},
    { provide: NgbDateParserFormatter, useClass: AP3DateParserFormatter},
    { provide: DeviceDetectorService, useClass: UniversalDeviceDetectorService },
    SortAndFilterAndPaginateTopLevelObjects, SortAndFilterAndPaginateObjects,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    ThousandSuffixesPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(faBell, faAngleUp, faAngleRight, faAngleLeft, faCog, faPlus, faMinus, faFileExcel, faCalendar, faPencilAlt, faTrash,
      faCheckCircle, faCalendarAlt, faCalendarPlus, faCheck, faUpload, faDownload, faEllipsisV, faTimesCircle, faEye, faSort, faSortUp,
      faSortDown, faPaperclip, faFileUpload, faEnvelope, faUser, faSave, faExclamationTriangle, faPaperPlane, faSpinner, faStickyNote, faTimes, faFileAlt);
  }
}
