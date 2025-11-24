import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Fail gracefully if no key
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (name: string, category: string, features: string): Promise<string> => {
  if (!apiKey) {
    return "الرجاء توفير مفتاح API لاستخدام ميزة الذكاء الاصطناعي.";
  }

  try {
    const prompt = `
      أنت خبير تسويق في متجر ملابس فاخر. اكتب وصفاً جذاباً ومختصراً (حوالي 30-50 كلمة) لمنتج بالبيانات التالية:
      الاسم: ${name}
      الفئة: ${category}
      مميزات إضافية: ${features}
      
      اجعل النغمة حماسية وجذابة للزبائن العرب.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم يتم إنشاء وصف.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء توليد الوصف. يرجى المحاولة لاحقاً.";
  }
};