import { ChangeDetectorRef, Component } from '@angular/core';
import { ReportScheduleService } from '../services/report-schedule.service';
import { ReportSchedule } from '../models/report-schedule.model';
import { Subscription } from 'rxjs';
import { AddReportScheduleComponent } from './add-report-schedule/add-report-schedule.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Pagination } from '../shared/pagination/pagination';

@Component({
  selector: 'app-report-schedule',
  imports: [FormsModule, Pagination],
  templateUrl: './report-schedule.component.html',
})
export class ReportScheduleComponent {
  reportScheduleData: ReportSchedule[] = [];

  search!: string;
  private subscription!: Subscription;

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private reportScheduleService: ReportScheduleService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.reportScheduleService.listChanged$.subscribe(() => {
      this.getAllReportSchedule();
    });
  }

  ngOnInit(): void {
    this.getAllReportSchedule();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addReportSchedule(id = 0) {
    const modalRef = this.modalService.open(AddReportScheduleComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.id = id;
  }

  searchData() {
    this.currentPage = 1;
    this.getAllReportSchedule();
  }

  activeCount(): number {
  return this.reportScheduleData.filter(x => x.isActive).length;
  }

  getAllReportSchedule() {
  this.reportScheduleService
    .getAllReportSchedule(
      this.search || '', this.currentPage, this.pageSize
    )
    .subscribe({
      next: (res) => {
        console.log('Schedule list response:', res);

        this.reportScheduleData = res || [];
        this.totalItems = res && res.length > 0 ? res[0].totalCount ?? 0 : 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading report schedules', err);
        this.toastr.error('Error loading report schedules');
      }
    });
}

  activateSchedule(id: number) {
    this.reportScheduleService.activateReportSchedule(id).subscribe({
      next: () => {
        this.toastr.success('Schedule activated');
        this.getAllReportSchedule();
      },
      error: (err) => {
        console.error('Error activating schedule', err);
        this.toastr.error('Error activating schedule');
      }
    });
  }

  pauseSchedule(id: number) {
    this.reportScheduleService.pauseReportSchedule(id).subscribe({
      next: () => {
        this.toastr.success('Schedule paused');
        this.getAllReportSchedule();
      },
      error: (err) => {
        console.error('Error pausing schedule', err);
        this.toastr.error('Error pausing schedule');
      }
    });
  }

  deleteSchedule(id: number) {
    if (!confirm('Delete this schedule?')) return;

    this.reportScheduleService.deleteReportSchedule(id).subscribe({
      next: () => {
        this.toastr.success('Schedule deleted');
        this.getAllReportSchedule();
      },
      error: (err) => {
        console.error('Error deleting schedule', err);
        this.toastr.error('Error deleting schedule');
      }
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllReportSchedule();
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.getAllReportSchedule();
  }
}
