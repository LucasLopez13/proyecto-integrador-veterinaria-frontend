import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pageNumbers: number[] = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top border-light-subtle ${className}`}>
      {totalItems !== undefined && startItem !== null && endItem !== null ? (
        <span className="small text-muted" style={{ fontSize: "0.82rem" }}>
          Mostrando <strong className="text-dark">{startItem}-{endItem}</strong> de <strong className="text-dark">{totalItems}</strong> turnos
        </span>
      ) : (
        <span className="small text-muted" style={{ fontSize: "0.82rem" }}>
          Página <strong className="text-dark">{currentPage}</strong> de <strong className="text-dark">{totalPages}</strong>
        </span>
      )}

      <nav aria-label="Navegación de páginas">
        <ul className="pagination pagination-sm mb-0 gap-1">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link rounded-2 px-3 fw-medium"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                borderColor: "#EDE9FE",
                color: currentPage === 1 ? "#94A3B8" : "var(--vet-primary, #6D28D9)",
                backgroundColor: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
              }}
            >
              <i className="bi bi-chevron-left me-1"></i> Anterior
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button
                  type="button"
                  className="page-link rounded-2 px-2 fw-medium"
                  onClick={() => onPageChange(1)}
                  style={{ borderColor: "#EDE9FE", color: "var(--vet-primary, #6D28D9)" }}
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link rounded-2 border-0 bg-transparent text-muted">...</span>
                </li>
              )}
            </>
          )}

          {pageNumbers.map((num) => {
            const isActive = num === currentPage;
            return (
              <li key={num} className={`page-item ${isActive ? "active" : ""}`}>
                <button
                  type="button"
                  className="page-link rounded-2 px-2 fw-medium"
                  onClick={() => onPageChange(num)}
                  style={{
                    backgroundColor: isActive ? "var(--vet-primary, #6D28D9)" : "#FFFFFF",
                    borderColor: isActive ? "var(--vet-primary, #6D28D9)" : "#EDE9FE",
                    color: isActive ? "#FFFFFF" : "var(--vet-text-main, #1E1B4B)",
                  }}
                >
                  {num}
                </button>
              </li>
            );
          })}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link rounded-2 border-0 bg-transparent text-muted">...</span>
                </li>
              )}
              <li className="page-item">
                <button
                  type="button"
                  className="page-link rounded-2 px-2 fw-medium"
                  onClick={() => onPageChange(totalPages)}
                  style={{ borderColor: "#EDE9FE", color: "var(--vet-primary, #6D28D9)" }}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link rounded-2 px-3 fw-medium"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                borderColor: "#EDE9FE",
                color: currentPage === totalPages ? "#94A3B8" : "var(--vet-primary, #6D28D9)",
                backgroundColor: currentPage === totalPages ? "#F8FAFC" : "#FFFFFF",
              }}
            >
              Siguiente <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
