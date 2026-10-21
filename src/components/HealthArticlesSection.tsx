import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Bookmark, Sparkles } from 'lucide-react';
import { CLINIC_ARTICLES } from '../data/clinicData';
import { ArticleItem } from '../types';
import { ArticleReaderModal } from './ArticleReaderModal';

interface HealthArticlesSectionProps {
  onBookService?: (serviceId: string) => void;
  lang?: 'en' | 'ur';
}

export const HealthArticlesSection: React.FC<HealthArticlesSectionProps> = ({
  onBookService,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'Audiology', 'Hearing Aids', 'Pediatrics', 'Tinnitus', 'Prevention'];

  const filteredArticles = filterCategory === 'all'
    ? CLINIC_ARTICLES
    : CLINIC_ARTICLES.filter((a) => a.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <section id="articles" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            Hearing Health Guides &amp; Articles
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Evidence-Based Audiology &amp; Hearing Guides
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Written by our clinical audiology consultants to help patients, parents, and caregivers make informed decisions.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTimeMinutes} min read
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Key Takeaways preview */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Key Clinical Insight:
                  </p>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    "{article.keyTakeaways[0]}"
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  By {article.author.split(',')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      <ArticleReaderModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onBookRelatedService={onBookService}
      />
    </section>
  );
};
