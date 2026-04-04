import React from 'react';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className = "",
  height = "300px",
}) => {
  const fillParent = height === "100%";
  return (
    <div
      className={`w-full ${className}`}
      style={{
        height,
        minHeight: fillParent ? undefined : height,
        maxHeight: fillParent ? undefined : height,
        minWidth: 0,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
};

export default ChartContainer;
