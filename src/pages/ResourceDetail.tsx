import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentItem, ContentVersion, ContentComment } from '../types';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  History, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  User,
  Send,
  BookOpen,
  FileText,
  Globe,
  GraduationCap,
  Info as InfoIcon,
  FileDigit,
  Image as ImageIcon,
  Video,
  FileText as FileWord,
  Download,
  Eye,
  Shield,
  Edit3,
  Save,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getTagColor } from '../lib/utils';
import { useAdmin } from '../contexts/AdminContext';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'history' | 'discussion'>('content');
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    content: '',
    tags: [] as string[],
    type: '' as any,
    fileUrl: '',
    isObsolete: false
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#discussion') {
        setActiveTab('discussion');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const itemDoc = await getDoc(doc(db, 'content', id!));
        if (itemDoc.exists()) {
          const data = { id: itemDoc.id, ...itemDoc.data() } as ContentItem;
          setItem(data);
          setEditData({
            title: data.title,
            description: data.description,
            content: data.content || '',
            tags: data.tags || [],
            type: data.type,
            fileUrl: data.fileUrl || '',
            isObsolete: data.isObsolete || false
          });
          
          const vQ = query(collection(db, 'content', id!, 'versions'), orderBy('versionNumber', 'desc'));
          const vSnap = await getDocs(vQ);
          setVersions(vSnap.docs.map(d => ({ id: d.id, ...d.data() } as ContentVersion)));

          const cQ = query(collection(db, 'content', id!, 'comments'), orderBy('createdAt', 'asc'));
          const cSnap = await getDocs(cQ);
          setComments(cSnap.docs.map(d => ({ id: d.id, ...d.data() } as ContentComment)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commenterName.trim() || !id) return;

    try {
      const comment = {
        userId: 'anonymous',
        userName: commenterName,
        message: newComment,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'content', id, 'comments'), comment);
      setComments([...comments, { id: docRef.id, contentId: id, ...comment } as ContentComment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = () => {
    if (item) {
      setEditData({
        title: item.title,
        description: item.description,
        content: item.content || '',
        tags: item.tags || [],
        type: item.type,
        fileUrl: item.fileUrl || '',
        isObsolete: item.isObsolete || false
      });
      setIsEditing(true);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'content', id), {
        ...editData,
        updatedAt: new Date().toISOString()
      });
      setItem({ ...item!, ...editData, updatedAt: new Date().toISOString() });
      setIsEditing(false);
      alert('Resource updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update resource');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('CRITICAL: Permanent destruction of this intelligence module. Proceed?')) return;
    try {
      await deleteDoc(doc(db, 'content', id));
      navigate('/resources');
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editData.tags.includes(tagInput.trim())) {
        setEditData({ ...editData, tags: [...editData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setEditData({ ...editData, tags: editData.tags.filter(t => t !== tag) });
  };

  const isFileType = ['pdf', 'doc', 'image', 'video'].includes(item?.type || '');

  if (loading) return <div className="p-8 text-center font-bold text-gray-400">Syncing with Knowledge Hub...</div>;
  if (!item) return <div className="p-8 text-center text-red-500 font-bold underline">Resource missing or restricted.</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link to="/resources" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-900/40 hover:text-accent-600 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:border-accent-200 group-hover:bg-accent-50 group-hover:text-accent-600 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Return to Hub
        </Link>

        {isAdmin && (
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={handleStartEdit}
                className="flex items-center gap-2 bg-primary-950 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary-950/20"
              >
                <Edit3 className="w-4 h-4 text-accent-400" />
                Modify Intelligence
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-white text-gray-500 border border-gray-100 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all font-mono"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-accent-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-600 transition-all shadow-xl shadow-accent-200"
                >
                  <Save className="w-4 h-4" />
                  Commit Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-white shadow-2xl shadow-primary-900/5 p-8 lg:p-10 relative overflow-hidden ring-1 ring-gray-100/50">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl rounded-full" />
            
            {item.isObsolete && !isEditing && (
              <div className="mb-10 p-6 bg-red-50/50 border-2 border-red-100 rounded-3xl flex items-center gap-6">
                <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-red-200">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-red-900 uppercase tracking-widest">DEPRECATED ASSET</h4>
                  <p className="text-[11px] text-red-700/80 font-medium leading-relaxed mt-1">This module has been replaced by more recent intelligence. Verify with the PMO team before operational use.</p>
                </div>
              </div>
            )}
            
            {isEditing ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2">Knowledge Identifier</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-accent-500 transition-all transition-all"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2">Asset Architecture</label>
                    <select
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-accent-500 transition-all transition-all appearance-none"
                      value={editData.type}
                      onChange={(e) => setEditData({...editData, type: e.target.value as any})}
                    >
                      <option value="wiki">Project Wiki</option>
                      <option value="post">Operational Post</option>
                      <option value="course">Training Course</option>
                      <option value="pdf">PDF File</option>
                      <option value="doc">MS Word Doc</option>
                      <option value="image">Graphic Media</option>
                      <option value="video">Video Intel</option>
                      <option value="url">External Hub</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2">Intel Abstract</label>
                  <textarea
                    rows={2}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-accent-500 transition-all transition-all resize-none"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2">Dynamic Pointer (URL/CID)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-accent-500 transition-all transition-all"
                    value={editData.fileUrl}
                    onChange={(e) => setEditData({...editData, fileUrl: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2">System Categorization (Press Enter)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editData.tags.map(tag => (
                      <span key={tag} className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm",
                        getTagColor(tag)
                      )}>
                        {tag}
                        <button onClick={() => removeTag(tag)} className="opacity-40 hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="inline-flex min-w-[120px] bg-transparent border-none focus:ring-0 text-sm font-black p-1"
                      placeholder="Add system tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <input
                    type="checkbox"
                    id="isObsolete"
                    className="w-6 h-6 rounded-lg border-red-200 text-red-600 focus:ring-red-500 cursor-pointer"
                    checked={editData.isObsolete}
                    onChange={(e) => setEditData({...editData, isObsolete: e.target.checked})}
                  />
                  <label htmlFor="isObsolete" className="flex-1 text-xs font-black text-red-700 uppercase tracking-widest cursor-pointer select-none">
                    DEPRECATE INTELLIGENCE
                    <p className="text-[10px] font-medium text-red-500/70 mt-1 lowercase first-letter:uppercase tracking-normal">Marks this resource as legacy for all hub users.</p>
                  </label>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest px-2 text-accent-600">Core Content Engine (MDX)</label>
                  <textarea
                    rows={15}
                    className="w-full bg-gray-950 border border-gray-900 rounded-3xl p-8 text-sm font-medium text-primary-100 focus:ring-2 focus:ring-accent-500 transition-all font-mono leading-relaxed"
                    value={editData.content}
                    onChange={(e) => setEditData({...editData, content: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 mb-12">
                  <div className="flex-1 space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-accent-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-500/20">
                        {item.type}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-primary-900/30 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        Synced: {item.updatedAt ? format(new Date(item.updatedAt), 'MMM d, yyyy') : 'Recent'}
                      </span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-[1.05]">{item.title}</h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl">{item.description}</p>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {item.tags.map(tag => (
                          <span key={tag} className={cn(
                            "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            getTagColor(tag)
                          )}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-24 h-24 bg-primary-950 rounded-[2rem] flex items-center justify-center text-accent-400 shrink-0 shadow-2xl shadow-primary-950/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary-800 opacity-20 transform translate-x-12 translate-y-12 rotate-45" />
                    <div className="relative z-10 transition-transform group-hover:scale-110 duration-500">
                      {item.type === 'wiki' && <Globe className="w-12 h-12" />}
                      {item.type === 'post' && <FileText className="w-12 h-12" />}
                      {item.type === 'course' && <GraduationCap className="w-12 h-12" />}
                      {item.type === 'pdf' && <FileDigit className="w-12 h-12" />}
                      {item.type === 'doc' && <FileWord className="w-12 h-12" />}
                      {item.type === 'image' && <ImageIcon className="w-12 h-12" />}
                      {item.type === 'video' && <Video className="w-12 h-12" />}
                      {item.type === 'url' && <ExternalLink className="w-12 h-12" />}
                    </div>
                  </div>
                </div>

                <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100 mb-10 gap-10">
                  {[
                    { id: 'content', label: 'INTELLIGENCE', icon: BookOpen },
                    { id: 'history', label: 'LOGS', icon: History },
                    { id: 'discussion', label: 'SYNC HUB', icon: MessageSquare },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-3 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all relative whitespace-nowrap",
                        activeTab === tab.id 
                          ? "text-accent-600 border-accent-500" 
                          : "text-primary-900/20 border-transparent hover:text-primary-900 hover:border-gray-300"
                      )}
                    >
                      <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-accent-500" : "opacity-30")} />
                      {tab.label}
                      {tab.id === 'discussion' && comments.length > 0 && (
                        <span className="bg-accent-500 text-white px-2 py-0.5 rounded-full text-[9px] ml-1 shadow-lg shadow-accent-200">
                          {comments.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === 'content' && (
                  <div className="space-y-12">
                    {item.fileUrl && (
                      <div className="p-10 bg-primary-950 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-2xl shadow-primary-950/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 blur-3xl -mr-20 -mt-20 rounded-full" />
                        <div className="flex items-center gap-6 relative z-10">
                          <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl rounded-3xl flex items-center justify-center text-accent-400 group-hover:scale-110 transition-all border border-white/5 shadow-inner">
                            {isFileType ? <Download className="w-10 h-10" /> : <ExternalLink className="w-10 h-10" />}
                          </div>
                          <div>
                            <p className="font-black text-white text-2xl tracking-tighter mb-1">{isFileType ? 'SYNC ASSET' : 'REMOTE ACCESS'}</p>
                            <p className="text-xs text-primary-400/60 font-mono truncate max-w-[200px] sm:max-w-xs">{item.fileUrl}</p>
                          </div>
                        </div>
                        <a 
                          href={item.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full md:w-auto bg-accent-500 text-white px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-accent-500/20 hover:bg-accent-400 transition-all flex items-center justify-center gap-3 group/btn"
                        >
                          {isFileType ? 'Ingest Package' : 'Open Link'}
                          {isFileType ? <Download className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" /> : <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                        </a>
                      </div>
                    )}

                    {/* Media Previews */}
                    {item.fileUrl && item.type === 'image' && (
                      <div className="rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl bg-gray-50 p-2">
                        <img src={item.fileUrl} alt={item.title} className="w-full h-auto rounded-[2.5rem]" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {item.fileUrl && item.type === 'video' && (
                      <div className="rounded-[3rem] overflow-hidden aspect-video border border-gray-900 shadow-2xl bg-black">
                        <video src={item.fileUrl} controls className="w-full h-full" />
                      </div>
                    )}

                    <div className="markdown-body px-4 selection:bg-accent-100">
                      {item.content ? (
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      ) : (
                        !isFileType && (
                          <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 italic font-black uppercase tracking-widest text-[10px]">Awaiting Core Documentation Sync</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Actionable Log</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="flex gap-6 p-8 bg-primary-50 rounded-3xl border-2 border-primary-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 bg-primary-600 text-white rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Active</div>
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-200">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-lg font-black text-primary-900">Deployed Version {item.version}.0</p>
                          <p className="text-sm text-primary-700 mt-1 font-medium italic opacity-80">Initial verification and release</p>
                        </div>
                      </div>
                      {versions.length === 0 && (
                        <div className="text-center py-16 opacity-30">
                          <History className="w-12 h-12 mx-auto mb-4" />
                          <p className="font-black uppercase tracking-[0.2em] text-xs">V0.1 Legacy Data Locked</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'discussion' && (
                  <div className="space-y-10">
                    <div className="space-y-8">
                      {comments.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                          <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active threads</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-6 group">
                              <div className="w-14 h-14 rounded-2xl bg-primary-900 text-white flex items-center justify-center text-xl font-black shrink-0 shadow-xl shadow-primary-100">
                                {comment.userName[0]}
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-[1.5rem] p-8 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-lg font-black text-gray-900">{comment.userName}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] bg-white px-2 py-1 rounded-md shadow-sm">
                                    {format(new Date(comment.createdAt), 'MMM d • h:mm a')}
                                  </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium text-lg">{comment.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-10 border-t-4 border-gray-50">
                        <form onSubmit={handlePostComment} className="bg-white rounded-3xl p-2 border-2 border-gray-100 shadow-sm focus-within:border-primary-500 focus-within:shadow-2xl transition-all duration-500">
                          <div className="flex flex-col md:flex-row gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Your Identifier"
                              value={commenterName}
                              onChange={(e) => setCommenterName(e.target.value)}
                              className="md:w-48 px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-0 text-gray-900 font-bold text-sm"
                            />
                            <div className="flex-1 relative">
                              <textarea
                                required
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add your operational insight..."
                                rows={1}
                                className="w-full rounded-2xl bg-gray-50 border-none focus:ring-0 py-4 pl-6 pr-16 text-gray-700 font-medium resize-none min-h-[56px]"
                              />
                              <button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-xl shadow-xl shadow-primary-200 hover:bg-gray-900 transition-all group/send"
                              >
                                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-white shadow-2xl shadow-primary-900/5 p-8 ring-1 ring-gray-100/50">
            <h3 className="font-black text-primary-900 mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] opacity-40 px-2">
              ASSET METRICS
              <InfoIcon className="w-4 h-4" />
            </h3>
            <div className="space-y-10 px-2">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600 shrink-0 shadow-inner group transition-all">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-primary-900/40 mb-1">INTEL SOURCE</p>
                  <p className="text-[13px] font-black text-gray-900 leading-tight">{item.creatorName}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 shadow-inner group transition-all">
                  <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-primary-900/40 mb-1">INGESTION DATE</p>
                  <p className="text-[13px] font-black text-gray-900 leading-tight">{item.createdAt ? format(new Date(item.createdAt), 'MMMM d, yyyy') : 'Recently'}</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner group transition-all">
                  <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-primary-900/40 mb-1">VERIFICATION</p>
                  <p className="text-[13px] font-black text-emerald-600 leading-tight">Secured Hub Asset</p>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-10 pt-8 border-t border-gray-100 px-2">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge Intelligence
                </button>
              </div>
            )}
          </div>

          <div className="p-10 bg-primary-950 rounded-[2.5rem] text-white shadow-2xl shadow-primary-950/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <p className="text-sm text-primary-200/80 leading-relaxed relative z-10 font-medium italic">
              "Collaborative intelligence accelerates operational precision. Mission success depends on high-integrity knowledge sharing."
            </p>
            <div className="mt-10 flex items-center gap-4 relative z-10">
              <div className="w-10 h-1 bg-accent-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-400">Hub Command</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
