


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."bank_name" AS ENUM (
    'AlBaraka Bank (Pakistan) Limited',
    'Allied Bank Limited',
    'Askari Bank Limited',
    'Bank AL Habib Limited',
    'Bank Alfalah Limited',
    'The Bank of Khyber',
    'The Bank of Punjab',
    'BankIslami Pakistan Limited',
    'Citibank N.A.',
    'Deutsche Bank AG',
    'Dubai Islamic Bank Pakistan Limited',
    'Faysal Bank Limited',
    'First Women Bank Limited',
    'Habib Bank Limited',
    'Habib Metropolitan Bank Limited',
    'Industrial and Commercial Bank of China Limited',
    'Industrial Development Bank of Pakistan',
    'JS Bank Limited',
    'Meezan Bank Limited',
    'MCB Bank Limited',
    'MCB Islamic Bank',
    'National Bank of Pakistan',
    'Punjab Provincial Cooperative Bank Ltd.',
    'Samba Bank Limited',
    'Sindh Bank Limited',
    'Easypaisa Bank Limited',
    'SME Bank Limited',
    'Soneri Bank Limited',
    'Standard Chartered Bank (Pakistan) Ltd',
    'Bank Makramah Limited',
    'The Bank of Tokyo-Mitsubishi UFJ Ltd.',
    'United Bank Limited',
    'Zarai Taraqiati Bank Ltd.'
);


ALTER TYPE "public"."bank_name" OWNER TO "postgres";


CREATE TYPE "public"."contract_type" AS ENUM (
    'full_time',
    'part_time',
    'project_based'
);


ALTER TYPE "public"."contract_type" OWNER TO "postgres";


CREATE TYPE "public"."designations" AS ENUM (
    'full_stack_developer',
    'qa_engineer',
    'hr_manager',
    'devops_engineer',
    'technical_recruiter',
    'wordpress_developer',
    'react_native_developer',
    'frontend_developer',
    'backend_developer'
);


ALTER TYPE "public"."designations" OWNER TO "postgres";


CREATE TYPE "public"."employee_statuses" AS ENUM (
    'current',
    'terminated',
    'resigned',
    'probation'
);


ALTER TYPE "public"."employee_statuses" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" character varying NOT NULL,
    "email" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "date_of_birth" "date",
    "designations" "public"."designations" NOT NULL,
    "job_type" "public"."contract_type" DEFAULT 'full_time'::"public"."contract_type" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "employment_status" "public"."employee_statuses" DEFAULT 'probation'::"public"."employee_statuses" NOT NULL,
    "contact_number" character varying,
    "personal_email" character varying,
    "home_address" "text",
    "emergency_contact_name" character varying,
    "relation_to_emergency_contact" character varying,
    "emergency_contact_number" character varying,
    "personal_bank_name" "public"."bank_name",
    "bank_account_title" character varying,
    "iban" character varying,
    "swift_code" character varying,
    "payoneer_name" character varying,
    "payoneer_email" character varying,
    "payoneer_customer_id" "text",
    "nsave_name" character varying,
    "nsave_bank_name" character varying,
    "nsave_iban" character varying,
    "nsave_swift_code" character varying,
    "nsave_bank_address" character varying,
    "nsave_recipient_address" character varying,
    "updated_at" timestamp with time zone,
    "deletec_at" timestamp without time zone
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


