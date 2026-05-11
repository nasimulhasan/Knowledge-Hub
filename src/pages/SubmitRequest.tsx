import React, { useState, useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { ContentType } from '../types';
import { useNavigate } from 'react-router-dom';
import { Send, FileText, Globe, GraduationCap, Link as LinkIcon, Info, User, FileDigit, Image as ImageIcon, Video, FileText as FileWord, Upload, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function SubmitRequest() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'post' as ContentType,
    fileUrl: '',
    content: '',
    contributorName: ''
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let finalFileUrl = formData.fileUrl;

      // Handle direct file upload if applicable
      if (['pdf', 'doc', 'image', 'video'].includes(formData.type) && selectedFile) {
        finalFileUrl = await uploadFile(selectedFile);
      }

      const newItem = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        fileUrl: finalFileUrl,
        content: formData.content,
        status: 'pending',
        creatorId: 'anonymous',
        creatorName: formData.contributorName,
        tags: tags,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'content'), newItem);
      alert('Request submitted successfully for admin review!');
      navigate('/resources');
    } catch (err) {
      console.error(err);
      alert('Failed to submit request. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const isFileUploadType = ['pdf', 'doc', 'image', 'video'].includes(formData.type);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 blur-3xl -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/5 blur-3xl -z-10 rounded-full" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Expand the Collective</h2>
          <p className="text-gray-500 mt-3 text-base font-medium max-w-sm">Contribute fresh intelligence to the BRAC Migration knowledge hub.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm self-start md:self-auto ring-1 ring-primary-900/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-primary-900/60 uppercase tracking-[0.2em]">Quality Integrity Verified</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-white shadow-2xl shadow-primary-900/5 overflow-hidden ring-1 ring-primary-900/5"
      >
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {/* Contributor Section */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">SOURCE IDENTITY</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-900/20 group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                required
                value={formData.contributorName}
                onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
                className="w-full pl-16 pr-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-bold text-gray-900 placeholder:text-primary-900/20 text-base"
                placeholder="Operational Lead / Name"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100/50" />

          {/* Type Selection */}
          <div className="space-y-6">
            <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">ASSET CLASSIFICATION</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { value: 'pdf', label: 'PDF INTEL', icon: FileDigit },
                { value: 'doc', label: 'MS DOC', icon: FileWord },
                { value: 'image', label: 'GRAPHIC', icon: ImageIcon },
                { value: 'video', label: 'VIDEO', icon: Video },
                { value: 'url', label: 'EXT LINK', icon: LinkIcon },
                { value: 'post', label: 'SITREP', icon: FileText },
                { value: 'wiki', label: 'WIKI', icon: Globe },
                { value: 'course', label: 'MODULE', icon: GraduationCap },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, type: t.value as ContentType });
                    setSelectedFile(null);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 px-4 py-6 rounded-3xl border-2 transition-all group relative overflow-hidden",
                    formData.type === t.value 
                      ? 'border-accent-500 bg-accent-50/50 text-accent-700 shadow-xl shadow-accent-500/10' 
                      : 'border-transparent bg-gray-50/50 text-primary-900/30 hover:border-gray-200 hover:bg-gray-100/50'
                  )}
                >
                  {formData.type === t.value && (
                    <motion.div layoutId="active-bg" className="absolute inset-0 bg-accent-500/5 pointer-events-none" />
                  )}
                  <t.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", formData.type === t.value ? "text-accent-500" : "text-primary-900/20")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description Area */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">REPORT TITLE</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-black text-2xl text-gray-900 placeholder:text-primary-900/10 tracking-tight"
                placeholder="Knowledge asset name"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">EXECUTIVE SUMMARY</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-medium text-primary-900/70 leading-relaxed placeholder:text-primary-900/20 text-base"
                placeholder="High-level description of the resource content..."
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">SYSTEM TAGS (ENTER TO ADD)</label>
              <div className="flex flex-wrap gap-2.5 mb-3 px-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-500 text-white text-[10px] font-black leading-none uppercase tracking-widest shadow-lg shadow-accent-500/20 group">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-bold text-gray-900 placeholder:text-primary-900/20 text-sm"
                placeholder="Add classification meta-tags..."
              />
            </div>
          </div>

          {/* Dynamic Content Section */}
          <AnimatePresence mode="wait">
            {isFileUploadType ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">BINARY INGESTION</label>
                {!selectedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center hover:border-accent-200 hover:bg-accent-50/20 transition-all cursor-pointer group bg-gray-50/30"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      accept={
                        formData.type === 'pdf' ? '.pdf' :
                        formData.type === 'doc' ? '.doc,.docx' :
                        formData.type === 'image' ? 'image/*' :
                        formData.type === 'video' ? 'video/*' : undefined
                      }
                    />
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:bg-accent-500 group-hover:text-white">
                      <Upload className="w-8 h-8 text-primary-900/20 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-primary-900 font-black text-lg tracking-tight">Drop package here or <span className="text-accent-600">locate manually</span></p>
                    <p className="text-[10px] text-primary-900/30 font-bold uppercase tracking-widest mt-2">Maximum Payload: 50MB</p>
                  </div>
                ) : (
                  <div className="bg-accent-500 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-2xl shadow-accent-500/20">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                        {formData.type === 'pdf' && <FileDigit className="w-8 h-8" />}
                        {formData.type === 'doc' && <FileWord className="w-8 h-8" />}
                        {formData.type === 'image' && <ImageIcon className="w-8 h-8" />}
                        {formData.type === 'video' && <Video className="w-8 h-8" />}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight truncate max-w-[200px] sm:max-w-md leading-tight">{selectedFile.name}</p>
                        <p className="text-[10px] text-white/60 uppercase font-black tracking-widest mt-1">Ready for Sync • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="w-12 h-12 bg-white/10 hover:bg-white hover:text-red-500 border border-white/10 rounded-xl flex items-center justify-center transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}
                {uploadProgress !== null && (
                  <div className="space-y-3 px-2">
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="bg-accent-500 h-full rounded-full shadow-lg"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-primary-900/20 uppercase tracking-[0.3em]">SYNCHRONIZING DATASTREAM</p>
                      <p className="text-[10px] font-black text-accent-600 uppercase tracking-widest">{Math.round(uploadProgress)}% COMPLETED</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : formData.type === 'url' ? (
              <motion.div
                key="url"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">CENTRAL HUB LINK</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-900/20 group-focus-within:text-accent-500 transition-colors" />
                  <input
                    type="url"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-bold text-gray-900 text-base"
                    placeholder="https://operational-link.com/asset"
                  />
                </div>
              </motion.div>
            ) : (formData.type === 'wiki' || formData.type === 'post') ? (
              <motion.div
                key="md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <label className="block text-[10px] font-black text-accent-600/60 uppercase tracking-[0.3em] px-4">INTEL BODY (MARKDOWN)</label>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-8 py-8 rounded-[2.5rem] bg-gray-950 border-2 border-transparent focus:border-accent-500 focus:outline-none transition-all font-mono text-sm leading-relaxed text-primary-100 shadow-inner"
                  placeholder="# Enter operational documentation here..."
                />
              </motion.div>
            ) : formData.type === 'course' ? (
              <motion.div
                key="course"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                 <label className="block text-[10px] font-black text-primary-900/40 uppercase tracking-[0.3em] px-4">CURRICULUM ACCESS LINK</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-900/20 group-focus-within:text-accent-500 transition-colors" />
                  <input
                    type="url"
                    required
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full pl-16 pr-8 py-5 rounded-3xl bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-accent-500 focus:shadow-xl focus:shadow-accent-500/5 focus:outline-none transition-all font-bold text-gray-900 text-base"
                    placeholder="https://training-portal.com/module"
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="pt-10 border-t border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start gap-4 p-5 bg-accent-50/50 rounded-2xl border border-accent-100 max-w-lg">
              <CheckCircle2 className="w-6 h-6 text-accent-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-accent-900/60 font-medium leading-relaxed">
                <span className="font-black text-accent-900 uppercase">Operational Protocol:</span> By deploying this resource, you verify its relevance to the BRAC Migration mission. Subject to admin verification.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || (isFileUploadType && !selectedFile)}
              className="w-full lg:w-auto flex items-center justify-center gap-3 bg-primary-950 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-22xl shadow-primary-950/20 hover:bg-black disabled:opacity-30 transition-all shrink-0 active:scale-95"
            >
              {loading ? 'Processing...' : 'Deploy Submission'}
              <Send className="w-5 h-5 text-accent-400" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

