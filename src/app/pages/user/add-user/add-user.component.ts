import { Component } from '@angular/core';
import { User } from '../../models/user.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule, CommonModule, InputFieldComponent, FormsModule],
  templateUrl: './add-user.component.html',
})
export class AddUserComponent {
  id: number = 0;

  userForm!: FormGroup;
  title = 'Add User';
  button = 'Save';

  userTypeList = [
    { value: '', label: 'Select' },
    { value: 'Admin', label: 'Admin' },
    { value: 'User', label: 'User' },
    { value: 'Manager', label: 'Manager' }
  ];

  constructor(
    public modalService: NgbActiveModal,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.userForm = new FormGroup({
      personName: new FormControl('', [Validators.required]),
      userType: new FormControl('', [Validators.required]),
      contactNo: new FormControl('', [
        //Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.title = this.id > 0 ? 'Update User' : 'Add User';
    this.button = this.id > 0 ? 'Update' : 'Save';

    if (this.id > 0) {
      this.patchData();
    }
  }

  close() {
    this.modalService.close();
  }

  saveData() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields.');
      return;
    }

    this.id > 0 ? this.updateUser() : this.addUser();
  }

  addUser() {
    const payload = {
      idUser: 0,
      ...this.userForm.value
    };

    this.userService.saveUser(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess === false) {
          this.toastr.error(res.message || 'Failed to save user');
          return;
        }

        this.toastr.success(res?.message || 'User added successfully');
        this.userService.notifyListChanged();
        this.close();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.error?.error || 'Error adding user');
        console.error('Error Adding User', err);
      }
    });
  }

  updateUser() {
    const payload = {
      idUser: this.id,
      ...this.userForm.value
    };

    this.userService.saveUser(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess === false) {
          this.toastr.error(res.message || 'Failed to update user');
          return;
        }

        this.toastr.success(res?.message || 'User updated successfully');
        this.userService.notifyListChanged();
        this.close();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || err?.error?.error || 'Error updating user');
        console.error('Error Updating User', err);
      }
    });
  }

  patchData() {
    this.userService.getUserById(this.id).subscribe({
      next: (data) => {
        this.userForm.patchValue({
          personName: data.personName,
          userType: data.userType,
          contactNo: data.contactNo,
          username: data.username,
          password: data.password
        });
      },
      error: (err) => {
        console.error('Error loading user', err);
        this.toastr.error('Error loading user');
      }
    });
  }
}
