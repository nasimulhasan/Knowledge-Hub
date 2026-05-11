import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentItem, ContentType } from '../types';
import { Search, Filter, BookOpen, FileText, Globe, GraduationCap, ChevronRight, FileDigit, Image as ImageIcon, Video, FileText as FileWord, ExternalLink, MessageSquare, Clock, User, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn, getTagColor } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function Resources() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'legacy'>('all');

  useEffect(() => {
    async function fetchResources() {
      try {
        const q = query(
          collection(db, 'content'),
          where('status', '==', 'approved'),
          orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ContentItem)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filteredItems = items.filter(item => {
    const searchLower = search.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchLower) || 
                         item.description.toLowerCase().includes(searchLower) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesTag = !selectedTag || (item.tags && item.tags.includes(selectedTag));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !item.isObsolete) ||
                         (statusFilter === 'legacy' && item.isObsolete);
    
    return matchesSearch && matchesFilter && matchesTag && matchesStatus;
  });

  // Get unique tags for quick filter
  const allTags = Array.from(new Set(items.flatMap(item => item.tags || []))).slice(0, 12);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wiki': return <Globe className="w-3.5 h-3.5" />;
      case 'post': return <FileText className="w-3.5 h-3.5" />;
      case 'course': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'pdf': return <FileDigit className="w-3.5 h-3.5" />;
      case 'doc': return <FileWord className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'video': return <Video className="w-3.5 h-3.5" />;
      case 'url': return <ExternalLink className="w-3.5 h-3.5" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-primary-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl shadow-primary-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 blur-3xl -mr-20 -mt-20 rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/10 blur-2xl -ml-20 -mb-20 rounded-full" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-accent-500/20 border border-accent-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent-300">
                Migration Repository v2.0
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-none">
              MIGRATION <span className="text-accent-400">INTELLIGENCE</span> HUB
            </h2>
            <p className="text-primary-200 text-sm font-medium leading-relaxed max-w-lg">
              Access verified resources, policy documentation, and field intelligence for rapid migration response and programme management.
            </p>
          </div>

          <div className="w-full lg:max-w-md space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="Search repository..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white focus:text-gray-900 focus:outline-none text-sm font-bold transition-all placeholder:text-primary-400 backdrop-blur-md"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'In Use' },
                  { id: 'legacy', label: 'Legacy' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      statusFilter === s.id ? "bg-accent-500 text-white shadow-lg" : "text-primary-300 hover:text-white"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="flex-1 bg-white/10 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-100 outline-none focus:bg-white focus:text-gray-900 transition-all cursor-pointer backdrop-blur-md"
              >
                <option value="all" className="text-gray-900">All Formats</option>
                <option value="pdf" className="text-gray-900">PDF Docs</option>
                <option value="doc" className="text-gray-900">Word Docs</option>
                <option value="image" className="text-gray-900">Media</option>
                <option value="video" className="text-gray-900">Video</option>
                <option value="url" className="text-gray-900">Links</option>
                <option value="post" className="text-gray-900">Posts</option>
                <option value="wiki" className="text-gray-900">Wiki</option>
                <option value="course" className="text-gray-900">Courses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[10px] font-black text-primary-900 uppercase tracking-widest mr-2">Top Tags:</span>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm",
                  selectedTag === tag 
                    ? "bg-accent-500 text-white border-accent-500 shadow-accent-200" 
                    : "bg-white text-primary-700 border-primary-100 hover:border-accent-300 hover:text-accent-600"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 text-[10px] font-black text-primary-900/40 uppercase tracking-widest mb-1">
            <div className="col-span-5">Intel Identification</div>
            <div className="col-span-1 text-center">Format</div>
            <div className="col-span-3">Categorization</div>
            <div className="col-span-2">Sync Status</div>
            <div className="col-span-1 text-right">Access</div>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-20" />
              ))
            ) : filteredItems.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-inner">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <h4 className="text-xl font-black text-gray-400 uppercase tracking-tighter">No intelligence matched</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">Try broadening your search parameters or resetting filters.</p>
                <button onClick={() => {setSearch(''); setFilter('all'); setSelectedTag(null); setStatusFilter('all');}} className="mt-6 text-accent-600 font-black text-[10px] uppercase tracking-widest hover:underline">Clear all filters</button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group bg-white rounded-2xl border border-white shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all hover:border-primary-100 overflow-hidden ring-1 ring-gray-100/50"
                >
                  <Link to={`/resources/${item.id}`} className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 p-4 lg:px-8">
                    {/* Info */}
                    <div className="lg:col-span-5 flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        "bg-primary-50 text-primary-400 group-hover:bg-accent-500 group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shadow-inner"
                      )}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-[13px] font-black text-gray-900 group-hover:text-accent-600 transition-colors uppercase tracking-tight truncate">
                            {item.title}
                          </h3>
                          {item.isObsolete && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase tracking-widest">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Legacy
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-1 font-medium leading-tight opacity-70">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="hidden lg:flex lg:col-span-1 justify-center">
                      <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest bg-primary-50/50 border border-primary-100/50 px-2.5 py-1 rounded-lg">
                        {item.type}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="lg:col-span-3 flex flex-wrap gap-1.5">
                      {item.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-md uppercase border whitespace-nowrap shadow-sm/5",
                          getTagColor(tag)
                        )}>
                          {tag}
                        </span>
                      ))}
                      {item.tags && item.tags.length > 3 && (
                        <span className="text-[9px] font-black text-gray-300 px-1 py-0.5 uppercase">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="lg:col-span-2 flex items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        <span>{item.updatedAt ? formatDistanceToNow(new Date(item.updatedAt)) : 'New'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent-600 font-extrabold">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-ping" />
                        <span>Live</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="hidden lg:flex lg:col-span-1 justify-end">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-all border border-transparent group-hover:border-accent-100">
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
