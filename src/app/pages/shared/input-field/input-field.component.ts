import { CommonModule } from '@angular/common';
import { Component, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './input-field.component.html',
})
export class InputFieldComponent {
  @Input() label = '';
  @Input() inputType = 'text';
  @Input() controlName = '';

  formControl!: FormControl;

  constructor(@Optional() private controlContainer: ControlContainer) {}

  ngOnInit() {
    const formGroup = this.controlContainer?.control as FormGroupDirective | any;
    if (formGroup && this.controlName) {
      this.formControl = formGroup.get(this.controlName) as FormControl;
    } else {
      throw new Error('formControlName must be provided and component must be inside a formGroup');
    }
  }
}
