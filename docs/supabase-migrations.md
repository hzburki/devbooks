Since you want to stick with the Dashboard for building while using Git for versioning, you are essentially adopting a "Dashboard-First, Code-Synced" workflow.

The Supabase CLI is the bridge that makes this possible. Here is exactly how to keep your code in sync without ever leaving the Dashboard to write SQL.

1. The Initial Setup (One Time)
   Since you've already created your first table, you need to "capture" it into your React project.

Initialize Supabase: Run npx supabase init in your project root.

Login in to your supabase account. run npx supabase login. This will open a browser and allow to login to supabase on the terminal.

Link your project: npx supabase link --project-ref your-project-id (Find this in Project Settings > General).

Before you run the below db pull command, you will need to have docker desktop running.

Pull the current schema: npx supabase db pull

The db pull command is going to pull the supabase/postgres image from docker among other images. According to Gemini these images are required for Supabase
to peform the diffing process.

This creates a folder called supabase/migrations and adds a file containing the SQL for the table you just built in the dashboard. Commit this to Git.

2. The "Syncing" Workflow (Every time you change something)
   Moving forward, follow this simple 3-step loop whenever you add a feature:

Step A: Build in Dashboard Go to the Supabase UI and add your new columns, tables, or Enums.

Step B: Pull the change In your terminal, run:

npx supabase db pull --schema public "commit_message"
This pulls the public schema which has your changes and ignores the rest of the changes which may have been caused by Supabase itself.
It also creates a new timestamped migration file in your code that represents only the changes you just made.

Step C: Git Commit git add .

git commit -m "commit_message"

## Red Flag

To the the db pull command for consequent change, I changed an existing column's name and type. When I ran the
db pull command and opened the migration file, I saw that supabase had droped the column and created a new one.
This is extremely dangerous. It means if there was any data in that column, it would be lost.
