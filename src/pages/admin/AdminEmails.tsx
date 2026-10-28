import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmailTemplate, EmailLog } from '../../types';
import { Mail, RefreshCw, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const AdminEmails: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmailRecipient, setTestEmailRecipient] = useState('care@littlenest.pk');
  const [sendingTest, setSendingTest] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadEmailData = async () => {
    try {
      const [tList, lList] = await Promise.all([
        api.getEmailTemplates(),
        api.getEmailLogs(),
      ]);
      setTemplates(tList);
      setLogs(lList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmailData();
  }, []);

  const handleRetryEmail = async (id: string) => {
    try {
      await api.retryEmail(id);
      setFeedback('Email delivery re-queued and dispatched successfully.');
      await loadEmailData();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to retry email');
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setFeedback(null);
    try {
      await api.sendTestEmail(testEmailRecipient, 'order_confirmation_customer');
      setFeedback(`Test preview notification sent to ${testEmailRecipient}`);
      await loadEmailData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-[#E8DCCB] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Automated Transactional Notifications
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Email Automation & Delivery Logs
        </h1>
        <p className="text-xs text-[#735F53] mt-1">
          Review automated customer receipts, admin alerts, shipping tracking triggers, and queue retries.
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Test Email Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] shadow-xs">
        <h4 className="font-serif-luxury text-base font-semibold text-[#4A3B32] mb-1">
          Send Test Notification Preview
        </h4>
        <p className="text-xs text-[#8A7569] mb-3">
          Simulate a customer order receipt or shipping update to verify delivery formatting.
        </p>
        <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="email"
            required
            placeholder="Enter destination email address"
            value={testEmailRecipient}
            onChange={(e) => setTestEmailRecipient(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg text-[#4A3B32]"
          />
          <button
            type="submit"
            disabled={sendingTest}
            className="px-4 py-2 bg-[#5A463C] text-white rounded-lg text-xs font-semibold hover:bg-[#43332B] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? 'Sending...' : 'Send Test Notification'}</span>
          </button>
        </form>
      </div>

      {/* Templates Overview */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs p-6 space-y-4">
        <h3 className="font-serif-luxury text-lg text-[#4A3B32]">Configured Transactional Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E8DCCB] flex flex-col justify-between">
              <div>
                <span className="font-semibold text-[#4A3B32] block">{tpl.name}</span>
                <p className="text-[#8A7569] text-[11px] mt-1">{tpl.description}</p>
                <p className="font-mono text-[11px] text-[#5A463C] mt-2 font-medium">Subject: {tpl.subject}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#E8DCCB]/60 text-[10px] text-[#8A7569]">
                Variables: {tpl.variables.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Delivery Queue & Logs */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
          <div>
            <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
              Notification Queue & Delivery Log History ({logs.length})
            </h3>
            <p className="text-xs text-[#8A7569]">
              Every transactional notification dispatched upon order creation or courier update
            </p>
          </div>
          <button onClick={loadEmailData} className="p-1.5 text-[#5A463C] hover:bg-white rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Retry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[#4A3B32]">{log.recipient}</td>
                  <td className="py-3 px-4">{log.subject}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#5A463C]">{log.orderNumber || '—'}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8A7569]">
                    {log.sentAt ? new Date(log.sentAt).toLocaleDateString('en-PK', { timeStyle: 'short', dateStyle: 'short' }) : 'Queued'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      log.status === 'sent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      log.status === 'queued' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRetryEmail(log.id)}
                      className="px-2.5 py-1 rounded bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white transition-colors"
                    >
                      Resend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
