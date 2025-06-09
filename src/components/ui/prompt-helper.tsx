import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Lightbulb, 
  Search, 
  List, 
  FileQuestion, 
  BookOpen, 
  Highlighter,
  Sparkles
} from 'lucide-react';

interface PromptHelperProps {
  onSelectPrompt: (prompt: string) => void;
}

const PromptHelper: React.FC<PromptHelperProps> = ({ onSelectPrompt }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const promptCategories = [
    {
      name: language === 'ar' ? 'أساسيات' : 'Basics',
      icon: <Search className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'ملخص' : 'Summary',
          text: language === 'ar' 
            ? 'لخص هذا المستند في 3-5 نقاط رئيسية'
            : 'Summarize this document in 3-5 key points'
        },
        {
          title: language === 'ar' ? 'الأفكار الرئيسية' : 'Main Ideas',
          text: language === 'ar'
            ? 'ما هي الأفكار الرئيسية في هذا المستند؟'
            : 'What are the main ideas in this document?'
        },
        {
          title: language === 'ar' ? 'الخلاصة' : 'Conclusion',
          text: language === 'ar'
            ? 'ما هي الخلاصة الرئيسية لهذا المستند؟'
            : 'What is the main conclusion of this document?'
        }
      ]
    },
    {
      name: language === 'ar' ? 'تحليل' : 'Analysis',
      icon: <FileQuestion className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'تحليل نقدي' : 'Critical Analysis',
          text: language === 'ar'
            ? 'قدم تحليلاً نقدياً للحجج المقدمة في هذا المستند'
            : 'Provide a critical analysis of the arguments presented in this document'
        },
        {
          title: language === 'ar' ? 'مقارنة' : 'Compare',
          text: language === 'ar'
            ? 'قارن بين وجهات النظر المختلفة المذكورة في هذا المستند'
            : 'Compare the different viewpoints mentioned in this document'
        },
        {
          title: language === 'ar' ? 'تقييم الأدلة' : 'Evaluate Evidence',
          text: language === 'ar'
            ? 'قيّم جودة الأدلة المقدمة في هذا المستند'
            : 'Evaluate the quality of evidence presented in this document'
        }
      ]
    },
    {
      name: language === 'ar' ? 'استخراج' : 'Extraction',
      icon: <Highlighter className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'استخراج البيانات' : 'Extract Data',
          text: language === 'ar'
            ? 'استخرج جميع الإحصائيات والأرقام من هذا المستند'
            : 'Extract all statistics and figures from this document'
        },
        {
          title: language === 'ar' ? 'استخراج المراجع' : 'Extract References',
          text: language === 'ar'
            ? 'استخرج جميع المراجع والاستشهادات من هذا المستند'
            : 'Extract all references and citations from this document'
        },
        {
          title: language === 'ar' ? 'استخراج المصطلحات' : 'Extract Terms',
          text: language === 'ar'
            ? 'استخرج وعرّف المصطلحات الرئيسية المستخدمة في هذا المستند'
            : 'Extract and define key terms used in this document'
        }
      ]
    },
    {
      name: language === 'ar' ? 'تعليمي' : 'Educational',
      icon: <BookOpen className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'شرح مبسط' : 'Simple Explanation',
          text: language === 'ar'
            ? 'اشرح المفاهيم الرئيسية في هذا المستند بلغة بسيطة'
            : 'Explain the main concepts in this document in simple language'
        },
        {
          title: language === 'ar' ? 'أسئلة للفهم' : 'Comprehension Questions',
          text: language === 'ar'
            ? 'اقترح 5 أسئلة للفهم لاختبار المعرفة حول هذا المستند'
            : 'Suggest 5 comprehension questions to test knowledge about this document'
        },
        {
          title: language === 'ar' ? 'ملخص تعليمي' : 'Study Notes',
          text: language === 'ar'
            ? 'قم بإنشاء ملاحظات دراسية منظمة من هذا المستند'
            : 'Create organized study notes from this document'
        }
      ]
    },
    {
      name: language === 'ar' ? 'تنظيم' : 'Organization',
      icon: <List className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'قائمة محتويات' : 'Table of Contents',
          text: language === 'ar'
            ? 'أنشئ قائمة محتويات مفصلة لهذا المستند'
            : 'Create a detailed table of contents for this document'
        },
        {
          title: language === 'ar' ? 'تصنيف المعلومات' : 'Categorize Information',
          text: language === 'ar'
            ? 'صنف المعلومات في هذا المستند إلى فئات منطقية'
            : 'Categorize the information in this document into logical groups'
        },
        {
          title: language === 'ar' ? 'خريطة ذهنية' : 'Mind Map',
          text: language === 'ar'
            ? 'أنشئ وصفًا لخريطة ذهنية تنظم المفاهيم الرئيسية في هذا المستند'
            : 'Create a description of a mind map organizing the key concepts in this document'
        }
      ]
    },
    {
      name: language === 'ar' ? 'متقدم' : 'Advanced',
      icon: <Sparkles className="h-4 w-4" />,
      prompts: [
        {
          title: language === 'ar' ? 'تحليل SWOT' : 'SWOT Analysis',
          text: language === 'ar'
            ? 'قم بإجراء تحليل SWOT (القوة، الضعف، الفرص، التهديدات) بناءً على محتوى هذا المستند'
            : 'Perform a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis based on this document\'s content'
        },
        {
          title: language === 'ar' ? 'تحليل الفجوات' : 'Gap Analysis',
          text: language === 'ar'
            ? 'حدد الفجوات أو النقاط المفقودة في المعلومات المقدمة في هذا المستند'
            : 'Identify gaps or missing points in the information presented in this document'
        },
        {
          title: language === 'ar' ? 'تحويل إلى عرض تقديمي' : 'Convert to Presentation',
          text: language === 'ar'
            ? 'حول هذا المستند إلى مخطط تفصيلي لعرض تقديمي من 10 شرائح'
            : 'Convert this document into a detailed outline for a 10-slide presentation'
        }
      ]
    }
  ];

  const handleSelectPrompt = (promptText: string) => {
    onSelectPrompt(promptText);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 text-xs h-8"
          aria-label={language === 'ar' ? 'مساعد الأسئلة' : 'Prompt helper'}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {language === 'ar' ? 'اقتراحات الأسئلة' : 'Prompt Ideas'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-medium text-sm">
            {language === 'ar' ? 'اختر سؤالاً للبدء' : 'Choose a prompt to get started'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'انقر على أي اقتراح لإضافته إلى مربع الدردشة'
              : 'Click any suggestion to add it to the chat box'}
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {promptCategories.map((category, index) => (
            <div key={index} className="border-b last:border-b-0">
              <div className="flex items-center gap-2 p-3 bg-muted/30">
                {category.icon}
                <h4 className="text-sm font-medium">{category.name}</h4>
              </div>
              <div className="p-2">
                {category.prompts.map((prompt, promptIndex) => (
                  <button
                    key={promptIndex}
                    className="w-full text-left p-2 text-sm rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleSelectPrompt(prompt.text)}
                  >
                    <div className="font-medium">{prompt.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{prompt.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PromptHelper;