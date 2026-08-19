import React, { useState } from 'react';
import { Plane, GraduationCap, FileCheck, Home, Banknote, Users, X } from 'lucide-react';

export default function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const services = [
    {
      id: 1,
      title: 'Admission Counseling',
      description: 'Expert guidance to help students choose the right university and program tailored to their career goals and academic background.',
      icon: <GraduationCap size={24} />,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Visa Assistance',
      description: 'Comprehensive support through the entire student visa application process, ensuring all documentation is accurate and timely.',
      icon: <FileCheck size={24} />,
      color: 'green'
    },
    {
      id: 3,
      title: 'Test Preparation',
      description: 'Coaching for standardized tests like IELTS, TOEFL, GRE, and GMAT to help students achieve their required scores.',
      icon: <Users size={24} />,
      color: 'yellow'
    },
    {
      id: 4,
      title: 'Travel & Relocation',
      description: 'Assistance with booking flights, airport pickups, and ensuring a smooth transition to the destination country.',
      icon: <Plane size={24} />,
      color: 'orange'
    },
    {
      id: 5,
      title: 'Accommodation Support',
      description: 'Helping students find safe, comfortable, and affordable housing options on or near their university campus.',
      icon: <Home size={24} />,
      color: 'blue'
    },
    {
      id: 6,
      title: 'Scholarship Guidance',
      description: 'Identifying financial aid opportunities and assisting students in preparing strong scholarship applications.',
      icon: <Banknote size={24} />,
      color: 'green'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
      {services.map((service) => (
        <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className={`stat-icon ${service.color}`} style={{ width: '48px', height: '48px' }}>
              {service.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{service.title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
            {service.description}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button className="secondary-btn" style={{ width: '100%' }} onClick={() => setSelectedService(service)}>
              View Details
            </button>
          </div>
        </div>
      ))}

      {selectedService && (
        <div className="modal-overlay fadeIn">
          <div className="modal-content slideUp" style={{ maxWidth: '500px', padding: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className={`stat-icon ${selectedService.color}`} style={{ width: '56px', height: '56px', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedService.icon}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    {selectedService.title}
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-main)', fontWeight: 600 }}>Premium Service</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedService(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Service Overview</h4>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {selectedService.description}
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 600, fontSize: '0.95rem' }}>What's Included</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dedicated 1-on-1 expert consultation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Comprehensive documentation review</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>24/7 priority support channel</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progress tracking via dashboard</span>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="primary-btn" style={{ width: '100%' }} onClick={() => setSelectedService(null)}>
                Close Details
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
