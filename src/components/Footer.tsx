import React from 'react';
import { version } from '../../package.json';

const Footer: React.FC = () => {
  return (
    <footer style={{ padding: '15px', textAlign: 'center', background: '#f5f5f5', borderTop: '1px solid #ddd', color: 'GrayText' }}>
      made by <a href="https://github.com/hugotorreslinares/glbviewer" style={{ color: '#0366d6', textDecoration: 'none' }}>Hugo Torres</a> <span style={{ marginLeft: '5px', fontSize: '0.9em' }}>v{version}</span>
    </footer>
  );
};

export default Footer;