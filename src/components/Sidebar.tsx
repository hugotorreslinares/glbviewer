import React from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <div className={`${styles.sidebar} ${!isOpen ? styles['sidebar--closed'] : ''}`}>
      <div className={styles.sidebar__header}>
        <h2 className={styles.sidebar__title}>{title}</h2>
        <button
          className={styles.sidebar__close_button}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className={styles.sidebar__content}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;