import { Routes } from '@angular/router';
import { ReportScheduleComponent } from './pages/report-schedule/report-schedule.component';
import { UserComponent } from './pages/user/user.component';

export const routes: Routes = [
    { path: '', redirectTo: 'report-schedule', pathMatch: 'full' },
    { path: 'report-schedule', component: ReportScheduleComponent},
    { path: 'user', component: UserComponent},
];
