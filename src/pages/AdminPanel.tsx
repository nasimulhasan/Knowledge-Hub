import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentItem } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Clock, 
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, getTagColor } from '../lib/utils';
import { useAdmin } from '../contexts/AdminContext';

export function AdminPanel() {
  const { isAdmin } = useAdmin();
  const [requests, setRequests] = useState<ContentItem[]>([]);
  const [activeItems, setActiveItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'active'>('pending');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'content'), 
        where('status', '==', tab === 'pending' ? 'pending' : 'approved'),
        orderBy('updatedAt', 'desc')
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentItem));
      
      if (tab === 'pending') {
        setRequests(items);
      } else {
        setActiveItems(items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'content', itemId), {
        status: 'approved',
        reviewerId: 'admin',
        reviewComments: reviewComment,
        tags: editableTags,
        updatedAt: new Date().toISOString()
      });
      alert('Request approved!');
      fetchData();
      setSelectedRequestId(null);
      setReviewComment('');
      setEditableTags([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartReview = (req: ContentItem) => {
    setSelectedRequestId(req.id);
    setEditableTags(req.tags || []);
    setReviewComment('');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editableTags.includes(tagInput.trim())) {
        setEditableTags([...editableTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setEditableTags(editableTags.filter(t => t !== tag));
  };

  const handleDecline = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'content', itemId), {
        status: 'declined',
        reviewerId: 'admin',
        reviewComments: reviewComment,
        updatedAt: new Date().toISOString()
      });
      alert('Request declined.');
      fetchData();
      setSelectedRequestId(null);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource permanently?')) return;
    try {
      await deleteDoc(doc(db, 'content', itemId));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) {
    return <div className="p-12 bg-red-50 text-red-600 rounded-3xl text-center font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Hub Command Center</h2>
          <p className="text-sm text-gray-500 mt-3 font-medium">Programme Admin Authority & Knowledge Management Hub.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-xl overflow-hidden ring-1 ring-primary-900/5">
          <button 
            onClick={() => setTab('pending')}
            className={cn(
              "px-8 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden",
              tab === 'pending' ? "bg-primary-950 text-white shadow-2xl shadow-primary-950/20" : "text-primary-900/40 hover:text-gray-900"
            )}
          >
            Review Queue
            {requests.length > 0 && tab !== 'pending' && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setTab('active')}
            className={cn(
              "px-8 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all relative",
              tab === 'active' ? "bg-primary-950 text-white shadow-2xl shadow-primary-950/20" : "text-primary-900/40 hover:text-gray-900"
            )}
          >
            Repository
          </button>
        </div>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-primary-950 rounded-[2.5rem] p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
              <Shield className="w-8 h-8 text-accent-400 group-hover:rotate-12 transition-transform duration-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{tab === 'pending' ? 'Review Protocol' : 'Active Intel'}</h3>
              <p className="text-primary-300/60 text-sm font-medium mt-1">
                {tab === 'pending' ? `${requests.length} packets pending verification.` : `${activeItems.length} verified assets deployed.`}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 relative z-10">
            <span className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-500">
              {tab === 'pending' ? requests.length : activeItems.length}
            </span>
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-accent-500">Total Count</span>
          </div>
        </div>

        <div className="bg-accent-500 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center text-white shadow-2xl shadow-accent-500/20 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -ml-16 -mt-16" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">System Integrity</p>
           <div className="text-3xl font-black">99.8%</div>
           <div className="w-12 h-1 bg-white/30 rounded-full my-4" />
           <p className="text-[10px] font-bold opacity-60 px-4">All protocols active and syncing across hub</p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-20 text-center font-black text-primary-900/10 uppercase tracking-[0.5em] animate-pulse">Syncing Database...</div>
        ) : (tab === 'pending' ? requests : activeItems).length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-gray-100 p-24 text-center shadow-xl shadow-primary-900/5 ring-1 ring-primary-900/5">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <p className="text-primary-900 font-black text-2xl tracking-tighter">Operational Clearance</p>
            <p className="text-gray-400 text-sm mt-2 font-medium">No items currently match the active filter protocol.</p>
          </div>
        ) : (
          (tab === 'pending' ? requests : activeItems).map((req) => (
            <motion.div 
              layout
              key={req.id} 
              className="bg-white rounded-[2.5rem] border border-white shadow-2xl shadow-primary-900/5 overflow-hidden hover:shadow-primary-900/10 transition-all duration-500 ring-1 ring-primary-900/5"
            >
              <div className="p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <span className="w-fit px-4 py-1.5 rounded-full bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        {req.type}
                      </span>
                      <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tight">{req.title}</h3>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 leading-relaxed font-medium text-sm lg:text-base line-clamp-3">{req.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-[10px] text-primary-900/40 font-black uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-black text-primary-900">
                          {req.creatorName[0]}
                        </div>
                        By {req.creatorName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 opacity-40" />
                        {req.updatedAt ? format(new Date(req.updatedAt), 'MMM d, h:mm a') : 'N/A'}
                      </div>
                      {tab === 'active' && (
                        <a 
                          href={`/resources/${req.id}`}
                          className="flex items-center gap-1.5 text-accent-600 hover:text-accent-500 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Knowledge Page
                        </a>
                      )}
                    </div>

                    {req.tags && req.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {req.tags.map(tag => (
                          <span key={tag} className={cn(
                            "text-[9px] font-black border-2 px-3 py-1 rounded-xl uppercase tracking-widest shadow-sm",
                            getTagColor(tag)
                          )}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:w-[320px] shrink-0">
                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 shadow-inner h-full min-h-[200px]">
                      {tab === 'pending' ? (
                        selectedRequestId === req.id ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary-900/30 uppercase tracking-[0.2em] px-2">Audit Insight</label>
                              <textarea
                                rows={3}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Add comments..."
                                className="w-full p-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-accent-500 text-xs font-bold transition-all resize-none shadow-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary-900/30 uppercase tracking-[0.2em] px-2">System Tags</label>
                              <div className="flex flex-wrap gap-1.5 mb-2 px-1">
                                {editableTags.map(tag => (
                                  <span key={tag} className={cn(
                                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest bg-white",
                                    getTagColor(tag)
                                  )}>
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="opacity-40 hover:opacity-100 transition-opacity">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="Add/Edit tags..."
                                className="w-full p-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-accent-500 text-xs font-bold transition-all shadow-sm"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                className="bg-emerald-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Deployed
                              </button>
                              <button
                                onClick={() => handleDecline(req.id)}
                                className="bg-red-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                            <button 
                              onClick={() => setSelectedRequestId(null)} 
                              className="w-full py-2 text-primary-900/30 hover:text-primary-900 text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                            >
                              Exit Review
                            </button>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col gap-3 h-full justify-center">
                            <button
                              onClick={() => handleStartReview(req)}
                              className="w-full bg-primary-950 text-white rounded-2xl py-5 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-950/20 hover:bg-black transition-all flex items-center justify-center gap-3 group"
                            >
                              START AUDIT
                              <Shield className="w-4 h-4 text-accent-400 group-hover:rotate-12 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="w-full flex items-center justify-center gap-3 py-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Purge Entry
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col gap-3 h-full justify-center">
                          <Link 
                            to={`/resources/${req.id}`}
                            className="w-full bg-primary-950 text-white rounded-2xl py-5 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary-950/20 hover:bg-black transition-all flex items-center justify-center gap-3 group"
                          >
                            MODIFY INTEL
                            <Edit3 className="w-4 h-4 text-accent-400 group-hover:scale-110 transition-transform" />
                          </Link>
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="w-full flex items-center justify-center gap-3 py-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Purge Asset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-8 bg-accent-50 rounded-[2.5rem] border border-accent-100 flex items-start gap-6 shadow-sm">
        <div className="w-12 h-12 rounded-[1.25rem] bg-accent-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-black text-accent-950 tracking-tight">Admin Responsibility Protocol</p>
          <p className="text-sm text-accent-900/60 leading-relaxed font-medium">
            Approved content becomes immediately visible to the collective. High-integrity knowledge is the baseline for all Programme intelligence. 
            Audit all links and verify MDX integrity before deployment to the hub.
          </p>
        </div>
      </div>
    </div>
  );
}
