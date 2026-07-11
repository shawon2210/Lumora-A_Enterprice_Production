import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileText, Image, User, Loader2 } from 'lucide-react';
import { useGlobalSearch, useDebounce } from '@/hooks';
import { SEO } from '@/components/seo';
import { Card } from '@lumora/ui';

const typeIcon = {
  post: FileText,
  media: Image,
  user: User,
};

const typeLabel = {
  post: 'Post',
  media: 'Media',
  user: 'User',
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 300);
  const { data, isLoading } = useGlobalSearch(debouncedQuery);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <SEO title="Search | Lumora" />
      <div className="bg-surface-primary min-h-screen px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <h1
                className="text-text-primary mb-2 text-4xl font-normal"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Search
              </h1>
              <p className="text-text-secondary text-sm">Search across posts, media, and users.</p>
            </div>

            <div className="relative">
              <Search className="text-text-tertiary pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search anything..."
                autoFocus
                className="border-border-secondary bg-surface-secondary text-text-primary placeholder-text-tertiary focus:border-primary-500/30 focus:ring-primary-500/10 w-full rounded-2xl border py-3.5 pl-12 pr-4 text-base outline-none transition-all focus:ring-1"
              />
              {isLoading && (
                <Loader2 className="text-text-tertiary absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
              )}
            </div>

            {debouncedQuery.length >= 2 && (
              <div className="space-y-3">
                {data && data.length > 0 ? (
                  <>
                    <p className="text-text-tertiary text-xs font-medium uppercase tracking-wider">
                      {data.length} result{data.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                    </p>
                    {data.map((result) => {
                      const Icon = typeIcon[result.type] ?? FileText;
                      return (
                        <motion.div key={result.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <Link to={result.url}>
                            <Card className="glass-card cursor-pointer p-4 transition-all hover:brightness-110">
                              <div className="flex items-start gap-4">
                                <div className="bg-primary-500/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                  <Icon className="text-primary-400 h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-text-primary text-sm font-medium">{result.title}</p>
                                    <span className="bg-surface-secondary text-text-tertiary rounded-full px-2 py-0.5 text-xs">
                                      {typeLabel[result.type]}
                                    </span>
                                  </div>
                                  {result.description && (
                                    <p className="text-text-tertiary mt-0.5 line-clamp-2 text-xs">
                                      {result.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </>
                ) : !isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Search className="text-text-tertiary/50 mb-3 h-10 w-10" />
                    <p className="text-text-primary text-sm font-medium">No results found</p>
                    <p className="text-text-tertiary mt-1 text-xs">Try different keywords or check your spelling.</p>
                  </div>
                ) : null}
              </div>
            )}

            {debouncedQuery.length < 2 && !query && (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="text-text-tertiary/30 mb-3 h-12 w-12" />
                <p className="text-text-tertiary text-sm">Start typing to search</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
