import { Component } from '@angular/core';
import { MainPageComponentParentComponent } from './page-component-parent.component';

@Component({
  selector: 'app-test-component',
  template: `
    <div class="container-fluid mt-20">
      <div class="row">
        <div class="col-md-8  boxCnt">
          <div class="row">
            <h4 class="Heding full-width">Steps Necessary To Complete Activity</h4>
          </div>
          <ng-container *ngFor="let step of steps; index as i">
            <div class="row mainbox" *ngIf="step.type === 'task'">
              <div class="col-sm-9 jumbotron cntentBoxs">
                <p class="pra">
                  {{step.content}}
                </p>
              </div>
              <div class="col-sm-3 radbox">
                <input type="radio" class="rdioBttn" (change)="stepCompleted(step, i);" [(ngModel)]="step.isCompleted" value="true" name="step_input_{{i}}"> <label class="labHed">Completed</label>
              </div>
            </div>
            <div class="row mainBos"  *ngIf="step.type === 'question'">
              <div class="col-sm-9 jumbotron cotentBoxs">
                <p class="pra">
                  {{step.content}}
                </p>
              </div>
              <div class="col-sm-3 radibox">
                <input type="radio" class="rdioBtnn" (change)="stepCompleted(step, i);" [(ngModel)]="step.answer" value="yes" name="step_input_{{i}}"> <label class="labHead"> Yes</label>
                <input type="radio" class="rdioBtnn" (change)="stepCompleted(step, i);" [(ngModel)]="step.answer" value="no" name="step_input_{{i}}"> <label class="labHead"> No</label>
              </div>
            </div>
            <ng-container *ngIf="step.type === 'final-step'">
              <h4 class="hedingsec">{{step.title}}</h4>
              <div class="row mainboxss">
                <div class="col-sm-9 container wrkBox">
                  <P class="pra"> {{step.content}}</P>
                </div>
                <div class="col-sm-3 raddbox ">
                  <input type="radio" class="rdioBttn" (change)="stepCompleted(step, i);" [(ngModel)]="step.isCompleted" value="true" name="step_input_{{i}}"> <label class="labHed">Completed</label>
                </div>
              </div>
            </ng-container>
          </ng-container>
        </div>
        <div class="col-md-4">
          <h4 class="Heding">Resources</h4>
          <div class="container ">
            <h4 class="sec-heding sec-top-heading">Helpful Links</h4>
            <div class="container-fluid sideBox">
              <a href="#" class="linkSide">https://www.sba.gov/about-sba/sba-performance/open</a>
              <a href="#" class="linkSide">https://www.sba.gov/about-sba/sba-performance/open</a>
              <a href="#" class="linkSide">https://www.sba.gov/about-sba/sba-performance/open</a>
              <a href="#" class="linkSide">https://www.sba.gov/about-sba/sba-performance/open</a>
            </div>
          </div>
          <div class="container ">
            <h4 class="sec-heding sec-heading-new">Video Tutorials</h4>
            <div class="container-fluid sideBox">
              <a href="#" class="linkSide">Composition of the Acquisition Team</a>
              <a href="#" class="linkSide">COR's Role in Exercising an option</a>
              <a href="#" class="linkSide">Incremental Funding</a>
              <a href="#" class="linkSide">Market Research</a>
            </div>
          </div>
          <div class="container ">
            <h4 class="sec-heding sec-heading-new">Document Templates</h4>
            <div class="container-fluid sideBox">
              <a href="#" class="linkSide">Acquisition Plan</a>
              <div class="sideContent">
                <a href="#" class="linkSide">7 Best Practices of Acquisition</a>
                <div class="sideContentRadio">
                  <input type="radio" class="rdioBtnn" name="pacticesAcquisition"> <label class="labHad">Yes</label>
                  <input type="radio" class="rdioBtnn" name="pacticesAcquisition"> <label class="labHad">No</label>
                </div>
              </div>
              <a href="#" class="linkSide">Overview of Contract Types</a>
              <a href="#" class="linkSide">Fixed Price Type Contracts</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TestComponent extends MainPageComponentParentComponent{
  steps = [];
  workflowObj: any = {
    content: 'Analyze existing understanding of technical and marketplace knowledge need/mission gap areas are sufficient.',
    type: 'task',
    isCompleted: false,
    children: {
      content: 'is need unual or noval such that added market/technology understanding may be useful?',
      type: 'question',
      answer: '',
      yesChildren: {
        content: 'Review relevant informaiton from federal websites and industry associations, forums, publications etc.',
        type: 'task',
        isCompleted: false,
        children: {
          content: 'are solutions potentially complex',
          answer: '',
          type: 'question',
          yesChildren: {
            content: 'Develop questions and issues to be explored bia RFI responses',
            type: 'task',
            isCompleted: false,
            children: {
              content: 'Issue RFI to obtain state of art and/or market practices',
              type: 'task',
              isCompleted: false,
              children: {
                content: 'determine whether to use a SOW, PWS or SOO + performance objectives/requirements, schedules, qualify standards, constraints etc.',
                type: 'task',
                isCompleted: false,
                children: {
                  content: 'requirement definition document',
                  type: 'final-step',
                  title: 'Work Products: Supporting Documentation',
                  isCompleted: false
                }
              }
            }
          },
          noChildren: {
            content: 'determine whether to use a SOW, PWS or SOO + performance objectives/requirements, schedules, qualify standards, constraints etc.',
            type: 'task',
            isCompleted: false,
            children: {
              content: 'requirement definition document',
              type: 'final-step',
              title: 'Work Products: Supporting Documentation',
              isCompleted: false
            }
          }
        }
      },
      noChildren: {
        content: 'determine whether to use a SOW, PWS or SOO + performance objectives/requirements, schedules, qualify standards, constraints etc.',
        type: 'task',
        isCompleted: false,
        children: {
          content: 'requirement definition document',
          type: 'final-step',
          title: 'Work Products: Supporting Documentation',
          isCompleted: false
        }
      }
    }
  };

  constructor() {
    super();
    this.steps.push(this.workflowObj);
  }
  stepCompleted(stepObj, index) {
    if (this.steps.length > index + 1) {
      const steps = this.steps.splice(index + 1, this.steps.length);
      for (const step of steps) {
        if (step.answer) {
          step.answer = '';
        } else if (step.isCompleted) {
          step.isCompleted = false;
        }
      }
    }
    if (stepObj.type === 'question' && stepObj.yesChildren && stepObj.noChildren) {
      if (stepObj.answer === 'yes') {
        this.steps.push(stepObj.yesChildren);
      } else if (stepObj.answer === 'no') {
        this.steps.push(stepObj.noChildren);
      }
    } else if (stepObj.type === 'task' && stepObj.children) {
      if (stepObj.isCompleted) {
        this.steps.push(stepObj.children);
      }
    } else {
      console.log('Steps Completed, Result is = ', this.workflowObj);
    }
  }


  // formatDate() {
  //   console.log(this.ngbFormatter.formatForProjectDates(this.scheduledDate));
  //   console.log(this.ngbFormatter.format(this.scheduledDate));
  // }
}
