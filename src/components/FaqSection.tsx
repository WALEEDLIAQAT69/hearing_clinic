import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageCircle, Search } from 'lucide-react';
import { CLINIC_FAQS, CLINIC_INFO } from '../data/clinicData';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string>(CLINIC_FAQS[0]?.id || 'faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? '' : id));
  };

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'pricing', label: 'Ala Samat & Pricing' },
    { id: 'products', label: 'Hearing Aids & Devices' },
    { id: 'care', label: 'Water Protection & Care' },
    { id: 'tests', label: 'Tests (PTA, BERA, Senior)' },
  ];

  const filteredFaqs = CLINIC_FAQS.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="py-16 bg-[#F8FAFC] border-b border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200/80">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-bold mb-3">
              <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
              <span>Frequently Asked Audiology Questions</span>
            </div>
            <h2
              id="faqs-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight"
            >
              Real answers for patients in Lahore &amp; across Pakistan.
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Find quick, reliable answers from our qualified audiologists about Ala Samat prices, water resistance, profound hearing loss, and test procedures.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="w-full lg:w-72 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audiology questions..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 min-h-[44px]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] flex items-center justify-center ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No matching questions found for &ldquo;{searchQuery}&rdquo;. Try another search term or chat with our audiologists directly.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 bg-white ${
                    isOpen
                      ? 'border-teal-400/80 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-2xl"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base pr-2 leading-snug">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-teal-600 text-white rotate-180' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Have a specific question about your hearing test or Ala Samat?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Speak directly with our senior consultant audiologist Monday to Saturday, 10:00 AM – 7:00 PM.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${CLINIC_INFO.phoneClean}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Call 0321 4190400</span>
            </a>
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsAppNumber}?text=${encodeURIComponent('Hello Hearing Clinic Lahore, I have a question about hearing aid recommendations.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
