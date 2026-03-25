import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-xl">📞</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Messagerie Vocale SaaS
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Enregistrez, transcrivez et gérez vos messages vocaux avec IA.
        </p>
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/signup">S'inscrire gratuitement</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Démo complète • Production ready
        </p>
      </div>
    </div>
  )
}

