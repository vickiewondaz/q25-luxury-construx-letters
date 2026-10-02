import React, { useEffect, useRef, useState, useMemo } from 'react'
import { getSupabase, isSupabaseConfigured, generateReferenceNo } from './supabase/client.js'

const OWNER = { name: 'Olalekan Sanusi', position: 'CEO' }
const COMPANY = 'Q25 LUXURY CONSTRUX'
const GOLD = '#C9A227'

const DEFAULT_MARGINS = {
  p1: { top: 210, bottom: 115, left: 62, right: 58 },
  p2: { top: 82, bottom: 85, left: 62, right: 58 }
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
      const user = { id: 'local_' + uid(), email: email || 'ceo@q25luxury.com', role: 'admin' }
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

// ---------- Rich Text with Table Support ----------
function RichToolbar({ editorRef }) {
  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }
  const insertTable = () => {
    const html = `
      <table class="letter-table">
        <thead><tr><th>Item</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Sample item</td><td class="num">₦100,000</td></tr>
          <tr><td>2</td><td>Another item</td><td class="num">₦250,000</td></tr>
          <tr><td colspan="2" style="text-align:right; font-weight:700">Total</td><td class="num" style="font-weight:700">₦350,000</td></tr>
        </tbody>
      </table><p><br/></p>`
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
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
      <button type="button" className="rich-btn" onMouseDown={e => { e.preventDefault(); insertTable() }} title="Insert professional table">⊞</button>
      <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
      <button type="button" className={`rich-btn ${align==='left'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); setAlign('left') }} title="Align left">L</button>
      <button type="button" className={`rich-btn ${align==='center'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); setAlign('center') }} title="Center">C</button>
      <button type="button" className={`rich-btn ${align==='right'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyRight'); setAlign('right') }} title="Align right">R</button>
      <button type="button" className={`rich-btn ${align==='justify'?'active':''}`} onMouseDown={e => { e.preventDefault(); exec('justifyFull'); setAlign('justify') }} title="Justify">J</button>
    </div>
  )
}

// ---------- Error Boundary ----------
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null } }
  static getDerivedStateFromError(error){ return { hasError: true, error } }
  componentDidCatch(error, info){ console.error('ErrorBoundary caught', error, info) }
  render(){
    if (this.state.hasError){
      return (
        <div style={{ padding: 20, background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 12, margin: 20 }}>
          <h3 style={{ color: '#b71c1c' }}>⚠️ Something went wrong</h3>
          <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>{this.state.error?.message || 'Unknown error'}</p>
          <pre style={{ fontSize: 11, background: '#fff', padding: 10, borderRadius: 8, overflow: 'auto', maxHeight: 200, marginTop: 10 }}>{this.state.error?.stack?.slice(0,1000)}</pre>
          <button className="btn-gold" style={{ marginTop: 12, padding: '8px 16px', fontSize: 12 }} onClick={()=>{ this.setState({ hasError: false, error: null }); if(this.props.onReset) this.props.onReset(); window.location.reload() }}>Reload App</button>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------- Document Import with SMART Table Auto-Detection & Error Fixing - ROBUST ----------
function ImportDocModal({ open, onClose, onExtracted }) {
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [extracted, setExtracted] = useState('')
  const [extractedHtml, setExtractedHtml] = useState('')
  const [hasTables, setHasTables] = useState(false)
  const [isBOQ, setIsBOQ] = useState(false)
  const [boqData, setBoqData] = useState(null)
  const [tableStats, setTableStats] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setErrorMsg('')
      setStatus('')
      setProgress(0)
    }
  }, [open])

  const HEADER_KEYWORDS = ['item','description','qty','quantity','unit','rate','amount','price','total','cost','s/n','no','material','work','particulars','details','specification','remarks','nos','uom']

  const cleanCell = (c) => {
    try {
      if (!c) return ''
      let s = c.trim().replace(/\s+/g, ' ')
      s = s.replace(/m2\b/gi, 'm²').replace(/m3\b/gi, 'm³').replace(/\bSqm\b/g, 'm²')
      s = s.replace(/\bM2\b/g, 'm²').replace(/\bM3\b/g, 'm³').replace(/\bLS\b/g, 'LS')
      return s.slice(0, 200)
    } catch { return (c||'').toString().slice(0,200) }
  }

  const isNumericCell = (c) => {
    try {
      const t = (c||'').toString().replace(/[₦$,\s]/g, '').trim()
      return /^-?\d+(\.\d+)?$/.test(t) || /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test((c||'').toString().trim())
    } catch { return false }
  }

  const isHeaderRow = (cells) => {
    try {
      if (!cells || cells.length === 0) return false
      const joined = cells.join(' ').toLowerCase()
      const keywordCount = HEADER_KEYWORDS.filter(k => joined.includes(k)).length
      const hasNumber = cells.some(isNumericCell)
      if (keywordCount >= 2 && !hasNumber) return true
      if (keywordCount >= 1 && cells.length >= 3 && !cells.some(c => /^\d{1,3}(,\d{3})+/.test(c))) return true
      if (cells.length >= 2 && cells.every(c => c.length < 25 && !/^\d+$/.test(c.trim()) && !isNumericCell(c))) {
        if (keywordCount >= 1) return true
      }
      return false
    } catch { return false }
  }

  const splitLineToCells = (line) => {
    try {
      const trimmed = (line||'').trim()
      if (!trimmed) return []
      if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t').map(cleanCell).filter(p => p.length > 0)
        if (parts.length >= 2) return parts
      }
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map(cleanCell).filter(p => p.length > 0)
        if (parts.length >= 2) return parts
      }
      const multiSpaceParts = trimmed.split(/\s{3,}|\t/).map(cleanCell).filter(Boolean)
      if (multiSpaceParts.length >= 3) return multiSpaceParts
      const doubleSpaceParts = trimmed.split(/\s{2,}/).map(cleanCell).filter(Boolean)
      if (doubleSpaceParts.length >= 3) return doubleSpaceParts
      const boqMatch = trimmed.match(/^(.*?)\s+(LS|m³|m²|m\b|tonne|No\.?|Nos?\.?|Set|Lot|Sum|Item)\s+([0-9\.\-—]+)\s+([0-9,\.\s]+)\s+([0-9,\.]+)$/i)
      if (boqMatch) {
        return [cleanCell(boqMatch[1]), cleanCell(boqMatch[2]), cleanCell(boqMatch[3]), cleanCell(boqMatch[4]), cleanCell(boqMatch[5])]
      }
      const genericNumMatch = trimmed.match(/^(.+?)\s+(\d+(?:,\d+)*(?:\.\d+)?)\s+(\d+(?:,\d+)*(?:\.\d+)?)\s+(\d+(?:,\d+)*(?:\.\d+)?)\s*$/)
      if (genericNumMatch) {
        return [cleanCell(genericNumMatch[1]), cleanCell(genericNumMatch[2]), cleanCell(genericNumMatch[3]), cleanCell(genericNumMatch[4])]
      }
      return []
    } catch { return [] }
  }

  const scoreTableLine = (line) => {
    try {
      const cells = splitLineToCells(line)
      if (cells.length < 2) return 0
      if (cells.length > 10) return 0.2
      let score = 0
      score += Math.min(cells.length * 0.2, 0.6)
      if (cells.some(isNumericCell)) score += 0.3
      if (cells.some(c => /^(LS|m²|m³|No|tonne)$/i.test(c.trim()))) score += 0.3
      if (line.includes('\t') || line.includes('|')) score += 0.2
      if (/\s{3,}/.test(line)) score += 0.15
      if (cells[0].length > 120) score -= 0.3
      return Math.min(Math.max(score, 0), 1)
    } catch { return 0 }
  }

  const detectTableBlocks = (text) => {
    try {
      const limitedText = (text||'').slice(0, 80000)
      const lines = limitedText.split('\n').slice(0, 2000)
      const blocks = []
      let currentTable = []
      let currentText = []
      let tableStartIdx = -1

      const flushText = () => {
        if (currentText.length) {
          const txt = currentText.join('\n').trim()
          if (txt) blocks.push({ type: 'text', content: txt, lines: [...currentText] })
          currentText = []
        }
      }
      const flushTable = () => {
        if (currentTable.length >= 2) {
          const colCounts = currentTable.map(r => r.cells.length)
          const avgCols = colCounts.reduce((a,b)=>a+b,0)/colCounts.length
          const consistent = colCounts.filter(c => Math.abs(c - avgCols) <= 1).length >= currentTable.length * 0.7
          if (consistent && avgCols >= 2) {
            blocks.push({ type: 'table', rows: [...currentTable], startLine: tableStartIdx })
          } else {
            const txt = currentTable.map(r => r.raw).join('\n')
            blocks.push({ type: 'text', content: txt, lines: currentTable.map(r=>r.raw) })
          }
        } else if (currentTable.length === 1) {
          if (currentTable[0].score > 0.8) {
            blocks.push({ type: 'table', rows: [...currentTable], startLine: tableStartIdx })
          } else {
            blocks.push({ type: 'text', content: currentTable[0].raw, lines: [currentTable[0].raw] })
          }
        }
        currentTable = []
        tableStartIdx = -1
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || ''
        const trimmed = line.trim()
        if (!trimmed) {
          if (currentTable.length) flushTable()
          currentText.push(line)
          continue
        }
        const score = scoreTableLine(line)
        const cells = splitLineToCells(line)
        let nextScores = []
        for (let j = 1; j <= 2; j++) {
          if (i+j < lines.length) nextScores.push(scoreTableLine(lines[i+j]||''))
        }
        const avgNext = nextScores.length ? nextScores.reduce((a,b)=>a+b,0)/nextScores.length : 0
        const isTable = (score >= 0.5 && (cells.length >= 2)) || (score >= 0.4 && avgNext >= 0.5 && cells.length >= 2)

        if (isTable) {
          if (currentText.length) flushText()
          if (tableStartIdx === -1) tableStartIdx = i
          currentTable.push({ raw: line, cells, score, lineIndex: i })
        } else {
          if (currentTable.length) flushTable()
          currentText.push(line)
        }
      }
      if (currentTable.length) flushTable()
      if (currentText.length) flushText()
      return blocks
    } catch (e) {
      console.warn('detectTableBlocks failed', e)
      return [{ type: 'text', content: (text||'').slice(0,5000), lines: [] }]
    }
  }

  const fixTableErrors = (tableBlock) => {
    try {
      let rows = (tableBlock.rows||[]).map(r => [...(r.cells||[])])
      if (rows.length === 0) return { headers: [], rows: [], fixed: [] }
      const colCounts = rows.map(r => r.length)
      const freq = {}
      colCounts.forEach(c => freq[c] = (freq[c]||0)+1)
      let targetCols = parseInt(Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0])
      if (targetCols < 2) return { headers: [], rows: [], fixed: ['Not a table'] }
      const fixes = []
      let fixedRows = []
      let i = 0
      while (i < rows.length) {
        let row = rows[i] || []
        if (row.length === targetCols) {
          fixedRows.push(row)
        } else if (row.length < targetCols) {
          if (i+1 < rows.length && rows[i+1].length < targetCols && rows[i+1].length === 1) {
            const merged = [...row]
            merged[0] = (merged[0]||'') + ' ' + (rows[i+1][0]||'')
            while (merged.length < targetCols) merged.push('')
            fixedRows.push(merged)
            fixes.push(`Merged multiline row at line ${i}`)
            i++
          } else if (row.length === targetCols - 1) {
            const last = row[row.length-1]||''
            const twoNums = last.match(/([0-9,]+\.?\d*)\s+([0-9,]+\.?\d*)$/)
            if (twoNums) {
              const newRow = [...row]
              newRow[newRow.length-1] = twoNums[1]
              newRow.push(twoNums[2])
              fixedRows.push(newRow)
              fixes.push(`Split merged numbers at row ${i}`)
            } else {
              const padded = [...row]
              while (padded.length < targetCols) padded.push('')
              fixedRows.push(padded)
              fixes.push(`Padded missing columns at row ${i}`)
            }
          } else {
            const padded = [...row]
            while (padded.length < targetCols) padded.push('')
            fixedRows.push(padded)
          }
        } else if (row.length > targetCols) {
          if (targetCols >= 3) {
            const extra = row.length - targetCols
            const desc = row.slice(0, extra+1).join(' ')
            const rest = row.slice(extra+1)
            fixedRows.push([desc, ...rest])
            fixes.push(`Merged split description at row ${i}`)
          } else {
            fixedRows.push(row.slice(0, targetCols))
            fixes.push(`Trimmed extra columns at row ${i}`)
          }
        }
        i++
      }
      rows = fixedRows
      let headers = []
      let dataRows = rows
      let hasHeader = false
      if (rows.length >= 2) {
        const first = rows[0]
        if (isHeaderRow(first)) {
          headers = first
          dataRows = rows.slice(1)
          hasHeader = true
          fixes.push('Detected header row')
        } else {
          const firstHasNum = first.some(isNumericCell)
          const secondHasNum = rows[1].some(isNumericCell)
          if (!firstHasNum && secondHasNum) {
            headers = first
            dataRows = rows.slice(1)
            hasHeader = true
            fixes.push('Inferred header')
          }
        }
      }
      if (!hasHeader) {
        const hasUnits = rows.some(r => r.some(c => /^(LS|m²|m³|m\b|tonne|No\.?)$/i.test((c||'').trim())))
        if (hasUnits && targetCols >= 4) {
          if (targetCols === 5) headers = ['Description', 'Unit', 'Qty', 'Rate (₦)', 'Amount (₦)']
          else if (targetCols === 4) headers = ['Description', 'Qty', 'Rate (₦)', 'Amount (₦)']
          else headers = Array.from({length: targetCols}, (_,i)=> `Col ${i+1}`)
          fixes.push('Auto-generated BOQ headers')
        } else if (targetCols === 3 && rows.some(r => r.some(isNumericCell))) {
          headers = ['Item', 'Description', 'Amount']
          fixes.push('Auto-generated 3-col headers')
        } else {
          headers = Array.from({length: targetCols}, (_,i)=> `Column ${i+1}`)
          fixes.push('Auto-generated generic headers')
        }
        hasHeader = true
      }
      dataRows = dataRows.map(row => row.map(cleanCell))
      headers = headers.map(cleanCell)
      const before = dataRows.length
      dataRows = dataRows.filter(r => r.some(c => (c||'').trim().length > 0))
      if (dataRows.length < before) fixes.push(`Removed ${before - dataRows.length} empty rows`)
      return { headers, rows: dataRows, hasHeader, fixed: fixes, targetCols }
    } catch (e) {
      console.warn('fixTableErrors failed', e)
      return { headers: [], rows: [], fixed: ['Error fixing table: '+e.message] }
    }
  }

  const blocksToHtml = (blocks) => {
    try {
      let htmlParts = []
      let totalTables = 0
      let totalRows = 0
      let allFixes = []
      const safeBlocks = (blocks||[]).slice(0, 100)
      for (const block of safeBlocks) {
        if (block.type === 'text') {
          const paras = (block.content||'').split(/\n\s*\n/).filter(p=>p.trim()).slice(0,50)
          for (const para of paras) {
            const trimmed = para.trim().slice(0,2000)
            if (!trimmed) continue
            const lines = trimmed.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,20)
            const bulletLines = lines.filter(l => /^(\s*[-•*]\s+|\s*\d+[\.\)]\s+)/.test(l))
            if (bulletLines.length >= 2 && bulletLines.length === lines.length) {
              const isOrdered = /^\s*\d+[\.\)]/.test(bulletLines[0])
              const tag = isOrdered ? 'ol' : 'ul'
              let listHtml = `<${tag} style="margin:14px 0 14px 24px; line-height:1.7">`
              lines.forEach(l => {
                const content = l.replace(/^(\s*[-•*]\s+|\s*\d+[\.\)]\s+)/, '').trim().slice(0,500)
                listHtml += `<li style="margin-bottom:6px">${content}</li>`
              })
              listHtml += `</${tag}>`
              htmlParts.push(listHtml)
            } else if (trimmed.length < 90 && (trimmed.endsWith(':') || (trimmed.toUpperCase() === trimmed && trimmed.length > 4 && trimmed.length < 80))) {
              htmlParts.push(`<p style="margin:16px 0 8px 0"><strong style="font-size:12pt; color:#111">${trimmed}</strong></p>`)
            } else {
              htmlParts.push(`<p style="margin:10px 0; line-height:1.65; text-align:justify">${trimmed.replace(/\n/g, '<br/>').slice(0,3000)}</p>`)
            }
          }
        } else if (block.type === 'table') {
          const fixed = fixTableErrors(block)
          if (fixed.rows.length === 0) {
            htmlParts.push(`<p>${(block.rows||[]).map(r=>(r.cells||[]).join(' ')).join('<br/>').slice(0,1000)}</p>`)
            continue
          }
          totalTables++
          totalRows += fixed.rows.length
          allFixes.push(...(fixed.fixed||[]))
          let tableHtml = `<table class="letter-table" style="width:100%; border-collapse:collapse; margin:18px 0; font-size:10.5pt; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); border:1px solid #e5e5e5">`
          tableHtml += `<thead><tr style="background:linear-gradient(135deg, #111 0%, #222 100%); color:#fff">`
          fixed.headers.forEach((h) => {
            const isNum = /amount|rate|qty|price|total/i.test(h)
            tableHtml += `<th style="padding:11px 14px; font-weight:700; text-align:${isNum?'right':'left'}; font-size:10pt; letter-spacing:0.3px; border-bottom:2px solid #C9A227; white-space:nowrap">${(h||'').slice(0,50)}</th>`
          })
          tableHtml += `</tr></thead><tbody>`
          fixed.rows.slice(0,100).forEach((row, rIdx) => {
            const isEven = rIdx % 2 === 0
            const bg = isEven ? '#fff' : '#fafaf8'
            const isSubtotal = row.join(' ').toLowerCase().includes('total') || row.join(' ').toLowerCase().includes('subtotal')
            if (isSubtotal) {
              tableHtml += `<tr style="background:#f0ece3; font-weight:700; border-top:2px solid #C9A227"><td colspan="${fixed.headers.length-1}" style="padding:12px 14px; text-align:right; color:#111">${row.slice(0,-1).join(' ').slice(0,200)}</td><td style="padding:12px 14px; text-align:right; color:#111">₦${(row[row.length-1]||'').replace(/₦/g,'').slice(0,20)}</td></tr>`
            } else {
              tableHtml += `<tr style="background:${bg}">`
              row.forEach((cell, cIdx) => {
                const header = fixed.headers[cIdx] || ''
                const isNum = /amount|rate|qty|price|total|₦|\d/.test(header) || isNumericCell(cell) || /^\d/.test(cell||'')
                const isUnit = /^(LS|m²|m³|tonne|No)$/i.test((cell||'').trim())
                let align = 'left'
                if (isNum && !isUnit) align = 'right'
                if (isUnit) align = 'center'
                const display = /amount|rate|total/i.test(header) && isNumericCell(cell) ? `₦${(cell||'').replace(/₦/g,'').trim().slice(0,30)}` : (cell||'').slice(0,200)
                tableHtml += `<td style="padding:10px 14px; border-bottom:1px solid #eee; text-align:${align}; vertical-align:top; ${isNum?'font-variant-numeric:tabular-nums;':''}">${display}</td>`
              })
              tableHtml += `</tr>`
            }
          })
          tableHtml += `</tbody></table>`
          htmlParts.push(tableHtml)
        }
      }
      return { html: htmlParts.join('\n').slice(0,50000), stats: { tables: totalTables, rows: totalRows, fixes: allFixes } }
    } catch (e) {
      console.warn('blocksToHtml failed', e)
      return { html: `<p>Error formatting tables: ${e.message}</p>`, stats: { tables: 0, rows: 0, fixes: [e.message] } }
    }
  }

  const smartImproveText = (raw) => {
    try {
      let text = (raw||'').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/ +\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
      return text.slice(0, 80000)
    } catch { return (raw||'').slice(0,80000) }
  }

  const parseBOQ = (text) => {
    try {
      const lines = (text||'').split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0,1000)
      const sections = []
      let currentSection = null
      let grandTotal = null
      let recipient = null
      const recipientMatch = (text||'').match(/(?:Prepared For|Client|For)[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
      if (recipientMatch) recipient = recipientMatch[1]
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]||''
        const sectionMatch = line.match(/^\s*(\d+)\s*[—\-–\.]\s*(.+?)(?:\s+Total)?$/i)
        const sectionAltMatch = line.match(/^(?:SECTION\s*)?(\d+)\s*[-—]\s*(.+)/i)
        if ((sectionMatch && sectionMatch[2].length > 5 && sectionMatch[2].length < 80) || (sectionAltMatch && sectionAltMatch[2].length > 5)) {
          const num = sectionMatch ? sectionMatch[1] : sectionAltMatch[1]
          const title = (sectionMatch ? sectionMatch[2] : sectionAltMatch[2]).replace(/Total$/i, '').trim()
          if (!/^\d+[\d,\.]*$/.test(title) && !/^(LS|m³|m²|tonne|No)/i.test(title)) {
            if (currentSection) sections.push(currentSection)
            currentSection = { number: num, title: title.slice(0,100), rows: [], subtotal: null }
            continue
          }
        }
        const rowRegex = /^(.*?)\s+(LS|m³|m²|m\b|tonne|No\.?|Nos?\.?)\s+([0-9\.\-—]+)\s+([0-9,\.]+)\s+([0-9,\.]+)$/i
        const rowMatch = line.match(rowRegex)
        if (rowMatch && currentSection) {
          const [, desc, unit, qty, rate, amount] = rowMatch
          if (desc.length > 3 && !/^\d+$/.test(desc.trim())) {
            currentSection.rows.push({ description: desc.trim().slice(0,300), unit: unit.trim(), qty: qty.trim(), rate: rate.trim(), amount: amount.trim() })
            continue
          }
        }
        const subtotalMatch = line.match(/(.+?)\s+Total\s+₦?([0-9,\.]+)/i)
        if (subtotalMatch && currentSection && /total/i.test(line)) {
          if (line.toLowerCase().includes('grand') || line.toLowerCase().includes('provisional')) {
            grandTotal = subtotalMatch[2] || line.match(/₦?([0-9,\.]+)/)?.[1]
          } else {
            currentSection.subtotal = subtotalMatch[2] || line.match(/₦?([0-9,\.]+)/)?.[1]
          }
          continue
        }
        const grandMatch = line.match(/Grand\s+Total.*?₦?([0-9,\.]+)/i)
        if (grandMatch) grandTotal = grandMatch[1]
      }
      if (currentSection) sections.push(currentSection)
      if (sections.length === 0) {
        const allRows = []
        for (const line of lines) {
          const m = line.match(/^(.*?)\s+(LS|m³|m²|m\b|tonne|No\.?)\s+([0-9\.\-—]+)\s+([0-9,\.]+)\s+([0-9,\.]+)$/i)
          if (m) allRows.push({ description: m[1].trim().slice(0,300), unit: m[2], qty: m[3], rate: m[4], amount: m[5] })
        }
        if (allRows.length >= 3) sections.push({ number: '1', title: 'Bill Items', rows: allRows, subtotal: null })
      }
      return { sections, grandTotal, recipient, isBOQ: sections.length > 0 && sections.some(s => s.rows.length >= 2) }
    } catch (e) {
      console.warn('parseBOQ failed', e)
      return { sections: [], grandTotal: null, recipient: null, isBOQ: false }
    }
  }

  const formatBOQToHtml = (boq) => {
    try {
      const { sections, grandTotal, recipient } = boq
      let html = `<div style="font-family: Nunito Sans, sans-serif; background:#fff; padding:20px; border-radius:12px">
      <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a); color:#fff; padding:24px; border-bottom:4px solid #C9A227; border-radius:12px 12px 0 0"><div style="font-size:20px; font-weight:800; color:#D4AF37; letter-spacing:2px">Q25 LUXURY CONSTRUX</div><div style="font-size:10px; color:#aaa; margin-top:4px">Building Excellence</div></div>
      <div style="background:linear-gradient(135deg,#C9A227,#D4AF37); color:#000; text-align:center; padding:12px; font-weight:800; letter-spacing:2px">Provisional Bill of Quantity</div>
      <div style="padding:20px"><div style="margin-bottom:12px"><span style="font-weight:700; font-size:11px; color:#666">PREPARED FOR</span><br/><span style="font-size:16px; font-weight:800">${recipient||'Client'}</span></div>`
      sections.slice(0,20).forEach(sec => {
        if (sec.rows.length === 0) return
        html += `<div style="margin-bottom:20px"><div style="background:#111; color:#D4AF37; padding:8px 12px; font-size:11px; font-weight:800">${sec.number} — ${sec.title}</div><table style="width:100%; border-collapse:collapse; font-size:11px"><thead><tr><th style="background:#222; color:#fff; padding:8px; text-align:left; border-bottom:2px solid #C9A227">Description</th><th style="background:#222; color:#fff; padding:8px; text-align:center">Unit</th><th style="background:#222; color:#fff; padding:8px; text-align:right">Qty</th><th style="background:#222; color:#fff; padding:8px; text-align:right">Rate</th><th style="background:#222; color:#fff; padding:8px; text-align:right">Amount</th></tr></thead><tbody>`
        sec.rows.slice(0,100).forEach(row => {
          html += `<tr><td style="padding:6px 8px; border-bottom:1px solid #eee">${row.description}</td><td style="padding:6px 8px; text-align:center; color:#888">${row.unit}</td><td style="padding:6px 8px; text-align:right; font-family:monospace">${row.qty}</td><td style="padding:6px 8px; text-align:right; font-family:monospace">${row.rate}</td><td style="padding:6px 8px; text-align:right; font-weight:700">₦${row.amount}</td></tr>`
        })
        if (sec.subtotal) html += `<tr style="background:#f0ece3; font-weight:800"><td colspan="4" style="padding:8px; text-align:right">${sec.title} Total</td><td style="padding:8px; text-align:right">₦${sec.subtotal}</td></tr>`
        html += `</tbody></table></div>`
      })
      if (grandTotal) html += `<div style="background:linear-gradient(135deg,#111,#000); color:#fff; display:flex; justify-content:space-between; padding:14px 20px; border-top:4px solid #C9A227; margin-top:10px"><span style="color:#D4AF37; font-weight:800; letter-spacing:2px">GRAND TOTAL</span><span style="font-size:18px; font-weight:800">₦${grandTotal}</span></div>`
      html += `</div></div>`
      return html
    } catch (e) {
      console.warn('formatBOQ failed', e)
      return `<p>Error formatting BOQ: ${e.message}</p>`
    }
  }

  const textToHtmlWithTables = (rawText) => {
    try {
      const text = smartImproveText(rawText)
      const boq = parseBOQ(text)
      if (boq.isBOQ && boq.sections.length > 0) {
        setIsBOQ(true)
        setBoqData(boq)
        const stats = { tables: boq.sections.length, rows: boq.sections.reduce((a,s)=>a+s.rows.length,0), fixes: ['BOQ auto-detected','Sections grouped'] }
        setTableStats(stats)
        return formatBOQToHtml(boq)
      }
      const blocks = detectTableBlocks(text)
      const hasTable = blocks.some(b => b.type === 'table')
      setHasTables(hasTable)
      setIsBOQ(false)
      if (hasTable) {
        const result = blocksToHtml(blocks)
        setTableStats(result.stats)
        return result.html
      }
      const lines = text.split('\n').slice(0,1000)
      let result = []
      let currentPara = []
      let inList = false
      let listBuffer = []
      let listType = 'ul'
      const flushList = () => {
        if (listBuffer.length === 0) return ''
        const tag = listType
        let out = `<${tag} style="margin:14px 0 14px 24px; line-height:1.7">`
        listBuffer.forEach(item => { out += `<li style="margin-bottom:6px">${(item||'').slice(0,500)}</li>` })
        out += `</${tag}>`
        listBuffer = []
        inList = false
        return out
      }
      const flushPara = () => {
        if (currentPara.length) {
          const paraText = currentPara.join(' ').trim().slice(0,2000)
          if (paraText) {
            if (paraText.length < 90 && (paraText.endsWith(':') || (paraText.toUpperCase() === paraText && paraText.length > 3 && paraText.length < 80))) {
              result.push(`<p style="margin:16px 0 8px 0"><strong style="font-size:12pt">${paraText}</strong></p>`)
            } else {
              result.push(`<p style="margin:10px 0; line-height:1.65; text-align:justify">${paraText}</p>`)
            }
          }
          currentPara = []
        }
      }
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]||''
        const trimmed = line.trim().slice(0,1000)
        if (!trimmed) { flushPara(); if (inList) result.push(flushList()); continue }
        const bulletMatch = trimmed.match(/^(\s*[-•*]\s+|\s*\d+[\.\)]\s+|\s*[a-zA-Z][\.\)]\s+)/)
        if (bulletMatch) {
          flushPara()
          const content = trimmed.replace(/^(\s*[-•*]\s+|\s*\d+[\.\)]\s+|\s*[a-zA-Z][\.\)]\s+)/, '').trim().slice(0,500)
          if (/^\s*\d+[\.\)]/.test(trimmed)) listType = 'ol'; else listType = 'ul'
          if (!inList) inList = true
          listBuffer.push(content)
          continue
        }
        if (inList) {
          if (listBuffer.length && trimmed.length > 0 && listBuffer[listBuffer.length-1].length < 120) {
            listBuffer[listBuffer.length-1] += ' ' + trimmed
            continue
          } else {
            result.push(flushList())
          }
        }
        currentPara.push(trimmed)
        if (trimmed.endsWith('.') && currentPara.join(' ').length > 280) flushPara()
      }
      if (inList && listBuffer.length) result.push(flushList())
      flushPara()
      setTableStats({ tables: 0, rows: 0, fixes: ['No tables - paragraphs & lists'] })
      return result.join('\n').slice(0,50000)
    } catch (e) {
      console.warn('textToHtmlWithTables failed', e)
      setErrorMsg('Formatting failed: ' + e.message)
      return `<p>${(rawText||'').slice(0,5000).replace(/\n/g,'<br/>')}</p>`
    }
  }

  const formatToHtml = (text, htmlWithTables = null) => {
    try {
      if (htmlWithTables && htmlWithTables.includes('<table')) {
        let cleaned = htmlWithTables.replace(/<table>/g, '<table class="letter-table">').replace(/<table[^>]*>/g, '<table class="letter-table">')
        return cleaned.slice(0,50000)
      }
      return textToHtmlWithTables(text)
    } catch (e) {
      console.warn('formatToHtml failed', e)
      return textToHtmlWithTables(text)
    }
  }

  const extractText = async (file) => {
    setErrorMsg('')
    setStatus(`Reading ${file.name}...`)
    setProgress(10)
    const ext = (file.name.split('.').pop()||'').toLowerCase()
    const type = file.type || ''
    try {
      if (type === 'text/plain' || ext === 'txt') {
        const txt = await file.text()
        setProgress(100)
        setExtractedHtml('')
        try {
          const blocks = detectTableBlocks(txt)
          setHasTables(blocks.some(b=>b.type==='table'))
          const boq = parseBOQ(txt)
          setIsBOQ(boq.isBOQ)
          if (boq.isBOQ) setBoqData(boq)
        } catch {}
        return txt.slice(0,80000)
      }
      if (type === 'application/pdf' || ext === 'pdf') {
        setStatus('Extracting PDF — please wait...')
        let pdfjsLib
        try {
          pdfjsLib = await import('pdfjs-dist')
        } catch (e) {
          console.warn('pdfjs import failed', e)
          setErrorMsg('PDF library failed to load: ' + e.message)
          throw new Error('PDF library failed')
        }
        try {
          const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
          if (workerSrc && workerSrc.default) pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default
        } catch {
          try {
            const version = pdfjsLib.version || '4.10.38'
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
          } catch {}
        }
        let buf
        try { buf = await file.arrayBuffer() } catch (e) { throw new Error('Failed to read PDF file: ' + e.message) }
        let pdf
        try {
          pdf = await pdfjsLib.getDocument({ data: buf }).promise
        } catch (err) {
          console.warn('getDocument failed', err)
          if (err.message && err.message.includes('API version')) {
            try {
              setStatus('Worker mismatch, retrying without worker...')
              pdfjsLib.GlobalWorkerOptions.workerSrc = ''
              pdf = await pdfjsLib.getDocument({ data: buf, disableWorker: true }).promise
            } catch (e2) { throw new Error('PDF parse failed: ' + e2.message) }
          } else {
            throw new Error('PDF parse failed: ' + err.message)
          }
        }

        // First try normal text extraction
        let fullText = ''
        let hasTable = false
        let isGarbled = false
        const maxPages = Math.min(pdf.numPages, 20)
        
        // Helper to fix spaced letters like "S i te c l ea r a n c e" -> "Site clearance"
        const fixSpacedLetters = (str) => {
          try {
            let s = str
            // Fix the pattern where letters are spaced: "P R O V I S I O N A L" -> "PROVISIONAL"
            // Count single letters separated by spaces
            // Replace sequences of single letters with merged word
            // This handles "D e s crip tio n" -> "Description"
            
            // First pass: merge single letters that are part of same word
            // Pattern: single letter + space + single letter + space + 2-4 letters etc.
            // We'll do iterative merging of short tokens
            
            // Split into tokens
            const tokens = s.split(/\s+/).filter(t=>t.length>0)
            if (tokens.length < 3) return s
            
            // If many tokens are single letters, likely garbled
            const singleLetterCount = tokens.filter(t=>t.length===1 && /[A-Za-z]/.test(t)).length
            const shortCount = tokens.filter(t=>t.length<=3).length
            if (singleLetterCount / tokens.length > 0.4) {
              // Garbled - try to reconstruct
              let reconstructed = ''
              let currentWord = ''
              for (let i=0; i<tokens.length; i++) {
                const tok = tokens[i]
                // If token is single letter, add to current word
                if (tok.length === 1 && /[A-Za-z]/.test(tok)) {
                  currentWord += tok
                } else if (tok.length <= 4 && /^[A-Za-z,.;:]+$/.test(tok) && !['and','for','the','with','from'].includes(tok.toLowerCase())) {
                  // Short fragment like "te", "ea", "crip", "tio" - part of word
                  // Check if next token is also short and likely continuation
                  currentWord += tok
                } else {
                  // Longer token or common word - flush current word
                  if (currentWord) {
                    reconstructed += currentWord + ' '
                    currentWord = ''
                  }
                  reconstructed += tok + ' '
                }
              }
              if (currentWord) reconstructed += currentWord
              // Clean up: fix cases like "Siteclearance," -> should be "Site clearance,"
              // But for now return reconstructed and then try to split camelCase?
              s = reconstructed.replace(/\s+/g, ' ').trim()
              
              // Second pass: try to fix merged words that should be separate
              // e.g., "Siteclearance," -> "Site clearance,"
              // Look for pattern: lowercase + uppercase or known words
              // Simple: if we have "Site" + "clearance" merged as "Siteclearance", split if second part starts with lowercase and first is capitalized?
              // Actually our reconstruction may have merged too much, let's try smarter:
              // We'll split by detecting when currentWord becomes too long (>15) and next char is lowercase start of new word?
              // For now, keep as is and let later processing handle
            }
            
            // Additional fixes for specific patterns
            s = s.replace(/\b([A-Z])\s+([a-z])\b/g, '$1$2') // "S i" -> "Si"
            s = s.replace(/\b([a-z])\s+([a-z]{2,})\b/g, (m,a,b) => {
              // If a is single and b is 2-3 letters, merge if not common word boundary
              if (a.length===1) return a+b
              return m
            })
            
            return s
          } catch { return str }
        }

        const isTextGarbled = (text) => {
          try {
            // Check for pattern like "P R O V" or "S i te"
            const singleLetterPattern = (text.match(/\b[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]\b/g) || []).length
            const spacedPattern = (text.match(/[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]/g) || []).length
            const totalWords = text.split(/\s+/).length
            if (singleLetterPattern > 5) return true
            if (spacedPattern > 10) return true
            // Check ratio of single letters
            const tokens = text.split(/\s+/).filter(t=>t.length>0)
            const singleCount = tokens.filter(t=>t.length===1).length
            if (tokens.length > 20 && singleCount / tokens.length > 0.35) return true
            // Check for "(cid:" which indicates failed extraction
            if (text.includes('(cid:')) return true
            return false
          } catch { return false }
        }

        for (let i = 1; i <= maxPages; i++) {
          try {
            setProgress(Math.round((i / maxPages) * 60))
            setStatus(`Reading PDF page ${i}/${pdf.numPages} — extracting text...`)
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const items = (content.items||[]).map(item => {
              try {
                return { str: item.str||'', x: item.transform ? item.transform[4] : 0, y: item.transform ? item.transform[5] : 0, width: item.width||0 }
              } catch { return { str: item.str||'', x: 0, y: 0, width: 0 } }
            }).filter(it => (it.str||'').trim())

            if (items.length === 0) continue

            items.sort((a, b) => b.y - a.y || a.x - b.x)
            let rows = []
            let currentRow = []
            let lastY = null
            const yThreshold = 5
            for (const item of items) {
              if (lastY === null || Math.abs(item.y - lastY) < yThreshold) currentRow.push(item)
              else { if (currentRow.length) rows.push(currentRow); currentRow = [item] }
              lastY = item.y
            }
            if (currentRow.length) rows.push(currentRow)

            let pageText = ''
            for (const row of rows) {
              try {
                row.sort((a, b) => a.x - b.x)
                if (row.length === 0) continue
                
                // Smart reconstruction: handle gaps
                let rowStr = ''
                let lastEnd = null
                for (const it of row) {
                  if (lastEnd === null) {
                    rowStr += it.str
                  } else {
                    const gap = it.x - lastEnd
                    if (gap > 25) {
                      rowStr += '\t' + it.str
                      hasTable = true
                    } else if (gap > 7) {
                      rowStr += ' ' + it.str
                    } else if (gap > 1) {
                      // Small gap - might be word space or part of same word
                      // If both are single letters, no space, else space
                      if (it.str.length === 1 && rowStr.slice(-1).match(/[A-Za-z]/) && rowStr.slice(-2,-1) !== ' ') {
                        rowStr += it.str
                      } else {
                        rowStr += ' ' + it.str
                      }
                    } else {
                      rowStr += it.str
                    }
                  }
                  lastEnd = it.x + it.w
                }
                pageText += rowStr + '\n'
              } catch {}
            }
            fullText += pageText + '\n'
            if (fullText.length > 80000) break
          } catch (pageErr) {
            console.warn(`Page ${i} failed`, pageErr)
            fullText += `\n[Page ${i} extraction failed: ${pageErr.message}]\n`
          }
        }

        // Check if garbled
        if (isTextGarbled(fullText) || fullText.length < 500) {
          console.log('Text appears garbled, trying OCR fallback')
          setStatus('Text garbled — switching to OCR (this takes 20-40s)...')
          isGarbled = true
          
          try {
            const { createWorker } = await import('tesseract.js')
            const worker = await createWorker('eng', 1, {
              logger: m => {
                if (m.status === 'recognizing text') {
                  const pct = 60 + Math.round((m.progress||0) * 35)
                  setProgress(pct)
                  setStatus(`OCR page ${Math.floor((pct-60)/35*maxPages)+1}/${maxPages}: ${Math.round((m.progress||0)*100)}%`)
                }
              }
            })

            let ocrText = ''
            for (let i = 1; i <= maxPages; i++) {
              try {
                setStatus(`OCR: Rendering page ${i}/${maxPages}...`)
                setProgress(60 + Math.round((i / maxPages) * 10))
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale: 2.0 })
                const canvas = document.createElement('canvas')
                canvas.width = viewport.width
                canvas.height = viewport.height
                const ctx = canvas.getContext('2d')
                if (!ctx) continue
                
                // White background
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                
                await page.render({ canvasContext: ctx, viewport }).promise
                
                setStatus(`OCR: Recognizing page ${i}/${maxPages}...`)
                const { data } = await worker.recognize(canvas)
                ocrText += (data.text||'') + '\n\n'
                
                if (ocrText.length > 80000) break
              } catch (ocrPageErr) {
                console.warn(`OCR page ${i} failed`, ocrPageErr)
              }
            }
            
            try { await worker.terminate() } catch {}
            
            if (ocrText.trim().length > 500) {
              console.log('OCR succeeded, length', ocrText.length)
              setStatus(`OCR success! Extracted ${ocrText.length} chars`)
              fullText = ocrText
              hasTable = true // OCR text likely has tables
              isGarbled = false
            } else {
              console.log('OCR text too short, keeping original')
              setStatus('OCR produced little text, using original extraction')
            }
          } catch (ocrErr) {
            console.warn('OCR fallback failed', ocrErr)
            setStatus('OCR failed, using original text extraction')
            setErrorMsg('OCR failed: ' + ocrErr.message + ' — using garbled text, will try to fix')
          }
        }

        // Try to fix spaced letters if still garbled
        if (!isGarbled && isTextGarbled(fullText)) {
          setStatus('Fixing spaced letters in PDF text...')
          try {
            const lines = fullText.split('\n')
            const fixedLines = lines.map(line => {
              // If line has many single letters, try to fix
              if ((line.match(/\b[A-Za-z]\b/g)||[]).length > 5) {
                return fixSpacedLetters(line)
              }
              return line
            })
            const fixedText = fixedLines.join('\n')
            // If fixed text is better (less single letters), use it
            const origSingle = (fullText.match(/\b[A-Za-z]\b/g)||[]).length
            const fixedSingle = (fixedText.match(/\b[A-Za-z]\b/g)||[]).length
            if (fixedSingle < origSingle * 0.7) {
              console.log(`Fixed spaced letters: ${origSingle} -> ${fixedSingle} single letters`)
              fullText = fixedText
              setStatus(`Fixed spaced letters: cleaned ${origSingle - fixedSingle} fragments`)
            }
          } catch (fixErr) {
            console.warn('fixSpacedLetters failed', fixErr)
          }
        }

        setProgress(90)
        try {
          const blocks = detectTableBlocks(fullText)
          const boq = parseBOQ(fullText)
          setIsBOQ(boq.isBOQ)
          if (boq.isBOQ) { 
            setBoqData(boq); 
            setHasTables(true); 
            setStatus(`BOQ detected! ${boq.sections.length} sections, ${boq.sections.reduce((a,s)=>a+s.rows.length,0)} items`) 
          }
          else { 
            setHasTables(hasTable || blocks.some(b=>b.type==='table')); 
            setStatus(hasTable ? `Tables detected! ${blocks.filter(b=>b.type==='table').length} tables` : `Text extracted (${fullText.length} chars)`) 
          }
        } catch {}
        setExtractedHtml('')
        setProgress(100)
        return fullText.slice(0,80000)
      }
      if (ext === 'docx' || type.includes('officedocument.wordprocessingml')) {
        setStatus('Extracting Word doc...')
        try {
          const mammoth = await import('mammoth')
          const buf = await file.arrayBuffer()
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buf }).catch(()=>({value:''}))
          const textResult = await mammoth.extractRawText({ arrayBuffer: buf }).catch(()=>({value:''}))
          const hasTable = (htmlResult.value||'').includes('<table')
          setHasTables(hasTable)
          setExtractedHtml(hasTable ? htmlResult.value : '')
          try {
            const blocks = detectTableBlocks(textResult.value||'')
            const boq = parseBOQ(textResult.value||'')
            if (boq.isBOQ) { setIsBOQ(true); setBoqData(boq) }
            else if (blocks.some(b=>b.type==='table')) setHasTables(true)
          } catch {}
          setProgress(100)
          return (textResult.value||'').slice(0,80000)
        } catch (e) {
          console.warn('docx extract failed', e)
          throw new Error('Word doc extraction failed: ' + e.message)
        }
      }
      if (type.startsWith('image/') || ['png','jpg','jpeg','webp','bmp'].includes(ext)) {
        setStatus('OCR scanning — 10-20s...')
        setProgress(20)
        try {
          const { createWorker } = await import('tesseract.js')
          const worker = await createWorker('eng', 1, {
            logger: m => {
              if (m.status === 'recognizing text') {
                setProgress(20 + Math.round((m.progress||0) * 60))
                setStatus(`OCR: ${Math.round((m.progress||0)*100)}%`)
              }
            }
          })
          const { data } = await worker.recognize(file)
          await worker.terminate().catch(()=>{})
          setProgress(90)
          try {
            const blocks = detectTableBlocks(data.text||'')
            const boq = parseBOQ(data.text||'')
            setIsBOQ(boq.isBOQ)
            if (boq.isBOQ) setBoqData(boq)
            setHasTables(blocks.some(b=>b.type==='table') || boq.isBOQ)
          } catch {}
          setProgress(100)
          return (data.text||'').slice(0,80000)
        } catch (e) {
          console.warn('OCR failed', e)
          throw new Error('OCR failed: ' + e.message)
        }
      }
      const txt = await file.text().catch(()=>{ throw new Error('Could not read file as text') })
      return txt.slice(0,80000)
    } catch (e) {
      console.error('extractText failed', e)
      setErrorMsg(e.message)
      setStatus('Failed: ' + e.message)
      throw e
    }
  }



  const handleFiles = async (files) => {
    if (!files || !files.length) return
    const file = files[0]
    if (file.size > 20 * 1024 * 1024) { setStatus('File too large — max 20MB'); setErrorMsg('File too large'); return }
    setErrorMsg('')
    try {
      const text = await extractText(file)
      if (text && text.trim().length > 0) {
        setExtracted(text)
        setStatus(`Extracted ${text.length} chars from ${file.name} ✓`)
      } else {
        setStatus('No text extracted')
        setErrorMsg('No text found in file')
      }
    } catch (err) {
      console.error('handleFiles failed', err)
      setStatus('Failed: ' + err.message)
      setErrorMsg(err.message)
    }
  }

  const handleDrop = (e) => { try{ e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }catch(err){ setErrorMsg(err.message) } }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 20, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-strong" style={{ width: '100%', maxWidth: 900, borderRadius: 24, padding: 24, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 19 }}>Smart Import — Auto-Detects Tables & Fixes Errors</h3>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Robust: won't crash on PDF • Handles errors gracefully</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '6px 12px' }}>✕ Close</button>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--border-strong)'}`,
            borderRadius: 16, padding: 28, textAlign: 'center',
            background: dragOver ? 'rgba(201,162,39,0.08)' : 'var(--surface)',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>📄📊🧠✨</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Drop any document — messy PDF, Word, scan</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
            <strong>Auto-detects:</strong> tables with errors, BOQ, lists, paragraphs<br/>
            <strong>Robust:</strong> won't crash app — shows error if fails<br/>
            .txt, .pdf, .docx, .png, .jpg — max 20MB, max 20 pages
          </div>
          <div style={{ marginTop: 14 }}><span className="btn-gold" style={{ padding: '10px 18px', fontSize: 13 }}>Browse Files</span></div>
          <input ref={fileRef} type="file" accept=".txt,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={e => { try{ handleFiles(e.target.files) }catch(err){ setErrorMsg(err.message) } }} />
        </div>

        {errorMsg && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: '#fff3f3', border: '1px solid #ffcdd2', fontSize: 13, color: '#b71c1c' }}>
            <strong>⚠️ Error:</strong> {errorMsg}<br/>
            <span style={{ fontSize: 11, color: '#666' }}>Try a smaller file, or save PDF as .docx, or take screenshot and upload as image for OCR.</span>
          </div>
        )}

        {status && (
          <div className="glass" style={{ marginTop: 16, padding: 12, borderRadius: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {status}
                {hasTables && <span style={{ background: 'var(--gold)', color: '#000', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>TABLES DETECTED</span>}
                {isBOQ && <span style={{ background: '#111', color: '#D4AF37', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>BOQ MODE</span>}
                {!hasTables && !isBOQ && extracted && <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>TEXT ONLY</span>}
              </span>
              <span style={{ fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: isBOQ ? 'linear-gradient(90deg, #111, #C9A227)' : hasTables ? 'linear-gradient(90deg, var(--gold), #111)' : '#4caf50', transition: 'width 0.3s' }} />
            </div>
            {tableStats && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>📊 Tables: {tableStats.tables}</span>
                <span>📝 Rows: {tableStats.rows}</span>
                <span>🔧 Fixes: {tableStats.fixes?.length || 0}</span>
              </div>
            )}
          </div>
        )}

        {extracted && (
          <ErrorBoundary onReset={()=>{ setExtracted('') }}>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)' }}>
                {isBOQ ? `BOQ — ${boqData?.sections.length} SECTIONS` : hasTables ? `WITH TABLES — ${tableStats?.tables || 0} TABLES` : 'TEXT ONLY'} — PREVIEW
              </label>
              <span style={{ fontSize: 11, color: isBOQ ? '#111' : hasTables ? 'var(--gold)' : '#2e7d32', fontWeight: 800, background: isBOQ ? '#D4AF37' : hasTables ? 'rgba(201,162,39,0.15)' : '#e8f5e9', padding: '2px 8px', borderRadius: 999 }}>
                {isBOQ ? '📊 BOQ formatted' : hasTables ? '🧠 Tables fixed' : '📝 Paragraphs'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>MESSY RAW (first 4000 chars)</div>
                <div className="input-glass" style={{ maxHeight: 280, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: 11, lineHeight: 1.4 }}>{extracted.slice(0, 4000)}{extracted.length > 4000 ? '\n... (truncated)' : ''}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 4 }}>PROFESSIONAL FIXED</div>
                <div className="glass" style={{ maxHeight: 280, overflowY: 'auto', padding: 8, borderRadius: 12, background: '#fff' }}>
                  <ErrorBoundary>
                    <div style={{ transform: 'scale(0.62)', transformOrigin: 'top left', width: '161%', fontSize: 12 }} dangerouslySetInnerHTML={{ __html: (isBOQ && boqData ? formatBOQToHtml(boqData) : formatToHtml(extracted, extractedHtml)).slice(0, 20000) }} />
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn-gold" onClick={() => {
                try {
                  if (isBOQ && boqData) {
                    const fullHtml = formatBOQToHtml(boqData)
                    const blob = new Blob([fullHtml], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    window.open(url, '_blank')
                    const tableHtml = boqData.sections.map(sec => {
                      let t = `<p><strong>${sec.number} — ${sec.title}</strong></p><table class="letter-table"><thead><tr><th>Description</th><th>Unit</th><th>Qty</th><th>Rate (₦)</th><th>Amount (₦)</th></tr></thead><tbody>`
                      sec.rows.forEach(r => { t += `<tr><td>${r.description}</td><td>${r.unit}</td><td>${r.qty}</td><td>${r.rate}</td><td>${r.amount}</td></tr>` })
                      if (sec.subtotal) t += `<tr style="background:#f0ece3; font-weight:800"><td colspan="4">${sec.title} Total</td><td>₦${sec.subtotal}</td></tr>`
                      t += `</tbody></table>`
                      return t
                    }).join('<br/>') + (boqData.grandTotal ? `<div style="background:#111; color:#D4AF37; padding:16px; display:flex; justify-content:space-between; font-weight:800; margin-top:16px"><span>GRAND TOTAL</span><span>₦${boqData.grandTotal}</span></div>` : '')
                    onExtracted(tableHtml, extracted)
                  } else {
                    const html = formatToHtml(extracted, extractedHtml)
                    onExtracted(html, extracted)
                  }
                  onClose()
                } catch (e) {
                  setErrorMsg('Failed to apply: ' + e.message)
                  console.error(e)
                }
              }}>✨ {isBOQ ? 'Format BOQ & Put on Letterhead' : hasTables ? 'Fix Tables & Put on Letterhead' : 'Format Text & Put on Letterhead'}</button>
              
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setExtracted(''); setExtractedHtml(''); setStatus(''); setProgress(0); setHasTables(false); setIsBOQ(false); setBoqData(null); setTableStats(null); setErrorMsg('') }}>Clear</button>
            </div>
          </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}


// ---------- Preview - ROBUST (won't crash on large PDFs) ----------
function LetterPreview({ letter, margins = DEFAULT_MARGINS, showSignature = true }) {
  const containerRef = useRef(null)
  const contentMeasureRef = useRef(null)
  const [pagesData, setPagesData] = useState([[]])
  const [error, setError] = useState(null)

  const blocks = useMemo(() => {
    try {
      const dateStr = letter.letter_date ? new Date(letter.letter_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
      const ref = (letter.reference_no || '').slice(0, 50)

      const blockList = []

      blockList.push({
        id: 'refdate',
        type: 'refdate',
        html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin-top:18px; margin-bottom:22px; padding-top:8px; display:flex; justify-content:space-between; font-size:10.5pt; align-items:flex-start; line-height:1.4">
          <div style="font-weight:700; letter-spacing:0.2px">Ref: ${ref}</div>
          <div style="text-align:right; font-weight:500; color:#222">${dateStr}</div>
        </div>`,
        keepTogether: true
      })

      if (letter.recipient_name || letter.recipient_title || letter.recipient_address) {
        let html = `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin-bottom:20px; line-height:1.5">`
        if (letter.recipient_name) html += `<div style="font-weight:700; font-size:11.5pt">${(letter.recipient_name||'').slice(0,200)}</div>`
        if (letter.recipient_title) html += `<div style="font-size:10.5pt; color:#222">${(letter.recipient_title||'').slice(0,200)}</div>`
        if (letter.recipient_address) html += `<div style="white-space:pre-line; font-size:10.5pt; margin-top:2px">${(letter.recipient_address||'').slice(0,500)}</div>`
        html += `</div>`
        blockList.push({ id: 'recipient', type: 'recipient', html, keepTogether: true })
      }

      if (letter.subject) {
        blockList.push({
          id: 'subject',
          type: 'subject',
          html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:16px 0 14px 0; font-size:11pt"><span style="font-weight:700">Subject: </span><span style="font-weight:700; text-decoration:underline; text-underline-offset:3px">${(letter.subject||'').slice(0,300)}</span></div>`,
          keepTogether: true
        })
      }

      if (letter.salutation) {
        blockList.push({
          id: 'salutation',
          type: 'salutation',
          html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:12px 0 16px 0; font-size:11.5pt">${(letter.salutation||'').slice(0,200)}</div>`,
          keepTogether: true
        })
      }

      const bodyHtml = (letter.body || '<p style="color:#999">Start typing your letter...</p>').slice(0, 100000)
      try {
        const doc = new DOMParser().parseFromString(`<div>${bodyHtml}</div>`, 'text/html')
        const root = doc.body.firstChild
        if (root) {
          let count = 0
          Array.from(root.childNodes).forEach((node, idx) => {
            if (count > 150) return
            try {
              if (node.nodeType === 3) {
                const txt = (node.textContent||'').trim().slice(0,2000)
                if (txt) {
                  blockList.push({
                    id: `body-text-${idx}`,
                    type: 'paragraph',
                    html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:10px 0; font-size:11.5pt; line-height:1.65">${txt}</div>`,
                    keepTogether: false
                  })
                  count++
                }
                return
              }
              if (node.nodeType === 1) {
                const tag = node.tagName.toLowerCase()
                let outer = ''
                try { outer = node.outerHTML.slice(0, 20000) } catch { outer = `<p>${(node.textContent||'').slice(0,2000)}</p>` }
                if (tag === 'table') {
                  blockList.push({
                    id: `body-table-${idx}`,
                    type: 'table',
                    html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:18px 0">${outer}</div>`,
                    keepTogether: true,
                    isTable: true
                  })
                } else if (['ul','ol'].includes(tag)) {
                  blockList.push({
                    id: `body-list-${idx}`,
                    type: 'list',
                    html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:12px 0">${outer}</div>`,
                    keepTogether: true
                  })
                } else {
                  blockList.push({
                    id: `body-${idx}`,
                    type: tag,
                    html: `<div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin:10px 0">${outer}</div>`,
                    keepTogether: tag !== 'div'
                  })
                }
                count++
              }
            } catch {}
          })
        } else {
          blockList.push({
            id: 'body-fallback',
            type: 'body',
            html: `<div class="letter-block" style="break-inside:avoid; margin:10px 0">${bodyHtml.slice(0,10000)}</div>`,
            keepTogether: false
          })
        }
      } catch (e) {
        console.warn('body parse failed', e)
        blockList.push({
          id: 'body-fallback',
          type: 'body',
          html: `<div class="letter-block" style="margin:10px 0"><p>${(letter.body||'').replace(/<[^>]+>/g,' ').slice(0,5000)}</p></div>`,
          keepTogether: false
        })
      }

      const signOffHtml = `
        <div class="letter-block" style="break-inside:avoid; page-break-inside:avoid; margin-top:36px; line-height:1.5">
          <div style="font-size:11.5pt; margin-bottom:6px">${(letter.closing_line || 'Yours sincerely,').slice(0,100)}</div>
          ${showSignature ? `<img src="/sign.png" alt="signature" style="height:68px; margin:12px 0 8px 0; object-fit:contain; display:block" onerror="this.style.display='none'" />` : '<div style="height:48px"></div>'}
          <div style="font-weight:800; font-size:12pt; letter-spacing:0.2px; margin-top:4px">${OWNER.name}</div>
          <div style="font-weight:700; font-size:10.5pt; color:#222">${OWNER.position}</div>
        </div>`
      blockList.push({ id: 'signoff', type: 'signoff', html: signOffHtml, keepTogether: true })

      return blockList.slice(0, 200)
    } catch (e) {
      console.error('blocks useMemo failed', e)
      return [
        { id: 'error', html: `<div style="color:#b71c1c; padding:10px; border:1px solid #ffcdd2; border-radius:8px">Preview error: ${e.message}. Showing simplified view.</div>` },
        { id: 'refdate', html: `<div>Ref: ${letter.reference_no||''} - ${letter.letter_date||''}</div>` },
        { id: 'body', html: `<div>${(letter.body||'').slice(0,5000)}</div>` }
      ]
    }
  }, [letter, showSignature])

  useEffect(() => {
    try {
      if (!contentMeasureRef.current) return
      const measurer = contentMeasureRef.current
      const contentWidth = 794 - margins.p1.left - margins.p1.right
      measurer.style.width = contentWidth + 'px'

      const measurements = []
      for (const block of blocks) {
        try {
          measurer.innerHTML = block.html
          const h = measurer.scrollHeight || 40
          measurements.push({ ...block, measuredHeight: Math.min(h + 4, 800) })
        } catch {
          measurements.push({ ...block, measuredHeight: 60 })
        }
      }

      const p1Usable = 1123 - margins.p1.top - margins.p1.bottom
      const p2Usable = 1123 - margins.p2.top - margins.p2.bottom

      const pages = []
      let currentPageBlocks = []
      let currentHeight = 0
      let currentUsable = p1Usable

      for (let i = 0; i < measurements.length; i++) {
        const blk = measurements[i]
        const blkH = blk.measuredHeight

        if (blkH > currentUsable) {
          if (currentPageBlocks.length > 0) {
            pages.push(currentPageBlocks)
            currentPageBlocks = []
            currentHeight = 0
            currentUsable = p2Usable
          }
          if (blk.isTable && blkH > currentUsable * 1.2) {
            pages.push([blk])
            currentPageBlocks = []
            currentHeight = 0
            currentUsable = p2Usable
            continue
          } else {
            if (blkH > currentUsable) {
              currentPageBlocks.push(blk)
              pages.push(currentPageBlocks)
              currentPageBlocks = []
              currentHeight = 0
              currentUsable = p2Usable
              continue
            }
          }
        }

        if (currentHeight + blkH > currentUsable) {
          pages.push(currentPageBlocks)
          currentPageBlocks = [blk]
          currentHeight = blkH
          currentUsable = p2Usable
        } else {
          currentPageBlocks.push(blk)
          currentHeight += blkH
        }
      }
      if (currentPageBlocks.length > 0) pages.push(currentPageBlocks)
      if (pages.length === 0) pages.push(measurements)

      setPagesData(pages)
      setError(null)
    } catch (e) {
      console.error('LetterPreview pagination failed', e)
      setError(e.message)
      // Fallback to single page with all blocks
      setPagesData([blocks])
    }
  }, [blocks, margins])

  if (error) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: '#b71c1c' }}>
          Preview pagination error: {error} — showing fallback
        </div>
        <div className="a4-page" style={{ width: 794, minHeight: 1123, position: 'relative' }}>
          <img src="/letter1.png" alt="letterhead" className="a4-bg" onError={(e)=>e.target.style.display='none'} />
          <div style={{ position: 'absolute', left: margins.p1.left, right: margins.p1.right, top: margins.p1.top, bottom: margins.p1.bottom, overflow: 'auto', fontFamily: "'Nunito Sans', sans-serif", fontSize: '11.5pt', lineHeight: 1.65 }}>
            {blocks.map(b => <div key={b.id} dangerouslySetInnerHTML={{ __html: b.html }} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div ref={contentMeasureRef} style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: -9999, top: 0, fontFamily: "'Nunito Sans', sans-serif", fontSize: '11.5pt', lineHeight: 1.65, color: '#111' }} />

      {pagesData.map((pageBlocks, idx) => {
        const isFirst = idx === 0
        const bg = isFirst ? '/letter1.png' : '/letter2.png'
        const m = isFirst ? margins.p1 : margins.p2
        return (
          <div key={idx} className="a4-page" style={{ width: 794, height: 1123, position: 'relative' }}>
            <img src={bg} alt="letterhead" className="a4-bg" onError={(e)=>e.target.style.display='none'} />
            <div style={{ position: 'absolute', left: m.left, right: m.right, top: m.top, bottom: m.bottom, overflow: 'hidden' }}>
              <div style={{ width: '100%', fontFamily: "'Nunito Sans', sans-serif", fontSize: '11.5pt', lineHeight: 1.65, color: '#111' }}>
                {pageBlocks.map(b => (
                  <div key={b.id} dangerouslySetInnerHTML={{ __html: b.html }} />
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 18, fontSize: 9, color: '#999', fontFamily: 'Nunito Sans', letterSpacing: 0.3 }}>Page {idx + 1} of {pagesData.length}</div>
          </div>
        )
      })}
    </div>
  )
}


// ---------- PDF Export (lazy-loaded) - ROBUST FIX ----------
async function exportLetterPdf(letter, margins = DEFAULT_MARGINS, showSignature = true) {
  try {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.create()
    const A4 = [595.28, 841.89]

    // Load fonts with robust fallback
    let fontMed, fontBold, fontExtra
    try {
      const [medBytes, boldBytes, extraBytes] = await Promise.all([
        fetch('/fonts/NunitoSans-Medium.ttf').then(r => { if (!r.ok) throw new Error('med font fetch failed'); return r.arrayBuffer() }).catch(() => null),
        fetch('/fonts/NunitoSans-Bold.ttf').then(r => { if (!r.ok) throw new Error('bold font fetch failed'); return r.arrayBuffer() }).catch(() => null),
        fetch('/fonts/NunitoSans-ExtraBold.ttf').then(r => { if (!r.ok) throw new Error('extra font fetch failed'); return r.arrayBuffer() }).catch(() => null),
      ])
      try {
        fontMed = medBytes ? await pdfDoc.embedFont(medBytes) : await pdfDoc.embedFont(StandardFonts.Helvetica)
      } catch { fontMed = await pdfDoc.embedFont(StandardFonts.Helvetica) }
      try {
        fontBold = boldBytes ? await pdfDoc.embedFont(boldBytes) : await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      } catch { fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold) }
      try {
        fontExtra = extraBytes ? await pdfDoc.embedFont(extraBytes) : fontBold
      } catch { fontExtra = fontBold }
    } catch (fontErr) {
      console.warn('Font loading failed, using standard', fontErr)
      fontMed = await pdfDoc.embedFont(StandardFonts.Helvetica)
      fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      fontExtra = fontBold
    }

    // Load letterhead images with fallback - if fails, use blank
    let letter1Img = null, letter2Img = null, signImg = null
    try {
      const [letter1Bytes, letter2Bytes] = await Promise.all([
        fetch('/letter1.png').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
        fetch('/letter2.png').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null),
      ])
      if (letter1Bytes) {
        try { letter1Img = await pdfDoc.embedPng(letter1Bytes) } catch(e){ console.warn('letter1 embed failed', e) }
      }
      if (letter2Bytes) {
        try { letter2Img = await pdfDoc.embedPng(letter2Bytes) } catch(e){ console.warn('letter2 embed failed', e) }
      }
    } catch(e){ console.warn('letterhead fetch failed', e) }

    if (showSignature) {
      try {
        const signBytes = await fetch('/sign.png').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null)
        if (signBytes) {
          try { signImg = await pdfDoc.embedPng(signBytes) } catch(e){ console.warn('sign embed failed', e) }
        }
      } catch(e){ console.warn('sign fetch failed', e) }
    }

    const parseHtmlToBlocks = (html) => {
      try {
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
          if (tag === 'table') {
            try {
              const rows = []
              const thead = node.querySelector('thead')
              const tbody = node.querySelector('tbody') || node
              const headerRows = thead ? Array.from(thead.querySelectorAll('tr')) : []
              const bodyRows = Array.from(tbody.querySelectorAll('tr'))
              const parseRow = (tr) => {
                return Array.from(tr.querySelectorAll('th, td')).map(cell => ({
                  text: (cell.textContent || '').trim().slice(0, 200),
                  isHeader: cell.tagName.toLowerCase() === 'th',
                  colspan: parseInt(cell.getAttribute('colspan') || '1', 10) || 1
                }))
              }
              if (headerRows.length) {
                headerRows.forEach(tr => { try{ rows.push({ cells: parseRow(tr), isHeader: true }) }catch{} })
              }
              bodyRows.forEach(tr => {
                if (thead && thead.contains(tr)) return
                try{ rows.push({ cells: parseRow(tr), isHeader: false }) }catch{}
              })
              if (rows.length) blocks.push({ type: 'table', rows })
            } catch(e){ console.warn('table parse failed', e) }
            return
          }
          if (tag === 'p' || tag === 'div') {
            if (blocks.length && blocks[blocks.length - 1].type !== 'br') blocks.push({ type: 'br' })
            const align = node.style?.textAlign || ''
            if (align) newStyles.align = align
            try{ Array.from(node.childNodes).forEach(c => walk(c, newStyles)) }catch{}
            blocks.push({ type: 'br' })
            if (tag === 'p') blocks.push({ type: 'br' })
            return
          }
          if (tag === 'li') {
            blocks.push({ type: 'text', text: '• ', ...newStyles })
            try{ Array.from(node.childNodes).forEach(c => walk(c, newStyles)) }catch{}
            blocks.push({ type: 'br' })
            return
          }
          if (['ul', 'ol'].includes(tag)) {
            try{ Array.from(node.childNodes).forEach(c => walk(c, newStyles)) }catch{}
            return
          }
          try{ Array.from(node.childNodes).forEach(c => walk(c, newStyles)) }catch{}
        }
        Array.from(doc.body.childNodes).forEach(n => { try{ walk(n, {}) }catch{} })
        return blocks
      } catch(e){
        console.warn('parseHtmlToBlocks failed', e)
        return [{ type: 'text', text: (html || '').replace(/<[^>]+>/g, ' ').slice(0, 5000) }]
      }
    }

    const dateStr = letter.letter_date ? new Date(letter.letter_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const ref = letter.reference_no || ''

    let currentPageIndex = 0
    const addPage = () => {
      const page = pdfDoc.addPage(A4)
      try {
        const bg = currentPageIndex === 0 ? letter1Img : letter2Img
        if (bg) {
          page.drawImage(bg, { x: 0, y: 0, width: A4[0], height: A4[1] })
        } else {
          // Fallback: draw simple header line if no image
          if (currentPageIndex === 0) {
            page.drawRectangle({ x: 0, y: A4[1]-80, width: A4[0], height: 80, color: rgb(0.05,0.05,0.05) })
            page.drawRectangle({ x: 0, y: A4[1]-82, width: A4[0], height: 3, color: rgb(0.79,0.66,0.15) })
          }
        }
      } catch(e){ console.warn('draw bg failed', e) }
      currentPageIndex++
      return page
    }

    let page = addPage()
    const getMarginsForPage = (idx) => idx === 0 ? margins.p1 : margins.p2
    const pxToPt = (px) => px * (595.28 / 794)
    const drawContentOnPage = (pIdx) => {
      const m = getMarginsForPage(pIdx)
      return {
        left: pxToPt(m.left),
        right: A4[0] - pxToPt(m.right),
        top: A4[1] - pxToPt(m.top),
        bottom: pxToPt(m.bottom),
        width: A4[0] - pxToPt(m.left) - pxToPt(m.right)
      }
    }

    let bounds = drawContentOnPage(0)
    let cursorY = bounds.top - 28

    const ensureSpace = (needed) => {
      if (cursorY - needed < bounds.bottom) {
        page = addPage()
        bounds = drawContentOnPage(currentPageIndex - 1)
        const isFirstPage = currentPageIndex === 1
        cursorY = bounds.top - (isFirstPage ? 28 : 16)
        return true
      }
      return false
    }

    // Date & Ref
    try {
      const refText = `Ref: ${ref}`
      page.drawText(refText, { x: bounds.left, y: cursorY, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
      const dateW = fontMed.widthOfTextAtSize(dateStr, 10)
      page.drawText(dateStr, { x: Math.max(bounds.left, bounds.right - dateW), y: cursorY, size: 10, font: fontMed, color: rgb(0.1, 0.1, 0.1) })
    } catch(e){ console.warn('draw ref/date failed', e) }
    cursorY -= 24

    // Recipient
    if (letter.recipient_name) {
      try { ensureSpace(14); page.drawText((letter.recipient_name||'').slice(0,100), { x: bounds.left, y: cursorY, size: 11, font: fontBold }) } catch{}
      cursorY -= 14
    }
    if (letter.recipient_title) {
      try { ensureSpace(14); page.drawText((letter.recipient_title||'').slice(0,100), { x: bounds.left, y: cursorY, size: 10, font: fontMed }) } catch{}
      cursorY -= 14
    }
    if (letter.recipient_address) {
      const lines = (letter.recipient_address||'').split('\n')
      for (const ln of lines) {
        if (!ln.trim()) continue
        try { ensureSpace(14); page.drawText(ln.slice(0,120), { x: bounds.left, y: cursorY, size: 10, font: fontMed }) } catch{}
        cursorY -= 14
      }
    }
    cursorY -= 8

    // Subject
    if (letter.subject) {
      try {
        ensureSpace(18)
        const subjLabel = 'Subject: '
        page.drawText(subjLabel, { x: bounds.left, y: cursorY, size: 11, font: fontBold })
        const labelW = fontBold.widthOfTextAtSize(subjLabel, 11)
        const subj = (letter.subject||'').slice(0,120)
        const subjW = fontBold.widthOfTextAtSize(subj, 11)
        page.drawText(subj, { x: bounds.left + labelW, y: cursorY, size: 11, font: fontBold })
        try { page.drawLine({ start: { x: bounds.left + labelW, y: cursorY - 2 }, end: { x: bounds.left + labelW + Math.min(subjW, bounds.width - labelW), y: cursorY - 2 }, thickness: 0.8, color: rgb(0, 0, 0) }) } catch{}
      } catch(e){ console.warn('subject draw failed', e) }
      cursorY -= 20
    }

    // Salutation
    if (letter.salutation) {
      try { ensureSpace(16); page.drawText((letter.salutation||'').slice(0,120), { x: bounds.left, y: cursorY, size: 11, font: fontMed }) } catch{}
      cursorY -= 20
    }

    // Body
    let bodyBlocks = []
    try { bodyBlocks = parseHtmlToBlocks(letter.body || '') } catch(e){ bodyBlocks = [{ type: 'text', text: 'Body parse error' }] }
    let currentAlign = 'left'
    let lineBuffer = ''
    let bufferStyle = { bold: false }
    const flushBuffer = () => {
      if (!lineBuffer.trim()) { lineBuffer = ''; return }
      const f = bufferStyle.bold ? fontBold : fontMed
      const size = 11
      const lh = 16
      const words = lineBuffer.split(/\s+/)
      let line = ''
      for (const w of words) {
        const test = line ? line + ' ' + w : w
        try {
          if (f.widthOfTextAtSize(test, size) > bounds.width && line) {
            ensureSpace(lh)
            let drawX = bounds.left
            if (currentAlign === 'center') drawX = bounds.left + (bounds.width - f.widthOfTextAtSize(line, size)) / 2
            if (currentAlign === 'right') drawX = bounds.right - f.widthOfTextAtSize(line, size)
            page.drawText(line, { x: drawX, y: cursorY, size, font: f })
            cursorY -= lh
            line = w
          } else {
            line = test
          }
        } catch {
          line = test
        }
      }
      if (line) {
        try {
          ensureSpace(lh)
          let drawX = bounds.left
          if (currentAlign === 'center') drawX = bounds.left + (bounds.width - f.widthOfTextAtSize(line, size)) / 2
          if (currentAlign === 'right') drawX = bounds.right - f.widthOfTextAtSize(line, size)
          page.drawText(line, { x: drawX, y: cursorY, size, font: f })
          cursorY -= lh
        } catch(e){ console.warn('flush line failed', e) }
      }
      lineBuffer = ''
    }

    for (const blk of bodyBlocks) {
      if (blk.type === 'br') {
        flushBuffer()
        cursorY -= 4
        if (cursorY < bounds.bottom + 20) {
          page = addPage()
          bounds = drawContentOnPage(currentPageIndex - 1)
          cursorY = bounds.top - 16
        }
        continue
      }
      if (blk.type === 'table') {
        flushBuffer()
        try {
          const table = blk
          if (!table.rows || table.rows.length === 0) continue
          const colCount = Math.max(1, ...table.rows.map(r => (r.cells||[]).reduce((sum, c) => sum + (c.colspan||1), 0)))
          const colWidth = bounds.width / colCount
          const rowHeight = 20
          const tableHeight = table.rows.length * rowHeight + 4

          if (cursorY - tableHeight < bounds.bottom) {
            if (tableHeight > (bounds.top - bounds.bottom) * 0.7) {
              if (cursorY - rowHeight * 2 < bounds.bottom) {
                page = addPage()
                bounds = drawContentOnPage(currentPageIndex - 1)
                cursorY = bounds.top - 16
              }
            } else {
              page = addPage()
              bounds = drawContentOnPage(currentPageIndex - 1)
              cursorY = bounds.top - 16
            }
          }

          let y = cursorY
          for (let rIdx = 0; rIdx < table.rows.length; rIdx++) {
            const row = table.rows[rIdx]
            if (!row.cells || row.cells.length === 0) continue
            const isHeader = row.isHeader || rIdx === 0

            if (y - rowHeight < bounds.bottom) {
              page = addPage()
              bounds = drawContentOnPage(currentPageIndex - 1)
              y = bounds.top - 16
              if (!isHeader && table.rows[0]?.isHeader) {
                try {
                  const header = table.rows[0]
                  let x = bounds.left
                  for (const cell of header.cells) {
                    const w = colWidth * (cell.colspan||1)
                    page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, color: rgb(0.07, 0.07, 0.07) })
                    page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, borderColor: rgb(0.79, 0.66, 0.15), borderWidth: 0.8 })
                    const text = (cell.text||'').slice(0, 30)
                    page.drawText(text, { x: x + 4, y: y - 4, size: 9, font: fontBold, color: rgb(1, 1, 1) })
                    x += w
                  }
                  y -= rowHeight
                } catch{}
              }
            }

            let x = bounds.left
            for (const cell of row.cells) {
              try {
                const w = colWidth * (cell.colspan||1)
                if (isHeader) {
                  page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, color: rgb(0.07, 0.07, 0.07) })
                } else if (rIdx % 2 === 0) {
                  page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, color: rgb(0.98, 0.98, 0.96) })
                } else {
                  page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, color: rgb(1, 1, 1) })
                }
                page.drawRectangle({ x, y: y - rowHeight + 4, width: w, height: rowHeight, borderColor: isHeader ? rgb(0.79, 0.66, 0.15) : rgb(0.9, 0.9, 0.9), borderWidth: isHeader ? 0.8 : 0.5 })

                const font = isHeader ? fontBold : fontMed
                const size = 9
                const textColor = isHeader ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1)
                let txt = (cell.text||'').slice(0, 80)
                try {
                  let txtWidth = font.widthOfTextAtSize(txt, size)
                  while (txtWidth > w - 8 && txt.length > 0) {
                    txt = txt.slice(0, -1)
                    txtWidth = font.widthOfTextAtSize(txt + '…', size)
                  }
                  if (txt.length < (cell.text||'').length) txt += '…'
                } catch{}
                const isNum = /^-?[\d,]+(\.\d+)?$/.test((cell.text||'').replace(/[$%₦,]/g,'').trim())
                let tx = x + 4
                if (isNum) {
                  try { const tw = font.widthOfTextAtSize(txt, size); tx = x + w - tw - 6 } catch{}
                }
                page.drawText(txt, { x: tx, y: y - 4, size, font, color: textColor })
                x += w
              } catch(e){ console.warn('cell draw failed', e) }
            }
            y -= rowHeight
          }
          cursorY = y - 8
        } catch(e){ console.warn('table draw failed', e); cursorY -= 20 }
        continue
      }
      if (blk.type === 'text') {
        if (blk.align) currentAlign = blk.align
        bufferStyle = { bold: !!blk.bold }
        lineBuffer += (lineBuffer ? ' ' : '') + (blk.text||'')
      }
    }
    flushBuffer()

    // Sign-off
    const signOffHeight = showSignature ? 110 : 70
    if (cursorY - signOffHeight < bounds.bottom) {
      page = addPage()
      bounds = drawContentOnPage(currentPageIndex - 1)
      cursorY = bounds.top - 16
    }
    cursorY -= 10
    try { page.drawText(letter.closing_line || 'Yours sincerely,', { x: bounds.left, y: cursorY, size: 11, font: fontMed }) } catch{}
    cursorY -= 18
    if (showSignature && signImg) {
      try {
        const sigW = 110, sigH = 48
        ensureSpace(sigH + 10)
        page.drawImage(signImg, { x: bounds.left, y: cursorY - sigH + 12, width: sigW, height: sigH })
        cursorY -= sigH + 8
      } catch(e){ console.warn('sign draw failed', e); cursorY -= 30 }
    } else {
      cursorY -= 30
    }
    try { page.drawText(OWNER.name, { x: bounds.left, y: cursorY, size: 12, font: fontExtra }) } catch{}
    cursorY -= 14
    try { page.drawText(OWNER.position, { x: bounds.left, y: cursorY, size: 10.5, font: fontBold }) } catch{}

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  } catch (err) {
    console.error('exportLetterPdf failed', err)
    throw new Error('PDF export failed: ' + (err.message || err))
  }
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
  const [showImport, setShowImport] = useState(false)

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
    if (!l) {
      alert('No letter to export')
      return
    }
    setSaveState('Exporting...')
    try {
      console.log('Starting PDF export for', l.reference_no)
      const bytes = await exportLetterPdf(l, margins, l.signature_applied)
      console.log('PDF bytes generated', bytes.length)
      if (!bytes || bytes.length === 0) throw new Error('Generated PDF is empty')

      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      // Robust download that works in all browsers
      const fileName = `${(l.reference_no||'Q25-Letter').replace(/\//g, '-')}_${(l.recipient_name || 'letter').replace(/[^a-zA-Z0-9]/g, '_').slice(0,30)}.pdf`
      try {
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        // Delay removal to ensure download starts
        setTimeout(() => {
          try { document.body.removeChild(a) } catch {}
          URL.revokeObjectURL(url)
        }, 2000)
      } catch (dlErr) {
        console.warn('Download via anchor failed, trying window.open', dlErr)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }

      // Optionally upload to supabase storage - non-blocking
      if (isSupabaseConfigured() && user) {
        try {
          const fileNameStorage = `${user.id}/${l.id}.pdf`
          const { error } = await supabase.storage.from('letter-pdfs').upload(fileNameStorage, blob, { upsert: true, contentType: 'application/pdf' })
          if (!error) {
            const { data } = await supabase.storage.from('letter-pdfs').createSignedUrl(fileNameStorage, 60 * 60 * 24 * 7)
            if (data?.signedUrl) {
              const updated = { ...l, pdf_url: data.signedUrl }
              setCurrent(updated)
            }
          }
        } catch (e) { console.warn('storage upload failed', e) }
      }
      setSaveState('Saved ✓')
      setTimeout(() => setSaveState('Saved'), 2000)
    } catch (e) {
      console.error('Export failed', e)
      setSaveState('Export failed')
      alert('PDF Export failed: ' + (e.message || 'Unknown error') + '\n\nCheck console for details. Trying print fallback.')
      // Fallback to print
      try { window.print() } catch {}
    }
  }

  const handleSharePdf = async () => {
    if (!current) return
    // Check if Web Share API with files is supported
    const canShareFiles = navigator.canShare && (() => {
      try {
        const testFile = new File([new Blob(['test'])], 'test.pdf', { type: 'application/pdf' })
        return navigator.canShare({ files: [testFile] })
      } catch { return false }
    })()

    if (navigator.share && canShareFiles) {
      setSaveState('Preparing share...')
      try {
        const bytes = await exportLetterPdf(current, margins, current.signature_applied)
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const fileName = `${(current.reference_no||'Q25-Letter').replace(/\//g, '-')}.pdf`
        const file = new File([blob], fileName, { type: 'application/pdf' })
        await navigator.share({
          title: current.subject || 'Q25 Luxury Construx Letter',
          text: `Letter ${current.reference_no} - ${current.recipient_name || ''}`,
          files: [file]
        })
        setSaveState('Shared ✓')
      } catch (err) {
        console.warn('Share failed', err)
        if (err.name !== 'AbortError') {
          alert('Share failed: ' + err.message + '\nDownloading PDF instead.')
          await handleExportPdf()
        } else {
          setSaveState('Saved')
        }
      }
    } else if (navigator.share) {
      // Share without files (text only) as fallback
      try {
        await navigator.share({
          title: current.subject || 'Q25 Letter',
          text: `Letter ${current.reference_no} to ${current.recipient_name || ''}\nSubject: ${current.subject || ''}`
        })
        setSaveState('Shared ✓')
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('Share not fully supported, downloading PDF')
          await handleExportPdf()
        }
      }
    } else {
      alert('Web Share not supported on this device, downloading PDF')
      await handleExportPdf()
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

  // Updated: any Gmail or any authenticated user is admin (per user request)
  const role = user.role || (user.email && (user.email.includes('gmail.com') || user.email.includes('ceo') || user.email.includes('admin') || user.email.includes('q25')) ? 'admin' : 'admin')
  const canSign = true // all roles can sign now
  const isAdmin = true // all users are admin for now - change to role === 'admin' to restrict later

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--text-secondary)', display: 'block' }}>BODY</label>
                    <button className="btn-gold" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setShowImport(true)}>📄 Import Doc / Scan</button>
                  </div>
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
                  <button className="btn-ghost" onClick={() => handleSharePdf()}>↗ Share</button>
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
                <ErrorBoundary onReset={()=>{}}>
                  <LetterPreview letter={current} margins={margins} showSignature={current.signature_applied} />
                </ErrorBoundary>
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

      {/* Import Modal */}
      <ImportDocModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onExtracted={(html, raw, meta) => {
          if (!current) return
          const newBody = html + (current.body && current.body !== '<p></p>' ? '<br/><br/>' + current.body : '')
          setCurrent({
            ...current,
            body: newBody,
            subject: meta?.subject || current.subject
          })
          if (editorRef.current) {
            editorRef.current.innerHTML = newBody
          }
        }}
      />

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
