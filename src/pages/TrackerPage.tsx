import React, { useState } from 'react';
import { Camera, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { CONSTRUCTION_STAGES } from '../data/constructionJourney';
import { useSensury } from '../context/SensuryContext';
import { AppPage, ConstructionTask } from '../types/sensury';
import { formatInr } from '../lib/calculators';
import { compressImageFile } from '../lib/mediaUtils';

interface TrackerPageProps {
  onNavigate: (page: AppPage) => void;
}

export function TrackerPage({ onNavigate }: TrackerPageProps) {
  const {
    user,
    activeProject,
    tasks,
    expenses,
    progressUpdates,
    createTask,
    updateTaskStatus,
    deleteTask,
    createExpense,
    deleteExpense,
    createProgressUpdate,
    deleteProgressUpdate,
  } = useSensury();

  const [tab, setTab] = useState<'tasks' | 'expenses' | 'logs'>('tasks');

  // Task form
  const [taskStage, setTaskStage] = useState(activeProject?.currentStageNumber || 1);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskRole, setTaskRole] = useState('Site Engineer');
  const [taskDue, setTaskDue] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  // Expense form
  const [expStage, setExpStage] = useState(activeProject?.currentStageNumber || 1);
  const [expCategory, setExpCategory] = useState('Cement & Concrete');
  const [expTitle, setExpTitle] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expMode, setExpMode] = useState('Bank Transfer / NEFT');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expNotes, setExpNotes] = useState('');

  // Progress log form
  const [logStage, setLogStage] = useState(activeProject?.currentStageNumber || 1);
  const [logTitle, setLogTitle] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [logPhotoUrl, setLogPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');

  if (!user) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">
          Sign in to use the Construction Progress Tracker
        </h1>
        <p className="text-sm text-[#4A5056] mb-6">
          Track stage tasks, record material bills, monitor contractor payments, and store site progress photos.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">
          Create a Home Plan First
        </h1>
        <p className="text-sm text-[#4A5056] mb-6">
          Once you create a home project in My Home Planner, you can log tasks, expenses, and site progress updates here.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('planner')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
        >
          Go to My Home Planner
        </button>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amountInr) || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({
      stageNumber: taskStage,
      title: taskTitle,
      description: taskDesc,
      assignedRole: taskRole,
      dueDate: taskDue,
      status: 'pending',
    });
    setTaskTitle('');
    setTaskDesc('');
    setTaskDue('');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense({
      stageNumber: expStage,
      category: expCategory,
      title: expTitle,
      vendorName: expVendor,
      amountInr: Number(expAmount),
      paymentMode: expMode,
      expenseDate: expDate,
      notes: expNotes,
    });
    setExpTitle('');
    setExpVendor('');
    setExpAmount(0);
    setExpNotes('');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 280000);
      setLogPhotoUrl(compressed);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Unable to compress photo.');
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProgressUpdate({
      stageNumber: logStage,
      title: logTitle,
      notes: logNotes,
      photoDataUrl: logPhotoUrl,
      updateDate: logDate,
    });
    setLogTitle('');
    setLogNotes('');
    setLogPhotoUrl('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E5DF]">
        <div>
          <p className="text-xs font-medium text-[#154D34] mb-1">{activeProject.projectName}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
            Construction Progress Tracker
          </h1>
          <p className="text-sm text-[#4A5056] mt-1">
            Tasks completed: <span className="font-mono-num font-semibold text-[#14171A]">{completedTasks}/{tasks.length}</span> ·
            Total recorded spend: <span className="font-mono-num font-semibold text-[#14171A]">{formatInr(totalSpent)}</span> of{' '}
            <span className="font-mono-num">{formatInr(activeProject.totalBudgetInr)}</span>
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-[#EFECE6] rounded-lg w-fit">
          {([
            { id: 'tasks', label: 'Tasks' },
            { id: 'expenses', label: 'Expenses & Bills' },
            { id: 'logs', label: 'Site Notes & Photos' },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                tab === item.id ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056] hover:text-[#14171A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleAddTask} className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4 h-fit">
            <h2 className="font-display text-lg font-semibold text-[#14171A]">Create Construction Task</h2>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Stage</label>
              <select
                value={taskStage}
                onChange={(e) => setTaskStage(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              >
                {CONSTRUCTION_STAGES.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Task Title</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Structural Engineer footing steel inspection"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Responsible Role</label>
                <input
                  type="text"
                  value={taskRole}
                  onChange={(e) => setTaskRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Target Date</label>
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Checklist Notes</label>
              <textarea
                rows={2}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Verify 50mm footing cover blocks and anti-termite spray..."
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
            >
              Add Task
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
              Stage Task List ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-[#4A5056] py-10 text-center border border-dashed border-[#E7E5DF] rounded-lg">
                No tasks logged yet. Add inspection checks, approval submissions, or curing reminders.
              </p>
            ) : (
              <div className="divide-y divide-[#E7E5DF]">
                {tasks.map((t) => (
                  <div key={t.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          updateTaskStatus(
                            t.id,
                            t.status === 'completed'
                              ? 'pending'
                              : t.status === 'pending'
                              ? 'in_progress'
                              : 'completed'
                          )
                        }
                        className="mt-0.5 text-[#154D34] cursor-pointer shrink-0"
                        title="Cycle status"
                      >
                        {t.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : t.status === 'in_progress' ? (
                          <Clock className="w-5 h-5 text-[#B45309]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#9CA3AF]" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs text-[#4A5056]">
                          Stage {t.stageNumber} · {t.assignedRole || 'Homeowner'}
                          {t.dueDate ? ` · Due ${t.dueDate}` : ''}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            t.status === 'completed' ? 'line-through text-[#4A5056]' : 'text-[#14171A]'
                          }`}
                        >
                          {t.title}
                        </p>
                        {t.description && <p className="text-xs text-[#4A5056] mt-1">{t.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(t.id, e.target.value as ConstructionTask['status'])}
                        className="px-2 py-1 text-xs border border-[#E7E5DF] rounded-md bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 text-[#4A5056] hover:text-[#DC2626] cursor-pointer"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleAddExpense} className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4 h-fit">
            <h2 className="font-display text-lg font-semibold text-[#14171A]">Record Expense / Payment</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Stage</label>
                <select
                  value={expStage}
                  onChange={(e) => setExpStage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
                >
                  {CONSTRUCTION_STAGES.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
                >
                  <option>Cement &amp; Concrete</option>
                  <option>TMT Steel</option>
                  <option>Bricks / Blocks / Sand</option>
                  <option>Contractor Milestone</option>
                  <option>Approvals &amp; Fees</option>
                  <option>Electrical &amp; Plumbing</option>
                  <option>Tiles, Doors &amp; Paint</option>
                  <option>Other Site Expense</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Payment Title</label>
              <input
                type="text"
                required
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                placeholder="e.g. 120 bags PPC Cement + 2 MT Fe550D"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={expAmount || ''}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono-num border border-[#E7E5DF] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  value={expVendor}
                  onChange={(e) => setExpVendor(e.target.value)}
                  placeholder="Dealer or contractor"
                  className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Payment Mode</label>
                <select
                  value={expMode}
                  onChange={(e) => setExpMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
                >
                  <option>Bank Transfer / NEFT</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Cash Receipt</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Bill / Invoice Notes</label>
              <input
                type="text"
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                placeholder="GST bill no. or milestone details"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
            >
              Record Expense
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-[#14171A]">
                Expense &amp; Payment Ledger
              </h2>
              <span className="font-mono-num text-base font-bold text-[#154D34]">
                {formatInr(totalSpent)}
              </span>
            </div>
            {expenses.length === 0 ? (
              <p className="text-sm text-[#4A5056] py-10 text-center border border-dashed border-[#E7E5DF] rounded-lg">
                No expenses recorded yet. Log every material invoice and contractor advance to monitor your budget.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E5DF] text-left text-xs text-[#4A5056]">
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 px-3 font-medium">Item &amp; Stage</th>
                      <th className="py-2 px-3 font-medium text-right">Amount</th>
                      <th className="py-2 pl-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5DF]">
                    {expenses.map((ex) => (
                      <tr key={ex.id}>
                        <td className="py-3 pr-3 font-mono-num text-xs text-[#4A5056] whitespace-nowrap">
                          {ex.expenseDate}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-[#14171A]">{ex.title}</p>
                          <p className="text-xs text-[#4A5056]">
                            Stage {ex.stageNumber} · {ex.category} · {ex.paymentMode}
                            {ex.vendorName ? ` · ${ex.vendorName}` : ''}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num font-semibold text-[#14171A] whitespace-nowrap">
                          {formatInr(ex.amountInr)}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => deleteExpense(ex.id)}
                            className="p-1 text-[#4A5056] hover:text-[#DC2626] cursor-pointer"
                            aria-label="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Site Notes & Photos Tab */}
      {tab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleAddLog} className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4 h-fit">
            <h2 className="font-display text-lg font-semibold text-[#14171A]">
              Add Site Progress Note / Photo
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Stage</label>
                <select
                  value={logStage}
                  onChange={(e) => setLogStage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
                >
                  {CONSTRUCTION_STAGES.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Update Title</label>
              <input
                type="text"
                required
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                placeholder="e.g. Concealed bathroom plumbing pressure test passed"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Site Notes</label>
              <textarea
                required
                rows={3}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="Record curing days, concrete batch arrival, mason headcount, or engineer feedback..."
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">
                Progress Photograph (Auto-compressed)
              </label>
              <label className="flex items-center gap-2 px-3.5 py-2.5 text-xs bg-[#F9F8F6] border border-dashed border-[#C9C5BC] rounded-lg cursor-pointer hover:bg-[#EFECE6]">
                <Camera className="w-4 h-4 text-[#154D34]" />
                <span>{logPhotoUrl ? 'Photo ready to save' : 'Upload site photo'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {photoError && <p className="text-xs text-[#DC2626] mt-1">{photoError}</p>}
              {logPhotoUrl && (
                <img
                  src={logPhotoUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-lg border border-[#E7E5DF]"
                />
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
            >
              Save Progress Update
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {progressUpdates.length === 0 ? (
              <div className="bg-white border border-[#E7E5DF] rounded-xl p-10 text-center text-sm text-[#4A5056]">
                No site logs recorded yet. Keep photos of concealed electrical/plumbing lines and slab reinforcement here.
              </div>
            ) : (
              progressUpdates.map((upd) => (
                <div key={upd.id} className="bg-white border border-[#E7E5DF] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-xs text-[#4A5056]">
                        {upd.updateDate} · Stage {upd.stageNumber}
                      </p>
                      <h3 className="font-display text-base font-semibold text-[#14171A]">{upd.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteProgressUpdate(upd.id)}
                      className="p-1 text-[#4A5056] hover:text-[#DC2626] cursor-pointer"
                      aria-label="Delete update"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[#4A5056] leading-relaxed mb-3">{upd.notes}</p>
                  {upd.photoDataUrl && (
                    <img
                      src={upd.photoDataUrl}
                      alt={upd.title}
                      className="max-h-64 w-full object-cover rounded-lg border border-[#E7E5DF]"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
