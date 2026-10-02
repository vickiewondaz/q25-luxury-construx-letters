import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  })
}

export const isSupabaseConfigured = () => !!supabase

export const getSupabase = () => supabase

// Helper to generate reference number: Q25/YYYY/NNN
export const generateReferenceNo = async () => {
  const year = new Date().getFullYear()
  const prefix = `Q25/${year}/`

  if (!supabase) {
    // Local fallback: use localStorage counter
    const key = `q25_counter_${year}`
    let count = parseInt(localStorage.getItem(key) || '0', 10) + 1
    localStorage.setItem(key, String(count))
    return `${prefix}${String(count).padStart(3, '0')}`
  }

  try {
    const { data, error } = await supabase.rpc('generate_reference_no')
    if (error) throw error
    return data
  } catch (e) {
    console.warn('RPC generate_reference_no failed, fallback to count', e)
    // Fallback: count existing
    const { count } = await supabase.from('letters').select('*', { count: 'exact', head: true }).ilike('reference_no', `${prefix}%`)
    const next = (count || 0) + 1
    return `${prefix}${String(next).padStart(3, '0')}`
  }
}
