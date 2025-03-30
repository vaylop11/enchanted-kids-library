
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages, FileSearch, Globe, Lock, Clock, Sparkles } from "lucide-react";

const FeaturesSection = () => {
  const { language } = useLanguage();
  
  const features = [
    {
      icon: <Languages className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'ترجمة ملفات PDF بسهولة' : 'Effortless PDF Translation',
      description: language === 'ar'
        ? 'ترجم مستنداتك بسهولة إلى أكثر من 30 لغة مع الحفاظ على التنسيق والتخطيط الأصلي.'
        : 'Translate your documents easily to over 30 languages while preserving the original formatting and layout.'
    },
    {
      icon: <FileSearch className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'معالجة نصوص دقيقة' : 'Accurate Text Processing',
      description: language === 'ar'
        ? 'استخراج النصوص من ملفات PDF بدقة عالية حتى للمستندات ذات التنسيق المعقد والصور.'
        : 'Extract text from PDFs with high accuracy even for documents with complex formatting and images.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'مدعوم بالذكاء الاصطناعي المتقدم' : 'Powered by Advanced AI',
      description: language === 'ar'
        ? 'استفد من أحدث تقنيات الذكاء الاصطناعي التي توفر ترجمات طبيعية وسياقية لمستنداتك.'
        : 'Leverage the latest AI technology that provides natural, context-aware translations for your documents.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-foreground" />,
      title: language === 'ar' ? 'ترجمة سريعة' : 'Fast Translation',
      description: language === 'ar'
        ? 'احصل على ترجمات عالية الجودة في ثوان، مما يوفر لك ساعات من العمل اليدوي.'
        : 'Get high-quality translations in seconds, saving you hours of manual work.'
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
        ? 'ترجم ملفات PDF إلى أكثر من 30 لغة مختلفة، مما يجعل المعلومات متاحة على مستوى عالمي.'
        : 'Translate PDF files to over 30 different languages, making information accessible globally.'
    }
  ];
  
  return (
    <section id="features" className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="heading-2 mb-4">
            {language === 'ar' ? 'لماذا تختار ترانسليت PDF؟' : 'Why Choose TranslatePDF?'}
          </h2>
          <p className="paragraph max-w-3xl mx-auto">
            {language === 'ar'
              ? 'استفد من أحدث تقنيات الذكاء الاصطناعي لترجمة مستندات PDF الخاصة بك بسهولة وبشكل احترافي.'
              : 'Leverage the latest AI technology to translate your PDF documents easily and professionally.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-0.25rem] border border-border/30"
            >
              <div className="mb-4 bg-primary p-3 rounded-lg w-fit">
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
