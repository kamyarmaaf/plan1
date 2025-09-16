# Design Guidelines for AI-Powered Life Planning Web Application

## Design Approach
**Reference-Based Approach** inspired by **Notion** and **Linear** - focusing on clean productivity interfaces with thoughtful information hierarchy and gentle visual feedback.

## Core Design Elements

### Color Palette
**Light Mode:**
- Primary: 220 15% 25% (Deep blue-gray for headers, navigation)
- Background: 0 0% 98% (Warm white)
- Surface: 0 0% 100% (Pure white cards/panels)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 50%

**Dark Mode:**
- Primary: 220 15% 85% (Light blue-gray)
- Background: 220 15% 8% (Deep blue-black)
- Surface: 220 15% 12% (Elevated dark panels)
- Text Primary: 220 15% 90%
- Text Secondary: 220 10% 70%

**Accent Colors:**
- Success: 142 70% 45% (Forest green for completed goals)
- Warning: 38 85% 55% (Amber for pending items)
- Accent: 260 85% 65% (Purple for AI-generated content)

### Typography
- **Primary Font:** Inter (Google Fonts) - for body text and UI elements
- **Display Font:** Inter (600-700 weight) - for headings and emphasis
- **Monospace:** JetBrains Mono - for time displays and data metrics

### Layout System
**Tailwind Spacing Units:** Primary spacing using units 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px)
- Section spacing: p-8, m-8 (32px)
- Large gaps: gap-12, mt-16 (48-64px)

### Component Library

**Navigation:**
- Clean sidebar navigation with collapsible sections
- Breadcrumb trails for deep navigation
- Tab-based interfaces for schedule views (daily/monthly)

**Data Displays:**
- Card-based layout for schedule items and goals
- Progress bars with smooth animations
- Calendar grid components with hover states
- Chart components using Chart.js or similar

**Forms:**
- Multi-step profile setup with progress indicators
- Inline editing for schedule adjustments
- Toggle switches for preference settings
- Floating labels for input fields

**Interactive Elements:**
- Drag-and-drop schedule reordering
- Expandable/collapsible sections
- Modal overlays for detailed editing
- Toast notifications for AI recommendations

### Key Pages Layout

**Dashboard:**
- Three-column layout: navigation, main content, sidebar widgets
- Today's schedule as primary focus
- Quick stats cards showing progress metrics
- AI suggestions panel with gentle purple accent

**Profile Setup:**
- Progressive disclosure multi-step form
- Visual progress indicator at top
- Clear section divisions with generous whitespace
- Smart defaults and helpful tooltips

**Schedule Views:**
- Timeline-based daily view with time blocks
- Calendar grid for monthly overview
- Split view: planned vs actual comparison
- Floating action button for quick additions

### Visual Treatments
- **Elevation:** Subtle shadows (0 1px 3px rgba(0,0,0,0.1))
- **Borders:** Minimal 1px borders in muted colors
- **Radius:** Consistent 6px border radius for cards, 4px for buttons
- **Transitions:** 150ms ease-in-out for hover states
- **Focus States:** 2px outline with primary color

### Content Strategy
- **Onboarding:** Progressive disclosure of features
- **Empty States:** Encouraging illustrations with clear next steps
- **AI Feedback:** Clearly labeled AI-generated content with explanation
- **Error Handling:** Friendly, actionable error messages

### Accessibility
- Consistent dark mode across all form inputs
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators on all interactive elements

This design emphasizes clarity, productivity, and trust - essential for a personal planning application where users input sensitive life data and rely on AI recommendations.