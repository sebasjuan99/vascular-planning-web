'use client'
import { useState, useEffect, useCallback } from 'react'
import { Users, Shield, BookOpen, Plus, Pencil, Trash2, Check, X, Search } from 'lucide-react'
import UserFormModal, { type UserFormData } from '@/components/admin/user-form-modal'
import ConfirmDialog from '@/components/admin/confirm-dialog'

interface AdminUser {
  id: string
  email: string
  full_name: string
  specialty: string
  institution: string
  approved: boolean
  role: string
  modules: string[]
  courses: string[]
  created_at: string
}

const AVAILABLE_MODULES = [
  { id: 'evar', label: 'EVAR' },
  { id: 'fevar', label: 'FEVAR' },
]

const AVAILABLE_COURSES = [
  { id: 'curso-evar', label: 'EVAR - Cirugía de Aorta' },
  { id: 'curso-fevar', label: 'FEVAR - Cirugía de Aorta' },
  { id: 'curso-tevar', label: 'TEVAR - Cirugía de Aorta' },
  { id: 'curso-angiografia', label: 'Angiografía Básica' },
  { id: 'curso-ultrasonido', label: 'Uso de Ultrasonido en Cirugía Vascular (VR)' },
  { id: 'curso-accesos', label: 'Accesos Vasculares Guiados con Ultrasonido (VR)' },
]

type Tab = 'users' | 'modules' | 'courses'

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('users')
  const [search, setSearch] = useState('')

  // Modal state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.institution.toLowerCase().includes(q)
  })

  const handleCreateUser = async (data: UserFormData) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error creating user')
    }
    await fetchUsers()
  }

  const handleEditUser = async (data: UserFormData) => {
    if (!editUser) return
    const body: Record<string, unknown> = { full_name: data.full_name, specialty: data.specialty, institution: data.institution }
    if (data.email !== editUser.email) body.email = data.email
    if (data.password) body.password = data.password

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error updating user')
    }
    await fetchUsers()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await fetch(`/api/admin/users/${confirmDelete.id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    await fetchUsers()
  }

  const handleApprove = async (user: AdminUser) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !user.approved }),
    })
    await fetchUsers()
  }

  const toggleModule = async (user: AdminUser, moduleId: string) => {
    setSaving(user.id + moduleId)
    const current = user.modules || []
    const updated = current.includes(moduleId) ? current.filter((m) => m !== moduleId) : [...current, moduleId]
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: updated }),
    })
    await fetchUsers()
    setSaving(null)
  }

  const toggleCourse = async (user: AdminUser, courseId: string) => {
    setSaving(user.id + courseId)
    const current = user.courses || []
    const updated = current.includes(courseId) ? current.filter((c) => c !== courseId) : [...current, courseId]
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courses: updated }),
    })
    await fetchUsers()
    setSaving(null)
  }

  const stats = {
    total: users.length,
    approved: users.filter((u) => u.approved).length,
    pending: users.filter((u) => !u.approved).length,
    admins: users.filter((u) => u.role === 'admin').length,
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'modules', label: 'Módulos', icon: Shield },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión de usuarios, módulos y cursos</p>
        </div>
        <button
          onClick={() => { setFormMode('create'); setEditUser(null); setFormOpen(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Crear Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Aprobados', value: stats.approved, color: 'bg-green-50 text-green-700' },
          { label: 'Pendientes', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Admins', value: stats.admins, color: 'bg-purple-50 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o institución..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Institución</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Rol</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{user.full_name || '—'}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{user.institution || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleApprove(user)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {user.approved ? <><Check className="w-3 h-3" /> Aprobado</> : <><X className="w-3 h-3" /> Pendiente</>}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setFormMode('edit'); setEditUser(user); setFormOpen(true) }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No se encontraron usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {tab === 'modules' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Usuario</th>
                  {AVAILABLE_MODULES.map((m) => (
                    <th key={m.id} className="text-center px-4 py-3 font-medium text-slate-500">{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.filter((u) => u.approved).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{user.full_name || '—'}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    {AVAILABLE_MODULES.map((m) => {
                      const has = (user.modules || []).includes(m.id)
                      const isSaving = saving === user.id + m.id
                      return (
                        <td key={m.id} className="text-center px-4 py-3">
                          <button
                            onClick={() => toggleModule(user, m.id)}
                            disabled={isSaving}
                            className={`w-10 h-6 rounded-full relative transition-colors ${has ? 'bg-blue-600' : 'bg-slate-200'} ${isSaving ? 'opacity-50' : ''}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${has ? 'left-[18px]' : 'left-0.5'}`} />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 min-w-[200px]">Usuario</th>
                  {AVAILABLE_COURSES.map((c) => (
                    <th key={c.id} className="text-center px-3 py-3 font-medium text-slate-500 text-xs min-w-[80px]">{c.label.split(' - ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.filter((u) => u.approved).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{user.full_name || '—'}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    {AVAILABLE_COURSES.map((c) => {
                      const has = (user.courses || []).includes(c.id)
                      const isSaving = saving === user.id + c.id
                      return (
                        <td key={c.id} className="text-center px-3 py-3">
                          <input
                            type="checkbox"
                            checked={has}
                            disabled={isSaving}
                            onChange={() => toggleCourse(user, c.id)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={formMode === 'create' ? handleCreateUser : handleEditUser}
        initialData={editUser ? { email: editUser.email, full_name: editUser.full_name, specialty: editUser.specialty, institution: editUser.institution } : undefined}
        mode={formMode}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar a ${confirmDelete?.full_name || confirmDelete?.email}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        destructive
      />
    </div>
  )
}
