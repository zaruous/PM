
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Project, Assignment, Member } from '../types';
import * as api from '../services/api';

interface PMOContextType {
  projects: Project[];
  assignments: Assignment[];
  members: Member[];
  positionLevels: string[];
  loading: boolean;
  error: Error | null;
  fetchData: () => void;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

const PMOContext = createContext<PMOContextType | undefined>(undefined);

export const PMOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [positionLevels, setPositionLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, membersData, assignmentsData, positionLevelsData] = await Promise.all([
        api.getProjects(),
        api.getMembers(),
        api.getAssignments(),
        api.getPositionLevels(),
      ]);
      setProjects(projectsData);
      setMembers(membersData);
      setAssignments(assignmentsData);
      setPositionLevels(positionLevelsData);
    } catch (e: any) {
      setError(e);
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addProject = async (project: Omit<Project, 'id'>) => {
    await api.createProject(project);
    fetchData();
  };
  const updateProject = async (id: string, updated: Partial<Project>) => {
    await api.updateProject(id, updated);
    fetchData();
  };
  const deleteProject = async (id: string) => {
    await api.deleteProject(id);
    fetchData();
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    await api.createAssignment(assignment);
    fetchData();
  };
  const updateAssignment = async (id: string, updated: Partial<Assignment>) => {
    await api.updateAssignment(id, updated);
    fetchData();
  };
  const deleteAssignment = async (id: string) => {
    await api.deleteAssignment(id);
    fetchData();
  };

  const addMember = async (member: Omit<Member, 'id'>) => {
    await api.createMember(member);
    fetchData();
  };
    
  const updateMember = async (id: string, member: Partial<Member>) => {
    await api.updateMember(id, member);
    fetchData();
  };

  const deleteMember = async (id: string) => {
    await api.deleteMember(id);
    fetchData();
  };


  return (
    <PMOContext.Provider value={{ 
        projects, assignments, members, positionLevels, loading, error, fetchData,
        addProject, updateProject, deleteProject, 
        addAssignment, updateAssignment, deleteAssignment,
        addMember, updateMember, deleteMember
    }}>
      {children}
    </PMOContext.Provider>
  );
};

export const usePMO = () => {
  const context = useContext(PMOContext);
  if (!context) throw new Error("usePMO must be used within PMOProvider");
  return context;
};

