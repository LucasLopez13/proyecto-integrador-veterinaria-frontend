import React from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  iconBg = "#F5F3FF",
  iconColor = "#6D28D9",
}) => {
  return (
    <div
      className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between"
      style={{ borderColor: "#EDE9FE" }}
    >
      <div>
        <span
          className="small text-uppercase fw-semibold d-block"
          style={{ color: "#64748B", fontSize: "0.75rem", letterSpacing: "0.05em" }}
        >
          {label}
        </span>
        <h2 className="h3 fw-bold mb-0 mt-1" style={{ color: "#1E1B4B" }}>
          {value}
        </h2>
      </div>
      <div
        className="rounded-2 d-flex align-items-center justify-content-center"
        style={{ width: "48px", height: "48px", backgroundColor: iconBg, color: iconColor, fontSize: "1.4rem" }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};
