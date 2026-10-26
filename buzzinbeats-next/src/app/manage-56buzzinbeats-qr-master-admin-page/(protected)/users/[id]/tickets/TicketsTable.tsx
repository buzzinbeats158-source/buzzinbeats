"use client";

import { useState } from "react";
import { publicStorageUrl } from "@/lib/storage";

type Ticket = {
  id: number;
  ticket_number: string;
  topic: string;
  message: string;
  attachment_path: string | null;
  status: string;
  created_at: string;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const [selected, setSelected] = useState<Ticket | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4 font-medium">Ticket #</th>
                <th className="p-4 font-medium">Topic</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Attachment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr key={t.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(t)}>
                  <td className="p-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black tracking-wide text-orange-700 uppercase">{t.ticket_number}</span>
                  </td>
                  <td className="max-w-[200px] truncate p-4 font-medium text-gray-900">{t.topic}</td>
                  <td className="max-w-[300px] truncate p-4 text-sm text-gray-500">{t.message}</td>
                  <td className="p-4 text-sm">
                    {t.attachment_path ? (
                      <a
                        href={publicStorageUrl(t.attachment_path) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-base">attach_file</span>
                        View
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{fmtDate(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between bg-gradient-to-r from-primary to-primary-warm p-6">
              <div>
                <p className="mb-1 text-xs font-bold tracking-widest text-white/70 uppercase">Ticket</p>
                <h3 className="text-xl font-black text-white uppercase">{selected.ticket_number}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 transition-colors hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Topic</p>
                <p className="text-base font-semibold text-slate-900">{selected.topic}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Message</p>
                <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">{selected.message}</p>
              </div>
              {selected.attachment_path && (
                <div>
                  <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Attachment</p>
                  <a
                    href={publicStorageUrl(selected.attachment_path) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">attach_file</span>
                    View attachment
                  </a>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                <span>Status: {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</span>
                <span>{fmtDate(selected.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
