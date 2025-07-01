"use client";

import { useState } from "react";

const Tabs = ({ children, value, onValueChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState(value);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {children({ activeTab, setActiveTab: handleTabChange })}
    </div>
  );
};

const TabsList = ({ children, className = "" }) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({
  children,
  value,
  activeTab,
  setActiveTab,
  className = "",
}) => {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, activeTab, className = "" }) => {
  if (activeTab !== value) return null;

  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
