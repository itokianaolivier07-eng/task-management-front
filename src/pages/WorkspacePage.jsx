import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getWorkspace } from '../api/workspaces.js'
import { RoleBadge } from '../components/ui/Badge.jsx'
import { ErrorBanner, Loader } from '../components/ui/Feedback.jsx'
import MembersTab from '../components/workspace/MembersTab.jsx'
import ProjectsTab from '../components/workspace/ProjectsTab.jsx'
import SettingsTab from '../components/workspace/SettingsTab.jsx'
import { useAsync } from '../hooks/useAsync.js'

const TABS = [
  { id: 'projects', label: 'Projets' },
  { id: 'members', label: 'Membres' },
  { id: 'settings', label: 'Paramètres' },
]

export default function WorkspacePage() {
  const { id } = useParams()
  const { data: workspace, loading, error, reload } = useAsync(() => getWorkspace(id), [id])
  const [tab, setTab] = useState('projects')

  if (loading && !workspace) return <Loader />
  if (error) return (<><ErrorBanner message={error} /><Link to="/">← Retour</Link></>)
  if (!workspace) return null

  return (
    <>
      <Link to="/" className="back">← Workspaces</Link>
      <div className="page-head">
        <div>
          <h1>{workspace.name} <RoleBadge value={workspace.role} /></h1>
          {workspace.description && <p className="muted">{workspace.description}</p>}
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'projects' && <ProjectsTab workspace={workspace} />}
      {tab === 'members' && <MembersTab workspace={workspace} />}
      {tab === 'settings' && <SettingsTab workspace={workspace} onUpdated={reload} />}
    </>
  )
}
