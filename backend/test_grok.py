import asyncio
from openai import AsyncOpenAI
from config import get_settings

async def main():
    s = get_settings()
    c = AsyncOpenAI(api_key=s.grok_api_key, base_url=s.grok_base_url)
    try:
        r = await c.chat.completions.create(model=s.grok_model, messages=[{'role':'user','content':'hi'}])
        print(r)
    except Exception as e:
        print("ERROR:", type(e))
        print("MSG:", getattr(e, 'message', str(e)))

asyncio.run(main())
