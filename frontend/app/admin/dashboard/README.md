# Admin Dashboard

## Architecture

The dashboard uses a generic `Manager<T, F>` component that handles CRUD operations for any entity type. Each entity provides a `ManagerConfig` object that defines its form fields, list rendering, and API endpoint.

## File Structure

```
dashboard/
├── page.tsx              # Dashboard shell: auth, tabs, sidebar navigation
├── Manager.tsx           # Generic CRUD component (fetch, create, edit, delete)
└── managers/
    ├── index.ts          # Barrel re-exports
    ├── shared.ts         # CSS classes, API_URL, form state interfaces
    ├── hooks.ts          # useSkillsData, useCategoriesData (shared data fetchers)
    ├── categoryManager.tsx
    ├── skillManager.tsx
    ├── projectManager.tsx  # Includes ProjectImageControls component
    ├── learningManager.tsx
    ├── activityManager.tsx
    └── userManager.tsx     # Singleton config (single user profile, not a list)
```

## How It Works

1. **`page.tsx`** renders tab navigation and passes a memoized `ManagerConfig` to `<Manager>` for the active tab.
2. **`Manager.tsx`** receives a config and handles all CRUD state/logic generically. Key config fields:
   - `apiEndpoint` — REST path (e.g. `"projects"`)
   - `renderForm` / `renderListItem` — JSX for form inputs and list cards
   - `getFormData` / `setFormData` — serialize/deserialize between form state and API payload
   - `isSingleton` — when `true`, treats the endpoint as a single object (used by `userManager`)
3. **`managers/*.tsx`** each export a config object or factory function. Factory functions (e.g. `createProjectConfig(skills)`) accept dependency data so list items can display related entity names.
4. **`hooks.ts`** provides `useSkillsData` and `useCategoriesData` which are called in `page.tsx` and passed into factory configs.

## Adding a New Entity

1. Create `managers/fooManager.tsx` exporting a `ManagerConfig<FooRead, FooFormState>`.
2. Add the form state interface to `shared.ts`.
3. Re-export from `managers/index.ts`.
4. Add a tab entry and `<Manager config={...} />` in `page.tsx`.
