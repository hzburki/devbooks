# DevBooks - Agent Guidelines

## Project Overview

DevBooks is an employee management dashboard application built for internal use at Ideamappers. It's a monorepo workspace using Nx, designed to manage employees, leave requests, invoices, and other HR-related operations.

### Key Technologies

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Form Handling**: React Hook Form with Yup validation
- **Routing**: React Router DOM v6
- **Authentication**: Supabase for authentication (restricted to @ideamappers.com domain)
- **Backend**: Supabase (to be integrated)
- **Monorepo**: Nx workspace with library-based architecture

### Project Structure

```
apps/
  dashboard/          # Main application
libs/
  ui/                 # Atomic UI components (buttons, inputs, cards, etc.)
  components/         # Composite components (layouts, pages, etc.)
  hooks/             # Shared React hooks
```

## General Principles

1. **Library-First Architecture**: Build reusable components and hooks in `libs/` before using them in `apps/`
2. **Type Safety**: Leverage TypeScript's strict mode - never use `any`, use proper types
3. **Component Composition**: Prefer composition over inheritance, build small reusable pieces
4. **Consistent Patterns**: Follow established patterns in the codebase
5. **Performance**: Consider React 19 features, avoid unnecessary re-renders

## TypeScript Best Practices

### Type Definitions

- Always define explicit types for function parameters and return values
- Use interfaces for object shapes, types for unions/intersections
- Prefer `type` for utility types, `interface` for extensible shapes
- Use `const` assertions for literal types when appropriate

```typescript
// ✅ GOOD
interface User {
  id: string;
  email: string;
  name: string;
}

type Status = 'pending' | 'approved' | 'rejected';

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ BAD
function getUser(id) {
  // ...
}
```

### Type Safety

- Never use `any` - use `unknown` if type is truly unknown, then narrow it
- Use type guards for runtime type checking
- Leverage TypeScript's discriminated unions for state management
- Use `as const` for immutable data structures

```typescript
// ✅ GOOD
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Invalid data type');
}

// ❌ BAD
function processData(data: any): string {
  return data.toUpperCase();
}
```

### React Types

- Use proper React types: `React.FC` is optional, prefer explicit return types
- Type event handlers explicitly
- Use generic types for reusable components

```typescript
// ✅ GOOD
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ✅ ALSO GOOD (explicit return type)
const Button = ({ onClick, children }: ButtonProps): JSX.Element => {
  return <button onClick={onClick}>{children}</button>;
};
```

## Frontend Best Practices

### Component Structure

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract complex logic into custom hooks
- Colocate related files (component + styles + tests)

```typescript
// ✅ GOOD - Single responsibility
const EmployeeCard = ({ employee }: { employee: Employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{employee.email}</p>
      </CardContent>
    </Card>
  );
};

// ❌ BAD - Too many responsibilities
const EmployeeCard = ({ employee }) => {
  const [data, setData] = useState();
  useEffect(() => {
    fetchData();
  }, []);
  // ... 100 more lines
};
```

### State Management

- Use `useState` for local component state
- Use `useReducer` for complex state logic
- Consider context for shared state (but avoid prop drilling)
- Keep state as close to where it's used as possible

### Performance

- Use `React.memo` for expensive components that re-render frequently
- Memoize callbacks with `useCallback` when passing to memoized children
- Memoize expensive computations with `useMemo`
- Avoid creating objects/arrays in render (use `useMemo`)

```typescript
// ✅ GOOD
const ExpensiveComponent = React.memo(({ data }: { data: Data }) => {
  const processed = useMemo(() => expensiveOperation(data), [data]);
  return <div>{processed}</div>;
});

// ❌ BAD
const ExpensiveComponent = ({ data }: { data: Data }) => {
  const processed = expensiveOperation(data); // Runs on every render
  return <div>{processed}</div>;
};
```

### Form Handling

- Always use React Hook Form for forms
- Use Yup for validation schemas
- Provide clear error messages
- Handle loading and error states

```typescript
// ✅ GOOD
const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup.string().required('Password is required').min(8),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(schema),
});
```

### Error Handling

