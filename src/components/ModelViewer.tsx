import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Material, Object3D, Mesh, MeshStandardMaterial } from "three";
import Footer from "./Footer";

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "white",
        overflow: "auto",
      }}
    >
      {" "}
      <div
        style={{
          padding: "15px",
          background: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        {" "}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {" "}
          <img
            src="/logo.svg"
            alt="GLB Viewer Logo"
            style={{ width: "28px", height: "28px" }}
          />{" "}
          <h1
            style={{
              margin: "0",
              color: "#333",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
            }}
          >
            GLB Viewer
          </h1>{" "}
        </div>{" "}
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#555",
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
          }}
        >
          {" "}
          Upload a GLB file to view your 3D model. You can rotate, zoom, and pan
          using touch gestures or mouse controls.{" "}
        </p>{" "}
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#666",
            backgroundColor: "#e8f5e9",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #c8e6c9",
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
          }}
        >
          {" "}
          <strong>🔒 Privacy Notice:</strong> Your 3D model files are processed
          entirely in your browser and are not stored or transmitted anywhere.{" "}
        </p>{" "}
        <label
          htmlFor="file-upload"
          style={{
            display: "block",
            padding: "12px",
            backgroundColor: "#2196f3",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
            touchAction: "manipulation",
          }}
        >
          {" "}
          Choose GLB File{" "}
        </label>{" "}
        <input
          id="file-upload"
          type="file"
          accept=".glb"
          onChange={handleFileUpload}
          ref={inputRef}
          style={{ display: "none" }}
        />{" "}
      </div>{" "}
      <div style={{ flex: 1, minHeight: "50vh", touchAction: "none" }}>
        {" "}
        <Canvas camera={{ position: [0, 0, 5] }}>
          {" "}
          <ambientLight intensity={0.5} />{" "}
          <directionalLight position={[10, 10, 5]} intensity={1} />{" "}
          <Suspense fallback={null}>
            {" "}
            {modelUrl && <Model url={modelUrl} onLoad={handleModelLoad} />}{" "}
          </Suspense>{" "}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            panSpeed={0.5}
          />{" "}
        </Canvas>{" "}
      </div>{" "}
      {metadata && (
        <div
          style={{
            padding: "15px",
            background: "#f5f5f5",
            borderTop: "1px solid #ddd",
          }}
        >
          {" "}
          <div
            onClick={() => setIsModelInfoExpanded(!isModelInfoExpanded)}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
              marginBottom: isModelInfoExpanded ? "12px" : "0",
              padding: "8px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              touchAction: "manipulation",
            }}
          >
            {" "}
            <h2
              style={{
                margin: "0",
                color: "#333",
                fontSize: "clamp(1rem, 3vw, 1.2rem)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {" "}
              <span
                style={{
                  display: "inline-block",
                  transform: `rotate(${
                    isModelInfoExpanded ? "90deg" : "0deg"
                  })`,
                  transition: "transform 0.3s ease",
                }}
              >
                ▶
              </span>{" "}
              Model Information{" "}
            </h2>{" "}
          </div>{" "}
          <div
            style={{
              maxHeight: isModelInfoExpanded ? "1000px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease-in-out",
            }}
          >
            {" "}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                color: "#555",
                fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              }}
            >
              {" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>File Name:</strong> {metadata.fileName}{" "}
              </div>{" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>File Size:</strong> {metadata.fileSize}{" "}
              </div>{" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>Last Modified:</strong> {metadata.lastModified}{" "}
              </div>{" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>Materials:</strong>{" "}
                {metadata.materialCount || "Loading..."}{" "}
              </div>{" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>Vertices:</strong>{" "}
                {metadata.vertexCount || "Loading..."}{" "}
              </div>{" "}
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              >
                {" "}
                <strong>Dimensions:</strong>{" "}
                {metadata.dimensions || "Loading..."}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {metadata.materialDetails && metadata.materialDetails.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              {" "}
              <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  marginBottom: isExpanded ? "12px" : "0",
                  padding: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  touchAction: "manipulation",
                }}
              >
                {" "}
                <h3
                  style={{
                    margin: "0",
                    color: "#333",
                    fontSize: "clamp(0.9rem, 2.8vw, 1.1rem)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {" "}
                  <span
                    style={{
                      display: "inline-block",
                      transform: `rotate(${isExpanded ? "90deg" : "0deg"})`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    ▶
                  </span>{" "}
                  Material Details{" "}
                </h3>{" "}
              </div>{" "}
              <div
                style={{
                  maxHeight: isExpanded ? "1000px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease-in-out",
                }}
              >
                {" "}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {" "}
                  {metadata.materialDetails.map((material, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        color: "#555",
                        fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                      }}
                    >
                      {" "}
                      <div>
                        <strong>Name:</strong> {material.name}
                      </div>{" "}
                      {material.color && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            flexWrap: "wrap",
                          }}
                        >
                          {" "}
                          <strong>Color:</strong>{" "}
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              backgroundColor: material.color,
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                            }}
                          />{" "}
                          {material.color}{" "}
                        </div>
                      )}{" "}
                      {material.roughness !== undefined && (
                        <div>
                          <strong>Roughness:</strong>{" "}
                          {material.roughness.toFixed(2)}
                        </div>
                      )}{" "}
                      {material.metalness !== undefined && (
                        <div>
                          <strong>Metalness:</strong>{" "}
                          {material.metalness.toFixed(2)}
                        </div>
                      )}{" "}
                      {material.map !== undefined && (
                        <div>
                          <strong>Texture Map:</strong>{" "}
                          {material.map ? "Yes" : "No"}
                        </div>
                      )}{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
      <Footer />{" "}
    </div>
  );
}
