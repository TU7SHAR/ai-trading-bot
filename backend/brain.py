import os
from google import genai
from groq import Groq

class CloudAnalyst:
    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    def get_detailed_analysis(self, technical_sheet):
        # Premium multi-strategy engineering prompt
        prompt = (
            f"You are the Lead Quantitative Algorithmic Trading Architect for an institutional hedge fund.\n"
            f"Analyze this comprehensive multi-factor market profile data sheet:\n\n"
            f"\"\"\"\n{technical_sheet}\n\"\"\"\n\n"
            f"Run an evaluation combining Momentum Heuristics, Liquidity Order Book Cluster Pressure, and Volatility Sizing Regimes.\n"
            f"Return your final strategic response EXACTLY in this format:\n"
            f"Score: <a float between -1.0 and 1.0 representing net directional conviction>\n"
            f"Reasoning: <Provide a comprehensive, high-density professional multi-paragraph breakdown detailing your technical trade rationale, entry signals, and warning levels based on the VIX context provided.>"
        )
        
        groq_res = {"sentiment_score": 0.0, "recommendation": "HOLD", "reasoning": "Unavailable"}
        try:
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
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
        reasoning = "Could not parse multi-factor audit explanation."
        try:
            # Enhanced block parser to extract long structural text paragraphs safely
            if "score:" in text.lower():
                parts = text.lower().split("score:")
                score_part = parts[1].split("\n")[0].replace(":", "").strip()
                score = float(score_part)
            
            if "reasoning:" in text.lower():
                reasoning_part = text.split("Reasoning:")[1] if "Reasoning:" in text else text.split("reasoning:")[1]
                reasoning = reasoning_part.strip()
        except Exception:
            pass
        return score, reasoning

fingpt = CloudAnalyst()