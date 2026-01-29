import React, { useMemo, useState } from 'react';
import { usePMO } from '../context/PMOContext';
import { getMonthList } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from './ui/Button';
import { Download, Users, LayoutDashboard, X, Save, Edit2, Loader } from 'lucide-react';

export const MMAnalysis: React.FC = () => {
  const { assignments, members, projects, updateAssignment } = usePMO();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  const [editCell, setEditCell] = useState<{ memberId: string; month: string } | null>(null);
  const [tempWeights, setTempWeights] = useState<{ assignmentId: string; weight: number; warning: string | null }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    assignments.forEach(a => {
        years.add(new Date(a.start_date).getFullYear());
        years.add(new Date(a.end_date).getFullYear());
    });
    if (years.size === 0) {
        return [new Date().getFullYear()];
    }
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearList = [];
    for (let y = minYear; y <= maxYear; y++) {
        yearList.push(y);
    }
    return yearList.sort((a,b) => b - a);
  }, [assignments]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears.includes(2026) ? 2026 : availableYears[0] || new Date().getFullYear());

  const analysisData = useMemo(() => {
    const months = getMonthList(`${selectedYear}-01-01`, `${selectedYear}-12-31`);

    const chartData = months.map(m => {
        let billable = 0;
        let active = 0;
        
        const targetAssignments = selectedMemberId 
            ? assignments.filter(a => a.member_id === selectedMemberId)
            : assignments;

        targetAssignments.forEach(a => {
            const weight = a.monthly_weights[m] || 0;
            if (weight > 0) {
                const project = projects.find(p => p.id === a.project_id);
                const isBillable = project && (project.type === 'External' || project.type === 'Internal');
                if (isBillable) {
                    billable += weight;
                } else {
                    active += weight;
                }
            }
        });

        return { 
            name: m, 
            "가득 (Billable)": Number(billable.toFixed(2)),
            "가동 (Active)": Number(active.toFixed(2)),
            Total: Number((billable + active).toFixed(2))
        };
    });

    const matrix = members.map(mem => {
        const row: any = { id: mem.id, member: mem.name, position: mem.position };
        let totalMM = 0;
        
        months.forEach(m => {
            let monthSum = 0;
            const memAssignments = assignments.filter(a => a.member_id === mem.id);
            memAssignments.forEach(a => {
                monthSum += (a.monthly_weights[m] || 0);
            });
            row[m] = Number(monthSum.toFixed(2));
            totalMM += monthSum;
        });

        row.total = Number(totalMM.toFixed(2));
        
        const hasBillable = assignments.some(a => 
            a.member_id === mem.id && 
            projects.some(p => p.id === a.project_id && (p.type === 'External' || p.type === 'Internal'))
        );

        if (row.total === 0) {
            row.statusLabel = '비가득'; row.statusType = 'unassigned';
        } else if (hasBillable) {
            row.statusLabel = '가득'; row.statusType = 'billable';
        } else {
            row.statusLabel = '가동'; row.statusType = 'active';
        }

        return row;
    });

    return { months, chartData, matrix };
  }, [assignments, members, projects, selectedMemberId, selectedYear]);

  const handleExport = () => {
    const headers = ['Member', 'Position', 'Status', ...analysisData.months, 'Total MM'];
    const rows = analysisData.matrix.map((row: any) => {
        const rowData = [row.member, row.position, row.statusLabel];
        analysisData.months.forEach(m => rowData.push(row[m] || 0));
        rowData.push(row.total);
        return rowData;
    });
    const csvContent = "\uFEFF" + [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/tsv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MM_Analysis_${selectedYear}.tsv`;
    link.click();
  };

  const handleCellClick = (e: React.MouseEvent, memberId: string, month: string) => {
    e.stopPropagation();
    const relevantAssignments = assignments.filter(a => 
        a.member_id === memberId && (a.monthly_weights[month] !== undefined || (month >= a.start_date.slice(0,7) && month <= a.end_date.slice(0,7)))
    );
    
    if (relevantAssignments.length === 0) return;

    setEditCell({ memberId, month });
    setTempWeights(relevantAssignments.map(a => ({
        assignmentId: a.id,
        weight: a.monthly_weights[month] ?? 0,
        warning: null
    })));
  };

  const handleSaveWeights = async () => {
    if (!editCell) return;
    setIsSubmitting(true);

    const updatePromises = tempWeights.map(item => {
        const assignment = assignments.find(a => a.id === item.assignmentId);
        if (!assignment) return Promise.resolve();

        const weightToSave = Math.min(1.0, Math.max(0.0, item.weight));
        const updatedWeights = { ...assignment.monthly_weights, [editCell.month]: weightToSave };
        const weightsArray = Object.values(updatedWeights) as number[];
        const avgRatio = weightsArray.length > 0
            ? weightsArray.reduce((acc: number, cur: number) => acc + cur, 0) / weightsArray.length
            : 1.0;

        const payload = {
            monthly_weights: updatedWeights,
            input_ratio: avgRatio
        };

        return updateAssignment(item.assignmentId, payload);
    });

    try {
        await Promise.all(updatePromises);
    } catch(error) {
        console.error("Failed to update weights", error);
    } finally {
        setIsSubmitting(false);
        setEditCell(null);
    }
  };

  const selectedMemberName = selectedMemberId 
    ? (members.find(m => m.id === selectedMemberId)?.name || 'Unknown')
    : '전체 리소스 현황 (Total Resources)';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Man-Month 조회 및 분석</h2>
              <p className="text-slate-500">월별 상세 가중치 기반 인력 투입 현황</p>
            </div>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
        </div>
        <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download size={16} /> Excel Export
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
               {selectedMemberId ? <Users className="text-indigo-500" size={18} /> : <LayoutDashboard className="text-indigo-500" size={18} />}
               {selectedMemberName}
            </h3>
            {selectedMemberId && (
                <Button size="sm" variant="ghost" onClick={() => setSelectedMemberId(null)} className="text-indigo-600 font-bold">전체 보기</Button>
            )}
        </div>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11}} axisLine={false} />
                <YAxis tick={{fontSize: 11}} axisLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                <Bar dataKey="가득 (Billable)" fill="#10b981" stackId="a" barSize={30} />
                <Bar dataKey="가동 (Active)" fill="#60a5fa" stackId="a" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">인원별 월별 MM 매트릭스 (셀 클릭 시 가중치 수정)</span>
            <div className="flex gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 가득</span>
                <span className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 가동</span>
                <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-300"></span> 비가득</span>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-white z-10 border-r">성명 / 직급</th>
                <th className="px-4 py-3 text-center">상태</th>
                {analysisData.months.map(m => <th key={m} className="px-2 py-3 text-center">{m.split('-')[1]}월</th>)}
                <th className="px-4 py-3 text-right bg-slate-50 sticky right-0 z-10 border-l">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysisData.matrix.map((row: any) => (
                <tr key={row.id} 
                    className={`transition-colors group ${selectedMemberId === row.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedMemberId(row.id)}>
                  <td className="px-4 py-3 font-bold sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r transition-colors">
                      {row.member} <span className="text-[10px] font-normal text-slate-400 ml-1">{row.position}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.statusType === 'billable' ? 'bg-emerald-100 text-emerald-700' : 
                      row.statusType === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {row.statusLabel}
                    </span>
                  </td>
                  {analysisData.months.map(m => (
                    <td 
                      key={m} 
                      className={`px-2 py-3 text-center font-mono text-xs cursor-pointer hover:bg-indigo-100 hover:scale-110 transition-all ${row[m] > 1.0 ? 'text-red-600 font-bold underline decoration-dotted' : row[m] > 0 ? 'text-slate-700' : 'text-slate-200'}`}
                      onClick={(e) => handleCellClick(e, row.id, m)}
                    >
                      {row[m] > 0 ? row[m].toFixed(1) : '0.0'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-bold text-indigo-600 bg-slate-50 sticky right-0 z-10 border-l">{row.total.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editCell && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditCell(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Edit2 size={16} className="text-indigo-600" /> 가중치 수정
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {members.find(m => m.id === editCell.memberId)?.name} / {editCell.month} 투입 비중
                        </p>
                      </div>
                      <button onClick={() => setEditCell(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="space-y-3">
                          {tempWeights.map((item, idx) => {
                              const assignment = assignments.find(a => a.id === item.assignmentId);
                              const project = projects.find(p => p.id === assignment?.project_id);
                              return (
                                  <div key={item.assignmentId} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                      <div className="flex-1 min-w-0 pr-4">
                                          <div className="text-xs font-bold text-slate-800 truncate">{project?.name}</div>
                                          <div className="text-[10px] text-slate-400">{assignment?.role}</div>
                                      </div>
                                      <div className="w-24 flex items-center gap-2 relative group">
                                          <input 
                                              type="number" step="0.1" min="0" 
                                              className={`w-full text-center text-sm font-mono p-1.5 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black ${item.warning ? 'border-red-500' : 'border-slate-300'}`}
                                              value={item.weight}
                                              onChange={(e) => {
                                                  const val = parseFloat(e.target.value);
                                                  const newWeights = tempWeights.map((w, i) => {
                                                      if (i === idx) {
                                                          const newWeight = isNaN(val) ? 0 : val;
                                                          let warningMessage = null;
                                                          if (newWeight > 1) {
                                                              warningMessage = "가중치는 1을 초과할 수 없습니다.";
                                                          } else if (newWeight < 0) {
                                                              warningMessage = "가중치는 0 미만일 수 없습니다.";
                                                          }
                                                          return { ...w, weight: newWeight, warning: warningMessage };
                                                      }
                                                      return w;
                                                  });
                                                  setTempWeights(newWeights);
                                              }}
                                          />
                                          <span className="text-[10px] font-bold text-slate-400">MM</span>
                                          {item.warning && (
                                              <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-[9px] rounded-md shadow-lg z-50 whitespace-nowrap arrow-bottom">
                                                  {item.warning}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                      <div className="pt-4 flex gap-2">
                          <Button variant="secondary" className="flex-1" onClick={() => setEditCell(null)}>취소</Button>
                          <Button variant="primary" className="flex-1 gap-2" onClick={handleSaveWeights} disabled={isSubmitting}>
                              {isSubmitting && <Loader size={16} className="animate-spin mr-2" />}
                              변경사항 저장
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};