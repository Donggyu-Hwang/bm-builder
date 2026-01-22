# Typography Setup for LoginPage

## Required Fonts

The LoginPage uses two complementary fonts to create the "AI Co-Founder Workspace" aesthetic:

### 1. Space Grotesk (Display/Headlines)
- **Usage**: Logo, titles, headings
- **Style**: Geometric, bold, tech-forward
- **Weights**: 700 (Bold)
- **Why**: Quirky yet structured personality - perfect for an AI co-founder brand

### 2. Plus Jakarta Sans (Body Text)
- **Usage**: Descriptions, UI text
- **Style**: Geometric, warm, highly readable
- **Weights**: 400, 500, 600
- **Why**: Technical but approachable - excellent readability with modern character

## Installation

### Option 1: Google Fonts (Recommended)

Add to your `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
```

### Option 2: Local Installation (For Production)

```bash
cd frontend
npm install @fontsource/plus-jakarta-sans @fontsource/space-grotesk
```

Then import in your main CSS:

```css
@import "@fontsource/space-grotesk/700.css";
@import "@fontsource/plus-jakarta-sans/400.css";
@import "@fontsource/plus-jakarta-sans/500.css";
@import "@fontsource/plus-jakarta-sans/600.css";
```

## CSS Font Family Variables

The CSS module already includes these variables:

```css
:root {
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

## Font Pairing Rationale

This combination creates a distinctive personality:

1. **Space Grotesk** - The "Visionary" Voice
   - Bold geometric shapes
   - Slightly quirky (not boring corporate)
   - Perfect for: Logos, headlines, CTAs

2. **Plus Jakarta Sans** - The "Practical" Voice
   - Clean geometric sans
   - Warm, approachable character
   - Perfect for: Body text, UI elements, descriptions

**Result**: A balance of innovation and accessibility - exactly what an AI co-founder should feel like.

## Fallback Fonts

If Google Fonts fails to load, the design falls back gracefully:

```css
font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

## Performance Tips

1. **Preconnect** to Google Fonts domains (already included)
2. **Display swap** prevents FOUT (Flash of Unstyled Text)
3. **Only load necessary weights** (700 for Space Grotesk, 400-600 for Jakarta)
4. **Consider self-hosting** for production (using @fontsource)

## Testing Your Fonts

After setup, verify fonts are loading:

```javascript
// In browser console
document.fonts.ready.then(() => {
  document.fonts.forEach(font => {
    console.log(font.family);
  });
});
```

You should see:
- "Space Grotesk"
- "Plus Jakarta Sans"
