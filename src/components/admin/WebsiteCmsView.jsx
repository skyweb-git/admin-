import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Image as ImageIcon, 
  Film, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ExternalLink,
  Edit3,
  Phone,
  Building,
  Building2,
  Layers,
  MapPin,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Plus,
  Trash2,
  ListPlus,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Gamepad2,
  Waves,
  ShoppingBag,
  Dumbbell,
  Dices,
  Footprints,
  PhoneCall,
  ArrowUpDown,
  Trees,
  Trophy,
  Activity,
  Target,
  PartyPopper,
  CreditCard
} from 'lucide-react';
import { 
  fetchContentFromAPI, 
  saveContentToAPI, 
  fetchAllMedia, 
  uploadMediaToAPI, 
  DEFAULT_CONTENT 
} from '../../services/cmsService';

const AVAILABLE_ICONS = [
  'Gamepad2', 'Waves', 'Building2', 'ShoppingBag', 'Dumbbell', 'Dices',
  'Footprints', 'PhoneCall', 'ArrowUpDown', 'Trees', 'ShieldCheck',
  'Trophy', 'Activity', 'Target', 'PartyPopper', 'CreditCard',
  'Sparkles', 'Heart', 'Car', 'Coffee', 'Sun'
];

export default function WebsiteCmsView() {
  const [activeSubTab, setActiveSubTab] = useState('media'); // 'media' | 'brochure' | 'hero' | 'about' | 'clubhouse' | 'amenities' | 'contact'
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const brochureFileInputRef = useRef(null);
  const [pendingUploadTarget, setPendingUploadTarget] = useState(null);

  useEffect(() => {
    loadCMSData();
  }, []);

  const loadCMSData = async () => {
    setIsLoading(true);
    try {
      const [fetchedContent, fetchedMedia] = await Promise.all([
        fetchContentFromAPI(),
        fetchAllMedia()
      ]);
      if (fetchedContent) {
        setContent({
          ...DEFAULT_CONTENT,
          ...fetchedContent,
          hero: { ...DEFAULT_CONTENT.hero, ...(fetchedContent.hero || {}) },
          about: { ...DEFAULT_CONTENT.about, ...(fetchedContent.about || {}) },
          clubhouse: { ...DEFAULT_CONTENT.clubhouse, ...(fetchedContent.clubhouse || {}) },
          contact: { ...DEFAULT_CONTENT.contact, ...(fetchedContent.contact || {}) },
          brochure: { ...DEFAULT_CONTENT.brochure, ...(fetchedContent.brochure || {}) },
          amenitiesSection: {
            ...DEFAULT_CONTENT.amenitiesSection,
            ...(fetchedContent.amenitiesSection || {}),
            items: (fetchedContent.amenitiesSection?.items && fetchedContent.amenitiesSection.items.length > 0)
              ? fetchedContent.amenitiesSection.items
              : DEFAULT_CONTENT.amenitiesSection.items
          },
          projectsSection: {
            ...DEFAULT_CONTENT.projectsSection,
            ...(fetchedContent.projectsSection || {}),
            items: (fetchedContent.projectsSection?.items && fetchedContent.projectsSection.items.length > 0)
              ? fetchedContent.projectsSection.items
              : DEFAULT_CONTENT.projectsSection.items
          }
        });
      }
      if (fetchedMedia && fetchedMedia.data) setMediaList(fetchedMedia.data);
    } catch (err) {
      console.warn('Error loading CMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await saveContentToAPI(content);
      if (res && res.success !== false) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res?.message || 'Failed to save website content to database');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerUpload = (targetKey, category, title, resourceType) => {
    setPendingUploadTarget({ key: targetKey, category, title, resourceType });
    if (fileInputRef.current) {
      fileInputRef.current.accept = resourceType === 'video' ? 'video/*' : resourceType === 'raw' ? 'application/pdf,*/*' : 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadTarget) return;

    setUploadingKey(pendingUploadTarget.key);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        const uploadRes = await uploadMediaToAPI({
          key: pendingUploadTarget.key,
          file: base64Data,
          title: pendingUploadTarget.title,
          category: pendingUploadTarget.category,
          resourceType: pendingUploadTarget.resourceType || (file.type.startsWith('video') ? 'video' : file.type.includes('pdf') ? 'raw' : 'image')
        });

        if (uploadRes.success) {
          if (pendingUploadTarget.key === 'brochurePdf' && uploadRes.data?.cloudinaryUrl) {
            setContent((prev) => ({
              ...prev,
              brochure: {
                ...(prev.brochure || {}),
                url: uploadRes.data.cloudinaryUrl
              }
            }));
          } else if (pendingUploadTarget.key.startsWith('projectImg_') && uploadRes.data?.cloudinaryUrl) {
            const pIdx = parseInt(pendingUploadTarget.key.split('_')[1], 10);
            if (!isNaN(pIdx)) {
              handleUpdateProject(pIdx, 'image', uploadRes.data.cloudinaryUrl);
            }
          }
          await loadCMSData();
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setErrorMsg(uploadRes.message || 'Cloudinary upload failed');
        }
        setUploadingKey(null);
        setPendingUploadTarget(null);
      };
    } catch (err) {
      setErrorMsg(err.message || 'File reading error');
      setUploadingKey(null);
      setPendingUploadTarget(null);
    }
    e.target.value = '';
  };

  // Amenities list manipulators
  const handleAddAmenity = () => {
    const newItems = [
      ...(content.amenitiesSection?.items || []),
      {
        name: 'New Custom Amenity',
        category: 'Leisure',
        img: '/images/Icons/playingArea.webp',
        iconName: 'Sparkles'
      }
    ];
    setContent({
      ...content,
      amenitiesSection: {
        ...(content.amenitiesSection || {}),
        items: newItems
      }
    });
  };

  const handleUpdateAmenity = (index, field, value) => {
    const updated = [...(content.amenitiesSection?.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({
      ...content,
      amenitiesSection: {
        ...(content.amenitiesSection || {}),
        items: updated
      }
    });
  };

  const handleDeleteAmenity = (index) => {
    const updated = [...(content.amenitiesSection?.items || [])];
    updated.splice(index, 1);
    setContent({
      ...content,
      amenitiesSection: {
        ...(content.amenitiesSection || {}),
        items: updated
      }
    });
  };

  const handleMoveAmenity = (index, direction) => {
    const updated = [...(content.amenitiesSection?.items || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setContent({
      ...content,
      amenitiesSection: {
        ...(content.amenitiesSection || {}),
        items: updated
      }
    });
  };

  // Projects list manipulators
  const handleAddProject = () => {
    const newItems = [
      ...(content.projectsSection?.items || []),
      {
        id: 'proj-' + Date.now(),
        title: 'New Luxury Township',
        tagline: 'Signature Luxury Community',
        location: 'ORR Exit Hub, Hyderabad',
        status: 'Upcoming Launch',
        image: 'https://res.cloudinary.com/s8b4ps7b/image/upload/v1788847939/maytri_ambhuja/gallery/gallery_001.jpg',
        specs: [
          { label: 'Project Area', value: '30 Acres' },
          { label: 'Villas', value: '200 Units' }
        ],
        features: ['3-Tier Gated Security', 'Solar Powered Township'],
        buttonText: 'For More Info'
      }
    ];
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: newItems
      }
    });
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...(content.projectsSection?.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: updated
      }
    });
  };

  const handleDeleteProject = (index) => {
    const updated = [...(content.projectsSection?.items || [])];
    updated.splice(index, 1);
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: updated
      }
    });
  };

  const handleMoveProject = (index, direction) => {
    const updated = [...(content.projectsSection?.items || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: updated
      }
    });
  };

  const handleAddProjectSpec = (projectIdx) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const specs = [...(targetProject.specs || []), { label: 'Specification', value: 'Value' }];
    targetProject.specs = specs;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const handleUpdateProjectSpec = (projectIdx, specIdx, field, value) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const specs = [...(targetProject.specs || [])];
    specs[specIdx] = { ...specs[specIdx], [field]: value };
    targetProject.specs = specs;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const handleDeleteProjectSpec = (projectIdx, specIdx) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const specs = [...(targetProject.specs || [])];
    specs.splice(specIdx, 1);
    targetProject.specs = specs;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const handleAddProjectFeature = (projectIdx) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const features = [...(targetProject.features || []), 'New Key Feature'];
    targetProject.features = features;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const handleUpdateProjectFeature = (projectIdx, featureIdx, value) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const features = [...(targetProject.features || [])];
    features[featureIdx] = value;
    targetProject.features = features;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const handleDeleteProjectFeature = (projectIdx, featureIdx) => {
    const projects = [...(content.projectsSection?.items || [])];
    const targetProject = { ...projects[projectIdx] };
    const features = [...(targetProject.features || [])];
    features.splice(featureIdx, 1);
    targetProject.features = features;
    projects[projectIdx] = targetProject;
    setContent({
      ...content,
      projectsSection: {
        ...(content.projectsSection || {}),
        items: projects
      }
    });
  };

  const getMediaUrl = (key, fallback = '') => {
    const item = mediaList.find((m) => m.key === key);
    return item?.cloudinaryUrl || fallback;
  };

  if (isLoading) {
    return (
      <div className="empty-state" style={{ minHeight: '400px' }}>
        <Loader2 size={36} className="animate-spin text-teal-600" />
        <div style={{ fontWeight: 700, marginTop: '1rem' }}>Loading Website CMS &amp; Cloud Assets...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hidden File Input for Cloudinary Uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelected} 
      />

      {/* Top CMS Header */}
      <div className="table-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="table-title" style={{ fontSize: '1.25rem' }}>
              <Globe size={20} className="text-cyan-500" />
              <span>Live Website CMS &amp; Media Studio</span>
              <span className="live-indicator" style={{ marginLeft: '0.5rem' }}>
                <span className="live-dot" />
                <span>Sync Active</span>
              </span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
              Manage website brochure PDF, Resort-Style Conveniences, slogans, pricing, and 4K media in real time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={loadCMSData}
              title="Refresh from MongoDB"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <a
              href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5173' : 'https://www.sanghicity.in'}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Preview Site</span>
              <ExternalLink size={13} />
            </a>

            <button
              className="btn btn-primary"
              onClick={handleSaveContent}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save &amp; Publish Website</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <CheckCircle size={16} />
            <span>Success! Website content, brochure link &amp; amenities published live to database!</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="nav-tabs" style={{ alignSelf: 'flex-start' }}>
        <button
          className={`nav-tab-btn ${activeSubTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('media')}
        >
          <ImageIcon size={15} />
          <span>Media &amp; Cloud Assets</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'brochure' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('brochure')}
        >
          <FileText size={15} />
          <span>Brochure PDF Kit</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'amenities' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('amenities')}
        >
          <Sparkles size={15} />
          <span>Resort Amenities</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('projects')}
        >
          <Building2 size={15} />
          <span>Our Projects</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('hero')}
        >
          <Sparkles size={15} />
          <span>Hero &amp; Headline Copy</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('about')}
        >
          <Building size={15} />
          <span>About &amp; Township Stats</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'clubhouse' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('clubhouse')}
        >
          <Layers size={15} />
          <span>Clubhouse Copy</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('contact')}
        >
          <Phone size={15} />
          <span>Contact &amp; Sales Desk</span>
        </button>
      </div>

      {/* TAB 1: MEDIA ASSETS STUDIO */}
      {activeSubTab === 'media' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Brand & Hero Media Grid */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} className="text-cyan-600" />
              <span>Core Brand &amp; Hero Background Media</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Brand Logo */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Main Brand Logo</span>
                  <span className="brand-badge admin-badge">Logo</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <img src={getMediaUrl('logo', '/ambhuja-logo.png')} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('logo', 'logo', 'Maytri Ambhuja Brand Logo', 'image')}
                  disabled={uploadingKey === 'logo'}
                >
                  {uploadingKey === 'logo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'logo' ? 'Uploading...' : 'Replace Logo on Cloud'}</span>
                </button>
              </div>

              {/* Sanghi City Logo */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Sanghi City Navbar Logo</span>
                  <span className="brand-badge emp-badge">Navbar Right</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <img src={getMediaUrl('sanghiLogo', '/sanghicity-logo.png')} alt="Sanghi Logo" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('sanghiLogo', 'logo', 'Sanghi City Logo', 'image')}
                  disabled={uploadingKey === 'sanghiLogo'}
                >
                  {uploadingKey === 'sanghiLogo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'sanghiLogo' ? 'Uploading...' : 'Replace Sanghi Logo'}</span>
                </button>
              </div>

              {/* Hero Background Poster */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Hero Poster / Cover</span>
                  <span className="brand-badge admin-badge">Image</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={getMediaUrl('heroPoster', '/hero-bg.png')} alt="Hero Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('heroPoster', 'image', 'Hero Background Poster', 'image')}
                  disabled={uploadingKey === 'heroPoster'}
                >
                  {uploadingKey === 'heroPoster' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'heroPoster' ? 'Uploading...' : 'Upload Hero Poster'}</span>
                </button>
              </div>

              {/* Hero Video Background */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Hero 4K Streaming Video</span>
                  <span className="brand-badge emp-badge">Video (MP4)</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Film size={28} className="text-teal-400" />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('heroVideo', 'video', 'Hero Background Video', 'video')}
                  disabled={uploadingKey === 'heroVideo'}
                >
                  {uploadingKey === 'heroVideo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'heroVideo' ? 'Uploading Video...' : 'Upload Video to Cloud'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROCHURE PDF KIT MANAGER */}
      {activeSubTab === 'brochure' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className="text-cyan-600" />
            <span>Project Digital Brochure &amp; PDF Kit Configuration</span>
          </h3>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Brochure PDF Download Source</span>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Direct URL link or uploaded PDF file downloaded by website prospects.</p>
              </div>
              
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleTriggerUpload('brochurePdf', 'brochure', 'Township Digital Brochure PDF', 'raw')}
                disabled={uploadingKey === 'brochurePdf'}
              >
                {uploadingKey === 'brochurePdf' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{uploadingKey === 'brochurePdf' ? 'Uploading PDF...' : 'Upload PDF File to Cloudinary'}</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Brochure PDF File Link / URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={content.brochure?.url || ''}
                  onChange={(e) => setContent({ ...content, brochure: { ...(content.brochure || {}), url: e.target.value } })}
                  placeholder="/assets/maytri-ambhuja-brochure.pdf or https://res.cloudinary.com/..."
                />
                {content.brochure?.url && (
                  <a
                    href={content.brochure.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Download size={14} />
                    <span>Test Link</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Brochure Download Modal Heading</label>
            <input
              type="text"
              className="form-input"
              value={content.brochure?.modalTitle || ''}
              onChange={(e) => setContent({ ...content, brochure: { ...(content.brochure || {}), modalTitle: e.target.value } })}
              placeholder="Download Maytri Ambhuja Brochure"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brochure Modal Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.brochure?.modalDesc || ''}
              onChange={(e) => setContent({ ...content, brochure: { ...(content.brochure || {}), modalDesc: e.target.value } })}
              placeholder="Receive the official villa township brochure featuring master plan details..."
            />
          </div>
        </div>
      )}

      {/* TAB 3: RESORT-STYLE AMENITIES MANAGER */}
      {activeSubTab === 'amenities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section Header Controls */}
          <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} className="text-cyan-600" />
              <span>Resort-Style Conveniences Header Settings</span>
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Section Eyebrow Badge</label>
                <input
                  type="text"
                  className="form-input"
                  value={content.amenitiesSection?.eyebrowTag || ''}
                  onChange={(e) => setContent({ ...content, amenitiesSection: { ...(content.amenitiesSection || {}), eyebrowTag: e.target.value } })}
                  placeholder="RESORT-STYLE CONVENIENCES"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section Main Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={content.amenitiesSection?.title || ''}
                  onChange={(e) => setContent({ ...content, amenitiesSection: { ...(content.amenitiesSection || {}), title: e.target.value } })}
                  placeholder="Amenities"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Section Subtitle</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={content.amenitiesSection?.subtitle || ''}
                onChange={(e) => setContent({ ...content, amenitiesSection: { ...(content.amenitiesSection || {}), subtitle: e.target.value } })}
                placeholder="A comprehensive suite of modern lifestyle, wellness, sports, and daily conveniences curated for all age groups."
              />
            </div>
          </div>

          {/* Dynamic Amenities List Editor */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ListPlus size={18} className="text-cyan-600" />
                  <span>Amenities Grid Items ({content.amenitiesSection?.items?.length || 0})</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Add, edit, reorder or remove individual township amenities displayed on the site.</p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddAmenity}
              >
                <Plus size={14} />
                <span>Add New Amenity</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(content.amenitiesSection?.items || []).map((item, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: 'auto 1fr 140px 140px auto', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#64748b', width: '24px', textAlign: 'center' }}>#{idx + 1}</span>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={item.name || ''}
                      onChange={(e) => handleUpdateAmenity(idx, 'name', e.target.value)}
                      placeholder="Amenity Name (e.g. Swimming Pool)"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={item.category || ''}
                      onChange={(e) => handleUpdateAmenity(idx, 'category', e.target.value)}
                      placeholder="Category (e.g. Wellness)"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <select
                      className="form-input"
                      value={item.iconName || 'Sparkles'}
                      onChange={(e) => handleUpdateAmenity(idx, 'iconName', e.target.value)}
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px' }}
                      onClick={() => handleMoveAmenity(idx, -1)}
                      disabled={idx === 0}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px' }}
                      onClick={() => handleMoveAmenity(idx, 1)}
                      disabled={idx === (content.amenitiesSection?.items?.length || 0) - 1}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => handleDeleteAmenity(idx)}
                      title="Delete Amenity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HERO & HEADLINE COPY */}
      {activeSubTab === 'hero' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} className="text-cyan-600" />
            <span>Hero Headline &amp; Slogan Configuration</span>
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Developer Eyebrow Badge</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.eyebrowBadge || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrowBadge: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telangana RERA Registration Number</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.reraNumber || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, reraNumber: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Hero H1 Title</label>
            <input
              type="text"
              className="form-input"
              value={content.hero?.title || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subheading</label>
            <input
              type="text"
              className="form-input"
              value={content.hero?.subheading || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheading: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Supporting Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.hero?.description || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Starting Villa Price</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.startingPrice || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, startingPrice: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Token Advance Booking Amount</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.tokenAdvance || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, tokenAdvance: e.target.value } })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ABOUT & TOWNSHIP STATS */}
      {activeSubTab === 'about' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} className="text-cyan-600" />
            <span>About Section &amp; Township Statistics</span>
          </h3>

          <div className="form-group">
            <label className="form-label">About Section Title</label>
            <input
              type="text"
              className="form-input"
              value={content.about?.sectionTitle || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, sectionTitle: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About Tagline</label>
            <input
              type="text"
              className="form-input"
              value={content.about?.tagline || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, tagline: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description Paragraph 1</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.about?.description1 || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description1: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description Paragraph 2</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.about?.description2 || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description2: e.target.value } })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Villas Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.totalVillas || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, totalVillas: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Acres Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.totalAcres || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, totalAcres: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clubhouse Size Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.clubhouseSize || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, clubhouseSize: e.target.value } })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CLUBHOUSE COPY */}
      {activeSubTab === 'clubhouse' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} className="text-cyan-600" />
            <span>Clubhouse &amp; Amenities Copy</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Clubhouse Title</label>
            <input
              type="text"
              className="form-input"
              value={content.clubhouse?.title || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, title: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clubhouse Tagline</label>
            <input
              type="text"
              className="form-input"
              value={content.clubhouse?.tagline || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, tagline: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clubhouse Overview Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.clubhouse?.description || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, description: e.target.value } })}
            />
          </div>
        </div>
      )}

      {/* TAB 7: CONTACT & LOCATION */}
      {activeSubTab === 'contact' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} className="text-cyan-600" />
            <span>Sales Desk &amp; Location Information</span>
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Sales Hotline Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.phone || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official WhatsApp Enquiry Number</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.whatsapp || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Official Contact Email (info@sanghicity.in)</label>
              <input
                type="email"
                className="form-input"
                value={content.contact?.email || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                placeholder="info@sanghicity.in"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website URL (www.sanghicity.in)</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.websiteUrl || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, websiteUrl: e.target.value } })}
                placeholder="https://www.sanghicity.in"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office &amp; Site Visiting Hours</label>
            <input
              type="text"
              className="form-input"
              value={content.contact?.officeHours || ''}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, officeHours: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Site Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={content.contact?.siteAddress || ''}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, siteAddress: e.target.value } })}
            />
          </div>
        </div>
      )}

      {/* TAB 8: OUR PROJECTS MANAGER */}
      {activeSubTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section Header Controls */}
          <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} className="text-cyan-600" />
              <span>Our Projects Section Header Settings</span>
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Section Eyebrow Badge</label>
                <input
                  type="text"
                  className="form-input"
                  value={content.projectsSection?.eyebrowTag || ''}
                  onChange={(e) => setContent({ ...content, projectsSection: { ...(content.projectsSection || {}), eyebrowTag: e.target.value } })}
                  placeholder="LANDMARK DEVELOPMENTS"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section Main Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={content.projectsSection?.title || ''}
                  onChange={(e) => setContent({ ...content, projectsSection: { ...(content.projectsSection || {}), title: e.target.value } })}
                  placeholder="Our Projects"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Section Subtitle</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={content.projectsSection?.subtitle || ''}
                onChange={(e) => setContent({ ...content, projectsSection: { ...(content.projectsSection || {}), subtitle: e.target.value } })}
                placeholder="Explore premier master-planned townships..."
              />
            </div>
          </div>

          {/* Projects Cards List Manager */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ListPlus size={18} className="text-cyan-600" />
                  <span>Projects List ({content.projectsSection?.items?.length || 0})</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Create, edit, reorder or delete project cards displayed in the "Our Projects" section.</p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddProject}
              >
                <Plus size={14} />
                <span>Add New Project</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(content.projectsSection?.items || []).map((project, pIdx) => (
                <div key={pIdx} style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Project Card Top Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', pb: '0.75rem', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 800, background: '#0b132b', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        Project #{pIdx + 1}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                        {project.title || 'Untitled Project'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleMoveProject(pIdx, -1)}
                        disabled={pIdx === 0}
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleMoveProject(pIdx, 1)}
                        disabled={pIdx === (content.projectsSection?.items?.length || 0) - 1}
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteProject(pIdx)}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Project Basic Info */}
                  <div className="form-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Project Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={project.title || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'title', e.target.value)}
                        placeholder="e.g. Maytri Ambhuja"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Tagline / Subheading</label>
                      <input
                        type="text"
                        className="form-input"
                        value={project.tagline || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'tagline', e.target.value)}
                        placeholder="e.g. Flagship 55-Acre Villa Township"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Location Text</label>
                      <input
                        type="text"
                        className="form-input"
                        value={project.location || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'location', e.target.value)}
                        placeholder="e.g. Sanghi City, Near ORR Exit 11, Hyderabad"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Status Badge Text</label>
                      <input
                        type="text"
                        className="form-input"
                        value={project.status || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'status', e.target.value)}
                        placeholder="e.g. Ready for VIP Booking"
                      />
                    </div>
                  </div>

                  {/* Image URL & Upload */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Project Cover Image URL</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={project.image || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'image', e.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => handleTriggerUpload(`projectImg_${pIdx}`, 'project', project.title || 'Project Cover Image', 'image')}
                        disabled={uploadingKey === `projectImg_${pIdx}`}
                      >
                        {uploadingKey === `projectImg_${pIdx}` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>{uploadingKey === `projectImg_${pIdx}` ? 'Uploading...' : 'Upload Image'}</span>
                      </button>
                    </div>

                    {project.image && (
                      <div style={{ marginTop: '0.5rem', width: '140px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Specifications Grid Editor */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Specifications Grid ({project.specs?.length || 0})</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleAddProjectSpec(pIdx)}
                      >
                        <Plus size={12} />
                        <span>Add Spec</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                      {(project.specs || []).map((spec, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            value={spec.label || ''}
                            onChange={(e) => handleUpdateProjectSpec(pIdx, sIdx, 'label', e.target.value)}
                            placeholder="Label (e.g. Area)"
                          />
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            value={spec.value || ''}
                            onChange={(e) => handleUpdateProjectSpec(pIdx, sIdx, 'value', e.target.value)}
                            placeholder="Value (e.g. 55 Acres)"
                          />
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px', color: '#dc2626' }}
                            onClick={() => handleDeleteProjectSpec(pIdx, sIdx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Features Bullet List Editor */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Key Feature Highlights ({project.features?.length || 0})</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleAddProjectFeature(pIdx)}
                      >
                        <Plus size={12} />
                        <span>Add Bullet</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(project.features || []).map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <CheckCircle size={14} className="text-emerald-600" />
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={feat || ''}
                            onChange={(e) => handleUpdateProjectFeature(pIdx, fIdx, e.target.value)}
                            placeholder="Bullet feature description..."
                          />
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px', color: '#dc2626' }}
                            onClick={() => handleDeleteProjectFeature(pIdx, fIdx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
