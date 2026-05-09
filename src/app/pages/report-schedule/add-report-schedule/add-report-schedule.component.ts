import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportScheduleService } from '../../services/report-schedule.service';
import { ToastrService } from 'ngx-toastr';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputFieldComponent } from '../../shared/input-field/input-field.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { UserLookup } from '../../models/user-lookup.model';
import { PartyAccountLookup } from '../../models/party-account-lookup.model';
import { SchedulerLookupService } from '../../services/scheduler-lookup.service';

@Component({
  selector: 'app-add-report-schedule',
  imports: [ReactiveFormsModule, InputFieldComponent, JsonPipe, CommonModule, FormsModule],
  templateUrl: './add-report-schedule.component.html',
})
export class AddReportScheduleComponent {
  scheduleForm!: FormGroup;

  id = 0;
  title = 'Add Schedule';
  button = 'Save';
  currentStep = 1;

  usersList: UserLookup[] = [];
  filteredUsersList: UserLookup[] = [];

  partyAccountList: PartyAccountLookup[] = [];
  filteredPartyAccountList: PartyAccountLookup[] = [];

  userTypeList: string[] = ['All User Types'];
  adminTypeList: string[] = ['All Admin Types', 'Main Admin', 'HOD', 'User', 'Dispatch User'];

  partyTypeList: string[] = ['All Party Types'];
  branchTypeList: string[] = ['All Branches'];
  dealerTypeList: string[] = ['All Dealers'];

  userSearch = '';
  partySearch = '';

  constructor(
    private modalService: NgbActiveModal,
    private reportScheduleService: ReportScheduleService,
    private schedulerLookupService: SchedulerLookupService,
    private toastr: ToastrService,
  ) {
    this.scheduleForm = new FormGroup({
      idSchedule: new FormControl(0),

      scheduleName: new FormControl('', [Validators.required]),
      description: new FormControl(''),

      outputType: new FormControl('Message', [Validators.required]),
      storedProcedureName: new FormControl('', [Validators.required]),

      messageSubject: new FormControl(''),
      messageHeader: new FormControl(''),
      messageTemplate: new FormControl(''),

      pdfTitle: new FormControl(''),
      pdfFileName: new FormControl(''),

      dateRangeType: new FormControl('Today', [Validators.required]),
      customDays: new FormControl(1),

      receiverSource: new FormControl('User', [Validators.required]),

      userSelectionMode: new FormControl('AllUsers'),
      adminType: new FormControl('All Admin Types'),
      userType: new FormControl('All User Types'),

      partySelectionMode: new FormControl('AllParties'),
      partyType: new FormControl('All Party Types'),
      branchType: new FormControl('All Branches'),
      dealerType: new FormControl('All Dealers'),

      customContactNos: new FormControl(''),

      mobileColumnName: new FormControl('ContactNo'),
      spMobileMode: new FormControl('Distinct'),

      frequency: new FormControl('Daily', [Validators.required]),
      runTime: new FormControl('20:30'),
      weekDays: new FormControl('Mon,Tue,Wed,Thu,Fri'),
      monthDay: new FormControl(1),

      cronMode: new FormControl('Auto'),
      cronExpression: new FormControl('0 30 20 * * ?'),

      isActive: new FormControl(true),

      parameters: new FormArray([]),
      recipients: new FormArray([]),
    });

    this.addDefaultParameters();
  }

  ngOnInit() {
    this.loadInitialLookups();
    this.patchData();

    this.title = this.id > 0 ? 'Update Schedule' : 'Add Schedule';
    this.button = this.id > 0 ? 'Update' : 'Save';
  }

  get parameters(): FormArray {
    return this.scheduleForm.get('parameters') as FormArray;
  }

  get recipients(): FormArray {
    return this.scheduleForm.get('recipients') as FormArray;
  }

  close() {
    this.modalService.close();
  }

