type PaginationProps = {
  pageIndex: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
};

export default function Pagination({
  pageIndex,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  isLoading = false,
  onPageChange,
  totalCount,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasExtendedControls =
    typeof totalCount === "number" &&
    typeof pageSize === "number" &&
    onPageSizeChange;
  const startItem =
    typeof totalCount === "number" && typeof pageSize === "number"
      ? (pageIndex - 1) * pageSize + 1
      : null;
  const endItem =
    typeof totalCount === "number" && typeof pageSize === "number"
      ? Math.min(pageIndex * pageSize, totalCount)
      : null;

  return (
    <div className="w-full space-y-2">
      {hasExtendedControls && startItem !== null && endItem !== null ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-4">
          <div className="hidden flex-col gap-2 text-xs text-gray-600 dark:text-gray-300 sm:flex sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <div className="whitespace-nowrap font-medium">
              Hiển thị {startItem} - {endItem} / {totalCount} bản ghi
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onPageSizeChange && (
                <label className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-600 dark:text-gray-300">
                  <span>Số dòng</span>
                  <select
                    value={pageSize}
                    disabled={isLoading}
                    onChange={(event) => {
                      onPageSizeChange(Number(event.target.value));
                    }}
                    className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-600 dark:text-gray-300">
                <span>Trang</span>
                <select
                  value={pageIndex}
                  disabled={isLoading}
                  onChange={(event) => {
                    onPageChange(Number(event.target.value));
                  }}
                  className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <option key={pageNumber} value={pageNumber}>
                      {pageNumber}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-center overflow-x-auto sm:justify-end">
            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                disabled={!hasPreviousPage || isLoading}
                onClick={() => onPageChange(1)}
                title="Trang đầu"
                aria-label="Trang đầu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span className="text-xs font-semibold">|&lt;</span>
              </button>

              <button
                type="button"
                disabled={!hasPreviousPage || isLoading}
                onClick={() => onPageChange(pageIndex - 1)}
                title="Trước"
                aria-label="Trước"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span className="text-xs font-semibold">&lt;</span>
              </button>

              <div className="min-w-12 px-1">
                <select
                  value={pageSize}
                  disabled={isLoading}
                  onChange={(event) => {
                    onPageSizeChange?.(Number(event.target.value));
                  }}
                  className="h-8 w-full min-w-12 rounded-lg border border-gray-300 bg-white px-2 text-center text-xs font-semibold text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:hidden"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <select
                  value={pageIndex}
                  disabled={isLoading}
                  onChange={(event) => {
                    onPageChange(Number(event.target.value));
                  }}
                  className="hidden h-8 w-full min-w-12 rounded-lg border border-gray-300 bg-white px-2 text-center text-xs font-semibold text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:block"
                >
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <option key={pageNumber} value={pageNumber}>
                      {pageNumber}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!hasNextPage || isLoading}
                onClick={() => onPageChange(pageIndex + 1)}
                title="Sau"
                aria-label="Sau"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span className="text-xs font-semibold">&gt;</span>
              </button>

              <button
                type="button"
                disabled={!hasNextPage || isLoading}
                onClick={() => onPageChange(totalPages)}
                title="Trang cuối"
                aria-label="Trang cuối"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span className="text-xs font-semibold">&gt;|</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:justify-end">
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <button
              type="button"
              disabled={!hasPreviousPage || isLoading}
              onClick={() => onPageChange(1)}
              title="Trang đầu"
              aria-label="Trang đầu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <span className="text-xs font-semibold">|&lt;</span>
            </button>

            <button
              type="button"
              disabled={!hasPreviousPage || isLoading}
              onClick={() => onPageChange(pageIndex - 1)}
              title="Trước"
              aria-label="Trước"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <span className="text-xs font-semibold">&lt;</span>
            </button>

            <div className="min-w-12 px-1">
              <select
                value={pageIndex}
                disabled={isLoading}
                onChange={(event) => {
                  onPageChange(Number(event.target.value));
                }}
                className="h-8 w-full min-w-12 rounded-lg border border-gray-300 bg-white px-2 text-center text-xs font-semibold text-gray-700 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <option key={pageNumber} value={pageNumber}>
                    {pageNumber}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!hasNextPage || isLoading}
              onClick={() => onPageChange(pageIndex + 1)}
              title="Sau"
              aria-label="Sau"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <span className="text-xs font-semibold">&gt;</span>
            </button>

            <button
              type="button"
              disabled={!hasNextPage || isLoading}
              onClick={() => onPageChange(totalPages)}
              title="Trang cuối"
              aria-label="Trang cuối"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <span className="text-xs font-semibold">&gt;|</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
