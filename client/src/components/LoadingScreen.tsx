import { Loader2 } from 'lucide-react'
import './LoadingScreen.css'

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Loader2 className="loading-icon" size={32} aria-hidden="true" />
      <p>Loading…</p>
    </div>
  )
}
