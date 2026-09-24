import React from 'react';

export const AuctionCardSkeleton = () => {
  return (
    <div className="bg-luxury-surface/40 border border-luxury-border/60 rounded-2xl overflow-hidden animate-pulse flex flex-col">
      <div className="h-64 bg-luxury-card/60 w-full"></div>
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3 bg-luxury-border/60 rounded w-1/4"></div>
          <div className="h-5 bg-luxury-border/60 rounded w-3/4"></div>
        </div>
        <div className="space-y-3 pt-2">
          <div className="h-3 bg-luxury-border/40 rounded w-full"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-luxury-border/60 rounded w-1/3"></div>
            <div className="h-4 bg-luxury-border/60 rounded w-1/4"></div>
          </div>
          <div className="h-10 bg-luxury-border/60 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-luxury-border/40">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-luxury-card/60 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};

export default { AuctionCardSkeleton, TableRowSkeleton };
