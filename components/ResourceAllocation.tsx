import React, { useState, useEffect, useMemo } from 'react';
import { usePMO } from '../context/PMOContext';
import { Assignment, Role } from '../types';
import { getMonthList } from '../utils/dateUtils';
import { Button } from './ui/Button';
import { UserPlus, Trash2, Briefcase, Edit2, X, Loader } from 'lucide-react';

export const ResourceAllocation: React.FC = () => {
  const { projects, assignments, members, addAssignment, deleteAssignment, updateAssignment } = usePMO();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to select the first project by default
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const [formData, setFormData] = useState<Partial<Assignment>>({
    member_id: '',
    role: Role.DEV,
    start_date: '',
    end_date: '',
    input_ratio: 1.0,
    monthly_weights: {}
  });

  const activeMonths = useMemo(() => {
    if (formData.start_date && formData.end_date) {
      return getMonthList(formData.start_date, formData.end_date);
    }
    return [];
  }, [formData.start_date, formData.end_date]);

  useEffect(() => {
    const newWeights: { [month: string]: number } = { ...(formData.monthly_weights || {}) };
    activeMonths.forEach(m => {
      if (newWeights[m] === undefined) newWeights[m] = 1.0;
    });
    Object.keys(newWeights).forEach(m => {
        if (!activeMonths.includes(m)) delete newWeights[m];
    });
    setFormData(prev => ({ ...prev, monthly_weights: newWeights }));
  }, [activeMonths]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectAssignments = assignments.filter(a => a.project_id === selectedProjectId);

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      member_id: assignment.member_id,
      role: assignment.role,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      input_ratio: assignment.input_ratio,
      monthly_weights: assignment.monthly_weights
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setFormData({ member_id: '', role: Role.DEV, start_date: '', end_date: '', input_ratio: 1.0, monthly_weights: {} });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id || !selectedProjectId) return;

    const member = members.find(m => m.id === formData.member_id);
    if (!member) return;
    
    setIsSubmitting(true);

    const weights = Object.values(formData.monthly_weights || {}) as number[];
    const avgRatio = weights.length > 0 ? weights.reduce((a: number, b: number) => a + b, 0) / weights.length : 1.0;

    const payload = {
        project_id: selectedProjectId,
        member_id: member.id,
        member_name: member.name,
        role: formData.role as Role,
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        input_ratio: avgRatio,
        monthly_weights: formData.monthly_weights || {}
    };

    try {
        if (editingAssignment) {
            await updateAssignment(editingAssignment.id, payload);
        } else {
            await addAssignment(payload as Omit<Assignment, 'id'>);
        }
        handleCancelEdit();
    } catch (error) {
        console.error("Failed to save assignment", error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this assignment?')) {
          try {
              await deleteAssignment(id);
          } catch(error) {
              console.error("Failed to delete assignment", error);
          }
      }
  }

  const selectClassName = "w-full rounded border border-slate-300 px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black";

  if (!selectedProject) {
      return <div>Please select a project.</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-2">대상 프로젝트 선택</label>
            <select className={selectClassName} value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); handleCancelEdit(); }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {selectedProject && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                  <Briefcase size={20} />
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{selectedProject.name}</h3>
              </div>
              <div className="text-sm text-slate-600 space-y-2 pt-2">
                <div className="flex justify-between"><span>고객사</span><span className="font-medium">{selectedProject.client}</span></div>
                <div className="flex justify-between"><span>유형</span><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{selectedProject.type}</span></div>
                <div className="flex justify-between"><span>프로젝트 기간</span><span className="font-medium text-[11px]">{selectedProject.start_date} ~ {selectedProject.end_date}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-6 rounded-xl border-2 transition-all ${editingAssignment ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                {editingAssignment ? <Edit2 size={18} /> : <UserPlus size={18} />} 
                {editingAssignment ? '투입 정보 수정' : '리소스 신규 할당'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">투입 인원</label>
                  <select required className={selectClassName} value={formData.member_id} onChange={e => setFormData({...formData, member_id: e.target.value})}>
                    <option value="">선택...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">역할</label>
                  <select className={selectClassName} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                    {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">투입 기간</label>
                    <div className="flex items-center gap-1">
                        <input type="date" required className="w-full text-[11px] border-slate-300 p-1 rounded" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                        <span>~</span>
                        <input type="date" required className="w-full text-[11px] border-slate-300 p-1 rounded" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                    </div>
                </div>
              </div>

              {activeMonths.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-3">월별 가중치 입력 (0.0 ~ 1.0)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {activeMonths.map(month => (
                            <div key={month} className="space-y-1">
                                <div className="text-[10px] text-slate-500 font-mono text-center">{month}</div>
                                <input 
                                    type="number" step="0.1" min="0" max="1" 
                                    className="w-full text-center text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={formData.monthly_weights?.[month] ?? 1.0}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData({
                                            ...formData,
                                            monthly_weights: { ...formData.monthly_weights, [month]: isNaN(val) ? 0 : val }
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {editingAssignment && <Button type="button" variant="secondary" onClick={handleCancelEdit}>취소</Button>}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader size={16} className="animate-spin mr-2" />}
                    {editingAssignment ? '수정 완료' : '할당 추가'}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                <tr>
                  <th className="px-5 py-3">성명</th>
                  <th className="px-5 py-3">역할</th>
                  <th className="px-5 py-3">투입기간</th>
                  <th className="px-5 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectAssignments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-bold text-slate-900">{a.member_name}</td>
                    <td className="px-5 py-3 text-xs">{a.role}</td>
                    <td className="px-5 py-3 text-[11px] text-slate-500">{a.start_date} ~ {a.end_date}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                        <button onClick={() => handleEditClick(a)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(a.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {projectAssignments.length === 0 && (
                   <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">할당된 인원이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};