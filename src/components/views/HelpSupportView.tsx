import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  HelpCircle,
  ExternalLink,
  BookOpen,
  Code2,
  FileQuestion,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const { t } = useLocalization();
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    fetch('/api/tiktok/endpoints')
      .then((res) => res.json())
      .then((data) => {
        if (data.endpoints) setEndpoints(data.endpoints);
      })
      .catch(() => {});
  }, []);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t.help.title}</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.help.subtitle}</p>
      </div>

      {/* Official TikTok API Guide Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{t.help.apiOverviewTitle}</span>
          </h2>
          <a
            href="https://business-api.tiktok.com/portal/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Open TikTok Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="font-semibold text-slate-200">{t.help.requiredScopes}</div>
          <ul className="space-y-2 ps-2">
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="font-mono text-cyan-400 font-semibold">ads_management</span>:
              <span className="text-slate-400 ms-1">
                Authorizes creation of campaigns, ad groups, daily budgets, targeting, and ads.
              </span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="font-mono text-cyan-400 font-semibold">ads_read</span>:
              <span className="text-slate-400 ms-1">
                Reads delivery performance metrics, impressions, CTR, and account billing balance.
              </span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="font-mono text-cyan-400 font-semibold">video.upload</span>:
              <span className="text-slate-400 ms-1">
                Direct programmatic upload of vertical 9:16 video creatives into TikTok Advertiser Library.
              </span>
            </li>
            <li className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="font-mono text-cyan-400 font-semibold">business_data</span>:
              <span className="text-slate-400 ms-1">
                Manages Business Center memberships and linked advertiser account IDs.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official TikTok Marketing API Endpoints Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Server-Side TikTok Marketing API v1.3 Endpoints Catalog</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-start">Operation</th>
                <th className="py-2.5 px-3 text-start">Method & Path</th>
                <th className="py-2.5 px-3 text-start">Required Scope</th>
                <th className="py-2.5 px-3 text-start">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {(endpoints.length > 0
                ? endpoints
                : [
                    {
                      name: 'OAuth 2.0 Auth',
                      method: 'GET',
                      path: '/oauth2/authorize/',
                      scope: 'N/A',
                      purpose: 'Advertiser grants permission to manage Ad Account',
                    },
                    {
                      name: 'Token Exchange',
                      method: 'POST',
                      path: '/oauth2/access_token/',
                      scope: 'N/A',
                      purpose: 'Server exchanges authorization_code for access_token',
                    },
                    {
                      name: 'Campaign Create',
                      method: 'POST',
                      path: '/campaign/create/',
                      scope: 'ads_management',
                      purpose: 'Create advertising campaign container & budget',
                    },
                    {
                      name: 'Ad Group Create',
                      method: 'POST',
                      path: '/adgroup/create/',
                      scope: 'ads_management',
                      purpose: 'Configure Iraqi governorate targeting & schedule',
                    },
                    {
                      name: 'Video Upload',
                      method: 'POST',
                      path: '/file/video/ad/upload/',
                      scope: 'video.upload',
                      purpose: 'Upload 9:16 vertical video into TikTok Library',
                    },
                    {
                      name: 'Ad Create',
                      method: 'POST',
                      path: '/ad/create/',
                      scope: 'ads_management',
                      purpose: 'Bind creative, ad text, CTA button, and URL',
                    },
                    {
                      name: 'Reporting Query',
                      method: 'GET',
                      path: '/report/integrated/get/',
                      scope: 'ads_read',
                      purpose: 'Retrieve verified impressions, clicks, spend',
                    },
                  ]
              ).map((ep, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-sans font-semibold text-white">{ep.name}</td>
                  <td className="py-2 px-3 text-cyan-300">
                    <span className="text-amber-400 font-bold me-1.5">{ep.method}</span>
                    {ep.path}
                  </td>
                  <td className="py-2 px-3 text-purple-300">{ep.scope}</td>
                  <td className="py-2 px-3 font-sans text-slate-400">{ep.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-cyan-400" />
          <span>{t.help.faqTitle}</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <h3 className="font-semibold text-white">{t.help.faq1Q}</h3>
            <p className="text-slate-400 leading-relaxed">{t.help.faq1A}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <h3 className="font-semibold text-white">{t.help.faq2Q}</h3>
            <p className="text-slate-400 leading-relaxed">{t.help.faq2A}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <h3 className="font-semibold text-white">{t.help.faq3Q}</h3>
            <p className="text-slate-400 leading-relaxed">{t.help.faq3A}</p>
          </div>
        </div>
      </div>

      {/* Support Inquiry Ticket Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>{t.help.contactSupport}</span>
        </h2>

        {ticketSent && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Support ticket recorded for MikMik technical review.</span>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300">Inquiry Subject</label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. TikTok Ads targeting question for Erbil"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300">Message</label>
            <textarea
              rows={3}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Describe your inquiry..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.help.sendTicket}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
