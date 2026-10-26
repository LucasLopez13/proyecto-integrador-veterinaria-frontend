import React from "react";

interface FormFieldErrorProps {
  error?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="form-field-error">
      <i className="bi bi-exclamation-circle-fill"></i>
      <span>{error}</span>
    </div>
  );
};
