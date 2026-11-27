import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { CONSTRUCTION_STAGES } from '../data/constructionJourney';
import { useSensury } from '../context/SensuryContext';

const PHASES = [
  'All Stages',
  'Pre-Construction',
  'Substructure & Frame',
  'Masonry & Services',
  'Finishing & Handover',
] as const;

export function JourneyPage() {
  const { activeProject, updateProjectProgress } = useSensury();
  const [selectedPhase, setSelectedPhase] = useState<(typeof PHASES)[number]>('All Stages');
  const [expandedStage, setExpandedStage] = useState<number>(activeProject?.currentStageNumber || 1);
  const [updatingStage, setUpdatingStage] = useState<number | null>(null);

  const completed = activeProject?.completedStageNumbers || [];
  const filteredStages =
    selectedPhase === 'All Stages'
      ? CONSTRUCTION_STAGES
      : CONSTRUCTION_STAGES.filter((s) => s.phase === selectedPhase);

  const handleToggleStageComplete = async (stageNum: number) => {
    if (!activeProject) return;
    setUpdatingStage(stageNum);
    try {
      const isDone = completed.includes(stageNum);
      const nextCompleted = isDone
        ? completed.filter((n) => n !== stageNum)
        : [...completed, stageNum].sort((a, b) => a - b);
      const nextCurrent = Math.min(18, Math.max(1, nextCompleted.length + 1));
      const nextStatus =
        nextCompleted.length === 18 ? 'completed' : nextCompleted.length > 0 ? 'active' : 'planning';
      await updateProjectProgress(activeProject.id, nextCurrent, nextCompleted, nextStatus);
    } finally {
      setUpdatingStage(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          18-Stage Construction Journey
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-2xl">
          Every stage from checking your land papers to collecting your final house keys—explained
          in plain language with materials, approximate timelines, and Tamil Nadu checks.
        </p>
        {activeProject && (
          <p className="text-xs font-medium text-[#154D34] mt-3">
            Tracking against: {activeProject.projectName} · {completed.length} of 18 stages completed
          </p>
        )}
      </div>

      {/* Phase Filter Bar */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#EFECE6] rounded-lg w-fit">
        {PHASES.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setSelectedPhase(phase)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedPhase === phase
                ? 'bg-white text-[#14171A] shadow-sm'
                : 'text-[#4A5056] hover:text-[#14171A]'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Stage List */}
      <div className="space-y-3">
        {filteredStages.map((stage) => {
          const isExpanded = expandedStage === stage.number;
          const isCompleted = completed.includes(stage.number);
          const isCurrent = activeProject?.currentStageNumber === stage.number;

          return (
            <div key={stage.number} className="bg-white border border-[#E7E5DF] rounded-xl overflow-hidden">
              <div className="p-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setExpandedStage(isExpanded ? -1 : stage.number)}
                  className="flex-1 text-left flex items-start gap-4 cursor-pointer min-w-0"
                >
                  <span className="font-mono-num text-sm font-semibold text-[#154D34] pt-0.5 shrink-0">
                    {String(stage.number).padStart(2, '0')}.
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A5056] mb-1">
                      <span>{stage.phase}</span>
                      <span aria-hidden="true">·</span>
                      <span>{stage.approximateDuration}</span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#154D34]">Current Stage</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-lg font-semibold text-[#14171A]">
                      {stage.title}
                    </h2>
                    <p className="text-xs text-[#4A5056] mt-0.5">{stage.tamilTitle}</p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  {activeProject && (
                    <button
                      type="button"
                      disabled={updatingStage === stage.number}
                      onClick={() => handleToggleStageComplete(stage.number)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-[#154D34] text-white border-[#154D34]'
                          : 'bg-[#F9F8F6] text-[#14171A] border-[#E7E5DF] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{isCompleted ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedStage(isExpanded ? -1 : stage.number)}
                    className="p-2 text-[#4A5056] hover:text-[#14171A] cursor-pointer"
                    aria-label={isExpanded ? 'Collapse stage' : 'Expand stage'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 pt-4 border-t border-[#E7E5DF] bg-[#F9F8F6] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-[#14171A] mb-1.5">Plain-Language Summary</h3>
                      <p className="text-[#4A5056] leading-relaxed">{stage.simpleSummary}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#14171A] mb-1.5">What Happens at This Stage</h3>
                      <ul className="space-y-1.5 text-[#4A5056]">
                        {stage.whatHappens.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-[#14171A] mb-1.5">Materials / Inputs Required</h3>
                      <p className="text-[#4A5056]">{stage.materialsRequired.join(' · ')}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#14171A] mb-1.5">Professional Support Needed</h3>
                      <p className="text-[#4A5056]">{stage.professionalSupport.join(' · ')}</p>
                    </div>
                    <div className="p-3.5 bg-white border border-[#E7E5DF] rounded-lg">
                      <p className="text-xs font-semibold text-[#154D34] mb-1">Tamil Nadu Note</p>
                      <p className="text-xs text-[#4A5056] leading-relaxed">{stage.tamilNaduNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
