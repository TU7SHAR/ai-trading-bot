import os
import torch
from transformers import AutoTokenizer, AutoModel
from peft import PeftModel
from google import genai
from groq import Groq

class FinGPTAnalyst:
    def __init__(self):
        self.mode = "fingpt"
        try:
            base_model = "THUDM/chatglm2-6b"
            peft_model = "oliverwang15/FinGPT_ChatGLM2_Sentiment_Instruction_LoRA_FT"
            self.tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
            model = AutoModel.from_pretrained(base_model, trust_remote_code=True, device_map="auto")
            self.model = PeftModel.from_pretrained(model, peft_model).eval()
        except Exception as e:
            print(f"FinGPT local initialization halted. Exception trace: {e}")
            self.mode = "api"
            self.gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
            self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    def get_sentiment(self, text, use_fast=True):
        if self.mode == "fingpt":
            return self._get_fingpt_sentiment(text)
        if use_fast:
            return self._get_groq_sentiment(text)
        return self._get_gemini_sentiment(text)

    def _get_fingpt_sentiment(self, text):
        prompt = f"Instruction: What is the sentiment of this news? Input: {text} Answer: "
        tokens = self.tokenizer(prompt, return_tensors='pt').to("cuda" if torch.cuda.is_available() else "cpu")
        res = self.model.generate(**tokens, max_length=512)
        ans = self.tokenizer.decode(res[0], skip_special_tokens=True)
        if "positive" in ans.lower():
            return 1.0
        if "negative" in ans.lower():
            return -1.0
        return 0.0

    def _get_groq_sentiment(self, text):
        try:
            prompt = f"Analyze financial sentiment for this text: '{text}'. Return ONLY a number between -1.0 and 1.0."
            completion = self.groq_client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
            )
            return float(completion.choices[0].message.content.strip())
        except:
            return self._get_gemini_sentiment(text)

    def _get_gemini_sentiment(self, text):
        try:
            prompt = f"Analyze financial sentiment for this text: '{text}'. Return ONLY a number between -1.0 and 1.0."
            response = self.gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
            )
            return float(response.text.strip())
        except:
            return 0.0

fingpt = FinGPTAnalyst()