import { ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { User } from '../models/user.model';
import { AddUserComponent } from './add-user/add-user.component';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../shared/pagination/pagination';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user',
  imports: [FormsModule, Pagination, DatePipe],
  templateUrl: './user.component.html',
})
export class UserComponent {
userData: User[] = [];

  search: string = '';
  private subscription?: Subscription;

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.userService.listChanged$.subscribe(() => {
      this.getAllUsers();
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  addUser(id = 0) {
    const modalRef = this.modalService.open(AddUserComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.id = id;
  }

  searchData() {
    this.currentPage = 1;
    this.getAllUsers();
  }

  getAllUsers() {
    this.userService
      .getAllUsers(this.search || '', this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          console.log('User list response:', res);

          this.userData = Array.isArray(res) ? [...res] : [];

          this.totalItems =
            this.userData.length > 0
              ? this.userData[0].totalCount ?? this.userData.length
              : 0;

          this.totalPages = Math.ceil(this.totalItems / this.pageSize);

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading users', err);
          this.toastr.error('Error loading users');
        }
      });
  }

  deleteUser(id: number) {
    if (!confirm('Delete this user?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toastr.success('User deleted');
        this.getAllUsers();
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.toastr.error('Error deleting user');
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllUsers();
    }
  }

  changePageSize(size: number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.getAllUsers();
  }
}
