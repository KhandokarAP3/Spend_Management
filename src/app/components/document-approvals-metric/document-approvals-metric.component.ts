import { Component, HostBinding } from '@angular/core';
import { RESTAPIService } from '../../services/REST-API.service';
import { AppConstants } from "../../AppConstants";
import { forkJoin } from "rxjs";


@Component({
  selector: 'app-document-approval-metric',
  template: `
    <div class="title_wrap">
      <div class="title">
        <h2>Approvals</h2>
      </div>
      <div><a href="javascript: void(0);" class="mr-2" (click)="toggleTab('Received')" [ngStyle]="{'fontWeight': activeTab === 'Received' ? 'bold' : '' }">Received</a><a href="javascript: void(0);" (click)="toggleTab('Sent')" [ngStyle]="{'fontWeight': activeTab === 'Sent' ? 'bold' : '' }">Sent</a></div>
    </div>
    <div class="chart_wrap">
      <app-pie-chart class="pieChart" *ngIf="data.length > 0" [secondaryTooltipInfoMap]="secondaryTooltipInfoMap" [legendWidth]="250" [data]="data" [isDoughnut]="true" [colorScheme]="colorScheme"></app-pie-chart>
    </div>
    `,
})
export class DocumentApprovalsMetricComponent {
  @HostBinding() class = 'data_table fixedMetrics m-0';
  @HostBinding() style = { display: 'block' };
  activeTab = AppConstants.RECEIVED;
  secondaryTooltipInfoMap: any = {};
  data: any[] = [];
  received: any[] = [];
  sent: any[] = [];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private restAPIService: RESTAPIService) {
    forkJoin([this.restAPIService.getDocumentForApproval(), this.restAPIService.getDocumentForApprovalList()]).subscribe((responses: any) => {
      let documentsApproverArr: any[] = [];
      let documentsArr: any[] = [];
      if (responses[0].data.length) {
        documentsApproverArr = responses[0].data;
      }
      if (responses[1].data.length) {
        documentsArr = responses[1].data;
      }
      else {
        documentsArr = [];
      }

      let receivedSubmittedCount = 0;
      let receivedApprovedCount = 0;
      let receivedPendingCount = 0;
      let receivedRejectedCount = 0;

      let sentSubmittedCount = 0;
      let sentApprovedCount = 0;
      let sentPendingCount = 0;
      let sentRejectedCount = 0;


      //If I received a request to approve a document - RECEIVED
      for (const docInfo of documentsArr) {
        let docApproverEmail: string = String(docInfo.Approver).trim();
        let userContextEmail: string = String(AppConstants.spPageContextInfo.userEmail).trim();

        if (docApproverEmail === userContextEmail) {
          if (String(docInfo.Status).trim() === AppConstants.PENDING) {
            receivedPendingCount++;
          } else if (String(docInfo.Status).trim() === AppConstants.APPROVED) {
            receivedApprovedCount++;
          } else if (String(docInfo.Status).trim() === AppConstants.REJECT) {
            receivedRejectedCount++;
          } else if (String(docInfo.Status).trim() === AppConstants.SUBMITTED) {
            receivedSubmittedCount++;
          }
        }
      }

      //If I sent request(s) to approve a document - SENT
      for (const submitterInfo of documentsApproverArr) {
        let submitterEmailAddress: string = String(submitterInfo.SubmitterEmailAddress).toLowerCase().trim();
        let userContextEmail: string = String(AppConstants.spPageContextInfo.userEmail).toLowerCase().trim();

        if (submitterEmailAddress === userContextEmail) {//If I submit a request to approve a document
          if (String(submitterInfo.OverAllStatus).trim() === AppConstants.SUBMITTED) {
            sentSubmittedCount++;
          } else if (String(submitterInfo.OverAllStatus).trim() === AppConstants.APPROVED) {
            sentApprovedCount++;
          } else if (String(submitterInfo.OverAllStatus).trim() === AppConstants.REJECTED) {
            sentRejectedCount++;
          } else if (String(submitterInfo.OverAllStatus).trim() === AppConstants.PENDING) {
            sentPendingCount++;
          }
        }
      }

      if (this.activeTab === AppConstants.RECEIVED){
        this.secondaryTooltipInfoMap.Pending = parseFloat(((receivedPendingCount * 100) / (receivedApprovedCount + receivedPendingCount + receivedRejectedCount)) + '').toFixed(2);
        this.secondaryTooltipInfoMap.Approved = parseFloat(((receivedApprovedCount * 100) / (receivedApprovedCount + receivedPendingCount + receivedRejectedCount)) + '').toFixed(2);
        this.secondaryTooltipInfoMap.Rejected = parseFloat(((receivedRejectedCount * 100) / (receivedApprovedCount + receivedPendingCount + receivedRejectedCount)) + '').toFixed(2);        
        // this.secondaryTooltipInfoMap.Submitted = parseFloat(((receivedSubmittedCount * 100) / (receivedApprovedCount + receivedPendingCount + receivedSubmittedCount + receivedRejectedCount)) + '').toFixed(2);

      }else {
        this.secondaryTooltipInfoMap.Submitted = parseFloat(((sentSubmittedCount * 100) / (sentApprovedCount + sentSubmittedCount + sentRejectedCount)) + '').toFixed(2);
        this.secondaryTooltipInfoMap.Approved = parseFloat(((sentApprovedCount * 100) / (sentApprovedCount + sentSubmittedCount + sentRejectedCount)) + '').toFixed(2);
        this.secondaryTooltipInfoMap.Rejected = parseFloat(((sentRejectedCount * 100) / (sentApprovedCount + sentSubmittedCount + sentRejectedCount)) + '').toFixed(2);
        // this.secondaryTooltipInfoMap.Pending = parseFloat(((sentPendingCount * 100) / (sentApprovedCount + sentPendingCount + sentSubmittedCount + sentRejectedCount)) + '').toFixed(2);
      }


      /**** RECEIVED metrics */
      this.received.push({
        name: AppConstants.PENDING,
        value: receivedPendingCount
      });
      this.received.push({
        name: AppConstants.APPROVED,
        value: receivedApprovedCount
      });
      this.received.push({
        name: AppConstants.REJECT,
        value: receivedRejectedCount
      });
      // this.received.push({
      //   name: AppConstants.SUBMITTED,
      //   value: receivedSubmittedCount
      // });
      
      /**** SENT metrics */
      this.sent.push({
        name: AppConstants.APPROVED,
        value: sentApprovedCount
      });
      this.sent.push({
        name: AppConstants.SUBMITTED,
        value: sentSubmittedCount
      });
      this.sent.push({
        name: AppConstants.REJECT,
        value: sentRejectedCount
      });
      this.data = this.received;
    });
  }

  toggleTab(tabName) {
    this.activeTab = tabName;
    if (this.activeTab === AppConstants.SENT) {
      this.data = this.sent;
    } else {
      this.data = this.received;
    }
  }
}
