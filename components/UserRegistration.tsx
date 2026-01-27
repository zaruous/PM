import React, { useState } from 'react';
import { Button } from './ui/Button'; // Assuming a Button component exists
import { usePMO } from '../context/PMOContext'; // Import usePMO
import { Member } from '../types';

const UserRegistration: React.FC = () => {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [yearOfEmployment, setYearOfEmployment] = useState('');
  const [otherNotes, setOtherNotes] = useState('');

  const { addMember } = usePMO(); // Get addMember from the context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Omit<Member, 'id'> = {
      name,
      id,
      employeeNumber,
      yearOfEmployment: yearOfEmployment ? parseInt(yearOfEmployment) : undefined,
      otherNotes,
      position: 'Staff', // Default position, can be changed later or added as an input field
      skills: [], // Default empty skills, can be changed later or added as an input field
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

  return (
    <div className="user-registration-container">
      <h2>사용자 추가</h2>
      <form onSubmit={handleSubmit} className="user-registration-form">
        <div>
          <label htmlFor="name">사용자 이름:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="id">아이디:</label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="employeeNumber">사번:</label>
          <input
            type="text"
            id="employeeNumber"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="yearOfEmployment">입사연도:</label>
          <input
            type="number"
            id="yearOfEmployment"
            value={yearOfEmployment}
            onChange={(e) => setYearOfEmployment(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="otherNotes">기타 사항:</label>
          <textarea
            id="otherNotes"
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
          />
        </div>
        <Button type="submit">사용자 추가</Button>
      </form>
    </div>
  );
};

export default UserRegistration;