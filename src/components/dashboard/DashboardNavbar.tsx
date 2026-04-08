import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface AccesoRapido {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  accent: string;
}

interface DashboardNavbarProps {
  accesos: AccesoRapido[];
}

export function DashboardNavbar({ accesos }: DashboardNavbarProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <>
      <style>{`
        .dash-navbar {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: var(--bg-card);
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 50px;
          animation: fadeIn 0.8s ease forwards 0.2s;
          opacity: 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          flex-wrap: wrap;
        }
        
        .dash-nav-item {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-radius: 16px;
          text-decoration: none;
          color: var(--text-primary);
          background: transparent;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }
        
        .dash-nav-item-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .dash-nav-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .dash-nav-text {
          font-weight: 700;
          font-size: 16px;
        }
        
        .dash-nav-arrow {
          transition: all 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 16, paddingLeft: 12 }}>
          Navegación Rápida
        </p>
        <div className="dash-navbar">
          {accesos.map((nav) => {
            const Icon = nav.icon;
            const isHovered = hoveredNav === nav.id;
            
            return (
              <Link 
                key={nav.id} 
                href={nav.href}
                className="dash-nav-item"
                onMouseEnter={() => setHoveredNav(nav.id)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  backgroundColor: isHovered ? `${nav.accent}15` : 'transparent',
                  borderColor: isHovered ? `${nav.accent}30` : 'transparent',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  boxShadow: isHovered ? `0 8px 24px ${nav.accent}20` : 'none',
                }}
              >
                <div className="dash-nav-item-content">
                  <div className="dash-nav-icon" style={{ 
                    background: isHovered ? nav.accent : 'var(--bg-secondary)',
                    color: isHovered ? 'white' : nav.accent,
                    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                    boxShadow: isHovered ? `0 4px 12px ${nav.accent}40` : 'none'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span className="dash-nav-text" style={{ 
                    color: isHovered ? nav.accent : 'var(--text-primary)' 
                  }}>
                    {nav.label}
                  </span>
                </div>
                <ChevronRight size={20} className="dash-nav-arrow" style={{ 
                  opacity: isHovered ? 1 : 0, 
                  transform: isHovered ? 'translateX(0)' : 'translateX(-10px)',
                  color: nav.accent 
                }} />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
