import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx'
import PageLoader from './components/PageLoader.jsx'

/* Lazy-loaded pages keep the initial bundle light */
const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Contacts = lazy(() => import('./pages/Contacts.jsx'))
const AddContact = lazy(() => import('./pages/AddContact.jsx'))
const ContactDetails = lazy(() => import('./pages/ContactDetails.jsx'))
const EditContact = lazy(() => import('./pages/EditContact.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const Groups = lazy(() => import('./pages/Groups.jsx'))
const Activity = lazy(() => import('./pages/Activity.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const S = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={S(<Home />)} />
      <Route path="/login" element={<PublicOnlyRoute>{S(<Login />)}</PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute>{S(<Signup />)}</PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute>{S(<ForgotPassword />)}</PublicOnlyRoute>} />

      {/* Authenticated shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={S(<Dashboard />)} />
        <Route path="/contacts" element={S(<Contacts />)} />
        <Route path="/contacts/new" element={S(<AddContact />)} />
        <Route path="/contacts/:id" element={S(<ContactDetails />)} />
        <Route path="/contacts/:id/edit" element={S(<EditContact />)} />
        <Route path="/favorites" element={S(<Favorites />)} />
        <Route path="/groups" element={S(<Groups />)} />
        <Route path="/activity" element={S(<Activity />)} />
        <Route path="/profile" element={S(<Profile />)} />
        <Route path="/settings" element={S(<Settings />)} />
      </Route>

      <Route path="*" element={S(<NotFound />)} />
    </Routes>
  )
}
