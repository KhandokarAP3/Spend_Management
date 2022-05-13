import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {CommonService} from '../../../services/common.service';
import {RESTAPIService} from '../../../services/REST-API.service';
import {NgForm} from '@angular/forms';

const getMonth = (idx) => {

  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(idx - 1);
  const month = objDate.toLocaleString('en-us', { month: 'long' });
  return month;
};

@Component({
  selector: 'app-notification-type-recurrence-modal',
  templateUrl: './notification-type-recurrence-modal.component.html'
})

export class NotificationTypeRecurrenceModalComponent implements OnInit {
  data: any;
  isFormSubmitted = false;
  showLoader = false;
  notificationTypeRecurrenceObj: any = {};
  notificationTypesRecurrenceFrequency = [
    'Daily',
    'Weekly',
    'Monthly',
    'Yearly'
  ];
  minMaxValueMap = {
    Daily: {
      min: 1, max: 31
    },
    Weekly: {
      min: 1, max: 52
    },
    Monthly: {
      min: 1, max: 12
    },
    Yearly: {
      min: 1, max: 5
    }
  };
  months = Array(12).fill(0).map((i, idx) => getMonth(idx + 1));
  selectedMonth: any = 1;
  selectedDay: any = 1;
  getCurrentYear: any;

  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService, public commonService: CommonService, private restAPIService: RESTAPIService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
    if (this.data.frequency === 'Yearly') {
      const selectedDate = new Date(this.data.startDate);
      this.selectedMonth = selectedDate.getMonth() + 1;
      this.selectedDay = selectedDate.getDate();
    }
    this.notificationTypeRecurrenceObj = this.data;
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submitLinkedData(data) {
    this.activeModal.close(data);
  }

  frequencyChangeEvent(event) {
    if (event === 'Weekly') {
      this.notificationTypeRecurrenceObj.Days = {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
      };
    }
    this.notificationTypeRecurrenceObj.noEnd = false;
    this.notificationTypeRecurrenceObj.noOftimes = '';
    this.notificationTypeRecurrenceObj.endDate = null;
    this.cdr.detectChanges();
  }

  public get days() {
    const currentDate = new Date();
    this.getCurrentYear = currentDate.getFullYear();

    const dayCount = this.getDaysInMonth(this.getCurrentYear, this.selectedMonth);
    return Array(dayCount).fill(0).map((i, idx) => idx + 1);
  }

  public getDaysInMonth(year: number, month: number) {
    return 32 - new Date(year, month - 1, 32).getDate();
  }

  noEndEvent(event) {
    this.cdr.detectChanges();
    if (this.notificationTypeRecurrenceObj.endDateERROR !== undefined) {
      this.notificationTypeRecurrenceObj.endDateERROR = undefined;
    }
    if (event.target.checked) {
      this.notificationTypeRecurrenceObj.endDate = null;
      this.notificationTypeRecurrenceObj.noOftimes = null;
    }
  }

  noOftimesChange(event) {
    this.cdr.detectChanges();
  }

  selectDaysChangeEvent(event) {
    this.cdr.detectChanges();
  }


  checkTypingDateForCalendar(fieldName, obj) {
    this.cdr.detectChanges();
    if (!obj) {
      obj = this.notificationTypeRecurrenceObj;
    }
    this.commonService.validateDateOnBlur(obj, fieldName);
    this.cdr.detectChanges();
  }


   configureNotificationTypeRecurrence(form: NgForm) {
    if (form.invalid) {
      this.isFormSubmitted = true;
      this.toastr.error(this.commonService.validationErrorMessage);
      return;
    }
    if (form.value.endDate && form.value.noOftimes) {
      return;
    }
    else {
      if (this.notificationTypeRecurrenceObj.frequency === 'Yearly') {
        this.notificationTypeRecurrenceObj.startDate = this.convertDateFn(this.selectedMonth, this.selectedDay, this.getCurrentYear);
      }
      this.submitLinkedData(this.notificationTypeRecurrenceObj);
    }
  }

  convertDateFn(month, days, year) {
    return `${('0' + month).slice(-2)}-${('0' + days).slice(-2)}-${year}`;
  }

  isEndDateAndNoOfDaysBothSet(obj) {
    return (obj.endDate !== null && obj.endDate !== undefined && obj.endDate !== '') && (obj.noOftimes !== null && obj.noOftimes !== undefined && obj.noOftimes !== '');
    // this.notificationTypeRecurrenceObj.endDate
    // this.notificationTypeRecurrenceObj.noOftimes
  }
}
