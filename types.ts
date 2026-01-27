
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
  orderAmount: number; 
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
}

export interface Member {
  id: string;
  name: string;
  position: string;
  skills: string[];
  employeeNumber?: string;
  yearOfEmployment?: string;
  otherNotes?: string;
}

export interface Assignment {
  id: string;
  projectId: string;
  memberId: string;
  memberName: string;
  role: Role;
  startDate: string;
  endDate: string;
  inputRatio: number; // 기본 가중치 (전체 평균용)
  monthlyWeights: { [month: string]: number }; // 상세 월별 가중치 (YYYY-MM 형식)
}

export interface MonthlyMM {
  month: string;
  mm: number;
}
