'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Machine {
  id: string;
  name: string;
  location: string | null;
  notes: string | null;
  maintenance_interval_days: number;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  is_active: boolean;
  status: 'good' | 'under_maintenance' | 'stopped';
}

interface MaintenanceClientProps {
  initialMachines: Machine[];
  userRole: string;
  userName: string;
  factoryId: string;
}

type FilterValue = 'all' | 'good' | 'under_maintenance' | 'stopped';

import type { LocaleCode } from '@/types';

function getStatusConfig(status: Machine['status'], locale: LocaleCode) {
  const config = {
    good: {
      label: t('machines.status.good', locale),
      dot: 'bg-[#22c55e]',
      bg: 'bg-[#22c55e]/10',
      text: 'text-[#16a34a]',
    },
    under_maintenance: {
      label: t('machines.status.underMaintenance', locale),
      dot: 'bg-[#eab308]',
      bg: 'bg-[#eab308]/10',
      text: 'text-[#ca8a04]',
    },
    stopped: {
      label: t('machines.status.stopped', locale),
      dot: 'bg-[#ef4444]',
      bg: 'bg-[#ef4444]/10',
      text: 'text-[#dc2626]',
    },
  };
  return config[status];
}

const emptyForm = {
  name: '',
  location: '',
  notes: '',
  maintenance_interval_days: '',
};

