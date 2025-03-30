
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQSection = () => {
  const { language } = useLanguage();
  
  const faqs = [
    {
      question: language === 'ar' ? 'ما هو ترانسليت PDF؟' : 'What is TranslatePDF?',
      answer: language === 'ar' 
        ? 'ترانسليت PDF هي أداة ذكاء اصطناعي تتيح لك ترجمة ملفات PDF بسهولة. ما عليك سوى تحميل المستند الخاص بك واختيار اللغة المستهدفة، وستحصل على ترجمة احترافية فورية.'
        : 'TranslatePDF is an AI tool that allows you to translate PDF documents easily. Simply upload your document and select the target language, and you\'ll get an instant professional translation.'
    },
    {
      question: language === 'ar' ? 'كيف يعمل ترانسليت PDF؟' : 'How does TranslatePDF work?',
      answer: language === 'ar'
        ? 'يقوم ترانسليت PDF باستخراج النص من ملف PDF الخاص بك، ثم يستخدم الذكاء الاصطناعي المتقدم لترجمة المحتوى مع الحفاظ على التنسيق الأصلي قدر الإمكان.'
        : 'TranslatePDF extracts text from your PDF file, then uses advanced AI to translate the content while preserving the original formatting as much as possible.'
    },
    {
      question: language === 'ar' ? 'ما هي اللغات المدعومة؟' : 'What languages are supported?',
      answer: language === 'ar'
        ? 'يدعم ترانسليت PDF أكثر من 30 لغة، بما في ذلك العربية، الإنجليزية، الفرنسية، الألمانية، الإسبانية، الصينية، اليابانية، والمزيد.'
        : 'TranslatePDF supports over 30 languages, including Arabic, English, French, German, Spanish, Chinese, Japanese, and more.'
    },
    {
      question: language === 'ar' ? 'هل بياناتي آمنة مع ترانسليت PDF؟' : 'Is my data safe with TranslatePDF?',
      answer: language === 'ar'
        ? 'نعم، أمان بياناتك هو أولويتنا القصوى. يتم تشفير ملفات PDF الخاصة بك أثناء النقل والتخزين ولا يتم مشاركتها مع أي طرف ثالث.'
        : 'Yes, your data security is our top priority. Your PDF files are encrypted during transit and storage and are never shared with any third parties.'
    },
    {
      question: language === 'ar' ? 'هل يمكنني استخدام ترانسليت PDF على الهاتف المحمول؟' : 'Can I use TranslatePDF on mobile?',
      answer: language === 'ar'
        ? 'نعم، تم تصميم ترانسليت PDF ليكون متجاوبًا تمامًا ويعمل بسلاسة على جميع الأجهزة، بما في ذلك الهواتف المحمولة والأجهزة اللوحية.'
        : 'Yes, TranslatePDF is designed to be fully responsive and works seamlessly on all devices, including mobile phones and tablets.'
    }
  ];
  
  return (
    <section id="faq" className="py-20 px-4 md:px-6 bg-muted/20">
      <div className="container mx-auto max-w-4xl">
        <h2 className="heading-2 mb-10 text-center">
          {language === 'ar' ? 'الأسئلة الشائعة حول ترانسليت PDF' : 'Frequently Asked Questions about TranslatePDF'}
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border/40">
              <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
