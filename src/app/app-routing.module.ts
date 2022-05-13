import {NgModule } from '@angular/core';
import {Routes, RouterModule } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';

import {AppRouteGuard, BackButtonEventtGuard, NavigationConfirmationGuard } from '../app-route-guard';

import {TestComponent } from './test.component';
import {HomeComponent} from './components/pages/home/home.component';
import {MainPageComponent} from './components/pages/main-page.component';
import {ProjectListingComponent} from './components/pages/project-main-page/project-listing/project-listing.component';
import {ProjectDetailComponent} from './components/pages/project-main-page/project-detail/project-detail.component';
import {ActivityDashboardComponent} from './components/activity/activity-dashboard.component';
import {CreateActivityComponent} from './components/activity/create-activity.component';
import {MarketResearchComponent } from './components/market-research/market-research.component';
import {RequirementsDevelopmentComponent } from './components/requirementsdevelopment/requirementsdevelopment.component';
import {ProcurementRequestPackageComponent} from './components/procurementrequestpackage/procurementrequestpackage.component';
import {DevelopAcquisitionsPlanComponent} from './components/developacquisitionsplan/developacquisitionsplan.component';
import {DocumentServerComponent} from './components/document-server/document-server.component';
import {TemplatePageDashboardComponent } from './components/templates-page/template-page-dashboard/template-page-dashboard.component';
import {TutorialsPageDashboardComponent } from './components/tutorials-page/tutorials-page-dashboard/tutorials-page-dashboard.component';
import {HelpDeskDashboardComponent } from './components/help-desk/help-desk-dashboard/help-desk-dashboard.component';
import {EmailTemplateComponent} from './components/email-template/email-template.component';
import {NotificationTypeTemplateComponent} from './components/notification-type/notification-type-template.component';
import {RepositoryDashboardComponent} from './components/repository/repository-dashboard/repository-dashboard.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';
import {DocumentApprovalComponent} from './components/document-approval/document-approval.component';
import {AcquisitionsOverviewComponent} from './components/acquisitions-overview/acquisitions-overview.component';
import {NotificationsComponent} from './components/notification/notifications.component';
import {EditUserProfileComponent} from './components/user-profile/edit-profile/edit-user-profile/edit-user-profile.component';
import {ActionItemDashboardComponent} from './components/action-item-dashboard/action-item-dashboard.component';
import {AppConstants} from './AppConstants';


const routes: Routes = [
  { path: 'test', component: TestComponent, canActivate: [BackButtonEventtGuard, AppRouteGuard] },
  { path: 'home', component: HomeComponent, canActivate: [BackButtonEventtGuard, AppRouteGuard] },
  {
    path: 'projects',
    component: MainPageComponent,
    canActivate: [BackButtonEventtGuard],
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        component: ProjectListingComponent
      },
      {
        path: ':projectid',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        canDeactivate: [NavigationConfirmationGuard],
        component: ProjectDetailComponent
      }
    ]
  },
  {
    path: 'activities',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: ActivityDashboardComponent
      },
      {
        path: ':activityId',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        canDeactivate: [NavigationConfirmationGuard],
        component: CreateActivityComponent
      }
    ]
  },
  {
    path: 'action-item',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        canDeactivate: [NavigationConfirmationGuard],
        component: ActionItemDashboardComponent,
        // data: {deactivateConfirmationMessage: AppConstants.ActionItemConfirmationMessage}
        data: {deactivateConfirmationMessage: AppConstants.RouteDeactivateConfirmationMessage}
      },
      {
        path: ':actionItemId',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        canDeactivate: [NavigationConfirmationGuard],
        component: ActionItemDashboardComponent,
        // data: {deactivateConfirmationMessage: AppConstants.ActionItemConfirmationMessage}
        data: {deactivateConfirmationMessage: AppConstants.RouteDeactivateConfirmationMessage}
      }
    ]
  },
  {
    path: 'marketresearch',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: MarketResearchComponent
      }
    ]
  },
  {
    path: 'requirementsdevelopment',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: RequirementsDevelopmentComponent
      }
    ]
  },
  {
    path: 'procurementrequestpackage',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: ProcurementRequestPackageComponent
      }
    ]
  },
  {
    path: 'developacquisitionsplan',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: DevelopAcquisitionsPlanComponent
      }
    ]
  },
  {
    path: 'acquisitions-overview',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: AcquisitionsOverviewComponent
      }
    ]
  },
  {
    path: 'documents',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: DocumentServerComponent
      }
    ]
  },
  {
    path: 'templatesspage',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: TemplatePageDashboardComponent
      }
    ]
  },
  {
    path: 'tutorialspage',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: TutorialsPageDashboardComponent
      }
    ]
  },
  {
    path: 'support',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: HelpDeskDashboardComponent
      }
    ]
  },
  {
    path: 'email-template/:id',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: EmailTemplateComponent,
  },
  {
    path: 'notification-type-template/:id',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: NotificationTypeTemplateComponent,
  },
  {
    path: 'repository', component: MainPageComponent, canActivate: [BackButtonEventtGuard, AppRouteGuard],
    children: [
      {
        path: '',
        component: RepositoryDashboardComponent
      }
    ]
  },
  {
    path: 'user-settings', component: MainPageComponent, children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        component: UserProfileComponent
      }
    ]
  },
  {
    path: 'app-edit-user-profile', component: MainPageComponent, children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard, AppRouteGuard],
        component: EditUserProfileComponent
      }
    ]
  },
  {
    path: 'notifications',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: NotificationsComponent
      }
    ]
  },
  {
    path: 'document-approval',
    canActivate: [BackButtonEventtGuard, AppRouteGuard],
    component: MainPageComponent,
    children: [
      {
        path: '',
        canActivate: [BackButtonEventtGuard],
        component: DocumentApprovalComponent
      }
    ]
  },
  { path: '**',   redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [],
  bootstrap: []
})
export class AppRoutingModule { }
