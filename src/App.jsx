import { Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './auth/RouteGuards.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyTasksPage from './pages/MyTasksPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import WorkspacesPage from './pages/WorkspacesPage.jsx'

export default function App() {
  return (
    <Routes>
      {/* Visiteurs uniquement */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Connectés uniquement, avec la barre de navigation */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<WorkspacesPage />} />
          <Route path="/workspaces/:id" element={<WorkspacePage />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
