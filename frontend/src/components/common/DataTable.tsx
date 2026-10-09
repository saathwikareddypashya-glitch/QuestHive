import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  hideOnMobile?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns, rows, rowKey, searchText, searchPlaceholder = 'Search…', toolbar, pageSize = 8,
  emptyTitle = 'Nothing here yet', emptyText, onRowClick,
}: Props<T>) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = rows;
    if (q && searchText) out = out.filter((r) => searchText(r).toLowerCase().includes(q.toLowerCase()));
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a);
          const vb = col.sortValue!(b);
          return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir;
        });
      }
    }
    return out;
  }, [rows, q, sort, columns, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 1 ? { key, dir: -1 } : null) : { key, dir: 1 }));

  return (
    <div className="panel table-panel">
      {(searchText || toolbar) && (
        <div className="table-toolbar">
          {searchText && (
            <label className="input-icon table-search">
              <Search size={16} aria-hidden />
              <input className="input" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={searchPlaceholder} aria-label="Search table" />
            </label>
          )}
          {toolbar && <div className="table-toolbar-extra">{toolbar}</div>}
        </div>
      )}
      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} text={q ? 'Try a different search.' : emptyText} compact />
      ) : (
        <>
          <div className="table-scroll">
            <table className="table-qh">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} style={{ textAlign: c.align ?? 'left' }} className={c.hideOnMobile ? 'hide-sm' : ''}>
                      {c.sortValue ? (
                        <button className="th-sort" onClick={() => toggleSort(c.key)}>
                          {c.header}
                          {sort?.key === c.key && (sort.dir === 1 ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                        </button>
                      ) : c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? 'is-clickable' : ''}>
                    {columns.map((c) => (
                      <td key={c.key} style={{ textAlign: c.align ?? 'left' }} className={c.hideOnMobile ? 'hide-sm' : ''}>{c.render(r)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-foot">
            <span className="text-muted-qh small">
              Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}
            </span>
            {pages > 1 && (
              <div className="pager">
                <button className="icon-btn" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span className="small">{current} / {pages}</span>
                <button className="icon-btn" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
