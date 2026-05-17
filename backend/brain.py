import os
from google import genai
from groq import Groq

class CloudAnalyst:
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    def get_detailed_analysis(self, text):
        prompt = f"Analyze financial sentiment for this text: '{text}'. Return your response exactly in this format:\nScore: <number between -1.0 and 1.0>\nReasoning: <one clear sentence explaining your choice>"
        
        groq_res = {"sentiment_score": 0.0, "recommendation": "HOLD", "reasoning": "Unavailable"}
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
            )
            content = completion.choices[0].message.content.strip()
            score, reasoning = self._parse_response(content)
            groq_res = {
                "sentiment_score": score,
                "recommendation": "BUY" if score > 0.3 else "SELL" if score < -0.3 else "HOLD",
                "reasoning": reasoning
            }
        except Exception as e:
            print(f"Groq execution failed: {e}")

        gemini_res = {"sentiment_score": 0.0, "recommendation": "HOLD", "reasoning": "Unavailable"}
        try:
            response = self.gemini_client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=prompt,
            )
            content = response.text.strip()
            score, reasoning = self._parse_response(content)
            gemini_res = {
                "sentiment_score": score,
                "recommendation": "BUY" if score > 0.3 else "SELL" if score < -0.3 else "HOLD",
                "reasoning": reasoning
            }
        except Exception as e:
            print(f"Gemini execution failed: {e}")

        return {"groq": groq_res, "gemini": gemini_res}

    def _parse_response(self, text):
        score = 0.0
        reasoning = "Could not parse explanation."
        try:
            lines = text.split("\n")
            for line in lines:
                if line.lower().startswith("score:"):
                    score = float(line.split(":")[1].strip())
                elif line.lower().startswith("reasoning:"):
                    reasoning = line.split(":")[1].strip()
        except:
            pass
        return score, reasoning

fingpt = CloudAnalyst()