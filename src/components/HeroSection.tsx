import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

import { FileText, Zap, Brain, Sparkles } from "lucide-react";

const HeroSection = () => {
  const { language } = useLanguage();
  
  return (
    <section className="relative min-h-screen py-20 md:py-32 bg-gradient-to-br from-slate-950 via-purple-950/20 to-blue-950/20 overflow-hidden" aria-labelledby="hero-heading">
      {/* Advanced animated background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Main gradient orbs */}
        <div className="absolute -top-96 -left-96 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-pink-500/30 blur-3xl animate-pulse opacity-70"></div>
        <div className="absolute -bottom-96 -right-96 w-[900px] h-[900px] rounded-full bg-gradient-to-tl from-blue-500/25 via-cyan-500/20 to-teal-500/25 blur-3xl animate-pulse opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/15 blur-2xl animate-pulse opacity-50" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" 
             style={{ 
               backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">
          
          {/* Enhanced Content Section */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 backdrop-blur-sm mb-8 group hover:from-violet-500/15 hover:to-purple-500/15 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-sm font-medium text-violet-300">
                {language === "ar" ? "🚀 الآن مع الذكاء الاصطناعي المتطور" : "🚀 Now with Advanced AI"}
              </span>
            </div>

            {/* Main heading with enhanced styling */}
            <h1 id="hero-heading" className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8 font-display">
              {language === "ar" ? (
                <>
                  <span className="block text-white/90 mb-2">تفاعل مع</span>
                  <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    ملفات PDF
                  </span>
                  <span className="block text-white/80 text-4xl md:text-5xl lg:text-6xl mt-4">
                    بذكاء خارق
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-white/90 mb-2">Chat with</span>
                  <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    PDFs
                  </span>
                  <span className="block text-white/80 text-4xl md:text-5xl lg:text-6xl mt-4">
                    Intelligently
                  </span>
                </>
              )}
            </h1>

            {/* Enhanced description */}
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 leading-relaxed">
              {language === "ar" 
                ? "اكتشف قوة الذكاء الاصطناعي في تحليل وفهم مستنداتك. تحدث، اسأل، واحصل على إجابات فورية من ملفات PDF الخاصة بك."
                : "Discover the power of AI in analyzing and understanding your documents. Chat, ask questions, and get instant answers from your PDFs."
              }
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-2xl">
              {[
                { icon: Brain, text: language === "ar" ? "ذكي" : "Smart", color: "violet" },
                { icon: Zap, text: language === "ar" ? "سريع" : "Fast", color: "cyan" },
                { icon: FileText, text: language === "ar" ? "دقيق" : "Accurate", color: "emerald" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                  <div className={`p-2 rounded-lg bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 group-hover:from-${feature.color}-500/30 group-hover:to-${feature.color}-600/30 transition-all duration-300`}>
                    <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                  </div>
                  <span className="font-medium text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Button asChild size="lg" className="relative px-10 py-4 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0 rounded-2xl shadow-2xl group overflow-hidden">
                <Link to="/pdfs">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {language === "ar" ? "ابدأ الآن" : "Get Started"}
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                  </span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/30 rounded-2xl backdrop-blur-sm transition-all duration-300 group">
                <Link to="#features">
                  <span className="flex items-center gap-2">
                    {language === "ar" ? "تعلم المزيد" : "Learn More"}
                    <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Enhanced Visual Section */}
          <div className="flex-1 flex items-center justify-center lg:justify-end max-w-lg lg:max-w-xl">
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 group hover:scale-105">
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                
                {/* Content placeholder for animation */}
                <div className="w-80 h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-12 h-12 text-violet-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-white/90 mb-3">
                      {language === "ar" ? "مستعد للتفاعل" : "Ready to Chat"}
                    </h3>
                    <p className="text-white/60">
                      {language === "ar" ? "ارفع ملف PDF وابدأ المحادثة" : "Upload a PDF and start chatting"}
                    </p>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-3xl blur-3xl -z-20 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
