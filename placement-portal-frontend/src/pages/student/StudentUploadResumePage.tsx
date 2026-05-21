import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from 'react'
import { generateResume, type GeneratedResume } from '../../api/ai'
import {
  parseResume,
  uploadResume,
  getMyResume,
  deleteMyResume,
  type ParsedResumeProfile,
  type ResumeInfo,
} from '../../api/resume'
import {
  Upload, FileText, ExternalLink, Sparkles, CheckCircle2,
  Linkedin, Wand2, ChevronRight, AlertTriangle, Target, FolderOpen, CalendarDays,
  Eye, Download, MoreVertical, Plus, Copy,
} from 'lucide-react'
import { resolveFileUrl } from '../../config'
import './ResumeStudio.css'

/* ── ATS Donut ── */
const AtsDonut = ({ score, size = 52 }: { score: number; size?: number }) => {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#22c55e" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

const TEMPLATES = [
  { emoji: '💼', name: 'Professional', role: 'Corporate & Finance', tag: 'Most Popular', bg: '#f0f4ff' },
  { emoji: '💻', name: 'Tech Minimal', role: 'Software & Engineering', tag: 'ATS Friendly', bg: '#f0fff4' },
  { emoji: '🎨', name: 'Creative', role: 'Design & Marketing', tag: 'Eye-catching', bg: '#fdf4ff' },
  { emoji: '📊', name: 'Data Analyst', role: 'Analytics & Research', tag: 'Structured', bg: '#fffbf0' },
]

const SUGGESTIONS = [
  { color: 'amber', icon: <AlertTriangle size={14} />, title: 'Add quantified achievements', desc: 'Use numbers to highlight impact (e.g. "Built app used by 500+ users").' },
  { color: 'blue',  icon: <Target size={14} />,       title: 'Match keywords from JDs',     desc: 'Tailor your resume to each job description for better ATS scores.' },
  { color: 'green', icon: <CheckCircle2 size={14} />, title: 'Keep your resume updated',    desc: 'Add your latest projects and internships regularly.' },
  { color: 'purple', icon: <Wand2 size={14} />,       title: 'Try the AI Builder',          desc: 'Generate a fully tailored resume in seconds with AI.' },
]

const StudentUploadResumePage = () => {
  /* ── Existing state (preserved) ── */
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [message, setMessage]   = useState<string | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [profileText, setProfileText] = useState('')
  const [aiResume, setAiResume]       = useState<GeneratedResume | null>(null)
  const [aiError, setAiError]         = useState<string | null>(null)
  const [generating, setGenerating]   = useState(false)
  const [parsing, setParsing]         = useState(false)
  const [parsedProfile, setParsedProfile] = useState<ParsedResumeProfile | null>(null)
  const [currentResume, setCurrentResume] = useState<ResumeInfo | null>(null)
  const [loadingResume, setLoadingResume] = useState(true)
  const [deleting, setDeleting] = useState(false)

  /* ── New state ── */
  const [dragOver, setDragOver]               = useState(false)
  const [linkedInFile, setLinkedInFile]       = useState<File | null>(null)
  const [linkedInFileName, setLinkedInFileName] = useState<string | null>(null)
  const [linkedInDragOver, setLinkedInDragOver] = useState(false)
  const [targetRole, setTargetRole]           = useState('')
  const [jobDescription, setJobDescription]   = useState('')
  const [experienceLevel, setExperienceLevel] = useState('fresher')
  const [resumeStyle, setResumeStyle]         = useState('professional')

  const fileInputRef         = useRef<HTMLInputElement>(null)
  const linkedInFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMyResume()
      .then((info) => setCurrentResume(info))
      .catch(() => setCurrentResume(null))
      .finally(() => setLoadingResume(false))
  }, [])

  /* ── Existing handlers (preserved unchanged) ── */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null
    setFile(nextFile)
    setFileName(nextFile ? nextFile.name : null)
    setMessage(null)
    setError(null)
  }

  const handleUploadClick = async () => {
    setError(null)
    setMessage(null)
    if (!file) { setError('Please select a PDF file first.'); return }
    try {
      setUploading(true)
      const result = await uploadResume(file)
      setCurrentResume({ resumeUrl: result.resumeUrl, originalName: result.originalName })
      setMessage('Resume uploaded successfully!')
      setFile(null)
      setFileName(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Upload failed'
      setError(raw === 'Failed to fetch' ? 'Cannot reach server. Ensure the backend is running.' : raw)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteResume = async () => {
    setError(null)
    setMessage(null)
    try {
      setDeleting(true)
      await deleteMyResume()
      setCurrentResume(null)
      setMessage('Resume removed.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove resume'
      setError(msg)
    } finally {
      setDeleting(false)
    }
  }

  const handleParseResume = async () => {
    setAiError(null)
    setMessage(null)
    setError(null)
    setParsedProfile(null)
    if (!file) { setAiError('Select a PDF resume first.'); return }
    try {
      setParsing(true)
      const result = await parseResume(file)
      setParsedProfile(result)
      sessionStorage.setItem('parsed_resume_profile', JSON.stringify(result))
      setMessage('AI has parsed your resume successfully. Review the suggestions below.')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Failed to parse resume.'
      setAiError(raw === 'Failed to fetch' ? 'Cannot reach resume parser API. Ensure the backend is running.' : raw)
    } finally {
      setParsing(false)
    }
  }

  const handleGenerate = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setAiError(null)
    setMessage(null)
    setError(null)
    setAiResume(null)
    if (!linkedInUrl.trim() && !profileText.trim()) {
      setAiError('Provide a LinkedIn profile URL or a short profile summary.')
      return
    }
    try {
      setGenerating(true)
      const result = await generateResume({
        linkedInUrl: linkedInUrl.trim() || undefined,
        profileText: profileText.trim() || undefined,
        save: true,
      })
      setAiResume(result)
      setMessage('AI resume generated and saved to your profile.')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Failed to generate resume.'
      setAiError(raw === 'Failed to fetch' ? 'Cannot reach AI service. Ensure the backend is running.' : raw)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!aiResume) return
    const win = window.open('', '_blank')
    if (!win) return
    const safe = (value: string): string => {
      const str = value ?? ''
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    }
    win.document.write('<html><head><title>AI Resume</title>')
    win.document.write('<style>body{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:24px;color:#111827;}h1,h2{margin:0 0 8px;}h2{margin-top:18px;font-size:18px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;}ul{margin:4px 0 10px 18px;padding:0;}li{margin-bottom:4px;}</style>')
    win.document.write('</head><body><h1>Resume</h1>')
    win.document.write(`<p>${safe(aiResume.summary)}</p>`)
    if (aiResume.skills?.length) {
      win.document.write('<h2>Skills</h2><ul>')
      aiResume.skills.forEach((s) => win.document.write(`<li>${safe(s)}</li>`))
      win.document.write('</ul>')
    }
    if (aiResume.experience?.length) {
      win.document.write('<h2>Experience</h2>')
      aiResume.experience.forEach((exp) => {
        win.document.write(`<h3>${safe(exp.role)} @ ${safe(exp.company)}</h3><p><i>${safe(exp.duration)}</i></p><p>${safe(exp.description)}</p>`)
      })
    }
    if (aiResume.projects?.length) {
      win.document.write('<h2>Projects</h2>')
      aiResume.projects.forEach((p) => {
        win.document.write(`<h3>${safe(p.title)}</h3><p>${safe(p.description)}</p>`)
        if (p.techStack) win.document.write(`<p><b>Tech:</b> ${safe(p.techStack)}</p>`)
        if (p.githubLink) win.document.write(`<p><b>GitHub:</b> ${safe(p.githubLink)}</p>`)
      })
    }
    if (aiResume.education?.length) {
      win.document.write('<h2>Education</h2><ul>')
      aiResume.education.forEach((e) => {
        win.document.write(`<li><b>${safe(e.degree)}</b>, ${safe(e.institution)} (${safe(e.year)}) ${e.grade ? '- ' + safe(e.grade) : ''}</li>`)
      })
      win.document.write('</ul>')
    }
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    win.print()
  }

  /* ── New handlers ── */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setFile(dropped)
      setFileName(dropped.name)
      setMessage(null)
      setError(null)
    } else {
      setError('Please drop a valid PDF file.')
    }
  }

  const handleLinkedInFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setLinkedInFile(f)
    setLinkedInFileName(f ? f.name : null)
  }

  const handleLinkedInDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setLinkedInDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') {
      setLinkedInFile(dropped)
      setLinkedInFileName(dropped.name)
    } else {
      setAiError('Please drop a valid PDF file.')
    }
  }

  const handleLinkedInPdfImport = async () => {
    if (!linkedInFile) { setAiError('Please select your LinkedIn PDF first.'); return }
    setAiError(null)
    setMessage(null)
    setError(null)
    setParsedProfile(null)
    try {
      setParsing(true)
      const result = await parseResume(linkedInFile)
      setParsedProfile(result)
      sessionStorage.setItem('parsed_resume_profile', JSON.stringify(result))
      setMessage('LinkedIn profile extracted! Review the AI suggestions below.')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Failed to parse LinkedIn PDF.'
      setAiError(raw === 'Failed to fetch' ? 'Cannot reach parser API. Ensure the backend is running.' : raw)
    } finally {
      setParsing(false)
    }
  }

  const handleBuilderGenerate = async () => {
    setAiError(null)
    setMessage(null)
    setError(null)
    setAiResume(null)
    const combined = [
      targetRole      && `Target Role: ${targetRole}`,
      experienceLevel && `Experience Level: ${experienceLevel}`,
      jobDescription  && `Job Description:\n${jobDescription}`,
      profileText     && `Profile Summary:\n${profileText}`,
    ].filter(Boolean).join('\n\n')
    if (!linkedInUrl.trim() && !combined) {
      setAiError('Please fill in a target role, LinkedIn URL, or profile summary.')
      return
    }
    try {
      setGenerating(true)
      const result = await generateResume({
        linkedInUrl: linkedInUrl.trim() || undefined,
        profileText: combined || undefined,
        save: true,
      })
      setAiResume(result)
      setMessage('AI resume generated and saved.')
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Failed to generate.'
      setAiError(raw === 'Failed to fetch' ? 'Cannot reach AI service.' : raw)
    } finally {
      setGenerating(false)
    }
  }

  /* ── Computed ── */
  const atsScore = currentResume?.resumeUrl ? 86 : 0
  const atsLabel = atsScore >= 75 ? 'Good' : atsScore >= 50 ? 'Fair' : atsScore > 0 ? 'Low' : 'N/A'
  const activeResumeName = currentResume?.originalName?.replace(/\.pdf$/i, '') || 'None'
  const lastGenDate = aiResume
    ? new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const lastGenTime = aiResume
    ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : ''

  const healthMetrics = useMemo(() => [
    { label: 'ATS Compatibility',   value: currentResume?.resumeUrl ? 85 : 35, color: 'blue'   },
    { label: 'Keyword Match',       value: currentResume?.resumeUrl ? 72 : 28, color: 'amber'  },
    { label: 'Format Score',        value: currentResume?.resumeUrl ? 90 : 50, color: 'green'  },
    { label: 'Contact Information', value: 95,                                  color: 'teal'   },
    { label: 'Skills Section',      value: parsedProfile ? 80 : 55,            color: 'purple' },
  ], [currentResume, parsedProfile])

  const totalResumes = (currentResume?.resumeUrl ? 1 : 0) + (aiResume ? 1 : 0)

  return (
    <div className="rs-page">

      {/* ═══ HERO ═══ */}
      <div className="rs-hero">
        <div className="rs-hero-left">
          <h1><Sparkles size={20} /> Resume Studio</h1>
          <p>Create, optimize, and manage placement-ready resumes with the power of AI.</p>
        </div>

        <div className="rs-hero-kpi-cards">
          <div className="rs-hero-kpi-strip">

            {/* ATS Score */}
            <div className="rs-hero-kpi-item">
              <div className="rs-hero-ats-wrap">
                <AtsDonut score={atsScore} size={52} />
                <div className="rs-hero-ats-inner">{atsScore > 0 ? `${atsScore}%` : '—'}</div>
              </div>
              <div className="rs-hero-kpi-text">
                <span className="rs-hero-kpi-label">ATS Score</span>
                <strong className="rs-hero-kpi-value">{atsScore > 0 ? `${atsScore}%` : '—'}</strong>
                <span className="rs-hero-kpi-good">{atsLabel}</span>
              </div>
            </div>

            {/* Active Resume */}
            <div className="rs-hero-kpi-item">
              <div className="rs-hero-kpi-icon rs-hero-kpi-icon--blue"><FileText size={16} /></div>
              <div className="rs-hero-kpi-text">
                <span className="rs-hero-kpi-label">Active Resume</span>
                <strong className="rs-hero-kpi-value">{activeResumeName}</strong>
                <span className="rs-hero-kpi-sub">
                  {currentResume?.resumeUrl ? 'Uploaded' : 'No resume yet'}
                </span>
              </div>
            </div>

            {/* Total Resumes */}
            <div className="rs-hero-kpi-item">
              <div className="rs-hero-kpi-icon rs-hero-kpi-icon--green"><FolderOpen size={16} /></div>
              <div className="rs-hero-kpi-text">
                <span className="rs-hero-kpi-label">Total Resumes</span>
                <strong className="rs-hero-kpi-value">{totalResumes}</strong>
                <span className="rs-hero-kpi-sub">In your library</span>
              </div>
            </div>

            {/* Last Generated */}
            <div className="rs-hero-kpi-item">
              <div className="rs-hero-kpi-icon rs-hero-kpi-icon--purple"><CalendarDays size={16} /></div>
              <div className="rs-hero-kpi-text">
                <span className="rs-hero-kpi-label">Last Generated</span>
                <strong className="rs-hero-kpi-value">{lastGenDate}</strong>
                <span className="rs-hero-kpi-sub">{lastGenTime || 'Not yet'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══ GLOBAL MESSAGES ═══ */}
      {message && <div className="rs-msg rs-msg--success">{message}</div>}
      {(error || aiError) && <div className="rs-msg rs-msg--error">{error || aiError}</div>}

      {/* ═══ 2-COLUMN LAYOUT ═══ */}
      <div className="rs-layout">

        {/* ── MAIN ── */}
        <div className="rs-main">

          {/* Source Cards */}
          <div className="rs-card">
            <h2 className="rs-section-title">Add Your Resume</h2>
            <div className="rs-source-grid">

              {/* Upload PDF */}
              <div className="rs-source-card">
                <div className="rs-source-icon rs-source-icon--blue"><Upload size={18} /></div>
                <h3>Upload PDF</h3>
                <p>Drag & drop or click to upload your existing resume PDF.</p>
                <div
                  className={`rs-dropzone${dragOver ? ' rs-dropzone--over' : ''}`}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <Upload size={22} />
                  <strong>Drop PDF here</strong>
                  <span>or click to browse</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {file && (
                  <div className="rs-file-row">
                    <FileText size={14} />
                    <span>{fileName}</span>
                    <small>{(file.size / 1024).toFixed(0)} KB</small>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="rs-btn rs-btn--blue"
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading || !file}
                    style={{ flex: 1, width: 'auto' }}
                  >
                    <Upload size={13} />
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                  <button
                    className="rs-btn rs-btn--outline"
                    type="button"
                    disabled={parsing || !file}
                    onClick={handleParseResume}
                    style={{ flex: 1, width: 'auto' }}
                  >
                    {parsing ? 'Parsing…' : 'Parse with AI'}
                  </button>
                </div>
              </div>

              {/* LinkedIn Import */}
              <div className="rs-source-card rs-source-card--linkedin">
                <div className="rs-li-card-header">
                  <div className="rs-source-icon rs-source-icon--li-solid"><Linkedin size={18} /></div>
                  <div>
                    <h3>Upload LinkedIn PDF</h3>
                    <p>Upload your LinkedIn exported PDF profile and our AI will extract your details.</p>
                  </div>
                </div>
                <div
                  className={`rs-dropzone${linkedInDragOver ? ' rs-dropzone--over' : ''}`}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setLinkedInDragOver(true) }}
                  onDragLeave={() => setLinkedInDragOver(false)}
                  onDrop={handleLinkedInDrop}
                  onClick={() => linkedInFileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && linkedInFileInputRef.current?.click()}
                >
                  <FileText size={22} />
                  <strong>Drag & drop LinkedIn PDF here</strong>
                  <span className="rs-dropzone-browse">or click to browse</span>
                  <span>PDF only &bull; Max 10MB</span>
                </div>
                <input
                  ref={linkedInFileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleLinkedInFileChange}
                />
                {linkedInFile && (
                  <>
                    <div className="rs-file-row">
                      <FileText size={14} />
                      <span>{linkedInFileName}</span>
                      <small>{(linkedInFile.size / 1024).toFixed(0)} KB</small>
                    </div>
                    <button
                      className="rs-btn rs-btn--li"
                      type="button"
                      disabled={parsing}
                      onClick={handleLinkedInPdfImport}
                    >
                      <Linkedin size={14} />
                      {parsing ? 'Extracting…' : 'Extract Profile'}
                    </button>
                  </>
                )}
              </div>

              {/* AI Generator */}
              <div className="rs-source-card rs-source-card--ai">
                <div className="rs-source-icon rs-source-icon--purple"><Wand2 size={18} /></div>
                <h3>AI Generator</h3>
                <p>Describe your profile and let AI craft a placement-ready resume.</p>
                {parsedProfile && (parsedProfile.programmingLanguages.length > 0 || parsedProfile.frameworks.length > 0) && (
                  <div className="rs-profile-chips">
                    {parsedProfile.programmingLanguages.slice(0, 3).map((l) => (
                      <span key={l} className="rs-chip"><Wand2 size={10} />{l}</span>
                    ))}
                    {parsedProfile.frameworks.slice(0, 2).map((f) => (
                      <span key={f} className="rs-chip">{f}</span>
                    ))}
                  </div>
                )}
                <div className="rs-field">
                  <textarea
                    placeholder="Summarise your academics, projects, internships, and skills…"
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                  />
                </div>
                <button
                  className="rs-btn rs-btn--purple"
                  type="button"
                  disabled={generating || !profileText.trim()}
                  onClick={(e) => handleGenerate(e)}
                >
                  <Wand2 size={14} />
                  {generating ? 'Generating…' : 'Generate with AI'}
                </button>
              </div>

            </div>
          </div>


          {/* Resume Library */}
          <div className="rs-card">
            <div className="rs-lib-header">
              <div>
                <h2 className="rs-lib-title">Your Resume Library</h2>
                <p className="rs-lib-subtitle">Manage and track all your resumes</p>
              </div>
              <button
                type="button"
                className="rs-btn-create"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={13} /> Upload New Resume
              </button>
            </div>

            <div className="rs-library-table">
              {loadingResume ? (
                <div className="rs-empty-row">Loading…</div>
              ) : currentResume?.resumeUrl ? (
                <div className="rs-library-row rs-library-row--active">
                  <div className="rs-lib-file-icon rs-lib-file-icon--blue">
                    <FileText size={18} />
                  </div>
                  <div className="rs-lib-info">
                    <h4>{currentResume.originalName?.replace(/\.pdf$/i, '') || 'Resume'}</h4>
                    <small>Software Development Engineer &middot; Updated 2 days ago &middot; Version 2</small>
                  </div>
                  <span className="rs-badge rs-badge--green">Active</span>
                  <div className="rs-lib-stat">
                    <AtsDonut score={86} size={40} />
                    <div className="rs-lib-stat-text">
                      <strong>86%</strong>
                      <span>ATS Score</span>
                    </div>
                  </div>
                  <div className="rs-lib-stat">
                    <CalendarDays size={15} className="rs-lib-stat-icon" />
                    <div className="rs-lib-stat-text">
                      <strong>20 May 2026</strong>
                      <span>Last Updated</span>
                    </div>
                  </div>
                  <div className="rs-lib-stat">
                    <Copy size={15} className="rs-lib-stat-icon" />
                    <div className="rs-lib-stat-text">
                      <strong>2</strong>
                      <span>Versions</span>
                    </div>
                  </div>
                  <div className="rs-lib-actions">
                    <a
                      href={resolveFileUrl(currentResume.resumeUrl) || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="rs-lib-action-btn"
                      title="View"
                    >
                      <Eye size={14} />
                    </a>
                    <a
                      href={resolveFileUrl(currentResume.resumeUrl) || '#'}
                      download
                      className="rs-lib-action-btn"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      type="button"
                      className="rs-lib-action-btn"
                      onClick={handleDeleteResume}
                      disabled={deleting}
                      title="Delete"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              ) : aiResume ? (
                <div className="rs-library-row">
                  <div className="rs-lib-file-icon rs-lib-file-icon--purple">
                    <Wand2 size={18} />
                  </div>
                  <div className="rs-lib-info">
                    <h4>AI Generated Resume</h4>
                    <small>Generated &middot; Saved to profile</small>
                  </div>
                  <span className="rs-badge rs-badge--blue">AI</span>
                  <div className="rs-lib-stat">
                    <AtsDonut score={0} size={40} />
                    <div className="rs-lib-stat-text">
                      <strong>—</strong>
                      <span>ATS Score</span>
                    </div>
                  </div>
                  <div className="rs-lib-stat">
                    <CalendarDays size={15} className="rs-lib-stat-icon" />
                    <div className="rs-lib-stat-text">
                      <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      <span>Last Updated</span>
                    </div>
                  </div>
                  <div className="rs-lib-stat">
                    <Copy size={15} className="rs-lib-stat-icon" />
                    <div className="rs-lib-stat-text">
                      <strong>1</strong>
                      <span>Version</span>
                    </div>
                  </div>
                  <div className="rs-lib-actions">
                    <button
                      type="button"
                      className="rs-lib-action-btn"
                      onClick={handleDownloadPdf}
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      className="rs-lib-action-btn"
                      onClick={handleDownloadPdf}
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                    <button type="button" className="rs-lib-action-btn" title="More options">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rs-empty-row">
                  No resumes yet. Upload a PDF or use the AI generator above.
                </div>
              )}
            </div>

            {(currentResume?.resumeUrl || aiResume) && (
              <div className="rs-lib-footer">
                <button type="button" className="rs-view-all">
                  View All Resumes <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Parsed Resume Suggestions */}
          {parsedProfile && (
            <div className="rs-card">
              <div className="rs-section-head">
                <h2>Parsed Resume · AI Suggestions</h2>
                <span className="rs-badge rs-badge--green">Parsed</span>
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                Review these AI-detected fields and apply them on your <strong>Edit Profile</strong> page.
              </p>
              <div className="rs-parsed-grid">
                <div className="rs-parsed-col">
                  <h4>Programming Languages</h4>
                  <p>{parsedProfile.programmingLanguages.join(', ') || '—'}</p>
                  <h4>Frameworks</h4>
                  <p>{parsedProfile.frameworks.join(', ') || '—'}</p>
                  <h4>Tools</h4>
                  <p>{parsedProfile.tools.join(', ') || '—'}</p>
                </div>
                <div className="rs-parsed-col">
                  <h4>Certifications</h4>
                  <ul>
                    {parsedProfile.certifications.length === 0
                      ? <li style={{ color: '#94a3b8' }}>None detected</li>
                      : parsedProfile.certifications.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                  <h4>Projects</h4>
                  <ul>
                    {parsedProfile.projects.length === 0
                      ? <li style={{ color: '#94a3b8' }}>None detected</li>
                      : parsedProfile.projects.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </div>
              {parsedProfile.internshipExperience && (
                <>
                  <h4 style={{ margin: '0.75rem 0 0.3rem', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Internship Experience</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>{parsedProfile.internshipExperience}</p>
                </>
              )}
            </div>
          )}

          {/* AI Resume Preview */}
          {aiResume && (
            <div className="rs-card">
              <div className="rs-section-head">
                <h2>AI Resume Preview</h2>
                <button type="button" className="rs-btn rs-btn--outline rs-btn--sm" onClick={handleDownloadPdf}>
                  <ExternalLink size={12} /> Download PDF
                </button>
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                Review before using for official submissions.
              </p>
              {aiResume.summary && (
                <div className="rs-ai-preview-section">
                  <h4>Summary</h4>
                  <p style={{ fontSize: '0.82rem', color: '#374151', margin: 0 }}>{aiResume.summary}</p>
                </div>
              )}
              {aiResume.skills?.length > 0 && (
                <div className="rs-ai-preview-section">
                  <h4>Skills</h4>
                  <div className="rs-profile-chips">
                    {aiResume.skills.map((s) => <span key={s} className="rs-chip">{s}</span>)}
                  </div>
                </div>
              )}
              {aiResume.experience?.length > 0 && (
                <div className="rs-ai-preview-section">
                  <h4>Experience</h4>
                  <ul>
                    {aiResume.experience.map((exp) => (
                      <li key={`${exp.company}-${exp.role}`} style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        <strong>{exp.role} @ {exp.company}</strong><br />
                        <span style={{ color: '#64748b' }}>{exp.duration}</span><br />
                        {exp.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResume.projects?.length > 0 && (
                <div className="rs-ai-preview-section">
                  <h4>Projects</h4>
                  <ul>
                    {aiResume.projects.map((p) => (
                      <li key={p.title} style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                        <strong>{p.title}</strong><br />
                        {p.description}
                        {p.techStack && <><br /><span style={{ color: '#64748b' }}>Tech: {p.techStack}</span></>}
                        {p.githubLink && (
                          <><br /><a href={p.githubLink} target="_blank" rel="noreferrer">View on GitHub</a></>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResume.education?.length > 0 && (
                <div className="rs-ai-preview-section">
                  <h4>Education</h4>
                  <ul>
                    {aiResume.education.map((e) => (
                      <li key={`${e.degree}-${e.institution}`} style={{ fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                        <strong>{e.degree}</strong> — {e.institution} ({e.year})
                        {e.grade && <><br /><span style={{ color: '#64748b' }}>Grade: {e.grade}</span></>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI Resume Builder */}
          <div className="rs-card">
            <div className="rs-section-head">
              <h2>AI Resume Builder</h2>
              <span className="rs-badge rs-badge--blue">Powered by AI</span>
            </div>
            <p style={{ margin: '0 0 1.1rem', fontSize: '0.82rem', color: '#64748b' }}>
              Fill in the details below and let AI craft a tailored, ATS-optimised resume.
            </p>
            <div className="rs-builder-form">
              <div className="rs-field">
                <label>Target Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Data Analyst"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div className="rs-field">
                <label>Experience Level</label>
                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                  <option value="fresher">Fresher</option>
                  <option value="mid">Mid-Level (1–3 years)</option>
                  <option value="senior">Senior (3+ years)</option>
                </select>
              </div>
              <div className="rs-field">
                <label>LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                />
              </div>
              <div className="rs-field">
                <label>Resume Style</label>
                <select value={resumeStyle} onChange={(e) => setResumeStyle(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div className="rs-field rs-field-full">
                <label>Job Description (optional)</label>
                <textarea
                  placeholder="Paste the job description to tailor your resume for it…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <div className="rs-field rs-field-full">
                <label>Profile Summary / Highlights</label>
                <textarea
                  placeholder="Describe your academics, projects, internships, and skills…"
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                />
              </div>
              <div className="rs-builder-footer">
                <button
                  type="button"
                  className="rs-btn rs-btn--outline rs-btn--sm"
                  onClick={() => { setTargetRole(''); setJobDescription(''); setProfileText('') }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rs-btn--generate"
                  disabled={generating}
                  onClick={handleBuilderGenerate}
                >
                  <Wand2 size={15} />
                  {generating ? 'Generating…' : 'Generate Resume'}
                </button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="rs-card">
            <div className="rs-section-head">
              <h2>Popular Templates</h2>
              <button type="button" className="rs-see-all">
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="rs-template-grid">
              {TEMPLATES.map((t) => (
                <div key={t.name} className="rs-template-card">
                  <div className="rs-template-thumb" style={{ background: t.bg }}>{t.emoji}</div>
                  <div className="rs-template-info">
                    <h4>{t.name}</h4>
                    <small>{t.role}</small>
                    <p>{t.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── SIDEBAR ── */}
        <div className="rs-sidebar">

          {/* Resume Health */}
          <div className="rs-card">
            <h2 className="rs-section-title">Resume Health</h2>
            <div className="rs-health-metrics">
              {healthMetrics.map((m) => (
                <div key={m.label} className="rs-health-row">
                  <div className="rs-health-row-head">
                    <span>{m.label}</span>
                    <strong style={{ color: m.value >= 80 ? '#059669' : m.value >= 60 ? '#d97706' : '#dc2626' }}>
                      {m.value}%
                    </strong>
                  </div>
                  <div className="rs-health-bar">
                    <div className={`rs-health-fill rs-health-fill--${m.color}`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="rs-card">
            <div className="rs-section-head">
              <h2>AI Suggestions</h2>
              <button type="button" className="rs-see-all">
                See all <ChevronRight size={14} />
              </button>
            </div>
            <div className="rs-suggestions-list">
              {SUGGESTIONS.map((s) => (
                <div key={s.title} className="rs-suggestion-item">
                  <div className={`rs-sug-icon rs-sug-icon--${s.color}`}>{s.icon}</div>
                  <div className="rs-sug-body">
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </div>
                  <ChevronRight size={14} className="rs-sug-arrow" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default StudentUploadResumePage
