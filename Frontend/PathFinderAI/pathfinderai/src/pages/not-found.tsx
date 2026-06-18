import { Card, CardContent } from "@/components/ui/card.js";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext.js";
import { t } from "@/lib/i18n.js";

export default function NotFound() {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{t("notFound.title", lang)}</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">{t("notFound.body", lang)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
