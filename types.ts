export enum Role {
  PM = 'PM',
  PL = 'PL',
  AA = 'AA',
  TA = 'TA',
  DA = 'DA',
  UA = 'UA',
  DEV = 'DEV',
  DES = 'DES'
}

export type ProjectType = 'External' | 'Internal' | 'Other'; 

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  type: ProjectType;
  order_amount: number; 
  start_date: string;
  end_date: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
}

export interface Member {
  id: string;
  name: string;
  position: string;
  skills: string[];
  employee_number?: string;
  join_date?: string;
  note?: string;
  password?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
}

export interface Assignment {
  id: string;
  project_id: string;
  member_id: string;
  member_name: string;
  role: Role;
  start_date: string;
  end_date: string;
  input_ratio: number;
  monthly_weights: { [month: string]: number };
}

export interface MonthlyMM {
  month: string;
  mm: number;
}