import React, { useState, useEffect, useMemo } from 'react';
import { usePMO } from '../context/PMOContext';
import { Assignment, Role } from '../types';
import { getMonthList } from '../utils/dateUtils';
import { Button } from './ui/Button';
import { UserPlus, Trash2, Briefcase, Edit2, X, AlertCircle } from 'lucide-react';

export const ResourceAllocation: React.FC = () => {
  const { projects, assignments, members, addAssignment, deleteAssignment, updateAssignment } = usePMO();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [formData, setFormData] = useState<Partial<Assignment>>({
    memberId: '',
    role: Role.DEV,
    startDate: '',
    endDate: '',
    inputRatio: 1.0,
    monthlyWeights: {}
  });

  // 기간이 변경될 때마다 월별 리스트를 추출하여 가중치 초기값 설정
  const activeMonths = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      return getMonthList(formData.startDate, formData.endDate);
    }
    return [];
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    // 기간 내의 월들에 대해 기본 가중치(1.0)를 설정
    // Handle potential undefined monthlyWeights during spread
    const newWeights: { [month: string]: number } = { ...(formData.monthlyWeights || {}) };
    activeMonths.forEach(m => {
      if (newWeights[m] === undefined) newWeights[m] = 1.0;
    });
    // 기간을 벗어난 월 데이터 삭제 (정리)
    Object.keys(newWeights).forEach(m => {
        if (!activeMonths.includes(m)) delete newWeights[m];
    });
    setFormData(prev => ({ ...prev, monthlyWeights: newWeights }));
  }, [activeMonths]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectAssignments = assignments.filter(a => a.projectId === selectedProjectId);

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      memberId: assignment.memberId,
      role: assignment.role,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      inputRatio: assignment.inputRatio,
      monthlyWeights: assignment.monthlyWeights
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setFormData({ memberId: '', role: Role.DEV, startDate: '', endDate: '', inputRatio: 1.0, monthlyWeights: {} });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId || !selectedProjectId) return;

    const member = members.find(m => m.id === formData.memberId);
    if (!member) return;

    // 전체 평균 MM 계산을 위해 inputRatio 업데이트 (월별 가중치의 평균)
    // Fix: Explicitly cast weights to number[] and reduce values with typed parameters to resolve arithmetic errors
    const weights = Object.values(formData.monthlyWeights || {}) as number[];
    const avgRatio = weights.length > 0 ? weights.reduce((a: number, b: number) => a + b, 0) / weights.length : 1.0;

    const payload = {
        projectId: selectedProjectId,
        memberId: member.id,
        memberName: member.name,
        role: formData.role as Role,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        inputRatio: avgRatio,
        monthlyWeights: formData.monthlyWeights || {}
    };

    if (editingAssignment) {
        updateAssignment(editingAssignment.id, payload);
        setEditingAssignment(null);
    } else {
        addAssignment(payload);
    }
    
    setFormData({ memberId: '', role: Role.DEV, startDate: '', endDate: '', inputRatio: 1.0, monthlyWeights: {} });
  };

  const selectClassName = "w-full rounded border border-slate-300 px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black";

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
                <div className="flex justify-between"><span>프로젝트 기간</span><span className="font-medium text-[11px]">{selectedProject.startDate} ~ {selectedProject.endDate}</span></div>
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
                  <select required className={selectClassName} value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
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
                        <input type="date" required className="w-full text-[11px] border-slate-300 p-1 rounded" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                        <span>~</span>
                        <input type="date" required className="w-full text-[11px] border-slate-300 p-1 rounded" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                </div>
              </div>

              {/* 월별 가중치 입력 필드 영역 */}
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
                                    value={formData.monthlyWeights?.[month] ?? 1.0}
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        setFormData({
                                            ...formData,
                                            monthlyWeights: { ...formData.monthlyWeights, [month]: val }
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
                <Button type="submit">{editingAssignment ? '수정 완료' : '할당 추가'}</Button>
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
                    <td className="px-5 py-3 font-bold text-slate-900">{a.memberName}</td>
                    <td className="px-5 py-3 text-xs">{a.role}</td>
                    <td className="px-5 py-3 text-[11px] text-slate-500">{a.startDate} ~ {a.endDate}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                        <button onClick={() => handleEditClick(a)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                        <button onClick={() => deleteAssignment(a.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
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