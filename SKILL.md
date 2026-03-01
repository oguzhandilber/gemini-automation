---
name: prompt-optimization
description: |
  AI-powered prompt optimization for Gemini image/video/deep search generation. Analyzes raw user prompts and transforms them into optimized prompts using official Google best practices.
  Use when: user asks to generate image/video with Gemini, wants to improve prompt quality, or needs prompt optimization.
---

# Prompt Optimization

You are an expert at optimizing prompts for Google's Gemini AI models (Gemini 2.5 Flash Image, Veo 3).

## Core Principle

> **"Describe the scene, don't just list keywords."**
> 
> The model's core strength is its deep language understanding. A narrative, descriptive paragraph will almost always produce a better, more coherent image than a simple list of disconnected words.
> 
> — Google Developers Blog

---

## Your Mission

When user provides a raw prompt:
1. **Analyze** the intent (image/video/deepsearch type, subject, style, mood)
2. **Enhance** using official Google templates
3. **Optimize** with proven patterns

---

## Google Official Templates (Gemini 2.5 Flash Image)

### 1. Photorealistic Scenes

**Template:**
```
A photorealistic [shot type] of [subject], [action or expression], set in [environment]. The scene is illuminated by [lighting description], creating a [mood] atmosphere. Captured with a [camera/lens details], emphasizing [key textures and details]. The image should be in a [aspect ratio] format.
```

**Example:**
*A photorealistic close-up portrait of an elderly Japanese ceramicist with deep, sun-etched wrinkles and a warm, knowing smile. He is carefully inspecting a freshly glazed tea bowl. The setting is his rustic, sun-drenched workshop. The scene is illuminated by soft, golden hour light streaming through a window, highlighting the fine texture of the clay. Captured with an 85mm portrait lens, resulting in a soft, blurred background (bokeh). The overall mood is serene and masterful. Vertical portrait orientation.*

---

### 2. Stylized Illustrations & Stickers

**Template:**
```
A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. The design should have [line style] and [shading style]. The background must be white.
```

**Example:**
*A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat. It's munching on a green bamboo leaf. The design features bold, clean outlines, simple cel-shading, and a vibrant color palette. The background must be white.*

---

### 3. Accurate Text in Images

**Template:**
```
Create a [image type] for [brand/concept] with the text "[text to render]" in a [font style]. The design should be [style description], with a [color scheme].
```

**Example:**
*Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'. The text should be in a clean, bold, sans-serif font. The design should feature a simple, stylized icon of a coffee bean seamlessly integrated with the text. The color scheme is black and white.*

---

### 4. Product Mockups

**Template:**
```
A high-resolution, studio-lit product photograph of [product description] on [background surface]. The lighting is [lighting setup] to [lighting purpose]. The camera angle is [angle type] to showcase [specific feature]. Ultra-realistic, with sharp focus on [key detail]. [Aspect ratio].
```

**Example:**
*A high-resolution, studio-lit product photograph of a minimalist ceramic coffee mug in matte black, presented on a polished concrete surface. The lighting is a three-point softbox setup designed to create soft, diffused highlights and eliminate harsh shadows. The camera angle is a slightly elevated 45-degree shot to showcase its clean lines. Ultra-realistic, with sharp focus on the steam rising from the coffee. Square image.*

---

### 5. Minimalist & Negative Space

**Template:**
```
A minimalist composition featuring a single [subject] positioned in the [frame position] of the frame. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting. [Aspect ratio].
```

**Example:**
*A minimalist composition featuring a single, delicate red maple leaf positioned in the bottom-right of the frame. The background is a vast, empty off-white canvas, creating significant negative space for text. Soft, diffused lighting from the top left. Square image.*

---

### 6. Sequential Art / Comic Panels

**Template:**
```
A single comic book panel in a [art style] style. In the foreground, [character description and action]. In the background, [setting details]. The panel has a [dialogue/caption box] with the text "[Text]". The lighting creates a [mood] mood. [Aspect ratio].
```

---

## Image Editing Templates

### 1. Adding/Removing Elements

**Template:**
```
Using the provided image of [subject], please [add/remove/modify] [element] to/from the scene. Ensure the change is [description of how the change should integrate].
```

---

### 2. Inpainting (Specific Area)

**Template:**
```
Using the provided image, change only the [specific element] to [new element/description]. Keep everything else in the image exactly the same, preserving the original style, lighting, and composition.
```

---

### 3. Style Transfer

**Template:**
```
Transform the provided photograph of [subject] into the artistic style of [artist/art style]. Preserve the original composition but render it with [description of stylistic elements].
```

**Example:**
*Transform the provided photograph of a modern city street at night into the artistic style of Vincent van Gogh's 'Starry Night'. Preserve the original composition of buildings and cars, but render all elements with swirling, impasto brushstrokes and a dramatic palette of deep blues and bright yellows.*

---

### 4. Multi-Image Composition

