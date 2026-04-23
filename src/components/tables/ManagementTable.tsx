import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  useTable,
  type Cell,
  type CellProps,
  type Column,
  type ColumnInstance,
  type HeaderGroup,
  type Row,
  usePagination,
} from "react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export type ManagementColumn<T> = {
  header: string;
  className?: string;
  headerClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

type ManagementPagination = {
  mode?: "client" | "server";
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
};

interface ManagementTableProps<T extends object> {
  columns: ManagementColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyMessage?: string;
  pagination?: ManagementPagination;
}

export default function ManagementTable<T extends object>({
  columns,
  rows,
  rowKey,
  emptyMessage = "Chưa có dữ liệu để hiển thị.",
  pagination,
}: ManagementTableProps<T>) {
  const tableColumns = useMemo<Column<T>[]>(
    () =>
      columns.map((column, index) => ({
        id: `column-${index}`,
        Header: column.header,
        Cell: ({ row }: CellProps<T>) => column.render(row.original, row.index),
        meta: {
          cellClassName: column.className,
          headerClassName: column.headerClassName,
        },
      })),
    [columns],
  );

  const data = useMemo(() => rows, [rows]);

  const isManualPagination = pagination?.mode === "server";
  const resolvedPageSize = pagination?.pageSize ?? 10;
  const resolvedPageIndex = Math.max(1, pagination?.pageIndex ?? 1);
  const resolvedTotalCount = pagination?.totalCount ?? rows.length;
  const resolvedPageCount = Math.max(
    1,
    Math.ceil(resolvedTotalCount / resolvedPageSize),
  );
  const pageSizeOptions = pagination?.pageSizeOptions ?? [5, 10, 20, 50];

  const tableInstance = useTable<T>(
    {
      columns: tableColumns,
      data,
      initialState: {
        pageIndex: resolvedPageIndex - 1,
        pageSize: resolvedPageSize,
      },
      manualPagination: isManualPagination,
      pageCount: isManualPagination ? resolvedPageCount : undefined,
      autoResetPage: false,
    } as never,
    usePagination,
  ) as any;

  const {
    headerGroups,
    rows: tableRows,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
  } = tableInstance;

  const internalPageIndex = state.pageIndex + 1;
  const internalPageSize = state.pageSize;
  const totalPages = isManualPagination
    ? resolvedPageCount
    : pageOptions.length;
  const visibleRows = pagination ? page : tableRows;
  const shouldShowPagination = Boolean(pagination && resolvedTotalCount > 0);

  useEffect(() => {
    if (!pagination) {
      setPageSize(Math.max(1, rows.length || 1));
      gotoPage(0);
      return;
    }

    if (internalPageSize !== resolvedPageSize) {
      setPageSize(resolvedPageSize);
    }

    if (internalPageIndex !== resolvedPageIndex) {
      gotoPage(resolvedPageIndex - 1);
    }
  }, [
    gotoPage,
    internalPageIndex,
    internalPageSize,
    pagination,
    resolvedPageIndex,
    resolvedPageSize,
    rows.length,
    setPageSize,
  ]);

  const handlePageSizeChange = (nextSize: number) => {
    if (pagination?.onPageSizeChange) {
      pagination.onPageSizeChange(nextSize);
      return;
    }

    setPageSize(nextSize);
    gotoPage(0);
  };

  const handlePageChange = (nextPage: number) => {
    if (pagination?.onPageChange) {
      pagination.onPageChange(nextPage);
      return;
    }

    gotoPage(nextPage - 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/5">
            {headerGroups.map((headerGroup: HeaderGroup<T>) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((header: ColumnInstance<T>) => {
                  const headerMeta = header as ColumnInstance<T> & {
                    meta?: { headerClassName?: string };
                  };

                  return (
                    <TableCell
                      isHeader
                      {...header.getHeaderProps()}
                      className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${headerMeta.meta?.headerClassName ?? ""}`}
                    >
                      {header.render("Header")}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {visibleRows.length > 0 ? (
              visibleRows.map((row: Row<T>) => {
                prepareRow(row);

                return (
                  <TableRow
                    {...row.getRowProps({
                      key: rowKey(row.original, row.index),
                    })}
                  >
                    {row.cells.map((cell: Cell<T>) => {
                      const cellMeta = cell.column as ColumnInstance<T> & {
                        meta?: { cellClassName?: string };
                      };

                      return (
                        <TableCell
                          {...cell.getCellProps()}
                          className={`px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${cellMeta.meta?.cellClassName ?? ""}`}
                        >
                          {cell.render("Cell")}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  isHeader
                  colSpan={tableColumns.length}
                  className="px-5 py-16 text-center align-middle text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {shouldShowPagination && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-white/5">
          <div className="flex items-center justify-center gap-3 overflow-x-auto">
            <div className="hidden whitespace-nowrap text-theme-sm text-gray-500 dark:text-gray-400 sm:block">
              Hiển thị {visibleRows.length} / {resolvedTotalCount} bản ghi
            </div>
            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800 sm:ml-auto">
              <button
                type="button"
                disabled={!canPreviousPage || pagination?.isLoading}
                onClick={() => {
                  if (pagination?.onPageChange) {
                    handlePageChange(1);
                    return;
                  }
                  gotoPage(0);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                |&lt;
              </button>

              <button
                type="button"
                disabled={!canPreviousPage || pagination?.isLoading}
                onClick={() => {
                  if (pagination?.onPageChange) {
                    handlePageChange(Math.max(1, internalPageIndex - 1));
                    return;
                  }
                  previousPage();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                &lt;
              </button>

              <select
                value={internalPageSize}
                disabled={pagination?.isLoading}
                onChange={(event) => {
                  handlePageSizeChange(Number(event.target.value));
                }}
                className="h-8 min-w-12 rounded-lg border border-gray-300 bg-white px-2 text-center text-xs font-semibold text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!canNextPage || pagination?.isLoading}
                onClick={() => {
                  if (pagination?.onPageChange) {
                    handlePageChange(
                      Math.min(totalPages, internalPageIndex + 1),
                    );
                    return;
                  }
                  nextPage();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                &gt;
              </button>

              <button
                type="button"
                disabled={!canNextPage || pagination?.isLoading}
                onClick={() => {
                  if (pagination?.onPageChange) {
                    handlePageChange(totalPages);
                    return;
                  }
                  gotoPage(Math.max(0, totalPages - 1));
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-xs font-semibold text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                &gt;|
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