export default function MaintenanceClient({
  initialMachines,
  userRole,
  userName,
  factoryId,
}: MaintenanceClientProps) {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');
  const { locale } = useLocale();
  const isOwner = userRole === 'owner';

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsMachine, setDetailsMachine] = useState<Machine | null>(null);
  const [showMaintenanceLog, setShowMaintenanceLog] = useState(false);
  const [maintenanceMachine, setMaintenanceMachine] = useState<Machine | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [maintenanceForm, setMaintenanceForm] = useState({ date: '', note: '' });
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const [statusDropdown, setStatusDropdown] = useState<{ id: string; top: number; left: number } | null>(null);

  const changeMachineStatus = useCallback(async (machine: Machine, newStatus: Machine['status']) => {
    if (!isOwner) return;

    if (newStatus === machine.status) {
      setStatusDropdown(null);
      return;
    }

    const supabase = createClient();
    const willBeActive = newStatus !== 'stopped';

    const { error: updateError } = await supabase
      .from('machines')
      .update({ is_active: willBeActive })
      .eq('id', machine.id);

    if (updateError) return;

    setMachines((prev) =>
      prev.map((m) =>
        m.id === machine.id
          ? { ...m, is_active: willBeActive, status: newStatus }
          : m
      )
    );
    setStatusDropdown(null);
  }, [isOwner]);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', deleteConfirm);

    if (error) {
      setError(t('machines.errors.deleteFailed', locale));
      setDeleteLoading(false);
      return;
    }

    setMachines((prev) => prev.filter((m) => m.id !== deleteConfirm));
    setDeleteConfirm(null);
    setDeleteLoading(false);
    setSuccess(t('machines.deleteSuccess', locale));
  }, [deleteConfirm, locale]);

  const filteredMachines = useMemo(() => {
    let result = machines;

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.location && m.location.toLowerCase().includes(q))
      );
    }

    return result;
  }, [machines, statusFilter, searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingMachine(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  }, []);

  const openEditForm = useCallback((machine: Machine) => {
    setEditingMachine(machine);
    setForm({
      name: machine.name,
      location: machine.location ?? '',
      notes: machine.notes ?? '',
      maintenance_interval_days: machine.maintenance_interval_days.toString(),
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingMachine(null);
    setForm(emptyForm);
    setError(null);
  }, []);

  const openMaintenanceLog = useCallback((machine: Machine) => {
    setMaintenanceMachine(machine);
    setMaintenanceForm({ date: new Date().toISOString().split('T')[0], note: '' });
    setShowMaintenanceLog(true);
    setError(null);
    setSuccess(null);
  }, []);

  const openDetails = useCallback((machine: Machine) => {
    setDetailsMachine(machine);
    setShowDetails(true);
    setError(null);
    setSuccess(null);
  }, []);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setDetailsMachine(null);
    setError(null);
  }, []);

  const closeMaintenanceLog = useCallback(() => {
    setShowMaintenanceLog(false);
    setMaintenanceMachine(null);
    setMaintenanceForm({ date: '', note: '' });
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.name.trim()) {
      setError(t('machines.errors.nameRequired', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const payload = {
      factory_id: factoryId,
      name: form.name.trim(),
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      maintenance_interval_days: form.maintenance_interval_days
        ? parseInt(form.maintenance_interval_days, 10)
        : 30,
    };

    if (editingMachine) {
      const { data, error: updateError } = await supabase
        .from('machines')
        .update(payload)
        .eq('id', editingMachine.id)
        .select()
        .single();

      if (updateError) {
        setError(t('machines.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      setMachines((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? {
                ...m,
                ...data,
                status: m.status,
                next_maintenance_date: m.next_maintenance_date,
              }
            : m
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from('machines')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(t('machines.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      setMachines((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          location: data.location,
          notes: data.notes,
          maintenance_interval_days: data.maintenance_interval_days,
          last_maintenance_date: data.last_maintenance_date,
          next_maintenance_date: null,
          is_active: data.is_active,
          status: 'good',
        },
      ]);
    }

    setLoading(false);
    closeForm();
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceMachine) return;

    setMaintenanceLoading(true);
    setError(null);
    setSuccess(null);

    if (!maintenanceForm.date) {
      setError(t('machines.maintenanceDate', locale).replace(' *', '') + ' ' + t('machines.errors.nameRequired', locale).split(' ')[0]);
      setMaintenanceLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: logError } = await supabase.from('maintenance_logs').insert({
      factory_id: factoryId,
      machine_id: maintenanceMachine.id,
      date: maintenanceForm.date,
      note: maintenanceForm.note.trim() || null,
    });

    if (logError) {
      setError(t('machines.errors.maintenanceLogFailed', locale));
      setMaintenanceLoading(false);
      return;
    }

    const { data: updatedMachine, error: updateError } = await supabase
      .from('machines')
      .update({ last_maintenance_date: maintenanceForm.date })
      .eq('id', maintenanceMachine.id)
      .select()
      .single();

    if (updateError || !updatedMachine) {
      setError(t('machines.errors.updateFailed', locale));
      setMaintenanceLoading(false);
      return;
    }

    const nextDate = new Date(maintenanceForm.date);
    nextDate.setDate(nextDate.getDate() + updatedMachine.maintenance_interval_days);
    const nextMaintenance = nextDate.toISOString().split('T')[0];

    setMachines((prev) =>
      prev.map((m) =>
        m.id === maintenanceMachine.id
          ? {
              ...m,
              last_maintenance_date: maintenanceForm.date,
              next_maintenance_date: nextMaintenance,
              status: 'good',
              is_active: true,
            }
          : m
      )
    );

    setSuccess(t('machines.maintenanceLogSuccess', locale));
    setMaintenanceLoading(false);
    setTimeout(() => {
      closeMaintenanceLog();
    }, 1500);
  };

  const getMachineIdDisplay = (machine: Machine) => {
    return `MAC-${machine.id.slice(0, 4).toUpperCase()}`;
  };

  const allStatuses: Machine['status'][] = ['good', 'under_maintenance', 'stopped'];

  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {userName.charAt(0)}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {userName}
            </p>
            <p
              className="text-xs text-primary/40"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {isOwner ? t('role.owner', locale) : t('role.worker', locale)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1
              className="text-xl font-bold text-primary md:text-2xl"
              style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
            >
              {t('machines.title', locale)}
            </h1>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] md:px-4 md:py-2.5"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">{t('machines.addMachine', locale)}</span>
              <span className="sm:hidden">{t('machines.add', locale)}</span>
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('machines.searchPlaceholder', locale)}
                className="w-full rounded-lg border border-primary/10 bg-white px-3 py-2 pr-10 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {(['all', 'good', 'under_maintenance', 'stopped'] as FilterValue[]).map((f) => {
                const labels = {
                  all: t('machines.filterAll', locale),
                  good: t('machines.filterGood', locale),
                  under_maintenance: t('machines.filterUnderMaintenance', locale),
                  stopped: t('machines.filterStopped', locale),
                };
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === f
                        ? 'bg-[#1e293b] text-white'
                        : 'border border-primary/10 text-primary/50 hover:bg-primary/5'
                    }`}
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert type="success">
              {success}
            </Alert>
          )}

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                  {editingMachine ? t('machines.editMachine', locale) : t('machines.machineData', locale)}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-primary/40 hover:text-primary/60"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && (
                  <Alert type="error">
                    {error}
                  </Alert>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.name', locale)}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.location', locale)}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.notes', locale)}
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.maintenanceInterval', locale)}
                  </label>
                  <input
                    type="number"
                    name="maintenance_interval_days"
                    value={form.maintenance_interval_days}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {loading ? t('machines.submitSaving', locale) : t('machines.submitSave', locale)}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Maintenance Log Form */}
          {showMaintenanceLog && maintenanceMachine && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                  {t('machines.maintenanceLogTitle', locale)} - {maintenanceMachine.name}
                </h2>
                <button
                  type="button"
                  onClick={closeMaintenanceLog}
                  className="text-primary/40 hover:text-primary/60"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleMaintenanceSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && <Alert type="error">{error}</Alert>}

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.maintenanceDate', locale)}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={maintenanceForm.date}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('machines.maintenanceNote', locale)}
                  </label>
                  <textarea
                    name="note"
                    value={maintenanceForm.note}
                    onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, note: e.target.value }))}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={maintenanceLoading}
                    className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {maintenanceLoading ? t('machines.submitSaving', locale) : t('machines.action.logMaintenanceNow', locale)}
                  </button>
                  <button
                    type="button"
                    onClick={closeMaintenanceLog}
                    className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredMachines.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                {t('machines.empty', locale)}
              </div>
            ) : (
              filteredMachines.map((machine) => {
                const statusCfg = getStatusConfig(machine.status, locale);
                return (
                  <div key={machine.id} className="rounded-xl border border-primary/5 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="text-base font-semibold text-primary"
                          style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                        >
                          {machine.name}
                        </h3>
                        <p
                          className="mt-0.5 text-xs text-primary/40"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {getMachineIdDisplay(machine)}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          <p>{t('machines.location', locale)}: {machine.location ?? '—'}</p>
                          {machine.notes && <p dir="auto" className="text-primary/40 text-xs">{t('machines.notes', locale)}: {machine.notes}</p>}
                          <p>{t('machines.lastMaintenance', locale)}: {machine.last_maintenance_date ?? '—'}</p>
                          <p>{t('machines.nextScheduled', locale)}: {machine.next_maintenance_date ?? '—'}</p>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setStatusDropdown(
                              statusDropdown?.id === machine.id
                                ? null
                                : { id: machine.id, top: rect.bottom + 4, left: rect.left }
                            );
                          }}
                          disabled={!isOwner}
                          className={`inline-flex items-center gap-1.5 rounded-full ${statusCfg.bg} px-2.5 py-1 text-xs font-medium ${statusCfg.text} ${isOwner ? 'cursor-pointer hover:ring-2 hover:ring-accent/40' : ''} transition-all`}
                          style={{ fontFamily: 'var(--font-body-arabic), var-(font-body)' }}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                      <button
                        onClick={() => openDetails(machine)}
                        className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('machines.action.details', locale)}
                      </button>
                      <button
                        onClick={() => openMaintenanceLog(machine)}
                        className="flex-1 rounded-lg border border-accent/20 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/5"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('machines.action.logMaintenance', locale)}
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => openEditForm(machine)}
                          className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                          style={{ fontFamily: 'var-(font-body-arabic), var-(font-body)' }}
                        >
                          {t('machines.action.edit', locale)}
                        </button>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => setDeleteConfirm(machine.id)}
                          className="flex items-center justify-center rounded-lg border border-red-200 px-2.5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                          style={{ fontFamily: 'var-(font-body-arabic), var-(font-body)' }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="rounded-xl border border-primary/5 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5 bg-[#1e293b]">
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.machineId', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.name', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.location', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.notes', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.lastMaintenance', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.nextScheduled', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.status', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.table.actions', locale)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredMachines.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('machines.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      filteredMachines.map((machine) => {
                        const statusCfg = getStatusConfig(machine.status, locale);
                        return (
                          <tr key={machine.id} className="transition-colors hover:bg-primary/[0.01]">
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {getMachineIdDisplay(machine)}
                            </td>
                            <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {machine.name}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {machine.location ?? '—'}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60 max-w-[200px]" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              <p className="truncate" title={machine.notes ?? ''}>{machine.notes ?? '—'}</p>
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {machine.last_maintenance_date ?? '—'}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {machine.next_maintenance_date ?? '—'}
                            </td>
                            <td className="px-6 py-3.5">
                              <button
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setStatusDropdown(
                                    statusDropdown?.id === machine.id
                                      ? null
                                      : { id: machine.id, top: rect.bottom + 4, left: rect.left }
                                  );
                                }}
                                disabled={!isOwner}
                                className={`inline-flex items-center gap-1.5 rounded-full ${statusCfg.bg} px-2.5 py-1 text-xs font-medium ${statusCfg.text} ${isOwner ? 'cursor-pointer hover:ring-2 hover:ring-accent/40' : ''} transition-all`}
                                style={{ fontFamily: 'var(--font-body-arabic), var-(font-body)' }}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                                {statusCfg.label}
                              </button>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openDetails(machine)}
                                  className="rounded-lg border border-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary/60 transition-colors hover:bg-primary/5"
                                  style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                                >
                                  {t('machines.action.details', locale)}
                                </button>
                                <button
                                  onClick={() => openMaintenanceLog(machine)}
                                  className="rounded-lg border border-accent/20 px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/5"
                                  style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                                >
                                  {t('machines.action.logMaintenance', locale)}
                                </button>
                                {isOwner && (
                                  <button
                                    onClick={() => openEditForm(machine)}
                                    className="text-primary/30 transition-colors hover:text-primary/60"
                                    title={t('machines.action.edit', locale)}
                                  >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                  </button>
                                )}
                                {isOwner && (
                                  <button
                                    onClick={() => setDeleteConfirm(machine.id)}
                                    className="text-red-300 transition-colors hover:text-red-500"
                                    title={t('common.delete', locale)}
                                  >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Desktop Side Panel — Add/Edit Machine */}
          {showForm && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeForm} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                  >
                    {editingMachine ? t('machines.editMachine', locale) : t('machines.machineData', locale)}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.name', locale)}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.location', locale)}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.notes', locale)}
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.maintenanceInterval', locale)}
                    </label>
                    <input
                      type="number"
                      name="maintenance_interval_days"
                      value={form.maintenance_interval_days}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {loading ? t('machines.submitSaving', locale) : t('machines.submitSave', locale)}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {t('common.cancel', locale)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Mobile Details Panel */}
          {showDetails && detailsMachine && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                  {t('machines.action.details', locale)}
                </h2>
                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-primary/40 hover:text-primary/60"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {(() => {
                const sc = getStatusConfig(detailsMachine.status, locale);
                return (
                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Machine ID Badge */}
                    <div className="rounded-xl border border-primary/5 bg-primary/[0.01] p-4">
                      <p className="text-xs text-primary/40 mb-1" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.machineId', locale)}</p>
                      <p className="text-sm font-mono font-semibold text-primary">{getMachineIdDisplay(detailsMachine)}</p>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-primary/60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.basicInfo', locale)}
                      </h3>
                      <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-3">
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.name', locale)}</p>
                          <p className="text-sm font-medium text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.location', locale)}</p>
                          <p className="text-sm text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.location ?? '—'}</p>
                        </div>
                        {detailsMachine.notes && (
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.notes', locale)}</p>
                            <p className="text-sm text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.notes}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.status', locale)}</p>
                          <span className={`inline-flex items-center gap-1.5 rounded-full ${sc.bg} px-2.5 py-1 text-xs font-medium ${sc.text} mt-1`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance Info */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-primary/60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('machines.maintenanceInfo', locale)}
                      </h3>
                      <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-3">
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.lastMaintenance', locale)}</p>
                          <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.last_maintenance_date ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.nextScheduled', locale)}</p>
                          <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.next_maintenance_date ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.maintenanceInterval', locale)}</p>
                          <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.maintenance_interval_days} {t('common.days', locale)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Desktop Side Panel — Details */}
          {showDetails && detailsMachine && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeDetails} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3 flex items-center justify-between">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                  >
                    {t('machines.action.details', locale)}
                  </h2>
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="text-primary/40 hover:text-primary/60"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {(() => {
                  const sc = getStatusConfig(detailsMachine.status, locale);
                  return (
                    <div className="p-4 space-y-5">
                      {/* Machine ID */}
                      <div className="rounded-lg border border-primary/5 bg-primary/[0.01] p-3">
                        <p className="text-xs text-primary/40 mb-1" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.machineId', locale)}</p>
                        <p className="text-sm font-mono font-semibold text-primary">{getMachineIdDisplay(detailsMachine)}</p>
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary/60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('machines.basicInfo', locale)}
                        </h3>
                        <div className="rounded-lg border border-primary/5 bg-white p-3 space-y-3">
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.name', locale)}</p>
                            <p className="text-sm font-medium text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.location', locale)}</p>
                            <p className="text-sm text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.location ?? '—'}</p>
                          </div>
                          {detailsMachine.notes && (
                            <div>
                              <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.notes', locale)}</p>
                              <p className="text-sm text-primary mt-0.5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{detailsMachine.notes}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.status', locale)}</p>
                            <span className={`inline-flex items-center gap-1.5 rounded-full ${sc.bg} px-2.5 py-1 text-xs font-medium ${sc.text} mt-1`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Maintenance Info */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-primary/60 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('machines.maintenanceInfo', locale)}
                        </h3>
                        <div className="rounded-lg border border-primary/5 bg-white p-3 space-y-3">
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.lastMaintenance', locale)}</p>
                            <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.last_maintenance_date ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.nextScheduled', locale)}</p>
                            <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.next_maintenance_date ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('machines.maintenanceInterval', locale)}</p>
                            <p className="text-sm text-primary mt-0.5 font-mono">{detailsMachine.maintenance_interval_days} {t('common.days', locale)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Desktop Side Panel — Log Maintenance */}
          {showMaintenanceLog && maintenanceMachine && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeMaintenanceLog} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                  >
                    {t('machines.maintenanceLogTitle', locale)}
                  </h2>
                  <p
                    className="mt-0.5 text-xs text-primary/40"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {maintenanceMachine.name}
                  </p>
                </div>
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4 p-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.maintenanceDate', locale)}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={maintenanceForm.date}
                      onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('machines.maintenanceNote', locale)}
                    </label>
                    <textarea
                      name="note"
                      value={maintenanceForm.note}
                      onChange={(e) => setMaintenanceForm((prev) => ({ ...prev, note: e.target.value }))}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={maintenanceLoading}
                      className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {maintenanceLoading ? t('machines.submitSaving', locale) : t('machines.action.logMaintenanceNow', locale)}
                    </button>
                    <button
                      type="button"
                      onClick={closeMaintenanceLog}
                      className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {t('common.cancel', locale)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

          {/* Status dropdown overlay */}
          {statusDropdown && isOwner && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setStatusDropdown(null)} />
              <div
                className="fixed z-50 w-40 rounded-lg border border-primary/10 bg-white shadow-lg"
                style={{ top: statusDropdown.top, left: statusDropdown.left }}
              >
                {allStatuses.map((s) => {
                  const sc = getStatusConfig(s, locale);
                  const machine = machines.find((m) => m.id === statusDropdown.id);
                  if (!machine) return null;
                  return (
                    <button
                      key={s}
                      onClick={() => changeMachineStatus(machine, s)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/5 ${
                        s === machine.status ? 'bg-primary/[0.02]' : ''
                      }`}
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                      <span className={sc.text}>{sc.label}</span>
                      {s === machine.status && (
                        <svg className="mr-auto h-3.5 w-3.5 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {statusDropdown && !isOwner && (
            <>
              <div className="fixed inset-0 z-50" onClick={() => setStatusDropdown(null)} />
              <div
                className="fixed z-50 w-40 rounded-lg border border-primary/10 bg-white shadow-lg"
                style={{ top: statusDropdown.top, left: statusDropdown.left }}
              >
                {allStatuses.map((s) => {
                  const sc = getStatusConfig(s, locale);
                  const machine = machines.find((m) => m.id === statusDropdown.id);
                  if (!machine) return null;
                  return (
                    <button
                      key={s}
                      onClick={() => changeMachineStatus(machine, s)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/5 ${
                        s === machine.status ? 'bg-primary/[0.02]' : ''
                      }`}
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                      <span className={sc.text}>{sc.label}</span>
                      {s === machine.status && (
                        <svg className="mr-auto h-3.5 w-3.5 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={deleteConfirm !== null}
            title={t('common.delete', locale)}
            message={t('machines.deleteConfirm', locale)}
            confirmLabel={t('common.delete', locale)}
            cancelLabel={t('common.cancel', locale)}
            onConfirm={handleDelete}
            onCancel={() => { setDeleteConfirm(null); setError(null); }}
            loading={deleteLoading}
          />
      </main>
    </>
  );
}
