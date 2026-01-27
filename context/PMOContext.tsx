
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Assignment, Member, Role } from '../types';
import { generateId } from '../utils/dateUtils';

interface PMOContextType {
  projects: Project[];
  assignments: Assignment[];
  members: Member[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
}

const PMOContext = createContext<PMOContextType | undefined>(undefined);

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'NextGen Banking System', code: 'NGB-2026', client: 'K-Bank', type: 'External', orderAmount: 5000000000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p2', name: 'AI Customer Service Bot', code: 'AIC-2026', client: 'Retail Corp', type: 'Internal', orderAmount: 120000000, startDate: '2026-03-01', endDate: '2026-08-31', status: 'Planning' },
  { id: 'p3', name: 'Internal R&D Framework', code: 'RND-001', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  { id: 'p4', name: 'test', code: 'RND-001', client: 'In-House', type: 'Other', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' }
];

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Kim Min-su', position: 'Senior', skills: ['React', 'Node', 'AWS'] },
  { id: 'm2', name: 'Lee Ji-young', position: 'Lead', skills: ['Java', 'Spring', 'Architecture'] },
  { id: 'm3', name: 'Park Jun-ho', position: 'Senior', skills: ['Python', 'AI', 'TensorFlow'] },
  { id: 'm4', name: 'Choi Su-jin', position: 'Junior', skills: ['UI/UX', 'Figma', 'CSS'] },
  { id: 'm5', name: 'Jung Tae-woo', position: 'Senior', skills: ['DevOps', 'Docker', 'K8s'] },
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', projectId: 'p1', memberId: 'm1', memberName: 'Kim Min-su', role: Role.PM, startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a2', projectId: 'p1', memberId: 'm2', memberName: 'Lee Ji-young', role: Role.PL, startDate: '2026-01-01', endDate: '2026-12-31', inputRatio: 1.0, monthlyWeights: { "2026-01": 1, "2026-02": 1, "2026-03": 1, "2026-04": 1, "2026-05": 1, "2026-06": 1, "2026-07": 1, "2026-08": 1, "2026-09": 1, "2026-10": 1, "2026-11": 1, "2026-12": 1 } },
  { id: 'a3', projectId: 'p3', memberId: 'm5', memberName: 'Jung Tae-woo', role: Role.TA, startDate: '2026-02-01', endDate: '2026-11-30', inputRatio: 0.5, monthlyWeights: { "2026-02": 0.5, "2026-03": 0.5, "2026-04": 0.5, "2026-05": 0.5, "2026-06": 0.5, "2026-07": 0.5, "2026-08": 0.5, "2026-09": 0.5, "2026-10": 0.5, "2026-11": 0.5 } }
];

export const PMOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [members] = useState<Member[]>(INITIAL_MEMBERS);

  const addProject = (project: Omit<Project, 'id'>) => setProjects([...projects, { ...project, id: generateId() }]);
  const updateProject = (id: string, updated: Partial<Project>) => setProjects(projects.map(p => p.id === id ? { ...p, ...updated } : p));
  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setAssignments(assignments.filter(a => a.projectId !== id));
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => setAssignments([...assignments, { ...assignment, id: generateId() }]);
  const updateAssignment = (id: string, updated: Partial<Assignment>) => setAssignments(assignments.map(a => a.id === id ? { ...a, ...updated } : a));
  const deleteAssignment = (id: string) => setAssignments(assignments.filter(a => a.id !== id));

  return (
    <PMOContext.Provider value={{ projects, assignments, members, addProject, updateProject, deleteProject, addAssignment, updateAssignment, deleteAssignment }}>
      {children}
    </PMOContext.Provider>
  );
};

export const usePMO = () => {
  const context = useContext(PMOContext);
  if (!context) throw new Error("usePMO must be used within PMOProvider");
  return context;
};
