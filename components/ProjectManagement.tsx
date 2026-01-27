import React, { useState } from 'react';
import { usePMO } from '../context/PMOContext';
import { Project, ProjectType } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { Button } from './ui/Button';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';

export const ProjectManagement: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = usePMO();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '', code: '', client: '', type: 'External', orderAmount: 0, startDate: '2026-01-01', endDate: '2026-12-31', status: 'Planning'
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({ 
        name: '', code: '', client: '', type: 'External', orderAmount: 0, 
        startDate: '2026-01-01', endDate: '2026-12-31', status: 'Planning' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isOther = formData.type === 'Other';
    const finalData = {
      ...formData,
      orderAmount: isOther ? 0 : Number(formData.orderAmount || 0)
    };
    if (editingProject) {
      updateProject(editingProject.id, finalData);
    } else {
      addProject(finalData as Omit<Project, 'id'>);
    }
    setIsModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearchTerm = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStartDate = startDateFilter ? new Date(p.startDate) >= new Date(startDateFilter) : true;
    const matchesEndDate = endDateFilter ? new Date(p.endDate) <= new Date(endDateFilter) : true;

    return matchesSearchTerm && matchesStartDate && matchesEndDate;
  });

  const selectClassName = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black appearance-none";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">프로젝트 관리</h2>
          <p className="text-slate-500">프로젝트 기본 사항 및 속성 관리</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 신규 프로젝트
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="프로젝트명, 코드, 고객사 검색..." 
                    className="pl-9 w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <input 
              type="date" 
              className="rounded-md border border-slate-300 px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
            <span className="text-slate-500">~</span>
            <input 
              type="date" 
              className="rounded-md border border-slate-300 px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
            <Button onClick={() => { setStartDateFilter(''); setEndDateFilter(''); }} className="gap-2">
              <Search size={16} /> 조회
            </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">프로젝트명 / 코드</th>
                <th className="px-6 py-3">고객사 / 유형</th>
                <th className="px-6 py-3">기간</th>
                <th className="px-6 py-3">수주금액</th>
                <th className="px-6 py-3">상태</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-xs text-slate-500">{project.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{project.client}</div>
                    <div className="text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${
                          project.type === 'External' ? 'bg-blue-100 text-blue-700' :
                          project.type === 'Internal' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.type}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {project.startDate} ~ <br/> {project.endDate}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium">
                    {project.type === 'Other' ? '-' : formatCurrency(project.orderAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">
                        {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(project)} className="text-slate-400 hover:text-indigo-600">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteProject(project.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProject ? '프로젝트 수정' : '신규 프로젝트 등록'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">프로젝트명</label>
                  <input required type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">프로젝트 코드</label>
                  <input required type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">고객사</label>
                  <input required type="text" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">유형</label>
                  <select className={selectClassName}
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})}>
                    <option value="External">대외 (External)</option>
                    <option value="Internal">대내 (Internal)</option>
                    <option value="Other">기타 (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">상태</label>
                  <select className={selectClassName}
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                {formData.type !== 'Other' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">수주금액 (KRW)</label>
                    <input type="number" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.orderAmount} onChange={e => setFormData({...formData, orderAmount: Number(e.target.value)})} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">시작일</label>
                  <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">종료일</label>
                  <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>취소</Button>
                <Button variant="primary" type="submit">저장</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
