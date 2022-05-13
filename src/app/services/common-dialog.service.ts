import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import { TeamsModalComponent } from '../components/team/teams-modal/teams-modal.component';
import { TrackingItemDetailComponent } from '../components/tracking-item/tracking-item-detail.component';
import {AttachDocumentsComponent} from '../components/attach-documents/attach-documents.component';
import {SubmitForApprovalModalComponent} from '../components/submit-for-approval-modal/submit-for-approval-modal.component';
import {ViewAttachmentsModalComponent} from '../components/pages/project-main-page/project-detail/viewattachments-modal/viewattachments-modal.component';
import {NotificationTypesModalComponent} from '../components/notification-type/notification-type-modal/notification-type-modal.component';
import {NotificationTypeRecurrenceModalComponent} from '../components/notification-type/notification-type-recurrence-modal/notification-type-recurrence-modal.component';
import {NotificationTypeAddReceipientModalComponent} from '../components/notification-type/notification-type-addReicpient-modal/notification-type-addReicpient-modal.component';
import {PRSubmittalModalComponent} from '../components/pr-submittal/pr-submittal-modal.component';
import {MultipleActivitiesModalComponent} from '../components/pages/project-main-page/project-detail/multiple-activities-modal/multiple-activities-modal.component';
import {ViewActivitiesModalComponent} from '../components/pages/project-main-page/project-detail/viewactivities-modal/viewactivities-modal.component';
import {RepositoryPopupComponent} from '../components/repository/repository-popup/repository-popup.component';
import { EditUserProfileComponent } from '../components/user-profile/edit-profile/edit-user-profile/edit-user-profile.component';
import {ActivityAddReceipientModalComponent} from '../components/activity/activity-addReicpient-modal/activity-addRecicpient-modal.component';
import {UserAssignConfirmationModalComponent} from '../components/user-assign-confirmation-modal/user-assign-confirmation-modal.component';
import {NotesComponent} from '../components/notes-component/notes.component';
import {CreateDocumentsComponent} from "../components/document-server/create-documents/create-documents.component";
import {UploadDocumentsComponent} from "../components/document-server/upload-documents/upload-documents.component";
import {ShareDocumentDialogComponent} from '../components/document-server/share-document-dialog/share-document-dialog.component';
import {DocumentSharingStatusComponent} from '../components/document-sharing-status/document-sharing-status.component';
import {AttachDocumentProjectActivitiesComponent} from '../components/document-server/attach-documents-project-activities/attach-documents-project-activities.component';

@Injectable()
export class CommonDialogService {
  constructor(
    private modalService: NgbModal,
    private ngbModelConfig: NgbModalConfig) {
  }

  openTeamsModal() {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(TeamsModalComponent, {windowClass : 'teamsModalClass'});
      // modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('teammates dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openEditProfileModelModel(item) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(EditUserProfileComponent, { windowClass: 'large-modal' });
      modalRef.componentInstance.docData = item;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openTrackingItemDialog(trackingItem) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(TrackingItemDetailComponent);
      modalRef.componentInstance.data = trackingItem;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openPRSubmittalDialog() {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(PRSubmittalModalComponent, {windowClass : 'notificationTypeAddRecipientModalClass'});
      // modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openAttachFileModel(data?) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(AttachDocumentsComponent, {windowClass : 'attachmentModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('File attach dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openViewAttachmentsModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(ViewAttachmentsModalComponent, {windowClass : 'viewAttachmentsModalClass viewAttachmentsSecondModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('ViewAttachmentsModalComponent dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openNotificationTypesModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(NotificationTypesModalComponent, {windowClass : 'notificationTypesModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('ViewAttachmentsModalComponent dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openNotificationTypesRecurrenceModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(NotificationTypeRecurrenceModalComponent, {windowClass : 'notificationTypeRecurrenceModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('ViewAttachmentsModalComponent dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }
  openNotificationTypesAddRecipientModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(NotificationTypeAddReceipientModalComponent, {windowClass : 'notificationTypeAddRecipientModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('ViewAttachmentsModalComponent dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openAddMultipleActivitiesModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(MultipleActivitiesModalComponent, {windowClass : 'addMultipleActivitiesModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('MultipleActivitiesModalComponent dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openViewActivitiesModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(ViewActivitiesModalComponent, {windowClass : 'viewActivitiesModalClass' });
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('View Activities dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openNotesModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(NotesComponent, { windowClass: 'large-notes-modal' });
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('View Activities dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openDocumentShareStatusModel(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(DocumentSharingStatusComponent);
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openDocumentUpdateModel(item) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(RepositoryPopupComponent, { windowClass: 'large-modal' });
      modalRef.componentInstance.docData = item;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openSubmitForApprovalModal() {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(SubmitForApprovalModalComponent, { windowClass: 'submitForApproval-modal' });
      // modalRef.componentInstance.docData = item;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openActivityAddReceipientModal(data) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(ActivityAddReceipientModalComponent, {windowClass : 'notificationTypeAddRecipientModalClass'});
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('openActivityAddReceipientModal dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openAssignToModal(data?) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(UserAssignConfirmationModalComponent);
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('File attach dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openCreateDocumentModal(data: any) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(CreateDocumentsComponent, {windowClass : 'createDocumentModalClass' });
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('View Activities dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openShareDocumentModal(document) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(ShareDocumentDialogComponent, {windowClass : 'notificationTypeAddRecipientModalClass' });
      // modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.componentInstance.data = {document};
      modalRef.dismissed.subscribe(reason => {
        console.log('View Activities dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openUploadDocumentModal(data?) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = 'static';
      this.ngbModelConfig.keyboard = false;
      const modalRef = this.modalService.open(UploadDocumentsComponent, {windowClass : 'uploadDocumentModalClass' });
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        console.log('File attach dialog is dismissed.');
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }

  openAttachDocumentInProject_ActivitiesModal(data: any) {
    return new Observable(observer => {
      const ngbConfigObjBackup = {
        backdrop: this.ngbModelConfig.backdrop,
        keyboard: this.ngbModelConfig.keyboard
      };
      this.ngbModelConfig.backdrop = false;
      this.ngbModelConfig.keyboard = true;
      const modalRef = this.modalService.open(AttachDocumentProjectActivitiesComponent, {windowClass : 'attachDocumentProjectActivitiesModalClass' });
      modalRef.componentInstance.data = data;
      modalRef.closed.subscribe(result => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next(result);
        observer.complete();
      });
      modalRef.dismissed.subscribe(reason => {
        this.ngbModelConfig.backdrop = ngbConfigObjBackup.backdrop;
        this.ngbModelConfig.keyboard = ngbConfigObjBackup.keyboard;
        observer.next();
        observer.complete();
      });
    });
  }
}