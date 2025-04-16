
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileUp, Languages, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex gap-3 items-start">
    <div className="text-primary mt-0.5">
      {icon}
    </div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
);

const ProSubscriptionCard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const handleSubscribeClick = () => {
    if (!user) {
      navigate('/signin?redirect=subscribe');
    } else {
      navigate('/subscribe');
    }
  };

  const features = [
    {
      icon: <FileUp className="h-5 w-5" />,
      title: language === 'ar' ? 'تحميل ما يصل إلى 20 ملف PDF' : 'Upload up to 20 PDFs',
      description: language === 'ar' 
        ? 'إدارة المزيد من المستندات بسهولة والتفاعل معها مرة واحدة - مثالي للباحثين والطلاب والمحترفين'
        : 'Easily manage and interact with more documents at once – perfect for researchers, students, and professionals.'
    },
    {
      icon: <Languages className="h-5 w-5" />,
      title: language === 'ar' ? 'ميزة الترجمة الفورية' : 'Unlock Translation Feature',
      description: language === 'ar' 
        ? 'ترجم ملفات PDF وردود الذكاء الاصطناعي على الفور إلى لغات متعددة للوصول العالمي والفهم'
        : 'Instantly translate your PDFs and AI responses into multiple languages for global access and understanding.'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: language === 'ar' ? 'استجابة أسرع 10 مرات' : 'Respond 10× Faster',
      description: language === 'ar' 
        ? 'استمتع بسرعات استجابة فائقة مع المعالجة ذات الأولوية - احصل على إجابات في ثوانٍ، وليس دقائق'
        : 'Enjoy ultra-fast response speeds with priority processing – get answers in seconds, not minutes.'
    }
  ];
  
  return (
    <Card className="overflow-hidden border-2 border-primary/20 transition-all hover:shadow-lg hover:border-primary/30 h-full">
      <CardHeader className="bg-gradient-to-br from-primary to-primary-foreground/90 text-primary-foreground pb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">
            {language === 'ar' ? 'مميز' : 'Premium'}
          </span>
        </div>
        <CardTitle className="text-2xl md:text-3xl font-bold">
          {language === 'ar' ? 'Gemi PRO' : 'Gemi PRO'}
        </CardTitle>
        <CardDescription className="text-primary-foreground/90 text-base">
          {language === 'ar' ? 'أطلق إمكاناتك الكاملة' : 'Unlock Your Full Potential'}
        </CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">$9.99</span>
          <span className="text-primary-foreground/80 ml-1">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {features.map((feature, index) => (
          <FeatureItem 
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </CardContent>
      
      <CardFooter className="pt-2 pb-6">
        <Button 
          onClick={handleSubscribeClick} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
        >
          {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProSubscriptionCard;