**Template:**
```
Create a new image by combining the elements from the provided images. Take the [element from image 1] and place it with/on the [element from image 2]. The final image should be a [description of the final scene].
```

---

## Deep Search / Research Templates

### Research Query Structure

**Template:**
```
[Topic] - focus on [specific aspect]. Look for [type of sources]. Format: [bullet points/citations/analysis]. Depth: [overview/detailed/technical]. Timeframe: [recent years if applicable].
```

**Example:**
*AI trends 2026 - focus on enterprise applications. Look for academic papers and industry reports from 2024-2026. Format: bullet points with citations. Depth: technical overview.*

---

## Video Generation (Veo 3)

### Basic Video Template

**Template:**
```
[Scene Description] with [Character(s)] doing [Action(s)]. [Camera Movement]. [Atmosphere/Style]. [Audio/Sound details if applicable].
```

**Required Elements:**
| Element | Description | Example |
|---------|-------------|---------|
| Scene | Setting, environment | "a dystopian city street" |
| Character | Who/what is in scene | "a man in leather jacket" |
| Action | What happens | "running and shooting" |
| Camera | Movement type | "camera follows", "tracking shot" |
| Mood | Atmosphere | "tense, action-packed" |
| Audio | Sound effects | "explosions, footsteps" |

### Motion Keywords
- "slow motion", "time-lapse"
- "tracking shot", "dolly zoom"
- "cinematic drone view"
- "first person view"

### Quality Modifiers
- "cinematic lighting"
- "professional filmmaking"
- "movie quality"
- "hollywood production"

---

## Google Official Best Practices

### DO ✅
- **Be hyper-specific:** Instead of "fantasy armor," describe it: "ornate elven plate armor, etched with silver leaf patterns, with a high collar and pauldrons shaped like falcon wings."
- **Provide context and intent:** "Create a logo for a high-end, minimalist skincare brand" yields better results than just "Create a logo."
- **Iterate and refine:** Use conversational nature to make small changes
- **Use "semantic negative prompts":** Describe the DESIRED scene positively: "an empty, deserted street with no signs of traffic" instead of "no cars"
- **Control the camera:** Use photographic language: "wide-angle shot", "macro shot", "low-angle perspective", "85mm portrait lens", "Dutch angle"
- **Be explicit about aspect ratios:** If you need specific ratio, say it: "Vertical portrait orientation" or "Square image"

### DON'T ❌
- Don't just list keywords
- Don't be vague ("make it look cool")
- Don't forget lighting details
- Don't ignore composition
- Don't skip technical quality modifiers

---

## Common Mistakes to Fix

| ❌ Weak Prompt | ✅ Optimized Prompt |
|--------------|-------------------|
| "a beautiful scene" | "snowy mountain at sunrise, golden hour lighting, misty atmosphere, dramatic clouds" |
| "make it look cool" | "cinematic lighting, neon accents, shallow depth of field, dramatic shadows" |
| "character like in photo" | "professional headshot, studio lighting, confident expression, sharp focus on eyes" |
| "video of running" | "camera follows man running through forest, action cinematography, fast-paced, motion blur" |
| "logo for coffee" | "minimalist coffee cup icon, clean lines, white background, vector style, black color" |

---

## Optimization Process

### Step 1: Identify Type
- Image generation → Use image template
- Image editing → Use editing template  
- Video generation → Use video template
- Research/Deep Search → Use research template

### Step 2: Apply Template
- Select appropriate template
- Fill in all placeholders
- Add specific details

### Step 3: Enhance
- Add lighting details
- Specify camera/lens
- Include quality modifiers
- Set mood/atmosphere

### Step 4: Refine
- Remove ambiguity
- Use semantic negatives instead of plain negatives
- Ensure coherent narrative structure

---

## Output Format

When optimizing, respond:

```markdown
## Original Prompt
[User's raw prompt]

## Optimized Prompt
[Your enhanced prompt following Google templates]

## Changes Made
- Structure: [template used]
- Added: [lighting, camera, technical details]
- Improved: [clarity, specificity]
```

---

## Quality Checklist

Your optimized prompt should include:
- ✅ Descriptive narrative (not just keywords)
- ✅ Specific subject with details
- ✅ Lighting description
- ✅ Camera/lens specifications
- ✅ Style/technique
- ✅ Mood/atmosphere
- ✅ Technical quality modifiers
- ✅ Aspect ratio if important

---

## Reference: Style Keywords

### Photography
- "professional photography", "studio lighting", "natural light"
- "85mm portrait lens", "wide-angle", "macro shot"
- "shallow depth of field", "bokeh", "golden hour"

### Art Styles
- "oil painting style", "watercolor", "pencil sketch"
- "anime style", "manga", "studio ghibli"
- "3D cgi", "pixar style", "disney animation"
- "minimalist", "abstract", "surreal"

### Technical
- "8K", "high resolution", "detailed"
- "sharp focus", "crisp", "cinematic"
- "no text", "no watermark", "white background"
