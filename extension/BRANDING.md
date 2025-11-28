# Echo Extension Branding Guide

## Visual Identity

The Echo browser extension has been fully rebranded to match the clean, minimal aesthetic of the Echo web application and landing page.

## Color Palette

### Primary Colors
- **Slate Black**: `#0f172a` - Primary buttons, headers, active pins
- **White**: `#ffffff` - Backgrounds, cards
- **Beige**: `#FAF9F8` - Page background

### Accent Colors
- **Green**: `#10B981` - Resolved threads, success states
- **Red**: `#dc2626` / `#EF4444` - Stop/delete buttons, alerts
- **Yellow**: `#fbbf24` - Warnings, domain mismatch alerts
- **Gray Scale**:
  - Light: `#f8fafc`, `#f1f5f9`, `#e2e8f0`
  - Medium: `#64748b`, `#475569`
  - Dark: `#1e293b`, `#0f172a`

## Typography

- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Font Weights**:
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

## UI Components

### Popup Window
- **Width**: 360px
- **Background**: Beige (#FAF9F8)
- **Header**: White with slate text, logo, and subtitle
- **Cards**: White with subtle borders (#e2e8f0)
- **Buttons**: Slate black primary, light gray secondary

### Comment Pins
- **Size**: 32x32px
- **Shape**: Circle
- **Colors**:
  - Open threads: Slate black (#0f172a)
  - Resolved threads: Green (#10B981)
- **Border**: 2px white
- **Shadow**: `0 4px 12px rgba(0, 0, 0, 0.3)`
- **Badge**: Comment count in center

### Floating Action Button (FAB)
- **Size**: 56x56px
- **Background**: Slate black (#0f172a)
- **Icon**: 💬 (message bubble emoji)
- **Shadow**: `0 4px 12px rgba(15, 23, 42, 0.4)`
- **Badge**: Red notification badge for comment count

### Comments Panel
- **Width**: 380px
- **Position**: Fixed right side
- **Header**: Slate black (#0f172a) with white text
- **Filters**: Two-button toggle (All/Open)
- **Active filter**: Slate background with dark text
- **Inactive filter**: White background with gray text

### Form Elements
- **Input/Select**: White background, light gray border
- **Focus**: Slate border with subtle shadow
- **Border Radius**: 8px for inputs, 6-8px for buttons
- **Padding**: Comfortable spacing (10-12px)

### Buttons

#### Primary (Slate)
- Background: `#0f172a`
- Color: White
- Hover: `#1e293b`

#### Success (Recording/Start)
- Background: `#0f172a`
- Color: White
- Hover: `#1e293b`

#### Danger (Stop/Delete)
- Background: `#dc2626` / `#EF4444`
- Color: White
- Hover: `#b91c1c`

#### Secondary (Sign Out)
- Background: `#f1f5f9`
- Color: `#475569`
- Border: `1px solid #e2e8f0`
- Hover: `#e2e8f0`

## Icons & Graphics

### Logo Icon
- Message bubble SVG icon
- Stroke width: 2
- Size: 24x24px in header
- Color: Inherits from parent (slate)

### Status Indicators
- Recording: Green background (#f0fdf4)
- Not Recording: Light gray background (#f8fafc)
- Warning: Yellow background (#fef3c7)
- Error: Red background (#fef2f2)

## Spacing System

- **Base unit**: 4px
- **Small spacing**: 8px
- **Medium spacing**: 12px, 16px
- **Large spacing**: 20px, 24px
- **Section padding**: 20px
- **Card padding**: 16-20px

## Border Radius Scale

- **Small**: 6px (small buttons, badges)
- **Medium**: 8px (inputs, buttons, cards)
- **Large**: 12px (panels, major cards)
- **Circle**: 50% (FAB, pins, avatars)

## Shadows

- **Subtle**: `0 2px 8px rgba(0, 0, 0, 0.05)`
- **Card**: `0 4px 12px rgba(0, 0, 0, 0.1)`
- **Elevated**: `0 4px 12px rgba(15, 23, 42, 0.4)`
- **Pin**: `0 4px 12px rgba(0, 0, 0, 0.3)`
- **Hover**: `0 6px 20px rgba(15, 23, 42, 0.5)`

## Transitions

- **Standard**: `all 0.2s ease`
- **Transform**: `transform 0.2s ease`
- **Color**: `background 0.2s ease`, `color 0.2s ease`

## Responsive Behavior

- Fixed width popup (360px)
- Fixed width comments panel (380px)
- Scrollable content areas
- Sticky headers and footers
- Mobile-friendly touch targets (min 44px)

## Accessibility

- **Focus states**: Clear visible focus with slate border and subtle shadow
- **Color contrast**: WCAG AA compliant
- **Interactive elements**: Min 44x44px touch target
- **Hover states**: Clear visual feedback
- **Text legibility**: Sufficient line height and spacing

## Design Principles

1. **Clean & Minimal**: No unnecessary gradients or decorations
2. **Professional**: Slate and white color scheme
3. **Consistent**: Matches web app styling exactly
4. **Clear Hierarchy**: Strong typography and spacing
5. **Functional**: Every element serves a purpose
6. **Modern**: Contemporary design patterns

## Key Differences from Previous Version

### Changed
- ❌ Bright blue (#3B82F6) → ✅ Slate black (#0f172a)
- ❌ Gradient backgrounds → ✅ Solid colors
- ❌ Multiple accent colors → ✅ Focused palette
- ❌ Heavy shadows → ✅ Subtle, functional shadows

### Kept
- ✅ Comment pin system
- ✅ FAB navigation
- ✅ Panel layout
- ✅ Status indicators
- ✅ Filter toggles

## Implementation Notes

All color values have been updated in:
- `popup.html` - Extension popup styles
- `content.js` - Dynamic UI elements (pins, panels, widgets)
- `content.css` - Focus states and overrides
- `manifest.json` - Extension metadata

The extension now presents a cohesive, professional appearance that aligns perfectly with the Echo brand identity across all touchpoints.
