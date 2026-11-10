import React from 'react';

export interface BrutalistDividerProps {
  label?: string;
}

export const BrutalistDivider: React.FC<BrutalistDividerProps> = ({
  label = 'O CON TU CUENTA',
}) => {
  return (
    <div className="relative flex items-center justify-center my-2 w-full">
      <div className="w-full h-[3px] bg-espresso-ink" />
      <div className="absolute px-3 py-1 bg-surface border-[2px] border-espresso-ink rounded-full text-[10px] font-bold font-[family-name:var(--font-space-grotesk)] uppercase tracking-wider text-espresso-ink shadow-[2px_2px_0px_0px_#1A0F0A]">
        {label}
      </div>
    </div>
  );
};
