import { useState } from 'react';
import { X, HelpCircle, Search, ExternalLink, ChevronDown, Sparkles, BookOpen } from 'lucide-react';

interface PhotoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoGuideItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

export default function PhotoGuideModal({ isOpen, onClose }: PhotoGuideModalProps) {
  const [openId, setOpenId] = useState<string>('photo-guide');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const faqs: PhotoGuideItem[] = [
    {
      id: 'photo-guide',
      category: 'Images',
      question: 'How do I get the best images for my sneaker cards?',
      answer: (
        <div className="space-y-3 text-zinc-300 leading-relaxed text-sm">
          <p>
            We recommend using <strong>Google Images</strong> to search for the shoes. Find a high-resolution image that you like, then right-click on the image and select <strong>'Copy Image'</strong>.
          </p>
          <p>
            Open a new tab in your web browser and go to <a href="https://removal.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium">removal.ai <ExternalLink className="w-3 h-3" /></a>. Once on the site, paste the image in the upload container, then scroll down. Once the edited image appears, click the <strong>Download</strong> button.
          </p>
          <p>
            Go to <a href="https://lunapic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium">lunapic.com <ExternalLink className="w-3 h-3" /></a> and click the <strong>'Upload'</strong> button on the homepage. Select the image you just downloaded from your file explorer. Once the preview loads, hover your pointer over <strong>'Edit'</strong> in the menu below the site banner/header, then click on <strong>'Autocrop Image'</strong>.
          </p>
          <p>
            Once your cropped image is generated, click <strong>'Download Now'</strong> at the top of the screen. This is the file you will upload to <strong>Sneaker Roulette</strong>.
          </p>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2 text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span></span>
          </div>
        </div>
      ),
    },
    {
      id: 'spin-wheel',
      category: 'App Features',
      question: 'How does "Spin the Wheel" (Sneaker Roulette) pick a shoe?',
      answer: (
        <p className="text-zinc-300 leading-relaxed text-sm">
          Sneaker Roulette randomly selects 1, 3, or 5 sneakers from your collection based on your filters (by brand, color, style, or height). You can toggle logic operators (AND / OR) to narrow down your selection when deciding what kicks to wear today.
        </p>
      ),
    },
    {
      id: 'wear-counts',
      category: 'Collection Tracking',
      question: 'How are wear counts and wear frequencies calculated?',
      answer: (
        <p className="text-zinc-300 leading-relaxed text-sm">
          Whenever you log a wear for a sneaker, the app records a timestamp. On the back of every sneaker card, you can view your wear metrics broken down by 1 month, 3 months, 6 months, and 12 months, along with an estimated wear frequency average (e.g. "Every ~5 days").
        </p>
      ),
    },
    {
      id: 'import-csv',
      category: 'Import & Export',
      question: 'Can I batch import my sneaker collection from a file or spreadsheet?',
      answer: (
        <p className="text-zinc-300 leading-relaxed text-sm">
          Yes! Click the <strong>Import</strong> button in the top navigation bar. You can upload or drag-and-drop <strong>CSV (.csv)</strong>, <strong>JSON (.json)</strong>, or <strong>Excel (.xlsx)</strong> files containing columns or properties like Name, Brand, Model, Style, Colors, Times Worn, Image URL, and Condition.
        </p>
      ),
    },
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Photo Guide & Help
              </h2>
              <p className="text-xs text-zinc-400">Image tips, guides, and Sneaker Roulette features</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Close Photo Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or topics..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-medium">No matching questions found.</p>
              <p className="text-xs text-zinc-500">Try searching for different keywords like "photos" or "import".</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-zinc-950/60 border-blue-500/40 ring-1 ring-blue-500/20 shadow-md' 
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? '' : faq.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 cursor-pointer focus:outline-none"
                  >
                    <div className="space-y-1 pr-2">
                      <span className="text-[10px] font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {faq.category}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 leading-snug pt-0.5">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`p-1.5 rounded-lg text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'bg-blue-500/20 text-blue-300 rotate-180' : 'bg-zinc-800'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 border-t border-zinc-800/60 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400">
          <span>Need more help with your collection?</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
