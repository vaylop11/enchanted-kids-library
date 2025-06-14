
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Languages, ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";

const communitiesLink = "https://discord.com/channels/1119885301872070706/1280461670979993613";
const translationImg =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80";

const CommunityAndTranslationCards = () => {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Community Card */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-200/20 border border-purple-100 shadow-md p-8 flex flex-col items-center relative overflow-hidden h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 text-purple-800 p-3 rounded-full shadow-sm">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800">
                {language === "ar" ? "انضم لمجتمعنا" : "Join Our Community"}
              </h3>
            </div>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              {language === "ar"
                ? "كن جزءًا من مجتمع Gemi ChatPDF! شارك، تعلم، واسأل خبراءنا وأعضاءنا حول ملفات PDF والذكاء الاصطناعي."
                : "Be a part of the Gemi ChatPDF community! Share, learn, and get help from our experts and other users."}
            </p>
            <a
              href={communitiesLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex gap-2 items-center px-5 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow transition-all"
            >
              {language === "ar" ? "انضم الآن" : "Join Now"}
              <ArrowRightCircle className="h-5 w-5" />
            </a>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-16 w-44 h-44 bg-purple-300 rounded-full opacity-30 blur-2xl pointer-events-none"></div>
          </div>
          {/* Translation Card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-200/20 border border-blue-100 shadow-md flex flex-col md:flex-row items-center p-6 gap-6">
            <div className="flex-shrink-0 w-32 h-32 overflow-hidden rounded-xl border bg-blue-100 shadow-inner hidden md:block">
              <img
                src={translationImg}
                alt="Translation visual"
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full shadow-sm">
                  <Languages className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-blue-700">
                  {language === "ar" ? "ترجمات احترافية" : "Professional Translations"}
                </h3>
              </div>
              <p className="text-muted-foreground mb-4 max-w-xs">
                {language === "ar"
                  ? "جرب ميزات الترجمة المتقدمة لجيمي، وترجم صفحات PDF لأي لغة بسهولة وبدقة عالية."
                  : "Experience Gemi's advanced translation features and translate PDF pages to any language with high accuracy."}
              </p>
              <Link
                to="/translate"
                className="inline-flex gap-2 items-center px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all"
              >
                {language === "ar" ? "جرّب الترجمة" : "Try Translation"}
                <ArrowRightCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityAndTranslationCards;

