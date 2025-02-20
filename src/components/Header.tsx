import { useRef } from 'react';
import styles from './ModelViewer.module.css';

interface HeaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ onFileUpload }: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles["model-viewer__header"]}>
      <div className={styles["model-viewer__title-container"]}>
        <img
          src="/logo.svg"
          alt="GLB Viewer Logo"
          className={styles["model-viewer__logo"]}
        />
        <h1 className={styles["model-viewer__title"]}>GLB Viewer</h1>
      </div>
      <p className={styles["model-viewer__description"]}>
        Upload a GLB file to view your 3D model. You can rotate, zoom, and pan
        using touch gestures or mouse controls.
      </p>
      <p className={styles["model-viewer__privacy-notice"]}>
        <strong>🔒 Privacy Notice:</strong> Your 3D model files are processed
        entirely in your browser and are not stored or transmitted anywhere.
      </p>
      <label
        htmlFor="file-upload"
        className={styles["model-viewer__upload-label"]}
      >
        Choose GLB File
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".glb"
        onChange={onFileUpload}
        ref={inputRef}
        className={styles["model-viewer__upload-input"]}
      />
    </div>
  );
}