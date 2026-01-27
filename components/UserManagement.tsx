
import React, { useState } from 'react';
import { usePMO } from '../context/PMOContext';
import { Member } from '../types';
import { Button } from './ui/Button';
import { Plus, Edit2, Trash2, X, Search, User, Key, IdCard, Calendar, FileText } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { members, addMember, updateMember, deleteMember } = usePMO();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    loginId: '',
    employeeNumber: '',
    position: 'Junior',
    skills: [],
    joinDate: '',
    note: ''
  });

  const [skillInput, setSkillInput] = useState('');

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({ ...member });
      setSkillInput('');
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        loginId: '',
        employeeNumber: '',
        position: 'Junior',
        skills: [],
        joinDate: new Date().toISOString().split('T')[0], // Default to today
        note: ''
      });
      setSkillInput('');
    }
    setIsModalOpen(true);
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = formData.skills || [];
      if (!currentSkills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...currentSkills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.name || !formData.position) return;

    if (editingMember) {
      updateMember(editingMember.id, formData);
    } else {
      addMember(formData as Omit<Member, 'id'>);
    }
    setIsModalOpen(false);
  };

  const filteredMembers = members.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.loginId && m.loginId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.employeeNumber && m.employeeNumber.includes(searchTerm))
  );

  const selectClassName = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black appearance-none";
  const inputClassName = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black";

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">사용자 관리</h2>
            <p className="text-slate-500">시스템 사용자 및 인력 풀 관리</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus size={16} /> 사용자 추가
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                  type="text"
                  placeholder="성명, ID, 사번 검색..."
                  className="pl-9 w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">성명 / 직급</th>
                <th className="px-6 py-3">ID / 사번</th>
                <th className="px-6 py-3">보유 기술 (Skills)</th>
                <th className="px-6 py-3">입사일 / 기타</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {member.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{member.name}</div>
                          <div className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{member.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-mono text-slate-600 flex items-center gap-1"><User size={10} /> {member.loginId || '-'}</span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1"><IdCard size={10} /> {member.employeeNumber || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-100">{s}</span>
                        ))}
                        {member.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[10px] border border-slate-100">+{member.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {member.joinDate || '-'}</div>
                        {member.note && <div className="flex items-center gap-1 text-slate-400 truncate max-w-[150px]" title={member.note}><FileText size={12}/> {member.note}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenModal(member)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
              ))}
              {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">등록된 사용자가 없습니다.</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <User size={20} className="text-indigo-600"/>
                    {editingMember ? '사용자 정보 수정' : '신규 사용자 등록'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Basic Info */}
                    <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 mb-1">기본 정보</div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">성명 <span className="text-red-500">*</span></label>
                      <input required type="text" className={inputClassName} placeholder="홍길동"
                             value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">직급 <span className="text-red-500">*</span></label>
                      <select className={selectClassName}
                              value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                        <option value="Intern">Intern</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">아이디 (ID)</label>
                      <div className="relative">
                        <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input type="text" className={`${inputClassName} pl-9`} placeholder="user.id"
                               value={formData.loginId} onChange={e => setFormData({...formData, loginId: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">사번 (Employee No)</label>
                      <div className="relative">
                        <IdCard size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input type="text" className={`${inputClassName} pl-9`} placeholder="2026001"
                               value={formData.employeeNumber} onChange={e => setFormData({...formData, employeeNumber: e.target.value})} />
                      </div>
                    </div>

                    <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 mb-1 mt-2">추가 정보</div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">입사일</label>
                      <input type="date" className={inputClassName}
                             value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">기술 스택</label>
                      <div className="flex gap-2">
                        <input type="text" className={inputClassName} placeholder="예: React"
                               value={skillInput}
                               onChange={e => setSkillInput(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        />
                        <button type="button" onClick={handleAddSkill} className="px-3 bg-slate-100 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-200">
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills?.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs border border-indigo-100">
                               {skill}
                              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={12} /></button>
                           </span>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">기타 사항 (Note)</label>
                      <textarea className={`${inputClassName} min-h-[80px] resize-none`} placeholder="특이사항, 메모 등..."
                                value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
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
