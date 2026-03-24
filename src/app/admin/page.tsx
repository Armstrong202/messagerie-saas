'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

interface Stats {
  users: number | null
  voicemails: number | null
}

export default function Admin() {
  const [statsData, setStatsData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      if (!supabase) {
        setLoading(false)
        return
      }
      const { count: users } = await supabase.from('auth.users').select('*', { count: 'exact', head: true })
      const { count: voicemails } = await supabase.from('voicemails').select('*', { count: 'exact', head: true })
      setStatsData({ users, voicemails })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!statsData) {
    return <div className="p-8">Error loading stats</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold">Utilisateurs</h2>
          <p className="text-4xl font-bold text-indigo-600">{statsData.users ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <p className="text-4xl font-bold text-emerald-600">{statsData.voicemails ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

