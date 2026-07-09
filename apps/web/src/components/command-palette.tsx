import { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { useGlobalSearch, useDebounce } from '@/hooks';
import { useCommandPalette } from '@/store/command-palette-store';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  onSelect: () => void;
  section: string;
}

export function CommandPalette() {
  const { isOpen, setOpen } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

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

  const items: CommandItem[] = [
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
      id: 'admin-users',
      label: 'Users (Admin)',
      icon: <Users className="h-4 w-4" />,
      section: 'Admin',
      onSelect: () => {
        navigate('/admin/users');
        setOpen(false);
      },
    },
    {
      id: 'admin-analytics',
      label: 'Analytics (Admin)',
      icon: <BarChart3 className="h-4 w-4" />,
      section: 'Admin',
      onSelect: () => {
        navigate('/admin/analytics');
        setOpen(false);
      },
    },
    {
      id: 'admin-logs',
      label: 'Audit Logs (Admin)',
      icon: <Activity className="h-4 w-4" />,
      section: 'Admin',
      onSelect: () => {
        navigate('/admin/logs');
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
  ];

  const filteredItems = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const searchPosts: CommandItem[] =
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
      : [];

  const allItems = query ? [...filteredItems, ...searchPosts] : filteredItems;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter' && allItems[selectedIndex]) {
        e.preventDefault();
        allItems[selectedIndex].onSelect();
      }
    },
    [allItems, selectedIndex],
  );

  if (!isOpen) return null;

  const sections = allItems.reduce<Record<string, typeof allItems>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="border-border-glass overflow-hidden rounded-2xl border bg-black/80 shadow-2xl backdrop-blur-xl">
          <div className="border-border-secondary flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-text-tertiary h-5 w-5 shrink-0" />
            <input
              ref={inputRef}
              type="text"
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

          <div className="max-h-80 overflow-y-auto p-2">
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
                        {item.description && (
                          <p className="text-text-tertiary truncate text-xs">{item.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {allItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="text-text-tertiary h-8 w-8" />
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
