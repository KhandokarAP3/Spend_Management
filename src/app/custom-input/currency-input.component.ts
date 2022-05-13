import {Component, forwardRef, HostBinding, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-currency-input',
  template: `
    <input [placeholder]="placeholder" class="border-0 bg-transparent" attr.aria-label={{value}} *ngIf="isFocused" (keydown)="checkKey($event)" [appAutoFocus]="true" (blur)="isFocused = false;" type="number" [(ngModel)]="value"/>
    <input [placeholder]="placeholder" class="border-0 bg-transparent" attr.aria-label={{value}} *ngIf="!isFocused" (focus)="isFocused = true;" type="text" [value]="val | currency: 'USD': true"/>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true
    }
  ]
})
export class CurrencyInputComponent implements ControlValueAccessor {
  @HostBinding('style') style = {border: '1px solid',color: '#bdbdbd', borderRadius: '6px', height: 'auto', display: 'inline-block', backgroundColor: 'transparent', padding: 'unset'};

  constructor() { }
  @Input() placeholder = '';
  set value(val){  // this value is updated by programmatic changes if( val !== undefined && this.val !== val){
    this.val = val || 0;
    this.onChange(val);
    this.onTouch(val);
  }
  get value() {
    return this.val;
  }
  isFocused = false;
  val = 0; // this is the updated value that the class accesses
  onChange: any = () => {};
  onTouch: any = () => {};

  // this method sets the value programmatically
  writeValue(value: any){
    this.value = value || 0;
  }
  // upon UI element value changes, this method gets triggered
  registerOnChange(fn: any){
    this.onChange = fn;
  }
  // upon touching the element, this method gets triggered
  registerOnTouched(fn: any){
    this.onTouch = fn;
  }

  checkKey($event) {
    if ($event.key === ',' || $event.key === 'e') {
      $event.preventDefault();
    }
  }
}
