import { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Material, Object3D, Mesh, MeshStandardMaterial } from "three";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Header from "./Header";
import styles from "./ModelViewer.module.css";

interface ModelMetadata {
  materials: number;
  vertices: number;
  boundingBox: Box3 | null;
  materialDetails: Array<{
    name: string;
    color?: string;
    roughness?: number;
    metalness?: number;
    map?: boolean;
  }>;
}

interface ModelInfo {
  fileName: string;
  fileSize: string;
  lastModified: string;
  materialCount?: number;
  materialDetails?: Array<{
    name: string;
    color?: string;
    roughness?: number;
    metalness?: number;
    map?: boolean;
  }>;
  vertexCount?: string;
  dimensions?: string;
}

function Model({
  url,
  onLoad,
}: {
  url: string;
  onLoad: (info: ModelMetadata) => void;
}) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    const materials = new Set<Material>();
    const materialDetails: ModelMetadata["materialDetails"] = [];

    scene.traverse((object: Object3D) => {
      const mesh = object as Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            materials.add(material);
            const standardMaterial = material as MeshStandardMaterial;
            materialDetails.push({
              name: standardMaterial.name || "Unnamed Material",
              color: standardMaterial.color
                ? `#${standardMaterial.color.getHexString()}`
                : undefined,
              roughness: standardMaterial.roughness,
              metalness: standardMaterial.metalness,
              map: !!standardMaterial.map,
            });
          });
        } else {
          materials.add(mesh.material);
          const standardMaterial = mesh.material as MeshStandardMaterial;
          materialDetails.push({
            name: standardMaterial.name || "Unnamed Material",
            color: standardMaterial.color
              ? `#${standardMaterial.color.getHexString()}`
              : undefined,
            roughness: standardMaterial.roughness,
            metalness: standardMaterial.metalness,
            map: !!standardMaterial.map,
          });
        }
      }
    });

    const metadata: ModelMetadata = {
      materials: materials.size,
      materialDetails,
      vertices: scene.children.reduce((acc: number, child: Object3D) => {
        const mesh = child as Mesh;
        return acc + (mesh.geometry?.attributes.position?.count || 0);
      }, 0),
      boundingBox: (() => {
        const box = new Box3();
        scene.traverse((object: Object3D) => {
          const mesh = object as Mesh;
          if (mesh.geometry) {
            mesh.geometry.computeBoundingBox();
            box.expandByObject(object);
          }
        });
        return box.isEmpty() ? null : box;
      })(),
    };

    onLoad(metadata);
  }, [scene, onLoad]);

  return <primitive object={scene} />;
}

