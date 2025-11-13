import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Save, AlertCircle } from 'lucide-react';
import './index.css'; // استدعاء ملف CSS الجديد

const API_URL = 'http://20.2.211.179/students';

interface Student {
  _id: string;
  fullName: string;
  email?: string;
  age?: string;
  class?: string;
}


export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  age: '',
  class: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('فشل في جلب البيانات');
    const data: Student[] = await response.json(); // ✅ تعريف نوع البيانات هنا
    setStudents(data);
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError('حدث خطأ غير معروف');
  } finally {
    setLoading(false);
  }
};


  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('فشل في إضافة الطالب');
      await fetchStudents();
      closeModal();
    } catch (err: unknown) {
  if (err instanceof Error) setError(err.message);
  else setError('حدث خطأ غير معروف');
}
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingStudent) return;
  try {
    const response = await fetch(`${API_URL}/${editingStudent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!response.ok) throw new Error('فشل في تحديث البيانات');
    await fetchStudents();
    closeModal();
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError('حدث خطأ غير معروف');
  }
};


  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل في حذف الطالب');
      await fetchStudents();
    } catch (err: unknown) {
  if (err instanceof Error) setError(err.message);
  else setError('حدث خطأ غير معروف');
}
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ fullName: '', email: '', age: '', class: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email || '',
      age: student.age || '',
      class: student.class || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ fullName: '', email: '', age: '', class: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-card">
        <div className="header-content">
          <div>
            <h1>نظام إدارة الطلاب</h1>
            <p>عدد الطلاب: {students.length}</p>
          </div>
          <button onClick={openAddModal} className="btn-primary">
            <Plus size={20} />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-card">
          <AlertCircle size={20} />
          <div>
            <h3>حدث خطأ</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="students-grid">
        {students.map((student) => (
          <div key={student._id} className="student-card">
            <div className="student-header">
              <div className="student-class">{student.class || 'غير محدد'}</div>
              <div className="student-actions">
                <button onClick={() => openEditModal(student)} title="تعديل">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteStudent(Number(student._id))} title="حذف">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3>{student.fullName}</h3>
            <p><strong>البريد:</strong> {student.email || 'غير متوفر'}</p>
            <p><strong>العمر:</strong> {student.age || 'غير محدد'}</p>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="empty-card">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3>لا توجد بيانات</h3>
          <p>ابدأ بإضافة طالب جديد</p>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
              <button onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent} className="modal-form">
              <label>
                الاسم الكامل *
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="أدخل الاسم الكامل" />
              </label>

              <label>
                البريد الإلكتروني
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@email.com" />
              </label>

              <label>
                العمر
                <input type="text" name="age" value={formData.age} onChange={handleInputChange} placeholder="مثال: 20" />
              </label>

              <label>
                الصف
                <input type="text" name="class" value={formData.class} onChange={handleInputChange} placeholder="مثال: الصف الأول" />
              </label>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  <Save size={20} />
                  <span>{editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
