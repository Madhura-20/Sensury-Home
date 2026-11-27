import React, { useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { DOCUMENTS_GUIDE } from '../data/referenceCatalog';
import { CONSTRUCTION_STAGES } from '../data/constructionJourney';
import { useSensury } from '../context/SensuryContext';
import { AppPage, ProjectDocument } from '../types/sensury';
import { readSmallDocumentFile } from '../lib/mediaUtils';

interface DocumentsPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DocumentsPage({ onNavigate }: DocumentsPageProps) {
  const { user, activeProject, documents, createDocumentRecord, updateDocumentStatus, deleteDocumentRecord } =
    useSensury();

  const [category, setCategory] = useState(DOCUMENTS_GUIDE[0].category);
  const [title, setTitle] = useState('');
  const [stageNumber, setStageNumber] = useState(2);
  const [status, setStatus] = useState<ProjectDocument['status']>('pending');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readSmallDocumentFile(file, 380000);
      setFileName(file.name);
      setFileType(file.type || 'application/octet-stream');
      setFileDataUrl(dataUrl);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Unable to process file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('auth');
      return;
    }
    if (!activeProject) {
      onNavigate('planner');
      return;
    }
    setSaving(true);
    try {
      await createDocumentRecord({
        category,
        title,
        stageNumber,
        status,
        fileName,
        fileType,
        fileDataUrl,
        notes,
      });
      setTitle('');
      setNotes('');
      setFileName('');
      setFileType('');
      setFileDataUrl('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Documents &amp; Permissions
        </h1>
        <p className="text-sm text-[#4A5056] mt-1 max-w-3xl">
          Understand Tamil Nadu land records, CMDA/DTCP approvals, TNCDBR 2019 norms, construction
          agreements, and keep your project&rsquo;s deeds, bills, and payment records organized.
        </p>
      </div>

      {/* Knowledge Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DOCUMENTS_GUIDE.map((item) => (
          <div key={item.title} className="bg-white border border-[#E7E5DF] rounded-xl p-6">
            <p className="text-xs font-medium text-[#154D34] mb-1">
              {item.category} · {item.authority}
            </p>
            <h2 className="font-display text-lg font-semibold text-[#14171A] mb-2">{item.title}</h2>
            <p className="text-xs sm:text-sm text-[#4A5056] leading-relaxed mb-3">{item.whyNeeded}</p>
            <ul className="space-y-1 text-xs text-[#14171A]">
              {item.checklist.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Document Organizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-[#E7E5DF]">
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-[#E7E5DF] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-[#14171A]">
            Add Project Document Record
          </h2>
          {!activeProject && (
            <p className="text-xs text-[#B45309]">
              Create a home plan first to attach documents to your project.
            </p>
          )}
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            >
              {DOCUMENTS_GUIDE.map((g) => (
                <option key={g.category} value={g.category}>
                  {g.category}
                </option>
              ))}
              <option value="Material Bills">Material Bills</option>
              <option value="Payment Records">Payment Records</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Year EC Extract / CMDA Plan Sanction"
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Linked Stage</label>
              <select
                value={stageNumber}
                onChange={(e) => setStageNumber(Number(e.target.value))}
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
              <label className="block text-xs font-medium text-[#14171A] mb-1">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectDocument['status'])}
                className="w-full px-3 py-2 text-xs border border-[#E7E5DF] rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">
              Optional Scan / Image Attachment (Compressed ≤ 380 KB)
            </label>
            <label className="flex items-center gap-2 px-3.5 py-2.5 text-xs bg-[#F9F8F6] border border-dashed border-[#C9C5BC] rounded-lg cursor-pointer hover:bg-[#EFECE6]">
              <Upload className="w-4 h-4 text-[#154D34]" />
              <span className="truncate">{fileName || 'Choose image or small PDF scan'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {fileError && <p className="text-xs text-[#DC2626] mt-1">{fileError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1">Notes / Reference No.</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document number, advocate name, or storage folder location..."
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Document Record'}
          </button>
        </form>

        <div className="lg:col-span-7 bg-white border border-[#E7E5DF] rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-[#14171A] mb-4">
            Organized Project Documents ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <p className="text-sm text-[#4A5056] py-10 text-center border border-dashed border-[#E7E5DF] rounded-lg">
              No documents recorded yet. Add your Sale Deed, Patta, EC, building plan permit,
              and GST material bills to keep everything traceable.
            </p>
          ) : (
            <div className="divide-y divide-[#E7E5DF]">
              {documents.map((docItem) => (
                <div key={docItem.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-[#154D34] mt-1 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#4A5056]">
                        {docItem.category} · Stage {docItem.stageNumber}
                      </p>
                      <p className="text-sm font-semibold text-[#14171A] truncate">{docItem.title}</p>
                      {docItem.notes && <p className="text-xs text-[#4A5056] mt-0.5">{docItem.notes}</p>}
                      {docItem.fileDataUrl && (
                        <a
                          href={docItem.fileDataUrl}
                          download={docItem.fileName || 'document'}
                          className="inline-block text-xs font-medium text-[#154D34] hover:underline mt-1"
                        >
                          Download attached file ({docItem.fileName})
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={docItem.status}
                      onChange={(e) =>
                        updateDocumentStatus(docItem.id, e.target.value as ProjectDocument['status'])
                      }
                      className="px-2.5 py-1 text-xs border border-[#E7E5DF] rounded-md bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteDocumentRecord(docItem.id)}
                      className="p-1.5 text-[#4A5056] hover:text-[#DC2626] cursor-pointer"
                      aria-label="Delete document"
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
    </div>
  );
}
