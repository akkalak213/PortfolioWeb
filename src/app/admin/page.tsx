'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, LogOut, Terminal, Activity, Save, User, MessageSquare, 
  Share2, Plus, GripVertical, Briefcase, GraduationCap, Cpu, 
  PenTool, X, ChevronDown, CheckCircle, FolderOpen, Image as ImageIcon, Link as LinkIcon, 
  Github
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getIcon, IconMap } from '@/lib/iconMap'

// Initialize Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
  const router = useRouter()
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'contacts' | 'reviews'>('projects')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // --- MODAL STATES ---
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  // --- DATA STATE ---
  const [reviews, setReviews] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  
  // Editing States
  const [editingContact, setEditingContact] = useState<any>(null)
  const [editingProject, setEditingProject] = useState<any>(null)
  
  // Profile State
  const [profile, setProfile] = useState<any>({
    display_name: '', role_title: '', about_text: '', email: '', phone: '', github_url: '',
    hard_skills: [], soft_skills: [], education: [], experience: [], resume_projects: [], languages: []
  })

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { /* router.push('/') */ }

    // Fetch Reviews
    const { data: reviewsData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (reviewsData) setReviews(reviewsData)

    // Fetch Contacts
    const { data: contactsData } = await supabase.from('contacts').select('*').order('sort_order', { ascending: true })
    if (contactsData) setContacts(contactsData)

    // Fetch Projects
    const { data: projectsData } = await supabase.from('projects').select('*').order('id', { ascending: false })
    if (projectsData) setProjects(projectsData)

    // Fetch Profile
    const { data: profileData } = await supabase.from('profile_config').select('*').eq('id', 1).single()
    if (profileData) {
        setProfile({
            ...profileData,
            hard_skills: profileData.hard_skills || [],
            soft_skills: profileData.soft_skills || [],
            education: profileData.education || [],
            experience: profileData.experience || [],
            resume_projects: profileData.resume_projects || [],
            languages: profileData.languages || []
        })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- 2. LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = 'admin_access=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/')
  }

  // --- 3. PROFILE HANDLERS ---
  const handleAddItem = (field: string, newItem: any) => setProfile({ ...profile, [field]: [...profile[field], newItem] })
  const handleRemoveItem = (field: string, index: number) => { 
      const n = [...profile[field]]; n.splice(index, 1); setProfile({ ...profile, [field]: n }) 
  }
  const handleChangeItem = (field: string, index: number, key: string, value: any) => { 
      const n = [...profile[field]]; n[index] = { ...n[index], [key]: value }; setProfile({ ...profile, [field]: n }) 
  }
  const handleSimpleArrayChange = (index: number, value: string) => { 
      const n = [...profile.soft_skills]; n[index] = value; setProfile({ ...profile, soft_skills: n }) 
  }
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('profile_config').update({ ...profile }).eq('id', 1)
    setSaving(false)
    if (!error) alert('PROFILE SAVED!') 
    else alert('Error: ' + error.message)
  }

  // --- 4. PROJECTS HANDLERS ---
  const generateSlug = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim()

  const handleProjectTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    if (!editingProject.id) {
        setEditingProject({ ...editingProject, title: newTitle, slug: generateSlug(newTitle) })
    } else {
        setEditingProject({ ...editingProject, title: newTitle })
    }
  }

  // --- GALLERY HANDLERS (ส่วนที่เพิ่มใหม่จากแบบสั้น) ---
  const handleAddGalleryImage = () => {
    const currentImages = editingProject.gallery_images || []
    setEditingProject({ ...editingProject, gallery_images: [...currentImages, ''] })
  }

  const handleRemoveGalleryImage = (index: number) => {
    const currentImages = [...(editingProject.gallery_images || [])]
    currentImages.splice(index, 1)
    setEditingProject({ ...editingProject, gallery_images: currentImages })
  }

  const handleGalleryImageChange = (index: number, value: string) => {
    const currentImages = [...(editingProject.gallery_images || [])]
    currentImages[index] = value
    setEditingProject({ ...editingProject, gallery_images: currentImages })
  }
  // ----------------------------------------------------

  const openEditProject = (project?: any) => {
    if (project) {
        setEditingProject(project)
    } else {
        setEditingProject({ 
            title: '', slug: '', category: 'dev', description: '', tags: [], 
            cover_image: '', gallery_images: [], demo_url: '', repo_url: '', is_featured: false 
        })
    }
    setIsProjectModalOpen(true)
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...editingProject }
    if (!payload.slug) payload.slug = generateSlug(payload.title)
    if (typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
    }
    // Clean empty gallery images
    if (payload.gallery_images && Array.isArray(payload.gallery_images)) {
        payload.gallery_images = payload.gallery_images.filter((url: string) => url.trim() !== '')
    }
    
    const { error } = editingProject.id 
        ? await supabase.from('projects').update(payload).eq('id', editingProject.id)
        : await supabase.from('projects').insert([payload])
    
    setSaving(false)
    if (!error) { setIsProjectModalOpen(false); fetchData() } else { alert('Error: ' + error.message) }
  }

  const handleDeleteProject = async (id: number) => {
    if(!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id); fetchData()
  }

  // --- 5. CONTACTS HANDLERS ---
  const openEditContact = (c?: any) => { 
      setEditingContact(c || { platform: '', value: '', href: '', icon: 'Link', is_active: true, sort_order: contacts.length + 1 })
      setIsContactModalOpen(true) 
  }
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const payload = { ...editingContact, sort_order: parseInt(editingContact.sort_order) }
    const { error } = editingContact.id 
        ? await supabase.from('contacts').update(payload).eq('id', editingContact.id)
        : await supabase.from('contacts').insert([payload])
    setSaving(false); if(!error){ setIsContactModalOpen(false); fetchData() }
  }
  const handleDeleteContact = async (id: string) => { if(confirm('Delete?')) { await supabase.from('contacts').delete().eq('id', id); fetchData() } }

  // --- 6. REVIEWS HANDLERS ---
  const handleDeleteReview = async (id: string) => { if(confirm('Delete?')) { await supabase.from('reviews').delete().eq('id', id); fetchData() } }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 relative selection:bg-green-900 selection:text-white pb-20">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 border-b border-green-900 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tighter">
            <Terminal /> ADMIN_PANEL <span className="text-xs bg-green-900 text-black px-1 rounded">v7.0 (Fixed)</span>
        </h1>
        <button onClick={handleLogout} className="px-3 py-1 bg-red-900/20 text-red-500 border border-red-900/50 rounded hover:bg-red-900/50 text-xs transition-colors flex items-center gap-1">
            <LogOut size={14}/> LOGOUT
        </button>
      </header>

      {/* TABS (Sticky) */}
      <div className="flex flex-wrap gap-4 mb-6 sticky top-0 bg-black/90 backdrop-blur z-20 py-4 border-b border-green-900/30">
        <button onClick={() => setActiveTab('projects')} className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}>
            <FolderOpen size={16} /> PROJECTS
        </button>
        <button onClick={() => setActiveTab('profile')} className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}>
            <User size={16} /> RESUME
        </button>
        <button onClick={() => setActiveTab('contacts')} className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}>
            <Share2 size={16} /> CONTACTS
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}>
            <MessageSquare size={16} /> REVIEWS
        </button>
      </div>

      {loading ? (
          <div className="flex items-center gap-2 text-green-500 animate-pulse">
              <Activity className="animate-spin" size={20}/> DOWNLOADING DATABASE...
          </div>
      ) : (
        <>
            {/* ======================= TAB: PROJECTS (PORTFOLIO) ======================= */}
            {activeTab === 'projects' && (
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6 bg-green-900/10 p-4 rounded border border-green-900/50">
                        <h2 className="text-xl font-bold flex items-center gap-2"><FolderOpen size={20}/> PORTFOLIO ITEMS ({projects.length})</h2>
                        <button onClick={() => openEditProject()} className="bg-green-600 text-black px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"><Plus size={18} /> NEW PROJECT</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((p) => (
                            <div key={p.id} className="bg-black/40 border border-green-900/30 rounded-lg p-4 flex gap-4 hover:border-green-500/50 transition-all group relative overflow-hidden">
                                <div className="w-24 h-24 bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-green-900/30 relative">
                                    {p.cover_image ? <img src={p.cover_image} alt="cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-green-900"><ImageIcon /></div>}
                                    {p.gallery_images && p.gallery_images.length > 0 && (
                                        <div className="absolute bottom-0 right-0 bg-black/60 text-[9px] px-1 text-white">+{p.gallery_images.length}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white text-lg truncate">{p.title}</h3>
                                        {p.is_featured && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/50">FEATURED</span>}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mb-1">/{p.slug}</div>
                                    <div className="text-xs text-green-600 font-mono mb-1 uppercase tracking-wider">{p.category}</div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {p.tags?.map((t:string, i:number) => <span key={i} className="text-[9px] bg-green-900/20 text-green-400 px-1 rounded">{t}</span>)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 justify-center border-l border-green-900/30 pl-4 ml-2">
                                    <button onClick={() => openEditProject(p)} className="text-blue-400 hover:text-white p-1"><PenTool size={16}/></button>
                                    <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ======================= TAB: RESUME PROFILE (Full Version) ======================= */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-8 max-w-5xl mx-auto">
                     
                     {/* 1. MAIN INFO */}
                     <div className="bg-green-900/5 border border-green-900 rounded p-6">
                        <h2 className="text-xl mb-6 font-bold flex items-center gap-2 text-green-400"><Activity size={20}/> 1. MAIN INFO</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="lbl">Display Name</label><input className="input-field" value={profile.display_name || ''} onChange={e => setProfile({...profile, display_name: e.target.value})} /></div>
                            <div><label className="lbl">Role Title</label><input className="input-field" value={profile.role_title || ''} onChange={e => setProfile({...profile, role_title: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className="lbl">About Text (Summary)</label><textarea rows={3} className="input-field" value={profile.about_text || ''} onChange={e => setProfile({...profile, about_text: e.target.value})} /></div>
                            <div><label className="lbl">Contact Email</label><input className="input-field" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                            <div><label className="lbl">Contact Phone</label><input className="input-field" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                            <div className="md:col-span-2"><label className="lbl">Github URL</label><input className="input-field" value={profile.github_url || ''} onChange={e => setProfile({...profile, github_url: e.target.value})} /></div>
                        </div>
                     </div>

                     {/* 2. EXPERIENCE */}
                     <div className="bg-green-900/5 border border-green-900 rounded p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><Briefcase size={20}/> 2. EXPERIENCE</h2>
                            <button type="button" onClick={() => handleAddItem('experience', {title: 'New Role', company: 'Company', year: '202X', details: []})} className="btn-add"><Plus size={14}/> ADD</button>
                        </div>
                        <div className="space-y-4">
                            {profile.experience.map((exp: any, i: number) => (
                                <div key={i} className="bg-black/40 border border-green-900/50 p-4 rounded relative group hover:border-green-500/50 transition-colors">
                                    <button type="button" onClick={() => handleRemoveItem('experience', i)} className="absolute top-2 right-2 text-red-500 opacity-50 hover:opacity-100 p-1 hover:bg-red-900/20 rounded"><X size={16}/></button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                        <input className="input-field" placeholder="Job Title" value={exp.title} onChange={e => handleChangeItem('experience', i, 'title', e.target.value)} />
                                        <input className="input-field" placeholder="Company" value={exp.company} onChange={e => handleChangeItem('experience', i, 'company', e.target.value)} />
                                        <input className="input-field" placeholder="Year (e.g. 2022-Present)" value={exp.year} onChange={e => handleChangeItem('experience', i, 'year', e.target.value)} />
                                    </div>
                                    <label className="lbl">Details (One per line)</label>
                                    <textarea rows={3} className="input-field w-full text-xs" 
                                        value={Array.isArray(exp.details) ? exp.details.join('\n') : exp.details} 
                                        onChange={e => handleChangeItem('experience', i, 'details', e.target.value.split('\n'))} 
                                    />
                                </div>
                            ))}
                        </div>
                     </div>

                     {/* 3. SKILLS */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-900/5 border border-green-900 rounded p-6">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><Cpu size={20}/> 3. HARD SKILLS</h2><button type="button" onClick={() => handleAddItem('hard_skills', {category: 'Category', items: ''})} className="btn-add"><Plus size={14}/></button></div>
                            <div className="space-y-2">{profile.hard_skills.map((skill: any, i: number) => (<div key={i} className="flex gap-2 items-start"><input className="input-field w-1/3" placeholder="Category" value={skill.category} onChange={e => handleChangeItem('hard_skills', i, 'category', e.target.value)} /><input className="input-field w-2/3" placeholder="Items" value={skill.items} onChange={e => handleChangeItem('hard_skills', i, 'items', e.target.value)} /><button type="button" onClick={() => handleRemoveItem('hard_skills', i)} className="text-red-500 pt-2"><X size={16}/></button></div>))}</div>
                        </div>
                         <div className="bg-green-900/5 border border-green-900 rounded p-6">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><User size={20}/> 4. SOFT SKILLS</h2><button type="button" onClick={() => setProfile({...profile, soft_skills: [...profile.soft_skills, 'New Skill']})} className="btn-add"><Plus size={14}/></button></div>
                            <div className="flex flex-wrap gap-2">{profile.soft_skills.map((skill: string, i: number) => (<div key={i} className="flex items-center gap-1 bg-green-900/20 px-2 py-1 rounded border border-green-900/50"><input className="bg-transparent text-white text-xs w-24 outline-none border-b border-transparent focus:border-green-500" value={skill} onChange={e => handleSimpleArrayChange(i, e.target.value)} /><button type="button" onClick={() => {const n = [...profile.soft_skills]; n.splice(i, 1); setProfile({...profile, soft_skills: n})}} className="text-red-500 hover:text-red-400"><X size={12}/></button></div>))}</div>
                        </div>
                     </div>

                     {/* 4. RESUME PROJECTS & EDUCATION */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-900/5 border border-green-900 rounded p-6">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><PenTool size={20}/> 5. RESUME PROJECTS</h2><button type="button" onClick={() => handleAddItem('resume_projects', {name: 'Name', tech: 'Tech', desc: 'Desc'})} className="btn-add"><Plus size={14}/></button></div>
                            {profile.resume_projects.map((p: any, i: number) => (
                                <div key={i} className="bg-black/40 border border-green-900/50 p-3 rounded mb-2 relative hover:border-green-500/50">
                                    <button type="button" onClick={() => handleRemoveItem('resume_projects', i)} className="absolute top-1 right-1 text-red-500"><X size={14}/></button>
                                    <input className="input-field mb-1 font-bold" placeholder="Name" value={p.name} onChange={e => handleChangeItem('resume_projects', i, 'name', e.target.value)} />
                                    <input className="input-field mb-1 text-xs text-cyan-400" placeholder="Tech Stack" value={p.tech} onChange={e => handleChangeItem('resume_projects', i, 'tech', e.target.value)} />
                                    <textarea rows={2} className="input-field text-xs" placeholder="Description" value={p.desc} onChange={e => handleChangeItem('resume_projects', i, 'desc', e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="bg-green-900/5 border border-green-900 rounded p-6">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><GraduationCap size={20}/> 6. EDUCATION</h2><button type="button" onClick={() => handleAddItem('education', {degree: 'Degree', institution: 'Uni', year: 'Year'})} className="btn-add"><Plus size={14}/></button></div>
                            {profile.education.map((edu: any, i: number) => (
                                <div key={i} className="bg-black/40 border border-green-900/50 p-3 rounded mb-2 relative hover:border-green-500/50">
                                     <button type="button" onClick={() => handleRemoveItem('education', i)} className="absolute top-1 right-1 text-red-500"><X size={14}/></button>
                                    <input className="input-field mb-1 font-bold" placeholder="Degree" value={edu.degree} onChange={e => handleChangeItem('education', i, 'degree', e.target.value)} />
                                    <input className="input-field mb-1 text-xs" placeholder="Institution" value={edu.institution} onChange={e => handleChangeItem('education', i, 'institution', e.target.value)} />
                                    <input className="input-field text-xs text-gray-400" placeholder="Year" value={edu.year} onChange={e => handleChangeItem('education', i, 'year', e.target.value)} />
                                </div>
                            ))}
                        </div>
                     </div>

                    {/* 7. LANGUAGES */}
                    <div className="bg-green-900/5 border border-green-900 rounded p-6">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-green-400"><Share2 size={20}/> 7. LANGUAGES</h2><button type="button" onClick={() => handleAddItem('languages', {lang: 'Language', level: 'Level'})} className="btn-add"><Plus size={14}/></button></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.languages.map((l: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center bg-black/40 p-2 rounded border border-green-900/30">
                                    <input className="input-field mb-0 w-1/2" placeholder="Lang" value={l.lang} onChange={e => handleChangeItem('languages', i, 'lang', e.target.value)} />
                                    <input className="input-field mb-0 w-1/2" placeholder="Level" value={l.level} onChange={e => handleChangeItem('languages', i, 'level', e.target.value)} />
                                    <button type="button" onClick={() => handleRemoveItem('languages', i)} className="text-red-500"><X size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* SAVE BAR */}
                     <div className="sticky bottom-4 z-30">
                        <button type="submit" disabled={saving} className="bg-green-600 text-black font-bold px-6 py-4 rounded w-full hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex justify-center items-center gap-2 text-lg uppercase tracking-widest transition-all">
                            {saving ? <Activity className="animate-spin" /> : <Save />} {saving ? 'UPLOADING TO MAINFRAME...' : 'SAVE ALL CONFIGURATIONS'}
                        </button>
                     </div>
                </form>
            )}

            {/* ======================= TAB: CONTACTS ======================= */}
            {activeTab === 'contacts' && (
                <div className="bg-green-900/5 border border-green-900 rounded p-4 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><Share2 size={20}/> CONTACT NODES ({contacts.length})</h2><button onClick={() => openEditContact()} className="btn-add-primary"><Plus size={16} /> ADD NODE</button></div>
                    <div className="space-y-2">{contacts.map((c) => (<div key={c.id} className="row-item group"><div className="text-green-900 group-hover:text-green-500 cursor-move"><GripVertical size={16}/></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-bold text-white">{c.platform}</span>{!c.is_active && <span className="text-[9px] bg-red-900/50 text-red-400 px-1 rounded border border-red-900">HIDDEN</span>}</div><div className="text-xs text-gray-500">{c.value}</div></div><div className="flex gap-2"><button onClick={() => openEditContact(c)} className="text-blue-400 text-xs">EDIT</button><button onClick={() => handleDeleteContact(c.id)} className="text-red-500 text-xs">DEL</button></div></div>))}</div>
                </div>
            )}

            {/* ======================= TAB: REVIEWS ======================= */}
            {activeTab === 'reviews' && (
                <div className="bg-green-900/5 border border-green-900 rounded p-4 max-w-4xl mx-auto">
                     <h2 className="text-xl mb-4 font-bold flex items-center gap-2"><MessageSquare size={20}/> INCOMING_TRANSMISSIONS ({reviews.length})</h2>
                     <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">{reviews.map(r => (<div key={r.id} className="row-item justify-between"><div><div className="flex items-center gap-2 mb-1"><strong className="text-white text-lg">{r.name}</strong> <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900">{r.role}</span><span className="text-xs text-yellow-500">{'★'.repeat(r.rating)}</span></div><p className="text-gray-400 text-sm mt-1 italic">"{r.content}"</p></div><button onClick={() => handleDeleteReview(r.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18}/></button></div>))}</div>
                </div>
            )}
        </>
      )}

      {/* ======================= MODAL: EDIT PROJECT (Dynamic List for Gallery) ======================= */}
      <AnimatePresence>
        {isProjectModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-[#0f0f0f] border border-cyan-900/50 p-0 rounded-xl w-full max-w-4xl shadow-[0_0_50px_rgba(6,182,212,0.1)] max-h-[90vh] flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><FolderOpen size={20} className="text-cyan-500"/> {editingProject.id ? 'EDIT PROJECT' : 'CREATE NEW PROJECT'}</h3>
                        <button onClick={() => setIsProjectModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
                    </div>
                    
                    {/* Scrollable Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <form id="projectForm" onSubmit={handleSaveProject} className="space-y-8">
                            
                            {/* SECTION 1: BASIC INFO */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-widest border-b border-cyan-900/30 pb-2 mb-4">1. Project Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="lbl">Project Title <span className="text-red-500">*</span></label>
                                        <input required className="input-field text-lg font-bold" placeholder="My Awesome Project" value={editingProject.title} onChange={handleProjectTitleChange} />
                                    </div>
                                    <div>
                                        <label className="lbl">Slug (Auto-generated)</label>
                                        <input required className="input-field text-gray-500 cursor-not-allowed" readOnly value={editingProject.slug} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="lbl">Category</label>
                                        <select className="input-field appearance-none cursor-pointer" value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})}>
                                            <option value="dev">Software Development</option>
                                            <option value="iot">IoT & Embedded Systems</option>
                                            <option value="photo">Photography</option>
                                            <option value="video">Video Production</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${editingProject.is_featured ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'}`}>
                                                {editingProject.is_featured && <CheckCircle size={14} className="text-black" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={editingProject.is_featured} onChange={e => setEditingProject({...editingProject, is_featured: e.target.checked})} />
                                            <span className="text-sm text-gray-300 group-hover:text-white">Mark as "Featured"</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="lbl">Description</label>
                                    <textarea rows={4} className="input-field leading-relaxed" placeholder="Detailed explanation..." value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} />
                                </div>
                                <div>
                                     <label className="lbl">Tech Stack Tags</label>
                                    <input className="input-field" placeholder="e.g. React, Next.js (Comma separated)" value={Array.isArray(editingProject.tags) ? editingProject.tags.join(', ') : editingProject.tags} onChange={e => setEditingProject({...editingProject, tags: e.target.value.split(',').map((t:string) => t.trim())})} />
                                </div>
                            </div>

                            {/* SECTION 2: MEDIA (UPDATED GALLERY) */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest border-b border-orange-900/30 pb-2 mb-4">2. Media & Assets</h4>
                                
                                {/* Cover Image */}
                                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-start">
                                    <div>
                                        <label className="lbl">Cover Image URL</label>
                                        <input className="input-field" placeholder="https://..." value={editingProject.cover_image || ''} onChange={e => setEditingProject({...editingProject, cover_image: e.target.value})} />
                                    </div>
                                    <div className="aspect-video bg-black rounded border border-white/10 flex items-center justify-center overflow-hidden">
                                        {editingProject.cover_image ? <img src={editingProject.cover_image} className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-600">PREVIEW</span>}
                                    </div>
                                </div>

                                {/* Gallery Images (Dynamic List) */}
                                <div>
                                    <label className="lbl mb-2 block">Gallery Images (Slider)</label>
                                    <div className="space-y-2 mb-3">
                                        {(editingProject.gallery_images || []).map((url: string, index: number) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <div className="w-8 h-8 bg-black rounded border border-white/10 flex-shrink-0 overflow-hidden">
                                                    {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-600 m-auto mt-2"/>}
                                                </div>
                                                <input 
                                                    className="input-field mb-0 text-xs" 
                                                    value={url} 
                                                    onChange={(e) => handleGalleryImageChange(index, e.target.value)}
                                                    placeholder="https://image-url.com/pic.jpg"
                                                />
                                                <button type="button" onClick={() => handleRemoveGalleryImage(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={handleAddGalleryImage} className="text-xs font-bold flex items-center gap-2 text-cyan-400 hover:text-white bg-cyan-900/20 hover:bg-cyan-900/40 px-3 py-2 rounded transition-colors border border-cyan-900/50">
                                        <Plus size={14} /> ADD GALLERY IMAGE
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 3: LINKS */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest border-b border-green-900/30 pb-2 mb-4">3. External Links</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="lbl flex items-center gap-2"><LinkIcon size={12}/> Demo URL</label>
                                        <input className="input-field" placeholder="https://my-app.com" value={editingProject.demo_url || ''} onChange={e => setEditingProject({...editingProject, demo_url: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="lbl flex items-center gap-2"><Github size={12}/> Repo URL</label>
                                        <input className="input-field" placeholder="https://github.com/user/repo" value={editingProject.repo_url || ''} onChange={e => setEditingProject({...editingProject, repo_url: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 bg-[#050505] flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded font-bold transition-colors">DISCARD</button>
                        <button type="submit" form="projectForm" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2">
                            <Save size={18} /> SAVE PROJECT
                        </button>
                    </div>

                </motion.div>
             </div>
        )}
      </AnimatePresence>

      {/* ======================= MODAL: EDIT CONTACT ======================= */}
      <AnimatePresence>
        {isContactModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-black border border-green-500 p-6 rounded-lg w-full max-w-md shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                     <form onSubmit={handleSaveContact} className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Terminal size={18}/> EDIT CONTACT NODE</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="lbl">PLATFORM</label><input className="input-field" placeholder="Facebook" value={editingContact.platform} onChange={e => setEditingContact({...editingContact, platform: e.target.value})}/></div>
                            <div>
                                <label className="lbl">ICON</label>
                                <select className="input-field appearance-none" value={editingContact.icon} onChange={e => setEditingContact({...editingContact, icon: e.target.value})}>
                                    {Object.keys(IconMap).sort().map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                </select>
                            </div>
                        </div>
                        <div><label className="lbl">DISPLAY VALUE</label><input className="input-field" placeholder="@username" value={editingContact.value} onChange={e => setEditingContact({...editingContact, value: e.target.value})}/></div>
                        <div><label className="lbl">LINK (HREF)</label><input className="input-field" placeholder="https://..." value={editingContact.href} onChange={e => setEditingContact({...editingContact, href: e.target.value})}/></div>
                        
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 text-xs cursor-pointer text-white">
                                <input type="checkbox" className="accent-green-500" checked={editingContact.is_active} onChange={e => setEditingContact({...editingContact, is_active: e.target.checked})} /> ACTIVE
                            </label>
                            <label className="flex items-center gap-2 text-xs text-white">
                                ORDER: <input type="number" className="w-12 bg-white/5 border border-green-900 text-center p-1" value={editingContact.sort_order} onChange={e => setEditingContact({...editingContact, sort_order: e.target.value})} />
                            </label>
                        </div>

                         <div className="flex gap-2 pt-4">
                             <button type="button" onClick={()=>setIsContactModalOpen(false)} className="flex-1 bg-gray-800 py-2 text-white hover:bg-gray-700">CANCEL</button>
                             <button type="submit" className="flex-1 bg-green-600 py-2 text-black font-bold hover:bg-green-500">SAVE</button>
                         </div>
                     </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .tab-btn { @apply px-4 py-2 rounded flex items-center gap-2 border transition-all bg-green-900/10 border-green-900/30 text-green-600 hover:border-green-500/50 hover:text-green-400; }
        .tab-btn.active { @apply bg-green-600 text-black font-bold border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]; }
        .input-field { @apply w-full bg-black border border-green-800 p-2 text-white focus:border-green-500 outline-none rounded text-sm mb-1 font-mono transition-colors; }
        .lbl { @apply text-[10px] text-green-500 block mb-1 font-bold uppercase tracking-wider; }
        .btn-add { @apply bg-green-900/20 text-green-500 px-2 py-1 rounded text-xs border border-green-900 hover:bg-green-500 hover:text-black flex items-center gap-1 transition-all; }
        .btn-add-primary { @apply bg-green-600 text-black px-3 py-1 rounded text-sm font-bold flex items-center gap-1 hover:bg-green-500 transition-colors; }
        .row-item { @apply bg-black/40 p-3 rounded border border-green-900/30 flex items-center gap-4 hover:border-green-500/50 transition-colors; }
      `}</style>
    </div>
  )
}