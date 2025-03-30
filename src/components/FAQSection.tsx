
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQSection = () => {
  const { language } = useLanguage();
  
  const faqs = [
    {
      question: language === 'ar' ? 'ما هو ChatPDF؟' : 'What is ChatPDF?',
      answer: language === 'ar' 
        ? 'ChatPDF هي أداة ذكاء اصطناعي تتيح لك التحدث مع ملفات PDF الخاصة بك. ما عليك سوى تحميل المستند الخاص بك وطرح الأسئلة، وستحصل على إجابات فورية دقيقة.'
        : 'ChatPDF is an AI tool that allows you to chat with your PDF documents. Simply upload your document and ask questions, and you\'ll get instant, accurate answers.'
    },
    {
      question: language === 'ar' ? 'كيف يعمل ChatPDF؟' : 'How does ChatPDF work?',
      answer: language === 'ar'
        ? 'يقوم ChatPDF بتحليل وفهم محتوى ملف PDF الخاص بك، ثم يستخدم الذكاء الاصطناعي للإجابة على أسئلتك بناءً على المعلومات الموجودة في المستند.'
        : 'ChatPDF analyzes and understands the content of your PDF file, then uses AI to answer your questions based on the information in the document.'
    },
    {
      question: language === 'ar' ? 'هل يمكنني استخدام ChatPDF مع أي ملف PDF؟' : 'Can I use ChatPDF with any PDF file?',
      answer: language === 'ar'
        ? 'نعم، يمكنك استخدام ChatPDF مع أي ملف PDF تقريبًا، بما في ذلك الكتب والمقالات والتقارير والعقود والمزيد.'
        : 'Yes, you can use ChatPDF with almost any PDF file, including books, articles, reports, contracts, and more.'
    },
    {
      question: language === 'ar' ? 'هل بياناتي آمنة مع ChatPDF؟' : 'Is my data safe with ChatPDF?',
      answer: language === 'ar'
        ? 'نعم، أمان بياناتك هو أولويتنا القصوى. يتم تخزين ملفات PDF الخاصة بك بشكل آمن ولا يتم مشاركتها مع أي طرف ثالث.'
        : 'Yes, your data security is our top priority. Your PDF files are stored securely and never shared with any third parties.'
    },
    {
      question: language === 'ar' ? 'هل يمكنني استخدام ChatPDF على الهاتف المحمول؟' : 'Can I use ChatPDF on mobile?',
      answer: language === 'ar'
        ? 'نعم، تم تصميم ChatPDF ليكون متجاوبًا تمامًا ويعمل بسلاسة على جميع الأجهزة، بما في ذلك الهواتف المحمولة والأجهزة اللوحية.'
        : 'Yes, ChatPDF is designed to be fully responsive and works seamlessly on all devices, including mobile phones and tablets.'
    }
  ];
  
  return (
    <section id="faq" className="py-20 px-4 md:px-6 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="heading-2 mb-10 text-center">
          {language === 'ar' ? 'الأسئلة الشائعة حول ChatPDF' : 'Frequently Asked Questions about ChatPDF'}
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium">
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
