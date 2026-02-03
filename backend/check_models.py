import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load your key
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ ERROR: No API Key found in .env")
else:
    print(f"✅ Key found: {api_key[:10]}...")
    
    try:
        genai.configure(api_key=api_key)
        print("\n🔍 Asking Google for available models...")
        
        found = False
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   - {m.name}")
                found = True
        
        if not found:
            print("\n❌ No chat models found. Your API Key might be invalid or has no access.")
        else:
            print("\n✅ SUCCESS! Use one of the names above in your graph.py file.")
            
    except Exception as e:
        print(f"\n❌ CONNECTION ERROR: {e}")