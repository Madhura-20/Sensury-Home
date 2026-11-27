import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSensury } from '../context/SensuryContext';
import { TAMIL_NADU_DISTRICTS } from '../data/referenceCatalog';
import { AppPage } from '../types/sensury';

interface ProfilePageProps {
  onNavigate: (page: AppPage) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile, privateInfo, isAdmin, updateUserProfile } = useSensury();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [district, setDistrict] = useState(profile?.district || 'Chennai');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ta'>(
    profile?.preferredLanguage || 'en'
  );
  const [phone, setPhone] = useState(privateInfo?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setDistrict(profile.district || 'Chennai');
      setPreferredLanguage(profile.preferredLanguage || 'en');
    }
    if (privateInfo) {
      setPhone(privateInfo.phone || '');
    }
  }, [profile, privateInfo]);

  if (!user) {
    return (
      <div className="bg-white border border-[#E7E5DF] rounded-xl p-8 max-w-xl">
        <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">Profile &amp; Settings</h1>
        <p className="text-sm text-[#4A5056] mb-5">Please sign in to manage your profile preferences.</p>
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile({
        displayName,
        district,
        preferredLanguage,
        phone,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="pb-5 border-b border-[#E7E5DF]">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#14171A]">
          Profile &amp; Settings
        </h1>
        <p className="text-sm text-[#4A5056] mt-1">
          Account email and phone are stored in isolated private storage accessible only to you.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E7E5DF] rounded-xl p-6 sm:p-8 space-y-5">
        <div className="pb-4 border-b border-[#E7E5DF] text-xs text-[#4A5056] space-y-1">
          <p>
            <span className="font-semibold text-[#14171A]">Signed-in Email:</span>{' '}
            {privateInfo?.email || user.email}
          </p>
          <p>
            <span className="font-semibold text-[#14171A]">Account Role:</span>{' '}
            {isAdmin ? 'Administrator & Homeowner' : 'Homeowner'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#14171A] mb-1.5">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1.5">Primary District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            >
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#14171A] mb-1.5">Preferred Language</label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'ta')}
              className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#14171A] mb-1.5">Phone Number (Private)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXX XXXXX"
            className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg"
          />
        </div>

        {saved && (
          <p className="text-xs text-[#154D34] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile saved.</span>
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
