import { useState, useEffect } from "react";
import ReactSelect, { type SingleValue } from "react-select";

export interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  id?: string;
  value?: string | number;
  options?: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  isLoading?: boolean;
  error?: boolean;
  hint?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  options = [],
  placeholder = "Chọn...",
  onChange,
  className = "",
  defaultValue = "",
  disabled = false,
  isLoading = false,
  error = false,
  hint,
  isClearable = true,
  isSearchable = true,
}) => {
  const [selectedValue, setSelectedValue] = useState<SingleValue<Option>>(
    options.find((opt) => String(opt.value) === String(value ?? defaultValue)) ?? null
  );

  useEffect(() => {
    if (value !== undefined) {
      const foundOption = options.find((opt) => String(opt.value) === String(value));
      setSelectedValue(foundOption ?? null);
    }
  }, [value, options]);

  const handleChange = (option: SingleValue<Option>) => {
    setSelectedValue(option);
    onChange?.(String(option?.value ?? ""));
  };

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "44px",
      borderRadius: "0.5rem",
      fontSize: "14px",
      lineHeight: "20px",
      borderColor: error ? "#ef4444" : "#d1d5db",
      backgroundColor: "transparent",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
          : "0 0 0 3px rgba(59, 130, 246, 0.1)"
        : "none",
      borderWidth: "1px",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#9ca3af",
      },
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "all 150ms",
      "&&::-webkit-scrollbar": {
        width: "8px",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "white",
      borderRadius: "0.5rem",
      fontSize: "14px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      marginTop: "0.5rem",
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "200px",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#9ca3af",
        borderRadius: "4px",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#e5e7eb"
        : "transparent",
      color: state.isSelected ? "white" : "#1f2937",
      cursor: "pointer",
      fontSize: "14px",
      lineHeight: "20px",
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingTop: "10px",
      paddingBottom: "10px",
      "&:active": {
        backgroundColor: "#3b82f6",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#1f2937",
      fontSize: "14px",
      lineHeight: "20px",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "14px",
      lineHeight: "20px",
    }),
    input: (base: any) => ({
      ...base,
      color: "#1f2937",
      fontSize: "14px",
      lineHeight: "20px",
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      cursor: "pointer",
      "&:hover": {
        color: "#6b7280",
      },
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: "#9ca3af",
      "&:hover": {
        color: "#6b7280",
      },
    }),
  };

  return (
    <div className={className}>
      <ReactSelect
        inputId={id}
        value={selectedValue}
        options={options}
        onChange={handleChange}
        placeholder={isLoading ? "Đang tải..." : placeholder}
        isDisabled={disabled || isLoading}
        isLoading={isLoading}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={() => "Không có dữ liệu"}
        loadingMessage={() => "Đang tải dữ liệu..."}
      />
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-error-500" : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Select;
