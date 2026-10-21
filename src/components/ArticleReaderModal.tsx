import React, { useState } from 'react';
import { X, BookOpen, Clock, Calendar, User, CheckCircle2, ArrowRight, Share2 } from 'lucide-react';
import { ArticleItem } from '../types';

interface ArticleReaderModalProps {
  article: ArticleItem | null;
  onClose: () => void;
  onBookRelatedService?: (serviceId: string) => void;
  lang?: 'en' | 'ur';
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  onClose,
  onBookRelatedService,
}) => {
  const [copied, setCopied] = useState(false);
  if (!article) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {article.readTimeMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share article"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition relative"
              title="Share or Copy Link"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-7 right-0 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close article"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Authored by {article.author}</span>
          </div>
        </div>

        {/* Key Takeaways Callout */}
        <div className="mt-6 bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-teal-700" />
            Key Clinical Takeaways
          </h3>
          <ul className="space-y-2">
            {article.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-teal-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article Body */}
        <div className="mt-6 space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          {article.contentParagraphs.map((para, i) => (
            <p key={i} className="text-slate-700">
              {para}
            </p>
          ))}
        </div>

        {/* Footer Medical Disclaimer and CTA */}
        <div className="mt-10 pt-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 p-6 sm:p-8 rounded-b-2xl">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            <strong>Medical Disclaimer:</strong> This health guide is provided for educational and preventive awareness by Hearing Clinic. It does not replace individualized diagnostic audiological assessment. For an accurate hearing threshold chart, schedule an appointment with our audiologists in Lahore.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Close Guide
            </button>
            {article.relatedServiceId && onBookRelatedService && (
              <button
                type="button"
                onClick={() => {
                  const sId = article.relatedServiceId!;
                  onClose();
                  onBookRelatedService(sId);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow"
              >
                <span>Schedule Audiological Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
