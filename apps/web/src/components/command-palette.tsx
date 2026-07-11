import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Image,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  Activity,
  Plus,
  Bell,
} from 'lucide-react';
import { useGlobalSearch, useDebounce } from '@/hooks';
import { useCommandPalette } from '@/store/command-palette-store';
import { useAuthStore } from '@/store/auth-store';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  onSelect: () => void;
  section: string;
  adminOnly?: boolean;
}

export function CommandPalette() {
  const { isOpen, setOpen } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const { data: searchData } = useGlobalSearch(debouncedQuery.length >= 2 ? debouncedQuery : '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allCommandItems: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      section: 'Pages',
      onSelect: () => {
        navigate('/dashboard');
        setOpen(false);
      },
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: <FileText className="h-4 w-4" />,
      section: 'Pages',
      onSelect: () => {
        navigate('/dashboard/blog');
        setOpen(false);
      },
    },
    {
      id: 'media',
      label: 'Media',
      icon: <Image className="h-4 w-4" />,
      section: 'Pages',
      onSelect: () => {
        navigate('/dashboard/media');
        setOpen(false);
      },
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      section: 'Pages',
      onSelect: () => {
        navigate('/dashboard/notifications');
        setOpen(false);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      section: 'Pages',
      onSelect: () => {
        navigate('/dashboard/settings');
        setOpen(false);
      },
    },
    {
      id: 'new-post',
      label: 'New Blog Post',
      icon: <Plus className="h-4 w-4" />,
      section: 'Actions',
      onSelect: () => {
        navigate('/dashboard/blog/new');
        setOpen(false);
      },
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: <Users className="h-4 w-4" />,
      section: 'Admin',
      adminOnly: true,
      onSelect: () => {
        navigate('/admin/users');
        setOpen(false);
      },
    },
    {
      id: 'admin-analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      section: 'Admin',
      adminOnly: true,
      onSelect: () => {
        navigate('/admin/analytics');
        setOpen(false);
      },
    },
    {
      id: 'admin-logs',
      label: 'Audit Logs',
      icon: <Activity className="h-4 w-4" />,
      section: 'Admin',
      adminOnly: true,
      onSelect: () => {
        navigate('/admin/logs');
        setOpen(false);
      },
    },
  ];

  const visibleItems = allCommandItems.filter((item) => !item.adminOnly || isAdmin);

  const filteredItems = query
    ? visibleItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : visibleItems;

  const searchResults: CommandItem[] = useMemo(
    () =>
      query && searchData
        ? searchData.map((result) => ({
            id: `search-${result.id}`,
            label: result.title,
            description: result.description,
            icon: <FileText className="h-4 w-4" />,
            section: 'Search Results',
            onSelect: () => {
              navigate(result.url);
              setOpen(false);
            },
          }))
        : [],
    [query, searchData, navigate, setOpen],
  );

  const allItems = useMemo(
    () => (query ? [...filteredItems, ...searchResults] : filteredItems),
    [query, filteredItems, searchResults],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev: number) => (prev + 1) % Math.max(allItems.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev: number) => (prev - 1 + Math.max(allItems.length, 1)) % Math.max(allItems.length, 1));
      } else if (e.key === 'Enter' && allItems[selectedIndex]) {
        e.preventDefault();
        allItems[selectedIndex].onSelect();
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [allItems, selectedIndex, setOpen],
  );

  if (!isOpen) return null;

  const sections = allItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 px-4"
      >
        <div className="border-border-glass overflow-hidden rounded-2xl border bg-black/80 shadow-2xl backdrop-blur-xl">
          <div className="border-border-secondary flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-text-tertiary h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              placeholder="Search pages, posts, or type a command..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="text-text-primary placeholder:text-text-tertiary w-full bg-transparent text-sm outline-none"
            />
            <kbd className="border-border-secondary bg-surface-secondary text-text-tertiary rounded-md border px-1.5 py-0.5 text-xs">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2" role="listbox">
            {Object.entries(sections).map(([section, sectionItems]) => (
              <div key={section}>
                <p className="text-text-tertiary px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-wider">
                  {section}
                </p>
                {sectionItems.map((item) => {
                  const globalIndex = allItems.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={globalIndex === selectedIndex}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                        globalIndex === selectedIndex
                          ? 'bg-primary-500/10 text-text-primary'
                          : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="bg-surface-secondary flex h-8 w-8 items-center justify-center rounded-lg">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.label}</p>
                        {item.description && <p className="text-text-tertiary truncate text-xs">{item.description}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {allItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="text-text-tertiary h-8 w-8" aria-hidden="true" />
                <p className="text-text-secondary mt-3 text-sm">No results found</p>
              </div>
            )}
          </div>

          <div className="border-border-secondary flex items-center gap-4 border-t px-4 py-2">
            <span className="text-text-tertiary flex items-center gap-1 text-xs">
              <kbd className="border-border-secondary bg-surface-secondary rounded border px-1.5 py-0.5 text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="text-text-tertiary flex items-center gap-1 text-xs">
              <kbd className="border-border-secondary bg-surface-secondary rounded border px-1.5 py-0.5 text-[10px]">
                ↵
              </kbd>
              Open
            </span>
            <span className="text-text-tertiary flex items-center gap-1 text-xs">
              <kbd className="border-border-secondary bg-surface-secondary rounded border px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
              Toggle
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
