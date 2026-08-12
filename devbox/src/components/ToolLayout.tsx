import React from 'react';

interface ToolLayoutProps {
  children: React.ReactNode;
}

export function ToolLayout({ children }: ToolLayoutProps) {
  return <div className="tool-container">{children}</div>;
}
