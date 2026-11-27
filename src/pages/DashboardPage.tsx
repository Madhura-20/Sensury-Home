import React from 'react';
import { ArrowRight, Bot, CheckCircle2, FolderKanban, Plus } from 'lucide-react';
import { AppPage } from '../types/sensury';
import { useSensury } from '../context/SensuryContext';
import { formatInr } from '../lib/calculators';
import { CONSTRUCTION_STAGES } from '../data/constructionJourney';

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile, activeProject, tasks, expenses, materials } = useSensury();

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amountInr) || 0), 0);
  const completedStagesCount = activeProject?.completedStageNumbers?.length || 0;
  const stageProgressPct = Math.round((completedStagesCount / 18) * 100);
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const savedMaterials = materials.filter((m) => (profile?.savedMaterialIds || []).includes(m.id));
  const currentStage = CONSTRUCTION_STAGES.find((s) => s.number === (activeProject?.currentStageNumber || 1));

  if (!user) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">
          Sign in to open your Home Dashboard
        </h1>
        <p className="text-sm text-[#4A5056] leading-relaxed mb-6">
          Your projects, budget records, saved materials, tasks, and AI conversations are stored securely per account.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E5DF]">
        <div>
          <p className="text-xs font-medium text-[#154D34] mb-1">
            SENSURY HOME · Home is where Mom is.
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
            Welcome, {profile?.displayName || user.displayName || 'Homeowner'}
          </h1>
          <p className="text-sm text-[#4A5056] mt-1">
            {activeProject
              ? `${activeProject.projectName} · ${activeProject.landLocation}, ${activeProject.district}`
              : 'Create your first home plan to unlock tailored budgets, stage tracking, and AI guidance.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('planner')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#14171A] bg-white border border-[#E7E5DF] rounded-lg hover:bg-[#F3F2EE] whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeProject ? 'Edit Home Plan' : 'Plan Your Home'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Assistant</span>
          </button>
        </div>
      </div>

      {!activeProject ? (
        <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <FolderKanban className="w-7 h-7 text-[#154D34] mb-3" />
            <h2 className="font-display text-xl font-bold text-[#14171A] mb-2">
              No home project created yet
            </h2>
            <p className="text-sm text-[#4A5056] leading-relaxed mb-6">
              Start in My Home Planner by entering your plot size, location in Tamil Nadu, floors,
              and available budget. SENSURY HOME will generate a preliminary feasibility summary and
              set up your 18-stage construction tracker.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
            >
              <span>Create First Home Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="md:col-span-4 bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg p-5 space-y-2 text-xs text-[#4A5056]">
            <p className="font-semibold text-[#14171A]">What you can also explore now:</p>
            <button type="button" onClick={() => onNavigate('journey')} className="block text-[#154D34] hover:underline cursor-pointer">
              · Read the 18-Stage Construction Journey
            </button>
            <button type="button" onClick={() => onNavigate('materials')} className="block text-[#154D34] hover:underline cursor-pointer">
              · Browse 13 Material Categories
            </button>
            <button type="button" onClick={() => onNavigate('calculator')} className="block text-[#154D34] hover:underline cursor-pointer">
              · Run Cost &amp; Quantity Calculators
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#E7E5DF] rounded-xl p-5">
              <p className="text-xs font-medium text-[#4A5056] mb-1">Construction Progress</p>
              <p className="font-mono-num text-2xl font-bold text-[#14171A]">{stageProgressPct}%</p>
              <p className="text-xs text-[#4A5056] mt-2">
                {completedStagesCount} of 18 stages completed · Stage {activeProject.currentStageNumber} active
              </p>
            </div>

            <div className="bg-white border border-[#E7E5DF] rounded-xl p-5">
              <p className="text-xs font-medium text-[#4A5056] mb-1">Available / Est. Budget</p>
              <p className="font-mono-num text-2xl font-bold text-[#14171A]">
                {formatInr(activeProject.totalBudgetInr)}
              </p>
              <p className="text-xs text-[#4A5056] mt-2">
                Est. build: {formatInr(activeProject.estimatedCostInr)} ({activeProject.builtUpAreaSqFt.toLocaleString('en-IN')} sq.ft)
              </p>
            </div>

            <div className="bg-white border border-[#E7E5DF] rounded-xl p-5">
              <p className="text-xs font-medium text-[#4A5056] mb-1">Expenses Recorded</p>
              <p className="font-mono-num text-2xl font-bold text-[#14171A]">{formatInr(totalSpent)}</p>
              <p className="text-xs text-[#4A5056] mt-2">
                {expenses.length} logged bills &amp; payments
              </p>
            </div>

            <div className="bg-white border border-[#E7E5DF] rounded-xl p-5">
              <p className="text-xs font-medium text-[#4A5056] mb-1">Current Stage Focus</p>
              <p className="text-sm font-semibold text-[#14171A] line-clamp-2 mt-1">
                {currentStage ? `${currentStage.number}. ${currentStage.title}` : `Stage ${activeProject.currentStageNumber}`}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('journey')}
                className="text-xs font-medium text-[#154D34] hover:underline mt-2 cursor-pointer"
              >
                View stage guide
              </button>
            </div>
          </div>

          {/* Two-column Workspace Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upcoming Tasks */}
            <div className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="font-display text-lg font-semibold text-[#14171A]">
                  Upcoming Construction Tasks
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('tracker')}
                  className="text-xs font-semibold text-[#154D34] hover:underline cursor-pointer"
                >
                  Manage all tasks
                </button>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#E7E5DF] rounded-lg">
                  <p className="text-sm text-[#4A5056] mb-3">
                    No pending tasks logged for this project yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('tracker')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
                  >
                    Add First Construction Task
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E5DF]">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#14171A] truncate">{task.title}</p>
                        <p className="text-xs text-[#4A5056]">
                          Stage {task.stageNumber} · {task.assignedRole || 'Homeowner'}
                          {task.dueDate ? ` · Due ${task.dueDate}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#B45309] shrink-0">
                        {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Materials & Quick Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-[#E7E5DF] rounded-xl p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="font-display text-lg font-semibold text-[#14171A]">
                    Saved Materials
                  </h2>
                  <button
                    type="button"
                    onClick={() => onNavigate('materials')}
                    className="text-xs font-semibold text-[#154D34] hover:underline cursor-pointer"
                  >
                    Browse catalogue
                  </button>
                </div>

                {savedMaterials.length === 0 ? (
                  <p className="text-sm text-[#4A5056]">
                    Bookmark cement, steel, brick, or waterproofing guides in the Materials Knowledge Centre to keep them handy here.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E7E5DF]">
                    {savedMaterials.map((mat) => (
                      <div key={mat.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#14171A] truncate">{mat.name}</p>
                          <p className="text-xs text-[#4A5056] truncate">
                            {mat.category} · {mat.indianStandards}
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-[#154D34] shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F3F2EE] border border-[#E7E5DF] rounded-xl p-6">
                <h2 className="font-display text-base font-semibold text-[#14171A] mb-2">
                  Need help understanding a stage or quote?
                </h2>
                <p className="text-xs text-[#4A5056] leading-relaxed mb-4">
                  Ask the AI Home-Building Assistant in English or Tamil. It reads your active project details automatically.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('assistant')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask SENSURY Guide</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
