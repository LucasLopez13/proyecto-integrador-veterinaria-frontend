import React, { useRef, useState } from "react";

interface FileUploadZoneProps {
  files: File[];
  onFilesChanged?: (files: File[]) => void;
  onFilesAdded?: (newFiles: File[]) => void;
  onRemoveFile?: (index: number) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  files,
  onFilesChanged,
  onFilesAdded,
  onRemoveFile,
  onError,
  maxFiles = 10,
  maxSizeBytes = 5 * 1024 * 1024,
  acceptedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (!acceptedTypes.includes(file.type)) {
        onError?.(`El archivo "${file.name}" no es válido. Formatos admitidos: PDF, JPG, PNG.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        onError?.(`El archivo "${file.name}" supera el límite permitido de ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB.`);
        return;
      }

      validFiles.push(file);
    }

    if (files.length + validFiles.length > maxFiles) {
      onError?.(`No se pueden adjuntar más de ${maxFiles} archivos.`);
      return;
    }

    if (onFilesAdded) {
      onFilesAdded(validFiles);
    } else if (onFilesChanged) {
      onFilesChanged([...files, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    if (onRemoveFile) {
      onRemoveFile(index);
    } else if (onFilesChanged) {
      onFilesChanged(files.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: "none" }}
      />

      <div
        className={`consultation-upload-zone ${isDragging ? "dragging" : ""}`}
        style={{
          cursor: "pointer",
          border: isDragging ? "2px dashed #6D28D9" : "2px dashed #CBD5E1",
          backgroundColor: isDragging ? "#F5F3FF" : "#FAF9FC",
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
          transition: "all 0.2s ease",
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="fs-2 mb-2" style={{ color: "#6D28D9" }}>
          <i className="bi bi-cloud-arrow-up"></i>
        </div>
        <strong className="d-block small text-dark">Arrastrá archivos aquí o hacé clic para explorar</strong>
        <span className="text-muted" style={{ fontSize: "0.78rem" }}>
          Formatos admitidos: PDF, JPG, PNG (hasta 5 MB por archivo)
        </span>
      </div>

      {files.length > 0 && (
        <div className="d-flex flex-column gap-2 mt-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="p-2 rounded-2 border d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
            >
              <div className="d-flex align-items-center gap-2">
                <i
                  className={`bi ${
                    file.type === "application/pdf"
                      ? "bi-file-earmark-pdf text-danger"
                      : "bi-file-earmark-image text-primary"
                  } fs-5`}
                ></i>
                <span className="small fw-medium text-dark">{file.name}</span>
                <span className="text-muted small">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-2 py-0 px-2"
                onClick={() => removeFile(idx)}
                title="Quitar archivo"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
