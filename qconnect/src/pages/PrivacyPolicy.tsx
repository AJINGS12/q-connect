import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-soft font-body text-secondary pb-32 transition-all duration-700">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-100/60 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 hover:border-primary/30 text-primary shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] leading-none">Legal</p>
              <h1 className="text-base font-display font-black tracking-tight text-neutral-800 leading-tight">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="premium-card p-10 md:p-14 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary italic mb-4">Privacy Policy</h1>
          <p className="text-neutral-400">Effective Date: April 2026</p>
        </div>

        <div className="space-y-10 text-neutral-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">1. Introduction</h2>
            <p>
              Welcome to QConnect. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">2. The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username, and Google Account identifiers.</li>
              <li><strong>Contact Data</strong> includes email address.</li>
              <li><strong>Usage Data</strong> includes information about how you use our application, your reading progress, bookmarks, and reflections.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">3. Third Party Services</h2>
            <p>
              Our application integrates with third-party APIs such as the Quran.com API to provide content and sync bookmarks. Please review the Quran Foundation's privacy policies for understanding how they handle cross-platform data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use secure authentication protocols (Supabase OAuth) to handle login sessions safely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us via the support channels in the QConnect application.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
