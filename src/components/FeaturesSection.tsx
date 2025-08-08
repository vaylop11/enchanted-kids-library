
import { useLanguage } from "@/contexts/LanguageContext";
import { Bot, Clock, FileSearch, Globe, Lock, MessageSquare } from "lucide-react";

const FeaturesSection = () => {
  const { language } = useLanguage();
  
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'دردشة ذكية مع مستندات PDF' : 'Smart Chat with PDF Documents',
      description: language === 'ar'
        ? 'تحدث بشكل طبيعي مع مستنداتك واحصل على إجابات فورية ودقيقة بناءً على محتوى الملف.'
        : 'Chat naturally with your documents and get instant, accurate answers based on the file content.'
    },
    {
      icon: <FileSearch className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'استخراج معلومات دقيقة' : 'Precise Information Extraction',
      description: language === 'ar'
        ? 'استخرج النقاط والحقائق الرئيسية من مستندات PDF الطويلة بدون الحاجة إلى قراءة الملف بأكمله.'
        : 'Extract key points and facts from lengthy PDF documents without having to read the entire file.'
    },
    {
      icon: <Bot className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'مدعوم بالذكاء الاصطناعي المتقدم' : 'Powered by Advanced AI',
      description: language === 'ar'
        ? 'استفد من أحدث تقنيات الذكاء الاصطناعي التي تفهم السياق والمعنى في مستنداتك.'
        : 'Leverage the latest AI technology that understands context and meaning in your documents.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'توفير الوقت بنسبة 80%' : '80% Time Savings',
      description: language === 'ar'
        ? 'قلل وقت البحث وتحليل المستندات بشكل كبير مع الحصول على النتائج التي تحتاجها بسرعة.'
        : 'Dramatically reduce document research and analysis time while getting the results you need quickly.'
    },
    {
      icon: <Lock className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'أمان وخصوصية متقدمة' : 'Advanced Security & Privacy',
      description: language === 'ar'
        ? 'استمتع براحة البال مع تشفير البيانات من طرف إلى طرف وضمانات الخصوصية لمستنداتك الحساسة.'
        : 'Enjoy peace of mind with end-to-end data encryption and privacy guarantees for your sensitive documents.'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'دعم متعدد اللغات' : 'Multilingual Support',
      description: language === 'ar'
        ? 'تفاعل مع مستندات PDF بأكثر من 30 لغة مختلفة، مما يجعل المعلومات متاحة على مستوى عالمي.'
        : 'Interact with PDF documents in over 30 different languages, making information accessible globally.'
    }
  ];
  
  return (
    <section id="features" className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="heading-2 mb-4">
            {language === 'ar' ? 'لماذا تختار ChatPDF؟' : 'Why Choose ChatPDF?'}
          </h2>
          <p className="paragraph max-w-3xl mx-auto">
            {language === 'ar'
              ? 'استفد من أحدث تقنيات الذكاء الاصطناعي لاستخراج المعلومات والتفاعل مع مستندات PDF الخاصة بك بطريقة ثورية.'
              : 'Leverage the latest AI technology to extract information and interact with your PDF documents in a revolutionary way.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="premium-card rounded-2xl p-6 hover-lift border border-border/40"
            >
              <div className="mb-4 bg-primary p-3 rounded-lg w-fit glow-effect">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-foreground/80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
