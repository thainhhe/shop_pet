"use client";

import { createContext, useContext } from "react";

const RadioGroupContext = createContext();

const RadioGroup = ({ value, onValueChange, children, className = "" }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={`grid gap-2 ${className}`}>{children}</div>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = ({ value, id, className = "" }) => {
  const context = useContext(RadioGroupContext);

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={context.value === value}
      onChange={() => context.onValueChange(value)}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${className}`}
    />
  );
};

export { RadioGroup, RadioGroupItem };
