# Gemini Image Generation Skill

Reference guide for using Google's Gemini models for image generation.

## Purpose

Provides Claude Code agents with knowledge on how to correctly use the `google-genai` library for image generation. Agents can progressively load language-specific references as needed.

## Structure

```
gemini-image/
├── SKILL.md              # Overview, model info, prompt tips
├── README.md             # This file
└── references/
    └── python.md         # Python code patterns
```

## Usage

1. **SKILL.md** is loaded when the skill is invoked - contains model info, aspect ratios, prompt engineering tips
2. **references/python.md** should be loaded when implementing in Python - contains all code patterns

## Key Information

- **Model:** `gemini-3-pro-image-preview`
- **Library:** `google-genai>=1.0.0`
- **Auth:** `GOOGLE_API_KEY` environment variable
- **Cost:** ~$0.134 per image
