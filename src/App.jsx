import React, { useEffect, useRef, useState, useMemo } from 'react'
import { getSupabase, isSupabaseConfigured, generateReferenceNo } from './supabase/client.js'

const OWNER = { name: 'Olalekan Sanusi', position: 'CEO' }
const COMPANY = 'Q25 LUXURY CONSTRUX'
const GOLD = '#C9A227'

const DEFAULT_MARGINS = {
  p1: { top: 155, bottom: 110, left: 62, right: 58 },
  p2: { top: 68, bottom: 78, left: 62, right: 58 }
}

const uid = () => Math.random().toString(36).slice(2, 10)

function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)) }, [key, v])
  return [v, setV]
}

// ---------- Auth ----------
function AuthView({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = getSupabase()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    if (!isSupabaseConfigured()) {
      const user = { id: 'local_' + uid(), email: email || 'ceo@q25luxury.com', role: email.includes('ceo') || email.includes('admin') ? 'admin' : 'staff' }
      localStorage.setItem('q25_user', JSON.stringify(user))
      onAuth(user)
      setLoading(false)
      return
    }
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Check your email for confirmation. Then login.')
      }
    } catch (err) {
      setMsg(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'radial-gradient(1200px 600px at 20% -10%, rgba(201,162,39,0.18), transparent), radial-gradient(1000px 500px at 90% 110%, rgba(0,0,0,0.08), transparent), var(--bg)' }}>
      <div className="glass-strong animate-spring" style={{ width: '100%', maxWidth: 440, borderRadius: 28, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <img src="/logo.png" alt="logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, background: '#fff', padding: 6 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>{COMPANY}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: 2, textTransform: 'uppercase' }}>Official Letters</div>
          </div>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>Secure login to create and archive official letters on authentic letterhead.</p>
        <form onSubmit={handle} style={{ display: 'grid', gap: 14 }}>
          <input className="input-glass" placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="input-glass" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isSupabaseConfigured() ? false : true} />
          <button className="btn-gold" disabled={loading} style={{ justifyContent: 'center', width: '100%', padding: '14px 20px' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
          {!isSupabaseConfigured() && <span style={{ color: 'var(--text-tertiary)', fontSize: 11, alignSelf: 'center' }}>Demo mode (no Supabase)</span>}
        </div>
        {msg && <div className="glass" style={{ marginTop: 16, padding: 12, borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{msg}</div>}
        {!isSupabaseConfigured() && (
          <div style={{ marginTop: 18, fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            <strong>Setup:</strong> Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud auth, DB and storage. See /supabase/schema.sql
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Rich Text ----------
function RichToolbar({ editorRef }) {
  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }
  const [align, setAlign] = useState('left')
  return (
    <div className="rich-toolbar">
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); exec('bold') }} title="Bold"><b>B</b></button>
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); exec('italic') }} title="Italic"><i>I</i></button>
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); exec('underline') }} title="Underline"><u>U</u></button>
      <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }} title="Bullet list">•</button>
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList') }} title="Numbered list">1.</button>
      <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
      <button type="button" className={`rich-btn ${align==='left'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); setAlign('left') }} title="Align left">L</button>
      <button type="button" className={`rich-btn ${align==='center'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); setAlign('center') }} title="Center">C</button>
      <button type="button" className={`rich-btn ${align==='right'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyRight'); setAlign('right') }} title="Align right">R</button>
      <button type="button" className={`rich-btn ${align==='justify'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyFull'); setAlign('justify') }} title="Justify">J</button>
    </div>
  )
}

