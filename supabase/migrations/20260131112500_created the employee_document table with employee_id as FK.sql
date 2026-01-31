
  create table "public"."employee_documents" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid default gen_random_uuid(),
    "file_path" character varying not null,
    "name" character varying not null,
    "meta_data" jsonb,
    "created_at" timestamp with time zone not null,
    "updated_at" timestamp without time zone not null,
    "deleted_at" timestamp without time zone
      );


alter table "public"."employees" disable row level security;

CREATE UNIQUE INDEX employee_documents_employee_id_key ON public.employee_documents USING btree (employee_id);

CREATE UNIQUE INDEX employee_documents_employee_id_key1 ON public.employee_documents USING btree (employee_id);

CREATE UNIQUE INDEX employee_documents_pkey ON public.employee_documents USING btree (id);

alter table "public"."employee_documents" add constraint "employee_documents_pkey" PRIMARY KEY using index "employee_documents_pkey";

alter table "public"."employee_documents" add constraint "employee_documents_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."employee_documents" validate constraint "employee_documents_employee_id_fkey";

alter table "public"."employee_documents" add constraint "employee_documents_employee_id_key" UNIQUE using index "employee_documents_employee_id_key";

alter table "public"."employee_documents" add constraint "employee_documents_employee_id_key1" UNIQUE using index "employee_documents_employee_id_key1";

grant delete on table "public"."employee_documents" to "anon";

grant insert on table "public"."employee_documents" to "anon";

grant references on table "public"."employee_documents" to "anon";

grant select on table "public"."employee_documents" to "anon";

grant trigger on table "public"."employee_documents" to "anon";

grant truncate on table "public"."employee_documents" to "anon";

grant update on table "public"."employee_documents" to "anon";

grant delete on table "public"."employee_documents" to "authenticated";

grant insert on table "public"."employee_documents" to "authenticated";

grant references on table "public"."employee_documents" to "authenticated";

grant select on table "public"."employee_documents" to "authenticated";

grant trigger on table "public"."employee_documents" to "authenticated";

grant truncate on table "public"."employee_documents" to "authenticated";

grant update on table "public"."employee_documents" to "authenticated";

grant delete on table "public"."employee_documents" to "service_role";

grant insert on table "public"."employee_documents" to "service_role";

grant references on table "public"."employee_documents" to "service_role";

grant select on table "public"."employee_documents" to "service_role";

grant trigger on table "public"."employee_documents" to "service_role";

grant truncate on table "public"."employee_documents" to "service_role";

grant update on table "public"."employee_documents" to "service_role";

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


