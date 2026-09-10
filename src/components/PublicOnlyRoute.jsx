import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageLoader from './PageLoader.jsx'

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}
