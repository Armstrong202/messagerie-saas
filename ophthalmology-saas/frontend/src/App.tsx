import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { User, Calendar, Eye, FileText } from 'lucide-react'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OphthoApp />
    </QueryClientProvider>
  )
}

function OphthoApp() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then(res => res.json()),
    staleTime: 5 * 60 * 1000
  })

  const mockData = [
    { date: 'Jan', consultations: 12, revenue: 2400 },
    { date: 'Feb', consultations: 19, revenue: 3900 },
    { date: 'Mar', consultations: 15, revenue: 3100 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Cabinet Ophtalmologie SaaS
            </h1>
            <p className="text-xl text-gray-600">
              Gestion patients • RDV • Examens • Analyses {offline && '🔴 OFFLINE'}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_patients || 0}</p>
                <p className="text-gray-600">Patients</p>
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur p-8 rounded-3xl shadow-xl border border-white/50">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="w-12 h-12 text-emerald-500" />
              <div>
                <p className="text-3xl font-bold text-emerald-600">24</p>
                <p className="text-gray-600">RDV semaine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/70 backdrop-blur p-8 rounded-3xl shadow-xl border border-white/50 lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Suivi activité mensuelle
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="consultations" stroke="#3b82f6" name="Consultations" />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenus (€)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default App

