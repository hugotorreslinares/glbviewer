import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ padding: '15px', textAlign: 'center', background: '#f5f5f5', borderTop: '1px solid #ddd', color: 'GrayText' }}>
      made by <a href="https://github.com/hugotorreslinares/glbviewer" style={{ color: '#0366d6', textDecoration: 'none' }}>Hugo Torres</a>
    </footer>
  );
};

export default Footer;