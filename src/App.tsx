import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CertificatesSection } from './components/CertificatesSection';
import { SocialsSection } from './components/SocialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProjectModal } from './components/ProjectModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DEFAULT_PROFILE, DEFAULT_PROJECTS, DEFAULT_SOCIALS, DEFAULT_CERTIFICATES } from './data/defaultData';
import { ContactMessage, Profile, Project, SocialLink, AdminUser, Certificate } from './types';
import {
  subscribeAuth,
  subscribeProfile,
  subscribeProjects,
  subscribeCertificates,
  subscribeSocials,
  subscribeMessages,
  subscribeVisitorCount,
  subscribeProjectCategories,
  DEFAULT_PROJECT_CATEGORIES,
  recordVisit,
  seedInitialDataIfEmpty,
} from './services/firebase';

// Read cached data to avoid flashing old default profile/photo on fresh load
const getInitialProfile = (): Profile => {
  try {
    const cached = localStorage.getItem('portfolio_cached_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {
    console.error('Error loading cached profile:', e);
  }
  return DEFAULT_PROFILE;
};

const getInitialProjects = (): Project[] => {
  try {
    const cached = localStorage.getItem('portfolio_cached_projects');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading cached projects:', e);
  }
  return DEFAULT_PROJECTS;
};

const getInitialCertificates = (): Certificate[] => {
  try {
    const cached = localStorage.getItem('portfolio_cached_certificates');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading cached certificates:', e);
  }
  return DEFAULT_CERTIFICATES;
};

const getInitialCategories = (): string[] => {
  try {
    const cached = localStorage.getItem('portfolio_cached_categories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading cached categories:', e);
  }
  return DEFAULT_PROJECT_CATEGORIES;
};

export default function App() {
  const [user, setUser] = useState<User | AdminUser | null>(null);
  const [profile, setProfile] = useState<Profile>(getInitialProfile);
  const [projects, setProjects] = useState<Project[]>(getInitialProjects);
  const [certificates, setCertificates] = useState<Certificate[]>(getInitialCertificates);
  const [categories, setCategories] = useState<string[]>(getInitialCategories);
  const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('portfolio_cached_visitor_count');
      return cached ? parseInt(cached, 10) : 1;
    } catch (e) {
      return 1;
    }
  });

  // UI state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');

  // Initialize and subscribe
  useEffect(() => {
    // Seed initial data if Firestore is fresh
    seedInitialDataIfEmpty();

    // Listen to Firebase Auth
    const unsubAuth = subscribeAuth((currentUser) => {
      setUser(currentUser);
    });

    // Listen to Profile
    const unsubProfile = subscribeProfile((newProfile) => {
      if (newProfile) {
        setProfile(newProfile);
        try {
          localStorage.setItem('portfolio_cached_profile', JSON.stringify(newProfile));
        } catch (e) {}
      }
    });

    // Listen to Projects
    const unsubProjects = subscribeProjects((newProjects) => {
      setProjects(newProjects);
      setLoadingProjects(false);
      try {
        localStorage.setItem('portfolio_cached_projects', JSON.stringify(newProjects));
      } catch (e) {}
    });

    // Listen to Certificates
    const unsubCertificates = subscribeCertificates((newCerts) => {
      setCertificates(newCerts);
      try {
        localStorage.setItem('portfolio_cached_certificates', JSON.stringify(newCerts));
      } catch (e) {}
    });

    // Listen to Social Links
    const unsubSocials = subscribeSocials((newSocials) => {
      if (newSocials) setSocials(newSocials);
    });

    // Listen to Project Categories
    const unsubCategories = subscribeProjectCategories((newCats) => {
      if (newCats && newCats.length > 0) {
        setCategories(newCats);
        try {
          localStorage.setItem('portfolio_cached_categories', JSON.stringify(newCats));
        } catch (e) {}
      }
    });

    // Record visit and subscribe to visitor count
    recordVisit();
    const unsubVisitor = subscribeVisitorCount((count) => {
      setVisitorCount(count);
    });

    return () => {
      unsubAuth();
      unsubProfile();
      unsubProjects();
      unsubCertificates();
      unsubSocials();
      unsubCategories();
      unsubVisitor();
    };
  }, []);

  // Only subscribe to messages when authenticated admin
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const unsubMessages = subscribeMessages((newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      unsubMessages();
    };
  }, [user]);

  // Scroll spy for current section highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'projects', 'certificates', 'socials', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 selection:bg-indigo-600 selection:text-white relative transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        user={user}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
        currentSection={currentSection}
      />

      <main>
        {/* Hero Section */}
        <Hero
          profile={profile}
          socials={socials}
          onExploreWork={() => scrollToSection('projects')}
          onAboutMe={() => scrollToSection('about')}
        />

        {/* About Me Section */}
        <AboutSection profile={profile} />

        {/* Work / Projects Section */}
        <ProjectsSection
          projects={projects}
          loading={loadingProjects}
          onSelectProject={(proj) => setSelectedProject(proj)}
          categories={categories}
          user={user}
          onOpenAdminLogin={() => setLoginModalOpen(true)}
        />

        {/* Certificates Section */}
        <CertificatesSection certificates={certificates} />

        {/* Social Media Section */}
        <SocialsSection socials={socials} />

        {/* Contact Section */}
        <ContactSection profile={profile} socials={socials} />
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        socials={socials}
        user={user}
        visitorCount={visitorCount}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
      />

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          setDashboardOpen(true);
        }}
      />

      {/* Full Admin Dashboard view when opened and authenticated */}
      {dashboardOpen && user && (
        <AdminDashboard
          user={user}
          profile={profile}
          projects={projects}
          certificates={certificates}
          categories={categories}
          socials={socials}
          messages={messages}
          visitorCount={visitorCount}
          onClose={() => setDashboardOpen(false)}
        />
      )}
    </div>
  );
}
