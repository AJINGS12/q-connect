import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-soft font-body text-secondary pb-32 transition-all duration-700">
      <nav className="glass-panel sticky top-0 z-50 py-6 px-8 border-none bg-white/70">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-neutral-400 hover:text-primary transition-all group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 group-hover:border-primary/30 shadow-sm transition-all">
               <ChevronLeft size={18} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <FileText size={16} />
             </div>
             <h1 className="font-display text-sm font-bold text-secondary uppercase tracking-widest">Terms</h1>
          </div>
          <div className="w-24" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="premium-card p-10 md:p-14 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary italic mb-4">Terms of Service</h1>
          <p className="text-neutral-400">Effective Date: April 2026</p>
        </div>

        <div className="space-y-10 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using QConnect, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">2. Description of Service</h2>
            <p>
              QConnect is a platform designed to provide a rich daily experience of reading and reflecting on the Quran. It includes gamified quests, bookmark synchronization with the Quran Foundation API, and tools for personal reflection.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">3. User Accounts</h2>
            <p>
              At this time, we only support account creation and authentication through Google Accounts. By signing in, you authorize us to receive your basic Google profile information. You are solely responsible for managing the security of your Google Account, as it acts as your primary authentication method for our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of QConnect. Public domain texts, translations, and APIs integrated from the Quran Foundation remain the property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">5. Termination</h2>
            <p>
              We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
