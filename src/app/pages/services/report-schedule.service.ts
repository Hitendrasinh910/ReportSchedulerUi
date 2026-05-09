import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReportSchedule } from '../models/report-schedule.model';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportScheduleService {
  private apiUrl = `${environment.apiUrl}/ReportSchedule`;
  // private apiUrl = 'https://localhost:7005/api/ReportSchedule';

  private listChanged = new Subject<void>();
  listChanged$ = this.listChanged.asObservable();

  constructor(private http: HttpClient) {}

  saveReportSchedule(data: ReportSchedule): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save`, data);
  }

  getAllReportSchedule(
    search: string = '',
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<ReportSchedule[]> {
    return this.http.get<ReportSchedule[]>(`${this.apiUrl}`, 
      {
      params: {
        search,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString()
      }}
    );
  }

  getReportScheduleById(id: number): Observable<ReportSchedule> {
    return this.http.get<ReportSchedule>(`${this.apiUrl}/${id}`);
  }

  deleteReportSchedule(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  activateReportSchedule(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/activate`, {});
  }

  pauseReportSchedule(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/pause`, {});
  }

  notifyListChanged() {
    this.listChanged.next();
  }
}
