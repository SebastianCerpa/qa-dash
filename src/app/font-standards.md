# Font Standards for QA Dashboard

## Introduction

This document establishes font standards for the entire QA Dashboard project, with the goal of maintaining visual consistency throughout the application. These standards apply to all components and pages.

## Font Sizes

### Size Hierarchy

We will use the following Tailwind CSS classes for font sizes:

| Tailwind Class | Recommended Use |
|----------------|------------------|
| `text-sm` | General interface text, labels, descriptions, secondary information, metadata |
| `text-base` | Main text, paragraph content, card titles |
| `text-lg` | Subtitles, section headers |
| `text-xl` | Secondary section titles |
| `text-xl` | Secondary section titles |
| `text-2xl` | Page titles, main statistics |
| `text-3xl` | Featured titles |

### Application Rules

1. **Page Headers**: Use `text-2xl` with `font-bold`
2. **Section Titles**: Use `text-xl` with `font-semibold`
3. **Card Titles**: Use `text-base` with `font-medium` or `font-semibold`
4. **Interface Text**: Use `text-sm` for most interface elements
5. **Labels and Badges**: Use `text-sm` for consistency
6. **Metadata and Secondary Text**: Use `text-sm`

## Font Styles

### Font Weights

| Tailwind Class | Recommended Use |
|----------------|------------------|
| `font-normal` | Regular paragraph text |
| `font-medium` | Moderate emphasis, labels |
| `font-semibold` | Titles, highlighted elements |
| `font-bold` | Main titles, very highlighted elements |

### Text Colors

| Tailwind Class | Recommended Use |
|----------------|------------------|
| `text-gray-900` | Main text |
| `text-gray-700` | Secondary text |
| `text-gray-500` | Tertiary text, descriptions |
| `text-blue-600` | Links, primary actions |
| `text-red-600` | Errors, alerts |

## Positioning

### Spacing

1. **Margin between Title and Content**: `mb-2` or `mb-3`
2. **Margin between Paragraphs**: `mb-2`
3. **Margin between Sections**: `mb-4` or `mb-6`
4. **Padding in Text Containers**: `px-4 py-2` or `p-4`

### Alignment

1. **Titles**: Generally left-aligned (`text-left`)
2. **Paragraph Text**: Left-aligned (`text-left`)
3. **Form Labels**: Left-aligned, above fields

## Specific Components

### Buttons

- **Small (sm)**: `text-sm`
- **Medium (md)**: `text-sm` (default)
- **Large (lg)**: `text-base`
- **Extra Large (xl)**: `text-lg`

### Labels (Badges)

- **Small (sm)**: `text-sm`
- **Medium (md)**: `text-sm` (default)
- **Large (lg)**: `text-sm`

### Forms

- **Labels**: `text-sm` with `font-medium`
- **Input fields**: `text-sm`
- **Error messages**: `text-sm` with `text-red-600`
- **Help text**: `text-sm` with `text-gray-500`

### Tables

- **Headers**: `text-sm` with `font-medium` and `uppercase`
- **Cell content**: `text-sm`

## Implementation

To implement these standards, all existing components should be reviewed and updated to ensure they follow these guidelines. New components should be created following these standards from the beginning.