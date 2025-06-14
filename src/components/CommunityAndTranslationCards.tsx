
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, ArrowRightCircle } from "lucide-react";

const communitiesLink = "https://discord.com/channels/1119885301872070706/1280461670979993613";

const CommunityAndTranslationCards = () => {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex justify-center">
          {/* Community Card */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-200/20 border border-purple-100 shadow-md p-8 flex flex-col items-center relative overflow-hidden max-w-md">
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
        </div>
      </div>
    </section>
  );
};

export default CommunityAndTranslationCards;
