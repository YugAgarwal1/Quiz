import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGraduationCap,
  faChartLine,
  faBolt,
  faBookOpen,
  faCheckCircle,
  faShieldHalved,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import logo from '../images/logo.png';

export default function PublicLanding() {
  const { openAuthModal } = useAuth();

  const features = [
    {
      icon: faBolt,
      title: 'Adaptive Practice Quizzes',
      description: 'Filter questions by Easy, Medium, and Hard difficulty or customize question volume to match your prep pace.',
      color: 'bg-amber-500'
    },
    {
      icon: faChartLine,
      title: 'Deep Speed & Accuracy Analytics',
      description: 'Get real-time insights on your strengths, question-wise time distribution, and accuracy percentages.',
      color: 'bg-blue-500'
    },
    {
      icon: faBookOpen,
      title: 'Complete Semester Syllabus',
      description: 'Structured chapter-by-chapter breakdowns for Adv Java, Frontend Web Technologies, Backend Systems, and more.',
      color: 'bg-emerald-500'
    },
    {
      icon: faShieldHalved,
      title: 'Verified Question Bank',
      description: 'Over 2,200+ detailed multiple-choice questions with verified solutions and comprehensive explanations.',
      color: 'bg-red-500'
    }
  ];

  const subjects = [
    {
      name: 'Advanced Java',
      desc: 'JVM Architecture, Multithreading, Concurrency, Servlets & Spring Enterprise',
      questions: '750+ Questions',
      badge: 'Sem VI'
    },
    {
      name: 'Frontend Development',
      desc: 'HTML5 Semantic UI, CSS Flexbox & Grid, Modern JavaScript, React & DOM APIs',
      questions: '750+ Questions',
      badge: 'Sem VI'
    },
    {
      name: 'Backend Engineering',
      desc: 'Node.js, Express REST APIs, SQL Databases, Auth Security, and System Design',
      questions: '750+ Questions',
      badge: 'Sem VI'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 lg:px-20 py-16 lg:py-24 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column */}
          <div className="lg:w-7/12 space-y-6 text-center lg:text-left">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Master Engineering Quizzes with{' '}
              <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                Precision & Speed
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Quiz Bird is the intelligent exam preparation platform tailored for computer science and engineering students. Track your performance, test your knowledge chapter by chapter, and gain real exam confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <button
                onClick={() => openAuthModal('register')}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-3 text-base"
              >
                <span>Get Started Free</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

              <button
                onClick={() => openAuthModal('login')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-2xl border border-gray-300 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-base"
              >
                <span>Sign In to Dashboard</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">2,250+</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Curated Questions</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">100%</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Verified Solutions</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">0 ms</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Zero-Lag Timer</p>
              </div>
            </div>
          </div>

          {/* Right Column / Visual Card */}
          <div className="lg:w-5/12 w-full max-w-md">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Quiz Bird" className="w-10 h-10 object-contain" />
                  <div>
                    <h4 className="font-bold text-gray-900">Quiz Bird Interactive</h4>
                    <p className="text-xs text-gray-400">Live Exam Simulation</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Live
                </span>
              </div>

              {/* Sample Question Preview */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                    Adv Java • Chapter 1
                  </span>
                  <p className="font-medium text-gray-800 text-sm mt-1">
                    Which component of the JVM is responsible for converting bytecode into native machine instructions at runtime?
                  </p>
                </div>

                <div className="space-y-2 text-sm font-medium">
                  <div className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition">
                    A. ClassLoader Subsystem
                  </div>
                  <div className="p-3 rounded-xl border-2 border-green-500 bg-green-50 text-green-800 font-semibold flex justify-between items-center">
                    <span>B. Just-In-Time (JIT) Compiler</span>
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition">
                    C. Garbage Collector (GC)
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition">
                    D. Java Native Interface (JNI)
                  </div>
                </div>

                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-sm"
                >
                  Unlock 2,250+ Practice Questions →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white px-4 sm:px-8 lg:px-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Engineered for Maximum Retention & Score
            </h2>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              Everything you need to excel in university exams, tech interviews, and competitive semester assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-gray-50/70 hover:bg-white p-6 rounded-2xl border border-gray-200/80 hover:border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${feat.color}`}>
                  <FontAwesomeIcon icon={feat.icon} className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Catalog Preview */}
      <section className="py-16 px-4 sm:px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Available Subjects & Modules</h2>
          <p className="mt-2 text-gray-600">Start practicing right now with structured syllabus tracks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((sub, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
                    {sub.badge}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                    {sub.questions}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{sub.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{sub.desc}</p>
              </div>

              <button
                onClick={() => openAuthModal('login')}
                className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                Start Practising
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 sm:px-8 lg:px-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to boost your quiz scores?
          </h2>
          <p className="text-red-100 max-w-2xl mx-auto text-base sm:text-lg mb-8">
            Join Quiz Bird today and get instant access to full semester question sets, pause-and-resume tests, and personal analytics.
          </p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-red-600 font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-95 cursor-pointer"
          >
            Create Free Student Account Now
          </button>
        </div>
      </section>
    </div>
  );
}
