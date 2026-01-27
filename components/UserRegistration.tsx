import React, { useState } from 'react';
import { Button } from './ui/Button';
import { usePMO } from '../context/PMOContext';
import { Member } from '../types';

const UserRegistration: React.FC = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [yearOfEmployment, setYearOfEmployment] = useState('');
  const [otherNotes, setOtherNotes] = useState('');

  const { addMember } = usePMO();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Omit<Member, 'id'> = {
      name,
      id,
      employeeNumber,
      yearOfEmployment: yearOfEmployment ? parseInt(yearOfEmployment) : undefined,
      otherNotes,
      position: 'Staff', 
      skills: [], 
    };
    addMember(newMember);
    console.log("New member added:", newMember);
    // Reset form
    setName('');
    setId('');
    setEmployeeNumber('');
    setYearOfEmployment('');
    setOtherNotes('');
  };

  const inputClassName = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">사용자 등록</h2>
        <p className="text-slate-500">신규 사용자의 정보를 시스템에 추가합니다.</p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="id" className={labelClassName}>아이디</label>
              <input type="text" id="id" value={id} onChange={e => setId(e.target.value)} required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="name" className={labelClassName}>사용자 이름</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputClassName} />
            </div>

            <div>
              <label htmlFor="employeeNumber" className={labelClassName}>사번</label>
              <input type="text" id="employeeNumber" value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} required className={inputClassName} />
            </div>
            <div>
              <label htmlFor="yearOfEmployment" className={labelClassName}>입사연도</label>
              <input type="date" id="yearOfEmployment" value={yearOfEmployment} onChange={e => setYearOfEmployment(e.target.value)} className={inputClassName} />
            </div>
            <div className="col-span-2">
              <label htmlFor="otherNotes" className={labelClassName}>기타 사항</label>
              <textarea id="otherNotes" value={otherNotes} onChange={e => setOtherNotes(e.target.value)} className={`${inputClassName} min-h-[100px]`} />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary">사용자 추가</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;