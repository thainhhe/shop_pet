"use client";

const Checkbox = ({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
    />
  );
};

export { Checkbox };