- Always handle errors in async operations
- Provide user-friendly error messages
- Use toast notifications for user feedback
- Log errors appropriately (don't expose internal details)

```typescript
// ✅ GOOD
try {
  await submitForm(data);
  toast({ variant: 'success', title: 'Success!' });
} catch (error) {
  toast({
    variant: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  });
  console.error('Form submission error:', error);
}
```

## Naming Conventions

### Files and Directories

- **Components**: kebab-case - `employee-card.tsx`, `login-form.tsx`
- **Hooks**: kebab-case with `use` prefix - `use-toast.ts`, `use-employee.ts`
- **Utilities**: kebab-case - `format-date.ts`, `validate-email.ts`
- **Types/Interfaces**: kebab-case - `user.ts`, `employee.ts` (or inline in component files)
- **Directories**: kebab-case - `employee-card/`, `auth/`

### Variables and Functions

- **Variables**: camelCase - `userName`, `isLoading`, `employeeList`
- **Constants**: UPPER_SNAKE_CASE - `MAX_FILE_SIZE`, `API_BASE_URL`
- **Functions**: camelCase - `getUserById`, `handleSubmit`, `formatDate`
- **Components**: PascalCase - `UserCard`, `LoginForm`
- **Boolean variables**: Prefix with `is`, `has`, `should` - `isLoading`, `hasError`, `shouldRender`
- **Event handlers**: Prefix with `handle` - `handleClick`, `handleSubmit`, `handleChange`

```typescript
// ✅ GOOD
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const employeeList = useEmployees();

function handleSubmit(event: React.FormEvent) {
  // ...
}

const UserCard = ({ user }: { user: User }) => {
  // ...
};

// ❌ BAD
const [loading, setLoading] = useState(false);
const [error, setError] = useState(false);
const employees = useEmployees();

function submit(event: React.FormEvent) {
  // ...
}
```

### TypeScript Types and Interfaces

- **Interfaces**: PascalCase - `User`, `Employee`, `ApiResponse`
- **Types**: PascalCase - `Status`, `UserRole`, `FormData`
- **Generic types**: Single uppercase letter - `T`, `K`, `V`
- **Props interfaces**: Component name + `Props` - `ButtonProps`, `CardProps`

```typescript
// ✅ GOOD
interface User {
  id: string;
  name: string;
}

type Status = 'active' | 'inactive';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

// ❌ BAD
interface user {
  id: string;
}

type status = 'active' | 'inactive';
```

### CSS Classes (Tailwind)

- Use Tailwind utility classes directly in JSX
- Group related utilities logically
- Use `cn()` utility for conditional classes
- Keep class names readable and consistent

```typescript
// ✅ GOOD
<div className="flex items-center justify-between gap-4 p-6">
  <Button className={cn("w-full", isLoading && "opacity-50")}>
    Submit
  </Button>
</div>

// ❌ BAD
<div className="flex items-center justify-between gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg">
  {/* Too many classes, consider extracting to component */}
</div>
```

## Code Organization

### Imports

- Group imports: external libraries → internal libraries → relative imports
- Use absolute imports from `@devbooks/*` for libs
- Keep imports organized and remove unused ones

```typescript
// ✅ GOOD
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@devbooks/ui';
import { useToast } from '@devbooks/hooks';
import { formatDate } from '../utils';

// ❌ BAD
import { Button } from '@devbooks/ui';
import { useState } from 'react';
import { formatDate } from '../utils';
import { useNavigate } from 'react-router-dom';
```

### Component Exports

- If a folder contains multiple components, create an `index.ts` in that folder and export all components from it using named exports (see `libs/ui/src/atoms` as an example).
- Use default exports only for top-level page/route components.
- Use named exports for all reusable components, exporting them from the folder's `index.ts` where applicable.
- Always export related types/interfaces alongside the components from the same `index.ts` to keep imports organized and easy to maintain.

```typescript
// ✅ GOOD - Page component
const Login = () => {
  // ...
};
export default Login;

// ✅ GOOD - Reusable component
export const Button = ({ ... }: ButtonProps) => {
  // ...
};
```

## Library Usage Guidelines

### @devbooks/ui

- Contains atomic UI components (Button, Input, Card, etc.)
- Import from `@devbooks/ui` - e.g., `import { Button, Input } from '@devbooks/ui'`
- These are low-level, reusable building blocks

### @devbooks/components

- Contains composite components (layouts, page wrappers)
- Import from `@devbooks/components` - e.g., `import { DashboardPage } from '@devbooks/components'`
- These combine multiple UI components into higher-level patterns

### @devbooks/hooks

- Contains shared React hooks
- Import from `@devbooks/hooks` - e.g., `import { useToast } from '@devbooks/hooks'`
- Extract reusable logic into hooks here

## Code Quality

- Write self-documenting code with clear variable names
- Add comments for complex logic or business rules
- Keep functions small and focused
- Avoid deep nesting (max 3-4 levels)
- Use early returns to reduce nesting

```typescript
// ✅ GOOD
function processUser(user: User | null): string {
  if (!user) return 'No user';
  if (!user.email) return 'No email';
  return user.email;
}

// ❌ BAD
function processUser(user: User | null): string {
  if (user) {
    if (user.email) {
      return user.email;
    } else {
      return 'No email';
    }
  } else {
    return 'No user';
  }
}
```

## When Working on This Codebase

1. **Check existing patterns** - Look at similar components/files before creating new ones
2. **Use the library structure** - Don't duplicate code, extract to libs when reusable
3. **Follow the naming conventions** - Consistency is key
4. **Type everything** - No `any`, proper types for all functions and components
5. **Test your changes** - Ensure the app still works after modifications
6. **Keep components small** - If a component is >200 lines, consider splitting it
7. **Use Tailwind utilities** - Don't create custom CSS unless necessary
8. **Handle loading/error states** - Always consider these states in your UI
