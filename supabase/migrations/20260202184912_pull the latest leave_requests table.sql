create type "public"."leave_statuses" as enum ('pending', 'approved', 'rejected');

create type "public"."leave_types" as enum ('casual', 'sick', 'parental', 'other');

alter table "public"."employee_documents" drop constraint "employee_documents_employee_id_key";

alter table "public"."employee_documents" drop constraint "employee_documents_employee_id_key1";

drop index if exists "public"."employee_documents_employee_id_key";

drop index if exists "public"."employee_documents_employee_id_key1";


  create table "public"."leave_requests" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null default gen_random_uuid(),
    "leave_status" public.leave_statuses not null,
    "reason" text,
    "start_date" date not null,
    "end_date" date not null,
    "num_days" smallint not null,
    "partial_leave" boolean not null default false,
    "deadline_extended" boolean not null default false,
    "leave_type" public.leave_types not null,
    "decided_at" timestamp with time zone,
    "updated_at" timestamp with time zone not null,
    "deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."leave_requests" enable row level security;

CREATE UNIQUE INDEX leave_requests_pkey ON public.leave_requests USING btree (id);

alter table "public"."leave_requests" add constraint "leave_requests_pkey" PRIMARY KEY using index "leave_requests_pkey";

alter table "public"."leave_requests" add constraint "leave_requests_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE not valid;

alter table "public"."leave_requests" validate constraint "leave_requests_employee_id_fkey";

grant delete on table "public"."leave_requests" to "anon";

grant insert on table "public"."leave_requests" to "anon";

grant references on table "public"."leave_requests" to "anon";

grant select on table "public"."leave_requests" to "anon";

grant trigger on table "public"."leave_requests" to "anon";

grant truncate on table "public"."leave_requests" to "anon";

grant update on table "public"."leave_requests" to "anon";

grant delete on table "public"."leave_requests" to "authenticated";

grant insert on table "public"."leave_requests" to "authenticated";

grant references on table "public"."leave_requests" to "authenticated";

grant select on table "public"."leave_requests" to "authenticated";

grant trigger on table "public"."leave_requests" to "authenticated";

grant truncate on table "public"."leave_requests" to "authenticated";

grant update on table "public"."leave_requests" to "authenticated";

grant delete on table "public"."leave_requests" to "service_role";

grant insert on table "public"."leave_requests" to "service_role";

grant references on table "public"."leave_requests" to "service_role";

grant select on table "public"."leave_requests" to "service_role";

grant trigger on table "public"."leave_requests" to "service_role";

grant truncate on table "public"."leave_requests" to "service_role";

grant update on table "public"."leave_requests" to "service_role";