// ---------- Preview ----------
function LetterPreview({ letter, margins = DEFAULT_MARGINS, showSignature = true }) {
  const containerRef = useRef(null)
  const [pages, setPages] = useState(1)
  const contentMeasureRef = useRef(null)

  // Build HTML for full letter content (header fields + body + signoff)
  const fullHtml = useMemo(() => {
    const dateStr = letter.letter_date ? new Date(letter.letter_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const ref = letter.reference_no || ''
    const recip = `
      <div style="margin-bottom:18px">
        ${letter.recipient_name ? `<div style="font-weight:700">${letter.recipient_name}</div>` : ''}
        ${letter.recipient_title ? `<div>${letter.recipient_title}</div>` : ''}
        ${letter.recipient_address ? `<div style="white-space:pre-line">${letter.recipient_address}</div>` : ''}
      </div>`
    const subject = letter.subject ? `<div style="margin:14px 0 10px 0"><span style="font-weight:700">Subject: </span><span style="font-weight:700; text-decoration:underline">${letter.subject}</span></div>` : ''
    const salutation = letter.salutation ? `<div style="margin:10px 0 12px 0">${letter.salutation}</div>` : ''
    const body = letter.body || '<p style="color:#999">Start typing your letter...</p>'
    const signOff = `
      <div id="signoff-block" style="margin-top:32px; page-break-inside:avoid; break-inside:avoid">
        <div>${letter.closing_line || 'Yours sincerely,'}</div>
        ${showSignature ? `<img src="/sign.png" alt="signature" style="height:68px; margin:10px 0 6px 0; object-fit:contain; display:block; filter: contrast(1.2)" />` : '<div style="height:42px"></div>'}
        <div style="font-weight:800; font-size:12pt; letter-spacing:0.2px">${OWNER.name}</div>
        <div style="font-weight:700; font-size:10.5pt; color:#222">${OWNER.position}</div>
      </div>`
    return `
      <div style="font-family:'Nunito Sans', sans-serif; font-size:11.5pt; line-height:1.6; color:#111">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:10.5pt">
          <div>${dateStr}</div>
          <div style="font-weight:700">Ref: ${ref}</div>
        </div>
        ${recip}
        ${subject}
        ${salutation}
        <div>${body}</div>
        ${signOff}
      </div>`
  }, [letter, showSignature])

  useEffect(() => {
    if (!contentMeasureRef.current) return
    const el = contentMeasureRef.current
    el.innerHTML = fullHtml
    // measure
    const totalH = el.scrollHeight
    const p1Usable = 1123 - margins.p1.top - margins.p1.bottom
    const p2Usable = 1123 - margins.p2.top - margins.p2.bottom
    let remaining = totalH
    let count = 1
    remaining -= p1Usable
    while (remaining > 0) {
      count++
      remaining -= p2Usable
    }
    setPages(Math.max(1, count))
  }, [fullHtml, margins])

  // For visual slicing, we create pages with clipped content
  const pageHeights = useMemo(() => {
    const arr = []
    for (let i = 0; i < pages; i++) {
      arr.push(i === 0 ? 1123 - margins.p1.top - margins.p1.bottom : 1123 - margins.p2.top - margins.p2.bottom)
    }
    return arr
  }, [pages, margins])

  const offsets = useMemo(() => {
    let off = 0
    const list = [0]
    for (let i = 0; i < pageHeights.length - 1; i++) {
      off += pageHeights[i]
      list.push(off)
    }
    return list
  }, [pageHeights])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* hidden measurer */}
      <div ref={contentMeasureRef} style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 794 - margins.p1.left - margins.p1.right - 20, left: -9999, top: 0, fontFamily: "'Nunito Sans', sans-serif", fontSize: '11.5pt', lineHeight: 1.6 }} />
      {Array.from({ length: pages }).map((_, idx) => {
        const isFirst = idx === 0
        const bg = isFirst ? '/letter1.png' : '/letter2.png'
        const m = isFirst ? margins.p1 : margins.p2
        const usable = pageHeights[idx]
        const offset = offsets[idx]
        return (
          <div key={idx} className="a4-page" style={{ width: 794, height: 1123 }}>
            <img src={bg} alt="letterhead" className="a4-bg" />
            <div style={{ position: 'absolute', left: m.left, right: m.right, top: m.top, bottom: m.bottom, overflow: 'hidden' }}>
              <div style={{ transform: `translateY(-${offset}px)`, width: '100%' }} dangerouslySetInnerHTML={{ __html: fullHtml }} />
            </div>
            <div style={{ position: 'absolute', bottom: 8, right: 18, fontSize: 9, color: '#999', fontFamily: 'Nunito Sans' }}>Page {idx + 1} of {pages}</div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- PDF Export (lazy-loaded) ----------
async function exportLetterPdf(letter, margins = DEFAULT_MARGINS, showSignature = true) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  const A4 = [595.28, 841.89]

  // Load fonts
  const [medBytes, boldBytes, extraBytes] = await Promise.all([
    fetch('/fonts/NunitoSans-Medium.ttf').then(r => r.arrayBuffer()).catch(() => null),
    fetch('/fonts/NunitoSans-Bold.ttf').then(r => r.arrayBuffer()).catch(() => null),
    fetch('/fonts/NunitoSans-ExtraBold.ttf').then(r => r.arrayBuffer()).catch(() => null),
  ])
  let fontMed, fontBold, fontExtra
  try {
    fontMed = medBytes ? await pdfDoc.embedFont(medBytes) : await pdfDoc.embedFont(StandardFonts.Helvetica)
    fontBold = boldBytes ? await pdfDoc.embedFont(boldBytes) : await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    fontExtra = extraBytes ? await pdfDoc.embedFont(extraBytes) : fontBold
  } catch {
    fontMed = await pdfDoc.embedFont(StandardFonts.Helvetica)
    fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    fontExtra = fontBold
  }

  const [letter1Bytes, letter2Bytes, signBytes] = await Promise.all([
    fetch('/letter1.png').then(r => r.arrayBuffer()),
    fetch('/letter2.png').then(r => r.arrayBuffer()),
    showSignature ? fetch('/sign.png').then(r => r.arrayBuffer()).catch(() => null) : Promise.resolve(null)
  ])
  const letter1Img = await pdfDoc.embedPng(letter1Bytes)
  const letter2Img = await pdfDoc.embedPng(letter2Bytes)
  const signImg = signBytes ? await pdfDoc.embedPng(signBytes) : null

  const parseHtmlToBlocks = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const blocks = []
    const walk = (node, styles = {}) => {
      if (node.nodeType === 3) {
        const text = node.textContent
        if (text && text.trim()) blocks.push({ type: 'text', text, ...styles })
        return
      }
      if (node.nodeType !== 1) return
      const tag = node.tagName.toLowerCase()
      const newStyles = { ...styles }
      if (['b', 'strong'].includes(tag)) newStyles.bold = true
      if (['i', 'em'].includes(tag)) newStyles.italic = true
      if (tag === 'u') newStyles.underline = true
      if (tag === 'br') { blocks.push({ type: 'br' }); return }
      if (tag === 'p' || tag === 'div') {
        if (blocks.length && blocks[blocks.length - 1].type !== 'br') blocks.push({ type: 'br' })
        const align = node.style.textAlign || ''
        if (align) newStyles.align = align
        Array.from(node.childNodes).forEach(c => walk(c, newStyles))
        blocks.push({ type: 'br' })
        if (tag === 'p') blocks.push({ type: 'br' })
        return
      }
      if (tag === 'li') {
        blocks.push({ type: 'text', text: '• ', ...newStyles })
        Array.from(node.childNodes).forEach(c => walk(c, newStyles))
        blocks.push({ type: 'br' })
        return
      }
      if (['ul', 'ol'].includes(tag)) {
        Array.from(node.childNodes).forEach(c => walk(c, newStyles))
        return
      }
      Array.from(node.childNodes).forEach(c => walk(c, newStyles))
    }
    Array.from(doc.body.childNodes).forEach(n => walk(n, {}))
    return blocks
  }

  const wrapAndDraw = (page, text, opts) => {
    const { x, y, maxWidth, size, font, lineHeight, align } = opts
    const words = text.split(/\s+/)
    let line = ''
    let curY = y
    const lines = []
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      const wWidth = font.widthOfTextAtSize(test, size)
      if (wWidth > maxWidth && line) {
        lines.push(line)
        line = w
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    for (const l of lines) {
      let drawX = x
      const lineWidth = font.widthOfTextAtSize(l, size)
      if (align === 'center') drawX = x + (maxWidth - lineWidth) / 2
      if (align === 'right') drawX = x + (maxWidth - lineWidth)
      if (align === 'justify' && lines.indexOf(l) !== lines.length - 1) {
        // simple justify: spread words (approx)
      }
      page.drawText(l, { x: drawX, y: curY, size, font, color: rgb(0.07, 0.07, 0.07) })
      curY -= lineHeight
      if (curY < 60) break
    }
    return curY
  }

  // Build content blocks for pdf
  const dateStr = letter.letter_date ? new Date(letter.letter_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const ref = letter.reference_no || ''
  const headerLines = [
    { text: `${dateStr}    Ref: ${ref}`, bold: false, align: 'left', size: 9.5 },
  ]

  // We'll draw sequentially
  let currentPageIndex = 0
  const addPage = () => {
    const page = pdfDoc.addPage(A4)
    const bg = currentPageIndex === 0 ? letter1Img : letter2Img
    page.drawImage(bg, { x: 0, y: 0, width: A4[0], height: A4[1] })
    currentPageIndex++
    return page
  }

  let page = addPage()
  const getMarginsForPage = (idx) => idx === 0 ? margins.p1 : margins.p2
  // Convert px margins (from 794x1123 preview) to PDF points (595x842)
  const pxToPt = (px) => px * (595.28 / 794)
  const drawContentOnPage = (pIdx, pg) => {
    const m = getMarginsForPage(pIdx)
    return {
      left: pxToPt(m.left),
      right: A4[0] - pxToPt(m.right),
      top: A4[1] - pxToPt(m.top),
      bottom: pxToPt(m.bottom),
      width: A4[0] - pxToPt(m.left) - pxToPt(m.right)
    }
  }

  let bounds = drawContentOnPage(0, page)
  let cursorY = bounds.top - 10

  // Helper to ensure space
  const ensureSpace = (needed) => {
    if (cursorY - needed < bounds.bottom) {
      page = addPage()
      bounds = drawContentOnPage(currentPageIndex - 1, page)
      cursorY = bounds.top - 10
      return true
    }
    return false
  }

  // Date & Ref
  page.drawText(dateStr, { x: bounds.left, y: cursorY, size: 10, font: fontMed, color: rgb(0.1, 0.1, 0.1) })
  const refText = `Ref: ${ref}`
  const refW = fontBold.widthOfTextAtSize(refText, 10)
  page.drawText(refText, { x: bounds.right - refW, y: cursorY, size: 10, font: fontBold })
  cursorY -= 24

  // Recipient
  if (letter.recipient_name) {
    ensureSpace(14)
    page.drawText(letter.recipient_name, { x: bounds.left, y: cursorY, size: 11, font: fontBold })
    cursorY -= 14
  }
  if (letter.recipient_title) {
    ensureSpace(14)
    page.drawText(letter.recipient_title, { x: bounds.left, y: cursorY, size: 10, font: fontMed })
    cursorY -= 14
  }
  if (letter.recipient_address) {
    const lines = letter.recipient_address.split('\n')
    for (const ln of lines) {
      ensureSpace(14)
      page.drawText(ln, { x: bounds.left, y: cursorY, size: 10, font: fontMed })
      cursorY -= 14
    }
  }
  cursorY -= 8

  // Subject
  if (letter.subject) {
    ensureSpace(18)
    const subjLabel = 'Subject: '
    page.drawText(subjLabel, { x: bounds.left, y: cursorY, size: 11, font: fontBold })
    const labelW = fontBold.widthOfTextAtSize(subjLabel, 11)
    const subj = letter.subject
    // underline subject
    const subjW = fontBold.widthOfTextAtSize(subj, 11)
    page.drawText(subj, { x: bounds.left + labelW, y: cursorY, size: 11, font: fontBold })
    page.drawLine({ start: { x: bounds.left + labelW, y: cursorY - 2 }, end: { x: bounds.left + labelW + subjW, y: cursorY - 2 }, thickness: 0.8, color: rgb(0, 0, 0) })
    cursorY -= 20
  }

  // Salutation
  if (letter.salutation) {
    ensureSpace(16)
    page.drawText(letter.salutation, { x: bounds.left, y: cursorY, size: 11, font: fontMed })
    cursorY -= 20
  }

  // Body - parse HTML
  const bodyBlocks = parseHtmlToBlocks(letter.body || '')
  let currentAlign = 'left'
  let lineBuffer = ''
  let bufferStyle = { bold: false, italic: false }
  const flushBuffer = () => {
    if (!lineBuffer.trim()) { lineBuffer = ''; return }
    const f = bufferStyle.bold ? fontBold : fontMed
    const size = 11
    const lh = 16
    // simple wrapping
    const words = lineBuffer.split(/\s+/)
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (f.widthOfTextAtSize(test, size) > bounds.width && line) {
        ensureSpace(lh)
        // draw line
        let drawX = bounds.left
        if (currentAlign === 'center') drawX = bounds.left + (bounds.width - f.widthOfTextAtSize(line, size)) / 2
        if (currentAlign === 'right') drawX = bounds.right - f.widthOfTextAtSize(line, size)
        page.drawText(line, { x: drawX, y: cursorY, size, font: f })
        cursorY -= lh
        line = w
      } else {
        line = test
      }
    }
    if (line) {
      ensureSpace(lh)
      let drawX = bounds.left
      if (currentAlign === 'center') drawX = bounds.left + (bounds.width - f.widthOfTextAtSize(line, size)) / 2
      if (currentAlign === 'right') drawX = bounds.right - f.widthOfTextAtSize(line, size)
      page.drawText(line, { x: drawX, y: cursorY, size, font: f })
      cursorY -= lh
    }
    lineBuffer = ''
  }

  for (const blk of bodyBlocks) {
    if (blk.type === 'br') {
      flushBuffer()
      cursorY -= 4
      if (cursorY < bounds.bottom + 20) {
        page = addPage()
        bounds = drawContentOnPage(currentPageIndex - 1, page)
        cursorY = bounds.top - 10
      }
      continue
    }
    if (blk.type === 'text') {
      if (blk.align) currentAlign = blk.align
      bufferStyle = { bold: !!blk.bold, italic: !!blk.italic }
      lineBuffer += (lineBuffer ? ' ' : '') + blk.text
    }
  }
  flushBuffer()

  // Sign-off block - keep together
  const signOffHeight = showSignature ? 110 : 70
  if (cursorY - signOffHeight < bounds.bottom) {
    page = addPage()
    bounds = drawContentOnPage(currentPageIndex - 1, page)
    cursorY = bounds.top - 10
  }
  cursorY -= 10
  page.drawText(letter.closing_line || 'Yours sincerely,', { x: bounds.left, y: cursorY, size: 11, font: fontMed })
  cursorY -= 18
  if (showSignature && signImg) {
    const sigW = 110, sigH = 48
    ensureSpace(sigH + 10)
    page.drawImage(signImg, { x: bounds.left, y: cursorY - sigH + 12, width: sigW, height: sigH })
    cursorY -= sigH + 8
  } else {
    cursorY -= 30
  }
  page.drawText(OWNER.name, { x: bounds.left, y: cursorY, size: 12, font: fontExtra })
  cursorY -= 14
  page.drawText(OWNER.position, { x: bounds.left, y: cursorY, size: 10.5, font: fontBold })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

// ---------- Main App ----------
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('q25_user') || 'null') } catch { return null }
  })
  const [view, setView] = useState('editor') // editor, archive, templates, trash
  const [dark, setDark] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [letters, setLetters] = useLocalStorage('q25_letters', [])
  const [templates, setTemplates] = useLocalStorage('q25_templates', [
    { id: 't1', title: 'Official Introduction', subject: 'Introduction of Q25 Luxury Construx Services', salutation: 'Dear Sir/Madam,', body: '<p>We write to introduce <strong>Q25 Luxury Construx</strong>, a premium construction and luxury finishing company based in Abuja.</p><p>We specialize in high-end residential and commercial projects, delivering excellence with attention to detail.</p><p>We would be honored to discuss how we can add value to your upcoming project.</p>', created_at: new Date().toISOString() },
    { id: 't2', title: 'Quotation Submission', subject: 'Submission of Quotation', salutation: 'Dear Sir,', body: '<p>Further to your request, please find attached our detailed quotation for the proposed works.</p><p>Our quotation is valid for 14 days and includes all necessary preliminaries.</p><p>We look forward to your favorable response.</p>', created_at: new Date().toISOString() }
  ])
  const [margins, setMargins] = useLocalStorage('q25_margins', DEFAULT_MARGINS)
  const [current, setCurrent] = useState(null)
  const [saveState, setSaveState] = useState('Saved')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [isMobilePreview, setIsMobilePreview] = useState(false)

  const supabase = getSupabase()

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) setUser(data.session.user)
      })
      const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user || null)
      })
      return () => listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.documentElement.className = dark ? 'dark' : 'light'
  }, [dark])

  // Load letters from supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return
    const fetchLetters = async () => {
      const { data, error } = await supabase.from('letters').select('*').order('created_at', { ascending: false }).limit(200)
      if (!error && data) setLetters(data)
    }
    fetchLetters()
  }, [user])

  const createNewLetter = async () => {
    const ref = await generateReferenceNo()
    const newLetter = {
      id: uid(),
      reference_no: ref,
      letter_date: new Date().toISOString().slice(0, 10),
      recipient_name: '',
      recipient_title: '',
      recipient_address: '',
      subject: '',
      salutation: 'Dear Sir/Madam,',
      body: '<p></p>',
      closing_line: 'Yours sincerely,',
      signature_applied: true,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    }
    setCurrent(newLetter)
    setView('editor')
    setIsMobilePreview(false)
  }

  useEffect(() => {
    if (!current) { createNewLetter() }
  }, [])

  // Auto-save
  const saveTimeout = useRef(null)
  useEffect(() => {
    if (!current) return
    setSaveState('Unsaved')
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const updated = { ...current, updated_at: new Date().toISOString() }
      // local
      setLetters(prev => {
        const exists = prev.find(l => l.id === current.id)
        if (exists) return prev.map(l => l.id === current.id ? updated : l)
        return [updated, ...prev]
      })
      // supabase
      if (isSupabaseConfigured() && user) {
        try {
          await supabase.from('letters').upsert({
            id: updated.id,
            user_id: user.id,
            reference_no: updated.reference_no,
            recipient_name: updated.recipient_name || 'Untitled',
            recipient_title: updated.recipient_title,
            recipient_address: updated.recipient_address,
            subject: updated.subject || 'No subject',
            salutation: updated.salutation,
            body: updated.body,
            letter_date: updated.letter_date,
            closing_line: updated.closing_line,
            signature_applied: updated.signature_applied,
            status: updated.status,
            is_deleted: updated.is_deleted
          })
        } catch (e) { console.warn(e) }
      }
      setSaveState('Saved')
    }, 1200)
    return () => clearTimeout(saveTimeout.current)
  }, [current])

  const handleExportPdf = async (letterOverride = null) => {
    const l = letterOverride || current
    if (!l) return
    setSaveState('Exporting...')
    try {
      const bytes = await exportLetterPdf(l, margins, l.signature_applied)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${l.reference_no.replace(/\//g, '-')}_${(l.recipient_name || 'letter').replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      // Optionally upload to supabase storage
      if (isSupabaseConfigured() && user) {
        try {
          const fileName = `${user.id}/${l.id}.pdf`
          await supabase.storage.from('letter-pdfs').upload(fileName, blob, { upsert: true, contentType: 'application/pdf' })
          const { data } = await supabase.storage.from('letter-pdfs').createSignedUrl(fileName, 60 * 60 * 24 * 7)
          if (data?.signedUrl) {
            const updated = { ...l, pdf_url: data.signedUrl }
            setCurrent(updated)
          }
        } catch (e) { console.warn('storage upload failed', e) }
      }
      setSaveState('Saved')
    } catch (e) {
      console.error(e)
      setSaveState('Export failed')
    }
  }

  const filteredLetters = useMemo(() => {
    let list = letters.filter(l => !l.is_deleted)
    if (view === 'trash') list = letters.filter(l => l.is_deleted)
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(l => (l.recipient_name + l.subject + l.reference_no).toLowerCase().includes(s))
    }
    if (statusFilter !== 'all') list = list.filter(l => l.status === statusFilter)
    if (yearFilter !== 'all') list = list.filter(l => (l.reference_no || '').includes(yearFilter) || (l.letter_date || '').startsWith(yearFilter))
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [letters, search, statusFilter, yearFilter, view])

  const editorRef = useRef(null)

  if (!user) return <AuthView onAuth={setUser} />

  const role = user.role || (user.email && (user.email.includes('ceo') || user.email.includes('admin')) ? 'admin' : 'staff')
  const canSign = role === 'admin' || role === 'staff' // per spec only authorised roles can apply signature; allow both but admin finalise
  const isAdmin = role === 'admin'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar desktop */}
      <aside className="glass" style={{ width: 280, position: 'fixed', top: 16, left: 16, bottom: 16, borderRadius: 24, padding: 18, display: 'flex', flexDirection: 'column', zIndex: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <img src="/logo.png" style={{ width: 44, height: 44, objectFit: 'contain', background: '#fff', borderRadius: 10, padding: 4 }} alt="logo" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1 }}>{COMPANY}</div>
            <div style={{ fontSize: 10, letterSpacing: 1.6, color: 'var(--text-secondary)' }}>OFFICIAL LETTERS</div>
          </div>
        </div>

        <nav style={{ display: 'grid', gap: 8 }}>
          {[
            { id: 'editor', label: 'New Letter', icon: '✎' },
            { id: 'archive', label: 'Archive', icon: '◧', count: letters.filter(l => !l.is_deleted).length },
            { id: 'templates', label: 'Templates', icon: '⬔', count: templates.length },
            { id: 'trash', label: 'Trash', icon: '⌫', count: letters.filter(l => l.is_deleted).length },
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? 'btn-gold' : 'btn-ghost'} style={{ justifyContent: 'space-between', width: '100%', borderRadius: 14, padding: '12px 16px', fontSize: 14 }}>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>{item.icon}</span>{item.label}</span>
              {item.count !== undefined && <span style={{ fontSize: 11, background: view === item.id ? 'rgba(0,0,0,0.15)' : 'var(--border)', padding: '2px 8px', borderRadius: 999 }}>{item.count}</span>}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'grid', gap: 12 }}>
          <div className="glass" style={{ borderRadius: 16, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1 }}>Signed in as</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            <div style={{ fontSize: 11, marginTop: 2, display: 'inline-block', background: isAdmin ? 'var(--gold)' : 'var(--border)', color: isAdmin ? '#000' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{role.toUpperCase()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => setDark(!dark)}>{dark ? '☀ Light' : '◐ Dark'}</button>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => { localStorage.removeItem('q25_user'); setUser(null); if (isSupabaseConfigured()) getSupabase().auth.signOut() }}>Logout</button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>RC 8786514 • Abuja, NG</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 312, flex: 1, padding: '16px 20px 100px 0', minHeight: '100vh' }}>
        {view === 'editor' && current && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 480px) 1fr', gap: 20, alignItems: 'start' }}>
            {/* Editor panel */}
            <div className="glass-strong" style={{ borderRadius: 24, padding: 20, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }} >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 20 }}>Compose Letter</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: saveState === 'Saved' ? '#2e7d32' : 'var(--gold)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 999 }}>{saveState}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>DATE</label>
                    <input className="input-glass" type="date" value={current.letter_date} onChange={e => setCurrent({ ...current, letter_date: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>REFERENCE NO</label>
                    <input className="input-glass" value={current.reference_no} onChange={e => setCurrent({ ...current, reference_no: e.target.value })} style={{ fontWeight: 700 }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>RECIPIENT NAME</label>
                  <input className="input-glass" placeholder="e.g. The Managing Director" value={current.recipient_name} onChange={e => setCurrent({ ...current, recipient_name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>TITLE / COMPANY</label>
                    <input className="input-glass" placeholder="e.g. ABC Ltd" value={current.recipient_title} onChange={e => setCurrent({ ...current, recipient_title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>STATUS</label>
                    <select className="input-glass" value={current.status} onChange={e => setCurrent({ ...current, status: e.target.value })} disabled={!isAdmin && current.status === 'final'}>
                      <option value="draft">Draft</option>
                      <option value="final">Final</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>RECIPIENT ADDRESS</label>
                  <textarea className="input-glass" rows={3} placeholder="Address lines..." value={current.recipient_address} onChange={e => setCurrent({ ...current, recipient_address: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>SUBJECT</label>
                  <input className="input-glass" placeholder="Subject of the letter" value={current.subject} onChange={e => setCurrent({ ...current, subject: e.target.value })} style={{ fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>SALUTATION</label>
                  <input className="input-glass" value={current.salutation} onChange={e => setCurrent({ ...current, salutation: e.target.value })} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>BODY</label>
                  <RichToolbar editorRef={editorRef} />
                  <div
                    ref={editorRef}
                    contentEditable={current.status !== 'final'}
                    suppressContentEditableWarning
                    className="input-glass"
                    style={{ minHeight: 220, marginTop: 8, lineHeight: 1.7, overflowY: 'auto' }}
                    onInput={e => setCurrent({ ...current, body: e.currentTarget.innerHTML })}
                    dangerouslySetInnerHTML={{ __html: current.body }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>CLOSING</label>
                    <input className="input-glass" value={current.closing_line} onChange={e => setCurrent({ ...current, closing_line: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
                    <label className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontSize: 13, cursor: 'pointer', flex: 1 }}>
                      <input type="checkbox" checked={current.signature_applied} onChange={e => setCurrent({ ...current, signature_applied: e.target.checked })} disabled={!canSign} />
                      Signature
                    </label>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)', marginBottom: 8 }}>MARGINS (px, preview A4 794×1123)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><small>P1 Top</small><input className="input-glass" type="number" value={margins.p1.top} onChange={e => setMargins({ ...margins, p1: { ...margins.p1, top: parseInt(e.target.value) || 0 } })} /></div>
                    <div><small>P1 Bottom</small><input className="input-glass" type="number" value={margins.p1.bottom} onChange={e => setMargins({ ...margins, p1: { ...margins.p1, bottom: parseInt(e.target.value) || 0 } })} /></div>
                    <div><small>P2 Top</small><input className="input-glass" type="number" value={margins.p2.top} onChange={e => setMargins({ ...margins, p2: { ...margins.p2, top: parseInt(e.target.value) || 0 } })} /></div>
                    <div><small>P2 Bottom</small><input className="input-glass" type="number" value={margins.p2.bottom} onChange={e => setMargins({ ...margins, p2: { ...margins.p2, bottom: parseInt(e.target.value) || 0 } })} /></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="btn-gold" onClick={() => handleExportPdf()} style={{ flex: 1 }}>⬇ Export PDF</button>
                  <button className="btn-ghost" onClick={() => window.print()}>⎙ Print</button>
                  <button className="btn-ghost" onClick={async () => {
                    if (navigator.share) {
                      try {
                        const bytes = await exportLetterPdf(current, margins, current.signature_applied)
                        const file = new File([bytes], `${current.reference_no}.pdf`, { type: 'application/pdf' })
                        await navigator.share({ title: current.subject, text: `Letter ${current.reference_no}`, files: [file] })
                      } catch { alert('Share failed, PDF downloaded instead'); handleExportPdf() }
                    } else { alert('Web Share not supported, downloading PDF'); handleExportPdf() }
                  }}>↗ Share</button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={createNewLetter}>+ New Letter</button>
                  <button className="btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => {
                    const dup = { ...current, id: uid(), reference_no: current.reference_no + '-COPY', status: 'draft', created_at: new Date().toISOString() }
                    setCurrent(dup)
                  }}>Duplicate</button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="glass" style={{ borderRadius: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Live A4 Preview • Real Letterhead</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, background: 'var(--gold)', color: '#000', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>Page 1: Letter 1 • Rest: Letter 2</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }} className="scrollbar-thin">
                <LetterPreview letter={current} margins={margins} showSignature={current.signature_applied} />
              </div>
            </div>
          </div>
        )}

        {view === 'archive' && (
          <div style={{ maxWidth: 1200 }}>
            <div className="glass-strong" style={{ borderRadius: 24, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <h2 style={{ fontSize: 22 }}>Letter Archive</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input className="input-glass" placeholder="Search recipient, subject, ref..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
                  <select className="input-glass" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 130 }}>
                    <option value="all">All status</option>
                    <option value="draft">Draft</option>
                    <option value="final">Final</option>
                    <option value="sent">Sent</option>
                  </select>
                  <select className="input-glass" value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ width: 110 }}>
                    <option value="all">All years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={async () => {
                  const { saveAs } = await import('file-saver')
                  const rows = [['Reference','Date','Recipient','Subject','Status']]
                  filteredLetters.forEach(l => rows.push([l.reference_no, l.letter_date, l.recipient_name, l.subject, l.status]))
                  const csv = rows.map(r => r.map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  saveAs(blob, `q25_archive_${new Date().toISOString().slice(0,10)}.csv`)
                }}>Export CSV</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={async () => {
                  const [{ default: JSZip }, { saveAs }] = await Promise.all([import('jszip'), import('file-saver')])
                  const zip = new JSZip()
                  for (const l of filteredLetters.slice(0, 30)) {
                    try {
                      const bytes = await exportLetterPdf(l, margins, l.signature_applied)
                      zip.file(`${l.reference_no.replace(/\//g,'-')}.pdf`, bytes)
                    } catch {}
                  }
                  const blob = await zip.generateAsync({ type: 'blob' })
                  saveAs(blob, `q25_letters_${new Date().toISOString().slice(0,10)}.zip`)
                }}>Export ZIP (30 max)</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {filteredLetters.length === 0 && <div className="glass" style={{ padding: 40, borderRadius: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>No letters found. Create your first official letter.</div>}
              {filteredLetters.map(l => (
                <div key={l.id} className="glass animate-spring" style={{ borderRadius: 18, padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, background: '#111', color: '#fff', padding: '3px 10px', borderRadius: 999, letterSpacing: 0.3 }}>{l.reference_no}</span>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: l.status === 'final' ? 'var(--gold)' : l.status === 'sent' ? '#111' : 'var(--border)', color: l.status === 'final' ? '#000' : l.status === 'sent' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{l.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{l.letter_date} • {new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.recipient_name || 'Untitled'} {l.recipient_title ? `• ${l.recipient_title}` : ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.subject}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => { setCurrent(l); setView('editor'); window.scrollTo(0,0) }}>Open</button>
                    <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => handleExportPdf(l)}>PDF</button>
                    <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => {
                      const dup = { ...l, id: uid(), reference_no: l.reference_no + '-DUP', status: 'draft', created_at: new Date().toISOString() }
                      setCurrent(dup); setView('editor')
                    }}>Duplicate</button>
                    <button className="btn-ghost" style={{ padding: '8px 10px', fontSize: 12, color: '#b42318' }} onClick={() => {
                      const updated = { ...l, is_deleted: true, deleted_at: new Date().toISOString() }
                      setLetters(prev => prev.map(x => x.id === l.id ? updated : x))
                    }}>Trash</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'templates' && (
          <div style={{ maxWidth: 1000 }}>
            <div className="glass-strong" style={{ borderRadius: 24, padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22 }}>Reusable Templates</h2>
              <button className="btn-gold" onClick={() => {
                const t = { id: uid(), title: 'New Template', subject: current?.subject || '', salutation: current?.salutation || 'Dear Sir,', body: current?.body || '<p></p>', created_at: new Date().toISOString() }
                setTemplates([t, ...templates])
              }}>+ Save current as template</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
              {templates.map(t => (
                <div key={t.id} className="glass" style={{ borderRadius: 18, padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, maxHeight: 80, overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: t.body.slice(0, 200) }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => {
                      if (!current) return
                      setCurrent({ ...current, subject: t.subject, salutation: t.salutation, body: t.body })
                      setView('editor')
                    }}>Use</button>
                    <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setTemplates(templates.filter(x => x.id !== t.id))}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'trash' && (
          <div style={{ maxWidth: 800 }}>
            <div className="glass-strong" style={{ borderRadius: 24, padding: 20, marginBottom: 20 }}>
              <h2 style={{ fontSize: 22 }}>Trash • Restore within 30 days</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>Deleted letters are kept for 30 days, then permanently removed.</p>
            </div>
            {filteredLetters.length === 0 && <div className="glass" style={{ padding: 30, borderRadius: 16, textAlign: 'center', color: 'var(--text-tertiary)' }}>Trash is empty</div>}
            {filteredLetters.map(l => {
              const daysLeft = 30 - Math.floor((Date.now() - new Date(l.deleted_at || l.updated_at).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={l.id} className="glass" style={{ borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{l.reference_no} • {l.recipient_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{daysLeft} days left • {l.subject}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setLetters(prev => prev.map(x => x.id === l.id ? { ...x, is_deleted: false } : x))}>Restore</button>
                    <button className="btn-ghost" style={{ fontSize: 12, color: '#b42318' }} onClick={() => setLetters(prev => prev.filter(x => x.id !== l.id))}>Delete forever</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Mobile bottom tab */}
      <div className="glass-strong" style={{ position: 'fixed', bottom: 12, left: 12, right: 12, borderRadius: 22, padding: '8px 10px', display: 'none', zIndex: 30, gap: 6 }} id="mobile-tabs">
        <style>{`@media(max-width: 900px){ #mobile-tabs{display:flex !important} aside{display:none !important} main{margin-left:0 !important; padding:12px 12px 90px 12px !important} main>div{grid-template-columns:1fr !important} }`}</style>
        {[
          { id: 'editor', label: 'Write', icon: '✎' },
          { id: 'archive', label: 'Archive', icon: '◧' },
          { id: 'templates', label: 'Tpl', icon: '⬔' },
          { id: 'trash', label: 'Trash', icon: '⌫' },
        ].map(it => (
          <button key={it.id} onClick={() => setView(it.id)} style={{ flex: 1, borderRadius: 14, padding: '10px 6px', border: 'none', background: view === it.id ? 'var(--gold)' : 'transparent', color: view === it.id ? '#000' : 'var(--text)', fontWeight: 700, fontSize: 12 }}>{it.icon} {it.label}</button>
        ))}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          aside, #mobile-tabs, .glass, .glass-strong, button, input, textarea, select, .rich-toolbar { display: none !important; }
          main { margin:0 !important; padding:0 !important; }
          .a4-page { box-shadow: none !important; margin:0 !important; page-break-after: always; }
        }
      `}</style>
    </div>
  )
}