export default function ModelViewer() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ModelInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModelInfoExpanded, setIsModelInfoExpanded] = useState(true);
  const [showBookmarkPopover, setShowBookmarkPopover] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopover = localStorage.getItem('hasSeenBookmarkPopover');
    if (!hasSeenPopover && modelUrl) {
      setTimeout(() => setShowBookmarkPopover(true), 2000);
    }
  }, [modelUrl]);

  const handleDismissPopover = () => {
    setShowBookmarkPopover(false);
    localStorage.setItem('hasSeenBookmarkPopover', 'true');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setMetadata({
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        lastModified: new Date(file.lastModified).toLocaleString(),
      });
    }
  };

  const handleModelLoad = (modelInfo: ModelMetadata) => {
    setMetadata((prev) =>
      prev
        ? {
            ...prev,
            materialCount: modelInfo.materials,
            materialDetails: modelInfo.materialDetails,
            vertexCount: modelInfo.vertices.toLocaleString(),
            dimensions: modelInfo.boundingBox
              ? `${modelInfo.boundingBox.max.x.toFixed(
                  2
                )} x ${modelInfo.boundingBox.max.y.toFixed(
                  2
                )} x ${modelInfo.boundingBox.max.z.toFixed(2)}`
              : "N/A",
          }
        : null
    );
  };

  useEffect(() => {
    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  return (
    <div className={styles["model-viewer"]}>
      {showBookmarkPopover && (
        <div className={styles["model-viewer__bookmark-popover"]}>
          <div className={styles["model-viewer__bookmark-popover-title"]}>
            📌 Like GLB Viewer? Add it to your bookmarks for quick access!
          </div>
          <div className={styles["model-viewer__bookmark-popover-text"]}>
            Press {navigator.platform.toLowerCase().includes('mac') ? '⌘+D' : 'Ctrl+D'} to bookmark this page
          </div>
          <button
            onClick={handleDismissPopover}
            className={styles["model-viewer__bookmark-popover-button"]}
          >
            Got it!
          </button>
        </div>
      )}
      <Header onFileUpload={handleFileUpload} />
      <div className={styles["model-viewer__canvas-container"]}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            {modelUrl && <Model url={modelUrl} onLoad={handleModelLoad} />}
          </Suspense>
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            panSpeed={0.5}
          />
        </Canvas>
      </div>
      {metadata && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          title="Model Details"
        >
          <div className={styles["model-viewer__info-section"]}>
            <div
              onClick={() => setIsModelInfoExpanded(!isModelInfoExpanded)}
              className={styles["model-viewer__collapsible-header"]}
            >
              <h2 className={`${styles["model-viewer__collapsible-title"]} ${styles["model-viewer__collapsible-title--primary"]}`}>
                <span
                  className={`${styles["model-viewer__collapsible-arrow"]} ${isModelInfoExpanded ? styles["model-viewer__collapsible-arrow--expanded"] : ""}`}
                >
                  ▶
                </span>
                Model Information
              </h2>
            </div>
            <br/>
            <div
              className={styles["model-viewer__collapsible-content"]}
              style={{ maxHeight: isModelInfoExpanded ? "1000px" : "0" }}
            >
              <div className={styles["model-viewer__info-grid"]}>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>File Name:</strong> {metadata.fileName}
                </div>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>File Size:</strong> {metadata.fileSize}
                </div>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>Last Modified:</strong> {metadata.lastModified}
                </div>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>Materials:</strong>
                  {metadata.materialCount || "Loading..."}
                </div>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>Vertices:</strong>
                  {metadata.vertexCount || "Loading..."}
                </div>
                <div className={styles["model-viewer__info-item"]}>
                  <strong>Dimensions:</strong>
                  {metadata.dimensions || "Loading..."}
                </div>
              </div>
            </div>
            {metadata.materialDetails && metadata.materialDetails.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <div
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={styles["model-viewer__collapsible-header"]}
                >
                  <h3 className={`${styles["model-viewer__collapsible-title"]} ${styles["model-viewer__collapsible-title--secondary"]}`}>
                    <span
                      className={`${styles["model-viewer__collapsible-arrow"]} ${isExpanded ? styles["model-viewer__collapsible-arrow--expanded"] : ""}`}
                    >
                      ▶
                    </span>
                    Material Details
                  </h3>
                </div>
                <div
                  className={styles["model-viewer__collapsible-content"]}
                  style={{ maxHeight: isExpanded ? "1000px" : "0" }}
                >
                  <div className={styles["model-viewer__material-grid"]}>
                    {metadata.materialDetails.map((material, index) => (
                      <div
                        key={index}
                        className={styles["model-viewer__material-item"]}
                      >
                        <div>
                          <strong>Name:</strong> {material.name}
                        </div>
                        {material.color && (
                          <div className={styles["model-viewer__material-color"]}>
                            <strong>Color:</strong>
                            <div
                              className={styles["model-viewer__material-color-preview"]}
                              style={{ backgroundColor: material.color }}
                            />
                            {material.color}
                          </div>
                        )}
                        {material.roughness !== undefined && (
                          <div>
                            <strong>Roughness:</strong>{" "}
                            {material.roughness.toFixed(2)}
                          </div>
                        )}
                        {material.metalness !== undefined && (
                          <div>
                            <strong>Metalness:</strong>{" "}
                            {material.metalness.toFixed(2)}
                          </div>
                        )}
                        {material.map !== undefined && (
                          <div>
                            <strong>Texture Map:</strong>{" "}
                            {material.map ? "Yes" : "No"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Sidebar>
      )}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={styles["model-viewer__info-button"]}
        style={{ display: metadata && !isSidebarOpen ? "block" : "none" }}
        aria-label="Show model information"
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
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      <Footer />
    </div>
  );
}
