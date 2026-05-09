export class User {
  idUser?: number;
  personName!: string;
  userType!: string;
  contactNo!: string;
  username!: string;
  password!: string;

  createdBy?: number | null;
  createdDate?: string;
  updatedBy?: number | null;
  updatedDate?: string | null;

  totalCount?: number;
}
