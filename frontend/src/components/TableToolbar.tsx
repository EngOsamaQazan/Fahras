import { ReactNode } from "react";

interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
}

export default function TableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "بحث...",
  actions,
}: TableToolbarProps) {
  return (
    <div className="toolbar">
      {onSearchChange && (
        <div className="toolbar-search">
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {actions && <div className="toolbar-actions">{actions}</div>}
    </div>
  );
}
