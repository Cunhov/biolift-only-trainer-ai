<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hQJXz9FVAPi7_WiXZkcFf-sa4CeT7sYV

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# LLM Provider Configuration Guide

The Biolift backend now supports multiple LLM providers! You can choose between Gemini, OpenAI, or any custom OpenAI-compatible API.

## Configuration

Edit `server/.env` and set these variables:

### For Gemini (Google):
```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=your_gemini_api_key_here
```

### For OpenAI:
```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_API_KEY=sk-your_openai_key_here
```

### For Custom Provider (Anthropic, Local LLMs, etc.):
```env
LLM_PROVIDER=custom
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.anthropic.com/v1
```

## Supported Models

### Gemini:
- `gemini-2.5-flash` (recommended - fast)
- `gemini-2.0-flash-exp`
- `gemini-1.5-pro`

### OpenAI:
- `gpt-4o` (recommended)
- `gpt-4-turbo`
- `gpt-3.5-turbo`

### Custom:
Any OpenAI-compatible API (Anthropic Claude, local LLMs with OpenAI-compatible endpoints, etc.)

## Notes

- The `API_KEY` variable is kept for backward compatibility
- If `LLM_API_KEY` is not set, it will fall back to `API_KEY`
- Restart the server after changing the configuration
