"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef, DataTableProps, TableSortDirection } from "@/types/table";
import { Pagination } from "./pagination";

function getSortValue<T>(row: T, column: ColumnDef<T>): string | number {
  if (column.accessor) {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    const value = row[column.accessor as keyof T];
    if (typeof value === "string" || typeof value === "number") return value;
    return String(value ?? "");
  }
  return "";
}

function compareValues(a: string | number, b: string | number, direction: TableSortDirection) {
  if (direction === null) return 0;
  const multiplier = direction === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * multiplier;
  }
  return String(a).localeCompare(String(b)) * multiplier;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20],
  enableSelection = false,
  bulkActions,
  emptyState,
  getRowId = (row) => row.id,
  className,
  syncToUrl = false,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<TableSortDirection>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;
    const column = columns.find((c) => c.id === sortColumn);
    if (!column) return data;
    return [...data].sort((a, b) =>
      compareValues(getSortValue(a, column), getSortValue(b, column), sortDirection)
    );
  }, [data, columns, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageData = sortedData.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const toggleSort = (columnId: string) => {
    if (sortColumn !== columnId) {
      setSortColumn(columnId);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortColumn(null);
    setSortDirection(null);
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds = pageData.map(getRowId);
    const allSelected = pageIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId || !sortDirection) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary" aria-hidden />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary" aria-hidden />
    );
  };

  if (!isLoading && data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center",
          className
        )}
      >
        {emptyState?.illustration}
        {emptyState?.title && (
          <p className="mt-4 text-base font-semibold text-foreground">{emptyState.title}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {emptyState?.message ?? "No data to display"}
        </p>
      </div>
    );
  }

  const skeletonRowCount = Math.min(pageSize, 5);

  return (
    <div className={cn("space-y-4", className)}>
      {enableSelection && selected.size > 0 && bulkActions && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} row{selected.size === 1 ? "" : "s"} selected
          </span>
          {bulkActions}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {enableSelection && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-input"
                    checked={
                      pageData.length > 0 && pageData.every((row) => selected.has(getRowId(row)))
                    }
                    onChange={toggleAll}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn("px-4 py-3 text-xs font-medium text-muted-foreground", column.className)}
                >
                  {column.sortable !== false && column.accessor ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort(column.id)}
                      aria-label={`Sort by ${column.header}`}
                    >
                      {column.header}
                      <SortIcon columnId={column.id} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="border-b border-border/50">
                    {enableSelection && (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageData.map((row) => {
                  const rowId = getRowId(row);
                  return (
                    <tr
                      key={rowId}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      {enableSelection && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-input"
                            checked={selected.has(rowId)}
                            onChange={() => toggleRow(rowId)}
                            aria-label={`Select row ${rowId}`}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.id} className={cn("px-4 py-3", column.className)}>
                          {column.cell
                            ? column.cell(row)
                            : column.accessor
                              ? typeof column.accessor === "function"
                                ? column.accessor(row)
                                : String(row[column.accessor as keyof T] ?? "")
                              : null}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length > 0 && (
        <Pagination
          totalItems={sortedData.length}
          pageSize={pageSize}
          currentPage={page + 1}
          onPageChange={(p) => setPage(p - 1)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
          pageSizeOptions={pageSizeOptions}
          syncToUrl={syncToUrl}
        />
      )}
    </div>
  );
}
