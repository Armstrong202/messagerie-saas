'use client'

import { supabase } from '@/lib/supabase'

export default function Admin() {
  const stats = async () => {
    const { count: users } = await supabase.from('auth.users').select('*', { count: 'exact', head: true })
    const { count: voicemails } = await supabase.from('voicemails').select('*', { count: 'exact', head: true })
    return { users, voicemails }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold">Utilisateurs</h2>
          <p className="text-4xl font-bold text-indigo-600">{stats().users}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <p className="text-4xl font-bold text-emerald-600">{stats().voicemails}</p>
        </div>
      </div>
    </div>
  )
}

