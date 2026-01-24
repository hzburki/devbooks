create type "public"."user_types" as enum ('owner', 'employee');

alter table "public"."employees" add column "user_type" public.user_types not null;

alter table "public"."employees" alter column "designations" set data type public.designations using "designations"::text::public.designations;

alter table "public"."employees" alter column "employment_status" set default 'probation'::public.employee_statuses;

alter table "public"."employees" alter column "employment_status" set data type public.employee_statuses using "employment_status"::text::public.employee_statuses;

alter table "public"."employees" alter column "job_type" set default 'full_time'::public.contract_type;

alter table "public"."employees" alter column "job_type" set data type public.contract_type using "job_type"::text::public.contract_type;

alter table "public"."employees" alter column "personal_bank_name" set data type public.bank_name using "personal_bank_name"::text::public.bank_name;


