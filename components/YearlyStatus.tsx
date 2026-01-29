import React, { useMemo, useState } from 'react';
import { usePMO } from '../context/PMOContext';
import { Member, Assignment } from '../types';
import { Button } from './ui/Button';
import { UserCheck, UserMinus, UserCog, X, Info, Briefcase, Calendar, User, AlertTriangle } from 'lucide-react';
import { YearSelector } from "./ui/YearSelector";

export const YearlyStatus: React.FC = () => {
  const { members, assignments, projects } = usePMO();
  const [currentYear, setCurrentYear] = useState(2026);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cellInfo, setCellInfo] = useState<{ memberName: string; month: string; projects: any[]; totalWeight: number } | null>(null);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return `${currentYear}-${String(month).padStart(2, '0')}`;
    });
  }, [currentYear]);

  const memberStatusData = useMemo(() => {
    return members.map(mem => {
        const monthlyStatus = months.map(month => {
            const activeAssignments = assignments.filter(a => 
                a.member_id === mem.id && 
                (a.monthly_weights[month] !== undefined && a.monthly_weights[month] > 0)
            );

            const totalWeight = activeAssignments.reduce((sum, a) => sum + (a.monthly_weights[month] || 0), 0);

            let statusType = 'Unassigned';
            let label = '비가득';

            if (activeAssignments.length > 0) {
                const hasBillable = activeAssignments.some(a => {
                    const project = projects.find(p => p.id === a.project_id);
                    return project && (project.type === 'Internal' || project.type === 'External');
                });

                if (totalWeight > 1.001) { // Floating point buffer
                    statusType = 'Overloaded';
                    label = '과부하';
                } else if (hasBillable) {
                    if (totalWeight < 0.999) { // Partial
                        statusType = 'PartialBillable';
                        label = '부분가득';
                    } else {
                        statusType = 'FullBillable';
                        label = '가득';
                    }
                } else {
                    statusType = 'Active';
                    label = '가동';
                }
            }

            return { 
                type: statusType, 
                label,
                month,
                totalWeight: Number(totalWeight.toFixed(2)),
                activeAssignments 
            };
        });

        return {
            ...mem,
            statusRow: monthlyStatus
        };
    });
  }, [members, assignments, projects, months]);

  const handleCellClick = (member: Member, monthData: any) => {
    if (!monthData.activeAssignments || monthData.activeAssignments.length === 0) return;

    const projectDetails = monthData.activeAssignments.map((a: Assignment) => {
        const project = projects.find(p => p.id === a.project_id);
        const pmAssignment = assignments.find(pa => pa.project_id === project?.id && pa.role === 'PM');
        const plAssignment = assignments.find(pa => pa.project_id === project?.id && pa.role === 'PL');
        
        return {
            name: project?.name || 'Unknown Project',
            code: project?.code || 'N/A',
            start_date: project?.start_date || '',
            end_date: project?.end_date || '',
            pm: pmAssignment ? pmAssignment.member_name : 'N/A',
            pl: plAssignment ? plAssignment.member_name : 'N/A',
            myRole: a.role,
            type: project?.type || 'Other',
            weight: a.monthly_weights[monthData.month] || 0
        };
    });

    setCellInfo({
        memberName: member.name,
        month: monthData.month,
        projects: projectDetails,
        totalWeight: monthData.totalWeight
    });
  };

  const getCellBgClass = (type: string) => {
    switch (type) {
        case 'Overloaded': return 'bg-red-500 shadow-sm shadow-red-200';
        case 'FullBillable': return 'bg-emerald-600 shadow-sm shadow-emerald-200';
        case 'PartialBillable': return 'bg-emerald-300 shadow-sm shadow-emerald-100';
        case 'Active': return 'bg-blue-400 shadow-sm shadow-blue-200';
        default: return 'bg-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">연도별 인력 가동 현황</h2>
          <p className="text-slate-500 text-sm">인원별 월간 가동 상태 (과부하/가득/부분가득/가동/비가득)</p>
        </div>

        <YearSelector year={currentYear} onYearChange={(newYear) => setCurrentYear(newYear)}>
        </YearSelector>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <div className="w-3 h-3 rounded bg-red-500"></div> 과부하 (MM &gt; 1.0)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <div className="w-3 h-3 rounded bg-emerald-600"></div> 가득 (MM = 1.0)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <div className="w-3 h-3 rounded bg-emerald-300"></div> 부분가득 (MM &lt; 1.0)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <div className="w-3 h-3 rounded bg-blue-400"></div> 가동 (Active/Other)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <div className="w-3 h-3 rounded bg-slate-200"></div> 비가득 (Unassigned)
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase sticky top-0 z-20">
              <tr>
                <th className="px-4 py-3 bg-slate-50 sticky left-0 z-10 border-r border-slate-100">성명 / 직급</th>
                {months.map(m => (
                  <th key={m} className="px-1 py-3 text-center min-w-[50px] border-r border-slate-100">
                      {m.split('-')[1]}월
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {memberStatusData.map((row) => (
                <tr key={row.id} className="group">
                  <td 
                    className="px-4 py-3 font-medium text-slate-900 bg-white sticky left-0 z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-indigo-50 transition-colors"
                    onClick={() => setSelectedMember(row)}
                  >
                    <div className="flex items-center justify-between">
                        <span>{row.name} <span className="text-[10px] text-slate-400 font-normal ml-1">{row.position}</span></span>
                        <Info size={12} className="text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  {row.statusRow.map((status, idx) => (
                    <td key={idx} className="px-1 py-2 text-center border-r border-slate-50" onClick={() => handleCellClick(row, status)}>
                        <div 
                            className={`w-full h-8 rounded flex items-center justify-center transition-all cursor-pointer transform hover:scale-105 ${getCellBgClass(status.type)}`}
                            title={`${status.label} (MM: ${status.totalWeight})`}
                        >
                            {status.type === 'Overloaded' && <AlertTriangle size={14} className="text-white" />}
                            {(status.type === 'FullBillable' || status.type === 'PartialBillable') && <UserCheck size={14} className="text-white" />}
                            {status.type === 'Active' && <UserCog size={14} className="text-white" />}
                            {status.type === 'Unassigned' && <UserMinus size={14} className="text-slate-300" />}
                        </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedMember(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="h-2 bg-indigo-600"></div>
                  <div className="p-6">
                      <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                              {selectedMember.name[0]}
                          </div>
                      </div>
                      <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-slate-900">{selectedMember.name}</h2>
                          <div className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-500 text-xs font-semibold mt-1">
                            {selectedMember.position}
                          </div>
                      </div>
                      <div className="space-y-4">
                          <div>
                              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 block">Skill Stack</label>
                              <div className="flex flex-wrap gap-1.5">
                                  {selectedMember.skills.map(skill => (
                                      <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-medium border border-indigo-100">
                                          {skill}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className="mt-8">
                          <Button className="w-full" variant="secondary" onClick={() => setSelectedMember(null)}>닫기</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {cellInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCellInfo(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <div>
                        <h3 className="font-bold text-slate-800">투입 프로젝트 상세</h3>
                        <p className="text-[11px] text-slate-500">{cellInfo.memberName} / {cellInfo.month}</p>
                      </div>
                      <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${cellInfo.totalWeight > 1.001 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              Total MM: {cellInfo.totalWeight.toFixed(2)}
                          </div>
                      </div>
                      <button onClick={() => setCellInfo(null)} className="ml-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                      {cellInfo.projects.map((proj, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-indigo-300 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-0.5">{proj.name}</h4>
                                      <span className="text-[10px] text-slate-400 font-mono">{proj.code}</span>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                        proj.type === 'Other' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                                    }`}>
                                        {proj.type}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-indigo-600">
                                        {proj.weight.toFixed(1)} MM
                                    </span>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-50 pt-3 mt-1">
                                  <div className="flex items-start gap-2">
                                      <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                      <div>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase">기간</div>
                                          <div className="text-[11px] text-slate-700 font-medium">{proj.start_date} ~ {proj.end_date}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                      <Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                      <div>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase">내 역할</div>
                                          <div className="text-[11px] text-indigo-700 font-bold">{proj.myRole}</div>
                                      </div>
                                  </div>
                                  <div className="flex items-start gap-2 col-span-2">
                                      <User size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                      <div>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase">Project Leaders (PM / PL)</div>
                                          <div className="text-[11px] text-slate-700 font-medium">{proj.pm} / {proj.pl}</div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {cellInfo.projects.length === 0 && (
                          <div className="text-center py-10 text-slate-400 text-sm">투입된 프로젝트 정보가 없습니다.</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};