  nextStep() {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  loadInitialLookups() {
    this.loadUsers();
    this.loadPartyAccounts();
  }

  loadUsers() {
    this.schedulerLookupService.getUsers('', '', '').subscribe({
      next: (res: any) => {
        this.usersList = res || [];
        this.userTypeList = this.buildStringList(
          this.usersList.map((x) => x.userType),
          'All User Types',
        );
        this.applyUserFilter();
      },
      error: (err: any) => {
        console.error('Error loading users', err);
        this.toastr.error('Error loading users');
      },
    });
  }

  loadPartyAccounts() {
    this.schedulerLookupService.getPartyAccounts('', '', '', '').subscribe({
      next: (res: any) => {
        this.partyAccountList = res || [];

        this.partyTypeList = this.buildStringList(
          this.partyAccountList.map((x) => x.partyType),
          'All Party Types',
        );

        this.branchTypeList = this.buildStringList(
          this.partyAccountList.map((x) => x.city),
          'All Branches',
        );

        this.dealerTypeList = this.buildStringList(
          this.partyAccountList.map((x) => x.type),
          'All Dealers',
        );

        this.applyPartyFilter();
      },
      error: (err: any) => {
        console.error('Error loading party accounts', err);
        this.toastr.error('Error loading party accounts');
      },
    });
  }

  buildStringList(values: Array<string | undefined | null>, allText: string): string[] {
    const cleanValues = values.map((x) => (x || '').trim()).filter((x) => x !== '');

    return [allText, ...Array.from(new Set(cleanValues)).sort()];
  }

  applyUserFilter() {
    const search = (this.userSearch || '').toLowerCase().trim();
    const userType = this.scheduleForm.get('userType')?.value || 'All User Types';
    const adminType = this.scheduleForm.get('adminType')?.value || 'All Admin Types';

    this.filteredUsersList = this.usersList.filter((user) => {
      const textMatch =
        search === '' ||
        (user.personName || '').toLowerCase().includes(search) ||
        (user.username || '').toLowerCase().includes(search) ||
        (user.contactNo || '').toLowerCase().includes(search);

      const userTypeMatch = userType === 'All User Types' || (user.userType || '') === userType;

      const adminTypeMatch = this.matchAdminType(user, adminType);

      return textMatch && userTypeMatch && adminTypeMatch;
    });
  }

  matchAdminType(user: UserLookup, adminType: string): boolean {
    if (!adminType || adminType === 'All Admin Types') {
      return true;
    }

    if (adminType === 'Main Admin') {
      return !!user.isMainAdmin;
    }

    if (adminType === 'HOD') {
      return !!user.isHod;
    }

    if (adminType === 'User') {
      return !!user.isUser;
    }

    if (adminType === 'Dispatch User') {
      return !!user.isDispatchUser;
    }

    return true;
  }

  applyPartyFilter() {
    const search = (this.partySearch || '').toLowerCase().trim();

    const partyType = this.scheduleForm.get('partyType')?.value || 'All Party Types';
    const branchType = this.scheduleForm.get('branchType')?.value || 'All Branches';
    const dealerType = this.scheduleForm.get('dealerType')?.value || 'All Dealers';

    this.filteredPartyAccountList = this.partyAccountList.filter((party) => {
      const textMatch =
        search === '' ||
        (party.partyACName || '').toLowerCase().includes(search) ||
        (party.contactPerson || '').toLowerCase().includes(search) ||
        (party.contactNo || '').toLowerCase().includes(search) ||
        (party.city || '').toLowerCase().includes(search) ||
        (party.partyType || '').toLowerCase().includes(search);

      const partyTypeMatch =
        partyType === 'All Party Types' || (party.partyType || '') === partyType;

      const branchTypeMatch = branchType === 'All Branches' || (party.city || '') === branchType;

      const dealerTypeMatch = dealerType === 'All Dealers' || (party.type || '') === dealerType;

      return textMatch && partyTypeMatch && branchTypeMatch && dealerTypeMatch;
    });
  }

  searchUsers() {
    this.applyUserFilter();
  }

  searchParties() {
    this.applyPartyFilter();
  }

  onUserFilterChange() {
    this.applyUserFilter();
  }

  onPartyFilterChange() {
    this.applyPartyFilter();
  }

  addDefaultParameters() {
    this.parameters.push(this.createParameterGroup('@FromDate', 'DateRangeFrom', 'auto', 0));
    this.parameters.push(this.createParameterGroup('@ToDate', 'DateRangeTo', 'auto', 1));
  }

  createParameterGroup(
    parameterName = '',
    parameterType = 'Static',
    parameterValue = '',
    sortOrder = 0,
  ): FormGroup {
    return new FormGroup({
      idParameter: new FormControl(0),
      idSchedule: new FormControl(0),
      parameterName: new FormControl(parameterName, [Validators.required]),
      parameterType: new FormControl(parameterType, [Validators.required]),
      parameterValue: new FormControl(parameterValue),
      sortOrder: new FormControl(sortOrder),
    });
  }

  addParameter() {
    this.parameters.push(this.createParameterGroup('', 'Static', '', this.parameters.length));
  }

  removeParameter(index: number) {
    this.parameters.removeAt(index);
  }

  isUserSelected(idUser: number): boolean {
    return this.recipients.controls.some(
      (x) =>
        x.get('recipientType')?.value === 'User' && Number(x.get('idReference')?.value) === idUser,
    );
  }

  toggleUser(user: UserLookup) {
    const idUser = user.idUser || user.id;

    const index = this.recipients.controls.findIndex(
      (x) =>
        x.get('recipientType')?.value === 'User' && Number(x.get('idReference')?.value) === idUser,
    );

    if (index >= 0) {
      this.recipients.removeAt(index);
      return;
    }

    this.recipients.push(
      new FormGroup({
        idRecipient: new FormControl(0),
        idSchedule: new FormControl(this.id),
        recipientType: new FormControl('User'),
        idReference: new FormControl(idUser),
      }),
    );
  }

  isPartySelected(idPartyAccount: number): boolean {
    return this.recipients.controls.some(
      (x) =>
        x.get('recipientType')?.value === 'PartyAccount' &&
        Number(x.get('idReference')?.value) === idPartyAccount,
    );
  }

  toggleParty(party: PartyAccountLookup) {
    const idPartyAccount = party.idPartyAccount || party.id;

    const index = this.recipients.controls.findIndex(
      (x) =>
        x.get('recipientType')?.value === 'PartyAccount' &&
        Number(x.get('idReference')?.value) === idPartyAccount,
    );

    if (index >= 0) {
      this.recipients.removeAt(index);
      return;
    }

    this.recipients.push(
      new FormGroup({
        idRecipient: new FormControl(0),
        idSchedule: new FormControl(this.id),
        recipientType: new FormControl('PartyAccount'),
        idReference: new FormControl(idPartyAccount),
      }),
    );
  }

  getSelectedUserCount(): number {
    return this.recipients.controls.filter((x) => x.get('recipientType')?.value === 'User').length;
  }

  getSelectedPartyCount(): number {
    return this.recipients.controls.filter((x) => x.get('recipientType')?.value === 'PartyAccount')
      .length;
  }

  generateCron() {
    if (this.scheduleForm.get('cronMode')?.value === 'Manual') {
      return;
    }

    const frequency = this.scheduleForm.get('frequency')?.value;
    const runTime = this.scheduleForm.get('runTime')?.value || '00:00';
    const weekDays = this.scheduleForm.get('weekDays')?.value || 'Mon';
    const monthDay = this.scheduleForm.get('monthDay')?.value || 1;

    const timeParts = runTime.split(':');
    const hour = Number(timeParts[0] || 0);
    const minute = Number(timeParts[1] || 0);

    let cron = '';

    if (frequency === 'Daily') {
      cron = `0 ${minute} ${hour} * * ?`;
    } else if (frequency === 'Weekly') {
      cron = `0 ${minute} ${hour} ? * ${weekDays}`;
    } else if (frequency === 'Monthly') {
      cron = `0 ${minute} ${hour} ${monthDay} * ?`;
    } else {
      cron = this.scheduleForm.get('cronExpression')?.value || '';
    }

    this.scheduleForm.patchValue({
      cronExpression: cron,
    });
  }

  saveData() {
    if (!this.scheduleForm.valid) {
      this.toastr.error('Please fill all required fields.');
      return;
    }

    this.generateCron();

    const formValue = { ...this.scheduleForm.value };

    formValue.idSchedule = this.id;

    // Convert Angular time input HH:mm to C# TimeSpan HH:mm:ss
    if (formValue.runTime && formValue.runTime.length === 5) {
      formValue.runTime = formValue.runTime + ':00';
    }

    this.reportScheduleService.saveReportSchedule(formValue).subscribe({
      next: (data) => {
        this.toastr.success(data?.message || 'Schedule saved successfully');
        this.reportScheduleService.notifyListChanged();
        this.close();
      },
      error: (err) => {
        this.toastr.error('Error saving schedule');
        console.error('Error saving schedule', err);
      },
    });
  }

  selectAllFilteredUsers() {
    this.filteredUsersList.forEach((user) => {
      const idUser = user.idUser || user.id;

      const exists = this.recipients.controls.some(
        (x) =>
          x.get('recipientType')?.value === 'User' &&
          Number(x.get('idReference')?.value) === idUser,
      );

      if (!exists) {
        this.recipients.push(
          new FormGroup({
            idRecipient: new FormControl(0),
            idSchedule: new FormControl(this.id),
            recipientType: new FormControl('User'),
            idReference: new FormControl(idUser),
          }),
        );
      }
    });
  }

  unselectAllFilteredUsers() {
    for (let i = this.recipients.length - 1; i >= 0; i--) {
      const control = this.recipients.at(i);

      const isUser = control.get('recipientType')?.value === 'User';
      const idReference = Number(control.get('idReference')?.value);

      const isInFilteredList = this.filteredUsersList.some(
        (user) => Number(user.idUser || user.id) === idReference,
      );

      if (isUser && isInFilteredList) {
        this.recipients.removeAt(i);
      }
    }
  }

  selectAllFilteredParties() {
    this.filteredPartyAccountList.forEach((party) => {
      const idPartyAccount = party.idPartyAccount || party.id;

      const exists = this.recipients.controls.some(
        (x) =>
          x.get('recipientType')?.value === 'PartyAccount' &&
          Number(x.get('idReference')?.value) === idPartyAccount,
      );

      if (!exists) {
        this.recipients.push(
          new FormGroup({
            idRecipient: new FormControl(0),
            idSchedule: new FormControl(this.id),
            recipientType: new FormControl('PartyAccount'),
            idReference: new FormControl(idPartyAccount),
          }),
        );
      }
    });
  }

  unselectAllFilteredParties() {
    for (let i = this.recipients.length - 1; i >= 0; i--) {
      const control = this.recipients.at(i);

      const isParty = control.get('recipientType')?.value === 'PartyAccount';
      const idReference = Number(control.get('idReference')?.value);

      const isInFilteredList = this.filteredPartyAccountList.some(
        (party) => Number(party.idPartyAccount || party.id) === idReference,
      );

      if (isParty && isInFilteredList) {
        this.recipients.removeAt(i);
      }
    }
  }

  patchData() {
    if (this.id <= 0) {
      return;
    }

    this.reportScheduleService.getReportScheduleById(this.id).subscribe({
      next: (data) => {
        this.parameters.clear();
        this.recipients.clear();

        this.scheduleForm.patchValue({
          idSchedule: data.idSchedule,

          scheduleName: data.scheduleName,
          description: data.description,

          outputType: data.outputType,
          storedProcedureName: data.storedProcedureName,

          messageSubject: data.messageSubject,
          messageHeader: data.messageHeader,
          messageTemplate: data.messageTemplate,

          pdfTitle: data.pdfTitle,
          pdfFileName: data.pdfFileName,

          dateRangeType: data.dateRangeType,
          customDays: data.customDays,

          receiverSource: data.receiverSource,

          userSelectionMode: data.userSelectionMode,
          adminType: data.adminType || 'All Admin Types',
          userType: data.userType || 'All User Types',

          partySelectionMode: data.partySelectionMode,
          partyType: data.partyType || 'All Party Types',
          branchType: data.branchType || 'All Branches',
          dealerType: data.dealerType || 'All Dealers',

          customContactNos: data.customContactNos,

          mobileColumnName: data.mobileColumnName,
          spMobileMode: data.spMobileMode,

          frequency: data.frequency,
          runTime: data.runTime,
          weekDays: data.weekDays,
          monthDay: data.monthDay,

          cronMode: data.cronMode,
          cronExpression: data.cronExpression,

          isActive: data.isActive,
        });

        if (data.parameters && data.parameters.length > 0) {
          data.parameters.forEach((p, index) => {
            const group = this.createParameterGroup(
              p.parameterName,
              p.parameterType,
              p.parameterValue || '',
              p.sortOrder ?? index,
            );

            group.patchValue({
              idParameter: p.idParameter || 0,
              idSchedule: p.idSchedule || data.idSchedule || 0,
            });

            this.parameters.push(group);
          });
        } else {
          this.addDefaultParameters();
        }

        if (data.recipients && data.recipients.length > 0) {
          data.recipients.forEach((r) => {
            this.recipients.push(
              new FormGroup({
                idRecipient: new FormControl(r.idRecipient || 0),
                idSchedule: new FormControl(r.idSchedule || data.idSchedule || 0),
                recipientType: new FormControl(r.recipientType),
                idReference: new FormControl(r.idReference),
              }),
            );
          });
        }

        this.applyUserFilter();
        this.applyPartyFilter();
      },
      error: (err) => {
        console.error('Error loading schedule', err);
        this.toastr.error('Error loading schedule');
      },
    });
  }
}
