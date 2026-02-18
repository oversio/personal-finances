# UI Package (`@repo/ui`)

Shared React component library for the monorepo.

## Export Pattern

Components are exported via the `@repo/ui/*` pattern:

```typescript
import { ListIcon, PencilIcon, ArchiveIcon } from "@repo/ui/icons";
```

## Structure

```
packages/ui/
├── src/
│   └── icons/           # @repo/ui/icons
│       ├── index.tsx    # Re-exports all icons
│       ├── list-icon.tsx
│       ├── pencil-icon.tsx
│       └── archive-icon.tsx
└── package.json
```

## Icons

Icons are SVG components based on [Heroicons](https://heroicons.com/) (outline style, 24x24).

### Available Icons

| Icon    | Component     | Description                                |
| ------- | ------------- | ------------------------------------------ |
| List    | `ListIcon`    | Bulleted list, used for transactions/items |
| Pencil  | `PencilIcon`  | Edit action                                |
| Archive | `ArchiveIcon` | Archive/store action                       |

### Usage

```typescript
import { ListIcon, PencilIcon, ArchiveIcon } from "@repo/ui/icons";

// Icons accept standard SVG props
<ListIcon className="size-5" />
<PencilIcon className="size-4 text-primary" />
<ArchiveIcon className="size-6" stroke="red" strokeWidth={2} />
```

### Adding New Icons

1. **Find the icon** at [Heroicons](https://heroicons.com/) (use outline style for consistency)

2. **Create the icon file** in `src/icons/`:

```typescript
// src/icons/[icon-name]-icon.tsx
import type { SVGProps } from "react";

export function IconNameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="..." // Paste path from Heroicons
      />
    </svg>
  );
}
```

3. **Export from index.tsx**:

```typescript
// src/icons/index.tsx
export { IconNameIcon } from "./icon-name-icon";
```

### Naming Convention

- File: `kebab-case-icon.tsx` (e.g., `chevron-down-icon.tsx`)
- Component: `PascalCaseIcon` (e.g., `ChevronDownIcon`)

## Adding New Components

1. Create a `.tsx` file in `src/` with named exports
2. The file automatically becomes available as `@repo/ui/[filename]`

```typescript
// src/badge.tsx
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

// Usage: import { Badge } from "@repo/ui/badge";
```

For subdirectories (like icons), add an explicit export in `package.json`:

```json
{
  "exports": {
    "./*": "./src/*.tsx",
    "./icons": "./src/icons/index.tsx"
  }
}
```
