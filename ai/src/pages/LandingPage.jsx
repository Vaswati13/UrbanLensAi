import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  Cpu, 
  Users, 
  Activity, 
  CheckCircle, 
  ArrowRight, 
  Layers,
  Database,
  LineChart,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-sky-500 selection:text-white">
      {/* Background Grid & Ambient Glows */}
      <div className="absolute inset-0 satellite-grid pointer-events-none opacity-40 z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[180px] pointer-events-none z-0"></div>

      {/* HEADER NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500 rounded-xl text-white">
            <Map size={22} className="glow-animation" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">UrbanLens AI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-400">
          <a href="#problem" className="hover:text-white transition-colors">Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">Solution</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats" className="hover:text-white transition-colors">Impact</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold tracking-tight shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all"
          >
            Launch Dashboard
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide uppercase"
          >
            <Cpu size={14} className="animate-pulse" />
            <span>AI-Powered Geospatial Analysis</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            AI Powered Infrastructure Intelligence for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-emerald-400">Informal Settlements</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto"
          >
            Detect infrastructure gaps, predict future risks and empower communities through geospatial AI.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-base font-bold tracking-tight flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all group"
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#solution"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl text-base font-bold tracking-tight flex items-center justify-center space-x-2 border border-slate-800 transition-all"
            >
              <span>Watch Demo</span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section id="problem" className="bg-slate-900/60 border-y border-slate-800/80 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">The Global Challenge</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                Informal settlements house 1 Billion people but remain invisible to standard maps.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Due to rapid growth and lack of formal planning, millions of citizens live in settlements without adequate clean water, electricity, drainage networks, or clinic access. Because governments lack real-time data, infrastructure remains severely outdated.
              </p>
              <div className="space-y-3">
                {[
                  "Outdated census and mapping records",
                  "Inaccessible and dense pathways preventing manual surveys",
                  "Vulnerability to flash flooding and water crises"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle size={16} className="text-sky-500 flex-shrink-0" />
                    <span className="text-sm text-slate-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
                <Activity size={18} className="text-sky-400 animate-pulse" />
                <span>Real-Time Structural Scarcity</span>
              </h3>
              <div className="space-y-6">
                {[
                  { label: "Critical Sanitation Deficit", value: "78%", color: "bg-rose-500" },
                  { label: "Population Growth (YoY)", value: "+15.4%", color: "bg-sky-500" },
                  { label: "Lack of Healthcare Access", value: "62%", color: "bg-amber-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-semibold">{item.label}</span>
                      <span className="text-white font-extrabold">{item.value}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.value.replace('+', '') }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION OVERVIEW */}
      <section id="solution" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">The Solution</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Geospatial AI that makes the invisible mapped and managed.
          </h2>
          <p className="text-slate-400">
            UrbanLens AI combines AI-based satellite object detection with field citizen reports to deliver a comprehensive dashboard for urban planners.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Cpu,
              title: "AI Feature Detection",
              desc: "Identify structure density, unpaved pathways, open sewerage systems, and boundaries directly from raw satellite uploads using customized computer vision models.",
              color: "text-sky-400 border-sky-950 bg-sky-950/20"
            },
            {
              icon: Layers,
              title: "Geospatial GIS Layers",
              desc: "Interactive, fullscreen Leaflet map compiling schools, health clinics, and water points to visual-display infrastructure gaps, complete with custom polygon drawing metrics.",
              color: "text-emerald-400 border-emerald-950 bg-emerald-950/20"
            },
            {
              icon: LineChart,
              title: "Risk Forecasting",
              desc: "Calculate flood risks, future water scarcity, and population influx using scikit-learn regression models to optimize facility distribution before crises hit.",
              color: "text-amber-400 border-amber-950 bg-amber-950/20"
            }
          ].map((item, idx) => (
            <div key={idx} className={`p-8 border rounded-3xl space-y-4 hover:bg-slate-900/40 hover:border-slate-700/50 transition-all ${item.color}`}>
              <div className="p-3 bg-slate-900 rounded-2xl w-fit">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-slate-900/30 border-t border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">Workflow</span>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">How UrbanLens AI Works</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Upload Image", desc: "Planners upload high-resolution drone or satellite imagery." },
              { step: "02", title: "AI Image Parsing", desc: "YOLOv8 and OpenCV segment building grids, roads, and drains." },
              { step: "03", title: "Gap Heatmapping", desc: "Interactive GIS maps compute accessibility deficits." },
              { step: "04", title: "Deploy Resource", desc: "Planners approve AI placement suggestions for new clinic and water tanks." }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <span className="text-5xl font-black text-sky-500/20 absolute top-4 right-4">{step.step}</span>
                <h3 className="text-lg font-bold text-white pt-6">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-20 max-w-7xl mx-auto px-6 relative z-10 text-center">
        <span className="text-xs font-bold text-sky-400 tracking-widest uppercase mb-4 block">Tech Stack</span>
        <h2 className="text-2xl font-bold mb-10">Engineered with Hackathon-Optimized Technologies</h2>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-400">
          {["React.js", "Tailwind CSS", "Leaflet Maps", "Framer Motion", "FastAPI", "MongoDB", "YOLOv8", "OpenCV", "Scikit-Learn", "GeoJSON"].map((tech, idx) => (
            <span key={idx} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* IMPACT STATISTICS */}
      <section id="stats" className="py-24 bg-slate-900/60 border-y border-slate-800/80 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { count: "250,000+", label: "Kibera Residents Covered" },
            { count: "92.4%", label: "AI Placement Accuracy" },
            { count: "3,200m+", label: "Unmapped Sewers Detected" },
            { count: "24/7", label: "Citizen Action Active" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-4xl font-extrabold text-sky-400 tracking-tight">{stat.count}</h3>
              <p className="text-slate-400 text-sm font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-sky-400 tracking-widest uppercase">The Team</span>
          <h2 className="text-3xl font-extrabold text-white">Created by Urban Innovators</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { name: "Amina Juma", role: "AI & Geospatial Engineer", bio: "Ex-UN Habitat researcher focusing on satellite models in East Africa." },
            { name: "Kenji Tanaka", role: "Full Stack Developer", bio: "React and Python API specialist dedicated to interactive mapping structures." },
            { name: "Carlos Mendez", role: "Urban Planner & NGO Liaison", bio: "Liaises with Nairobi County to optimize facility recommendation approvals." }
          ].map((member, idx) => (
            <div key={idx} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center font-bold text-xl text-sky-400 border border-slate-700">
                {member.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{member.name}</h3>
                <p className="text-xs text-sky-400 font-semibold">{member.role}</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER & CONTACT */}
      <footer className="border-t border-slate-900 bg-slate-950 relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500 rounded-lg text-white">
              <Map size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white">UrbanLens AI</span>
          </div>
          
          <div className="text-sm text-slate-500">
            © 2026 UrbanLens AI. All rights reserved. Hackathon Demonstration Edition.
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com" className="text-slate-500 hover:text-white transition-colors">
              <Globe size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
