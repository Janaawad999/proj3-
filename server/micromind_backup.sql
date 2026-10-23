--
-- PostgreSQL database dump
--

\restrict PLubLYVLVoRw6lMhOJFGblY3KNH5Wog6iacfxrDTdFCobKc7kkzRV9tntCOUa41

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentType" AS ENUM (
    'PDF',
    'IMAGE',
    'VIDEO',
    'AUDIO',
    'SPREADSHEET',
    'DOCUMENT',
    'OTHER'
);


--
-- Name: GoalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GoalStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'PAUSED'
);


--
-- Name: OrgRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrgRole" AS ENUM (
    'OWNER',
    'ADMIN',
    'MEMBER',
    'VIEWER'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'E_WALLET'
);


--
-- Name: SubscriptionPlan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionPlan" AS ENUM (
    'FREE',
    'STARTER',
    'PRO',
    'ENTERPRISE'
);


--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'TRIALING'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'USER',
    'VIEWER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    "categoryId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "alertThreshold" double precision DEFAULT 0.8 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    icon text,
    color text,
    type public."TransactionType" DEFAULT 'EXPENSE'::public."TransactionType" NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "monthlyBudget" numeric(12,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: chat_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_history (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text,
    "agentType" text NOT NULL,
    message text NOT NULL,
    response text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboards (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    description text,
    "sqlQuery" text,
    "chartConfig" jsonb,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    title text NOT NULL,
    description text,
    "fileType" public."DocumentType" NOT NULL,
    "s3Path" text NOT NULL,
    size integer,
    "uploadedBy" text,
    tags text[] DEFAULT ARRAY[]::text[],
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: financial_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_goals (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    "targetAmount" numeric(12,2) NOT NULL,
    "currentAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "targetDate" timestamp(3) without time zone NOT NULL,
    category text,
    status public."GoalStatus" DEFAULT 'ACTIVE'::public."GoalStatus" NOT NULL,
    icon text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invitations (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    email text NOT NULL,
    role public."OrgRole" DEFAULT 'MEMBER'::public."OrgRole" NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "invitedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_members (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    role public."OrgRole" DEFAULT 'MEMBER'::public."OrgRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    settings jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    description text,
    content jsonb,
    format text DEFAULT 'PDF'::text NOT NULL,
    "s3Path" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    plan public."SubscriptionPlan" DEFAULT 'FREE'::public."SubscriptionPlan" NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "stripeCustomerId" text,
    "stripeSubscriptionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    "organizationId" text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    type public."TransactionType" DEFAULT 'EXPENSE'::public."TransactionType" NOT NULL,
    "categoryId" text NOT NULL,
    merchant text,
    date timestamp(3) without time zone NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CARD'::public."PaymentMethod" NOT NULL,
    description text,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringPeriod" text,
    "receiptUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "displayName" text NOT NULL,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "currentOrganizationId" text,
    currency text DEFAULT 'EGP'::text NOT NULL,
    "safetyReserve" numeric(12,2),
    "monthlyIncomeTarget" numeric(12,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2efd4f1c-ce9a-409d-bf7b-d5d7f93b7adb	e9f7d2d7f6b9596fd3d725cc7500e99052d23bedc5b251095946457366670244	2026-08-30 00:53:19.416095+03	20260829215319_init_financial_detective	\N	\N	2026-08-30 00:53:19.065613+03	1
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budgets (id, "organizationId", "userId", "categoryId", amount, month, year, "alertThreshold", "createdAt", "updatedAt") FROM stdin;
a68f2345-5d46-469c-a46d-ef599f11fe2e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	a50ccff2-951d-4503-8883-bdfef3f7db9d	8000.00	8	2026	0.8	2026-08-29 21:54:12.682	2026-08-29 21:54:12.682
3f91104d-31b2-4eb5-bfce-fd9ad76ca420	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	2500.00	8	2026	0.8	2026-08-29 21:54:12.686	2026-08-29 21:54:12.686
59c2f62d-38c2-421a-bcf9-d41d80b79570	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2128b155-5bf0-486e-a322-7f83d09ec5f9	2500.00	8	2026	0.8	2026-08-29 21:54:12.689	2026-08-29 21:54:12.689
77b679ad-25fe-40b4-ae00-651b346c5707	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	4000.00	8	2026	0.8	2026-08-29 21:54:12.692	2026-08-29 21:54:12.692
007574ad-b17a-4502-b249-7c267ece5ed7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	7f6ea402-d298-489a-a37f-b249ede6d968	2500.00	8	2026	0.8	2026-08-29 21:54:12.695	2026-08-29 21:54:12.695
dfe14058-3de5-4c37-8e46-307480c0f2b4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	98f00321-f176-45f1-851d-a422e32ade37	1500.00	8	2026	0.8	2026-08-29 21:54:12.698	2026-08-29 21:54:12.698
326b0042-ea2e-45a1-a035-111a94537799	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	600.00	8	2026	0.8	2026-08-29 21:54:12.701	2026-08-29 21:54:12.701
982f9fa6-30c4-45a2-8150-b6a2a0f3cba8	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	ee6e254c-a319-4f17-8300-6fb62e036896	5000.00	8	2026	0.8	2026-08-30 20:46:43.681	2026-08-30 20:46:43.681
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, "organizationId", name, icon, color, type, "isDefault", "monthlyBudget", "createdAt") FROM stdin;
885474a3-dfed-46a1-b5e1-3e793a7a0df6	a47a1170-b3e9-4245-aaeb-9a571619e44d	Salary	Briefcase	#10B981	INCOME	t	\N	2026-08-29 21:54:12.351
60bc2573-7be7-4b2a-8018-0b2d073bc929	a47a1170-b3e9-4245-aaeb-9a571619e44d	Freelance & Consulting	Laptop	#3B82F6	INCOME	t	\N	2026-08-29 21:54:12.356
ff16a4df-d3e8-4094-9a3b-03c98247a732	a47a1170-b3e9-4245-aaeb-9a571619e44d	Investments	TrendingUp	#8B5CF6	INCOME	t	\N	2026-08-29 21:54:12.36
3bbcbfde-7708-4121-a78f-cbf3f4a9b9b4	a47a1170-b3e9-4245-aaeb-9a571619e44d	Other Income	PlusCircle	#6B7280	INCOME	t	\N	2026-08-29 21:54:12.364
91ce08b1-6e28-42fc-bd01-dd09e173a029	a47a1170-b3e9-4245-aaeb-9a571619e44d	Housing & Rent	Home	#E0AA3E	EXPENSE	t	\N	2026-08-29 21:54:12.367
a50ccff2-951d-4503-8883-bdfef3f7db9d	a47a1170-b3e9-4245-aaeb-9a571619e44d	Food & Groceries	ShoppingCart	#10B981	EXPENSE	t	\N	2026-08-29 21:54:12.372
1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	a47a1170-b3e9-4245-aaeb-9a571619e44d	Food Delivery	UtensilsCrossed	#F59E0B	EXPENSE	t	\N	2026-08-29 21:54:12.376
2128b155-5bf0-486e-a322-7f83d09ec5f9	a47a1170-b3e9-4245-aaeb-9a571619e44d	Transportation	Car	#3B82F6	EXPENSE	t	\N	2026-08-29 21:54:12.379
7f6ea402-d298-489a-a37f-b249ede6d968	a47a1170-b3e9-4245-aaeb-9a571619e44d	Bills & Utilities	Zap	#EC4899	EXPENSE	t	\N	2026-08-29 21:54:12.422
7a6ddae9-936b-4d69-8c24-781f3f69bfc5	a47a1170-b3e9-4245-aaeb-9a571619e44d	Shopping & Apparel	ShoppingBag	#8B5CF6	EXPENSE	t	\N	2026-08-29 21:54:12.425
98f00321-f176-45f1-851d-a422e32ade37	a47a1170-b3e9-4245-aaeb-9a571619e44d	Entertainment & Leisure	Film	#6366F1	EXPENSE	t	\N	2026-08-29 21:54:12.429
742b9360-19c5-4fb0-86b9-7e6dc8c9964e	a47a1170-b3e9-4245-aaeb-9a571619e44d	Subscriptions & Services	Repeat	#14B8A6	EXPENSE	t	\N	2026-08-29 21:54:12.433
45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	a47a1170-b3e9-4245-aaeb-9a571619e44d	Healthcare & Fitness	HeartPulse	#EF4444	EXPENSE	t	\N	2026-08-29 21:54:12.437
227c7873-b500-43e0-8b3d-b1da78e11c13	a47a1170-b3e9-4245-aaeb-9a571619e44d	Education	GraduationCap	#06B6D4	EXPENSE	t	\N	2026-08-29 21:54:12.44
0dcd14c3-0f96-4103-b9b4-07194e0d9b10	a47a1170-b3e9-4245-aaeb-9a571619e44d	Other Expenses	MoreHorizontal	#9CA3AF	EXPENSE	t	\N	2026-08-29 21:54:12.444
7a217da8-5c90-4a9b-a843-7d120c14da3e	ee759112-cc83-4a55-9407-e51d98af4593	Food	Utensils	#FF6B6B	EXPENSE	t	\N	2026-08-30 20:43:10.438
d05f173d-c1b5-44d3-8ad9-dd2452f2a5c3	ee759112-cc83-4a55-9407-e51d98af4593	Transportation	Car	#4D96FF	EXPENSE	t	\N	2026-08-30 20:43:10.5
fa78289a-626c-4dc8-905b-aa1984621d1b	ee759112-cc83-4a55-9407-e51d98af4593	Shopping	ShoppingBag	#9B59B6	EXPENSE	t	\N	2026-08-30 20:43:10.505
9f28ba77-defb-4ac6-a95b-c25f814af872	ee759112-cc83-4a55-9407-e51d98af4593	Bills	Receipt	#F39C12	EXPENSE	t	\N	2026-08-30 20:43:10.51
ee6e254c-a319-4f17-8300-6fb62e036896	ee759112-cc83-4a55-9407-e51d98af4593	Entertainment	Film	#E91E63	EXPENSE	t	\N	2026-08-30 20:43:10.515
603463f2-0ad8-495a-99bd-b22268fea83b	ee759112-cc83-4a55-9407-e51d98af4593	Housing	Home	#2ECC71	EXPENSE	t	\N	2026-08-30 20:43:10.52
55ddfd6b-2b34-4c4a-b130-de2ab34051f4	ee759112-cc83-4a55-9407-e51d98af4593	Healthcare	HeartPulse	#00A8A8	EXPENSE	t	\N	2026-08-30 20:43:10.524
9bd30618-e9ea-4281-be13-2955f1230a25	ee759112-cc83-4a55-9407-e51d98af4593	Education	GraduationCap	#34495E	EXPENSE	t	\N	2026-08-30 20:43:10.528
9265ca72-6a76-48ea-bbd1-42c7c7ad3ac9	ee759112-cc83-4a55-9407-e51d98af4593	Salary	Wallet	#27AE60	INCOME	t	\N	2026-08-30 20:43:10.533
4ef2e75d-ae88-49e5-83e9-0eac5523dbeb	ee759112-cc83-4a55-9407-e51d98af4593	Other	Tag	#95A5A6	EXPENSE	t	\N	2026-08-30 20:43:10.537
\.


--
-- Data for Name: chat_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_history (id, "organizationId", "userId", "agentType", message, response, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dashboards (id, "organizationId", "userId", title, description, "sqlQuery", "chartConfig", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, "organizationId", title, description, "fileType", "s3Path", size, "uploadedBy", tags, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: financial_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_goals (id, "organizationId", "userId", title, "targetAmount", "currentAmount", "targetDate", category, status, icon, "createdAt", "updatedAt") FROM stdin;
0e94b250-6762-4a0e-bb92-daeeb54cba43	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	Emergency Safety Reserve	30000.00	18500.00	2027-02-01 00:00:00	Safety	ACTIVE	ShieldCheck	2026-08-29 21:54:12.704	2026-08-29 21:54:12.704
f471b7e6-f990-427d-b80e-6bc854f2aeea	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	New M3 MacBook Pro Fund	45000.00	14000.00	2027-04-01 00:00:00	Tech & Career	ACTIVE	Laptop	2026-08-29 21:54:12.709	2026-08-29 21:54:12.709
f76f7220-e394-4f01-b5e4-e4238cc23f99	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	Red Sea Holiday Vacation	18000.00	12500.00	2026-11-15 00:00:00	Travel	ACTIVE	Palmtree	2026-08-29 21:54:12.713	2026-08-29 21:54:12.713
57522eae-53eb-4b4b-9826-535164bb2dff	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	get new phone	70000.00	0.00	2027-03-02 00:00:00	\N	ACTIVE	Target	2026-08-30 20:46:13.734	2026-08-30 20:46:13.734
\.


--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invitations (id, "organizationId", email, role, token, "expiresAt", "acceptedAt", "invitedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_members (id, "organizationId", "userId", role, "createdAt") FROM stdin;
54c8b6f7-0eba-47aa-aa21-dd14ffb62016	a47a1170-b3e9-4245-aaeb-9a571619e44d	6f1586c7-3b34-49bd-9ba0-e124b4d378f4	OWNER	2026-08-29 21:54:12.222
eafb0749-2fb0-4fab-aab7-c8c722deebb8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	MEMBER	2026-08-29 21:54:12.23
da6b852b-c55f-4d6f-997c-626c2b1698ad	ca4ae73c-51f0-49e5-8a31-706b5dcd137f	9c1562a3-a349-484a-a5fc-ffe099b68920	OWNER	2026-08-29 21:54:12.233
96d143b6-b173-4984-8a47-7063c26d9a3e	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	MEMBER	2026-08-30 20:28:17.315
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, slug, logo, settings, "createdAt", "updatedAt") FROM stdin;
a47a1170-b3e9-4245-aaeb-9a571619e44d	Acme Personal Finance	acme-corp	\N	{"currency": "EGP", "timezone": "Africa/Cairo"}	2026-08-29 21:54:11.888	2026-08-29 21:54:11.888
ca4ae73c-51f0-49e5-8a31-706b5dcd137f	MicroMind Labs	micromind-labs	\N	{"currency": "USD", "timezone": "UTC"}	2026-08-29 21:54:11.94	2026-08-29 21:54:11.94
ee759112-cc83-4a55-9407-e51d98af4593	jana khaled Finance 	jana-khaled-finance	\N	null	2026-08-30 20:16:09.667	2026-08-30 20:15:02.709
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (id, "organizationId", "userId", title, description, content, format, "s3Path", "createdAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "organizationId", plan, status, "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "stripeCustomerId", "stripeSubscriptionId", "createdAt", "updatedAt") FROM stdin;
9e8b03f8-b5db-4869-b0d8-f359dc3ea5df	a47a1170-b3e9-4245-aaeb-9a571619e44d	PRO	ACTIVE	2026-08-29 21:54:12.237	2026-09-29 21:54:12.237	f	\N	\N	2026-08-29 21:54:12.241	2026-08-29 21:54:12.241
7eb35243-dcb3-41d4-bd6c-6de96a49d175	ca4ae73c-51f0-49e5-8a31-706b5dcd137f	FREE	ACTIVE	2026-08-29 21:54:12.237	2026-09-29 21:54:12.237	f	\N	\N	2026-08-29 21:54:12.288	2026-08-29 21:54:12.288
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, "organizationId", "userId", amount, type, "categoryId", merchant, date, "paymentMethod", description, "isRecurring", "recurringPeriod", "receiptUrl", "createdAt", "updatedAt") FROM stdin;
75180e71-6969-4a35-bed9-a22445e2e365	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-03-01 10:00:00	BANK_TRANSFER	Monthly Salary - March 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
231c82fd-c402-4372-a3c4-31a33f94ee43	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-03-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
e19edf9c-cb44-47ef-bd98-1b2a267fec3b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1150.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-03-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
cc520349-1971-47a3-a2b0-f12dd94a2777	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-03-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
9f4b5095-f3e6-477c-a1c3-90d73bc9e413	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-03-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7f2dc308-c518-4a9e-824d-4fe75baf9cd3	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-03-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
02883062-582d-4ee9-a9c7-a7f08bcb0340	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-03-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a061ad0e-dc77-43c6-abc0-7475af6f9ba0	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-03-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
fde4c44f-6210-4fbf-bff0-e29742bc9d6f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1650.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-03-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f959919b-26bb-4c33-b2e7-5a13543943c5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1770.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-03-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
37c2ccfe-a5a1-4763-9f2c-15089fb6dc6a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1890.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-03-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
fc893413-ab8a-488d-b1ec-40b8a1ec2f43	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2010.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-03-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6dde5612-d7c1-4f97-8b45-a1cb1960d3b3	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-03-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f34b2a95-8b9c-4a0a-918b-6abbbe1977a7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-03-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a50ec7e1-55a2-4c95-9963-7d3ce3c3d867	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-03-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
65e79479-03af-401d-a62f-54358c4ce23d	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-03-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
9b9b9f29-5670-496d-b327-995bbfac81d3	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-03-02 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
744cec71-ab63-4567-8aac-6513b20e9ba5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-03-05 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
afa3baef-4b3b-4a39-abed-d43f7e86a6ba	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-03-08 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
75017a48-53ef-499e-81c8-fd4111eafcb8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-03-11 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a52a6005-4558-4fb4-be39-b0305de2c470	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-03-15 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
700b4659-42d5-4f59-a273-bcfb924911e5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-03-18 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
43c48ad2-9ed6-45fd-b1b6-f200ed0682ad	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-03-21 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
58d999ab-eb8b-4e04-9b45-67d7513f2ea7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-03-24 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a6404486-1ab5-4e58-9777-5bd795baee61	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1850.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-03-16 14:00:00	CARD	General online shopping	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
059fc7d4-ed4a-4b0d-b98e-d37c1cda38fa	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	850.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-03-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
54b88bc9-6bd8-4d4e-92f5-a2a0a73ef310	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-04-01 10:00:00	BANK_TRANSFER	Monthly Salary - April 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5c91c30e-3043-4f6a-895b-1b37fd3fb878	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	4500.00	INCOME	60bc2573-7be7-4b2a-8018-0b2d073bc929	Fintech Advisory Client	2026-04-14 15:30:00	BANK_TRANSFER	UI/UX Consulting Project Phase 1	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f9ae10ed-905e-4c23-aadf-e6254347eb1b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-04-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6b9eb116-e3fa-4aac-80b2-091dd916d35b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1190.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-04-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
4cba042f-a4bb-47a6-b7e6-b02569f298d1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-04-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
bf09d2b3-c1f7-486c-9036-8e6bab6df8c9	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-04-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
9a5053b3-c703-4793-b0f0-044d4da0e89d	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-04-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5e03386d-1bed-4bc8-ac59-890e5d102ffb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-04-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
417b7d38-641c-432b-a287-824ddd271a7c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-04-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
22bbb25e-75f0-463a-abbc-fbdfbde8e73b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1700.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-04-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
088cae2b-4c63-4e5d-a86e-507b871f3b3a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1820.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-04-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
aa0f6e1b-a97d-45a8-be86-5d8a4bcfb470	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1940.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-04-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
bda01d0b-f5c6-4ad7-a6ea-11bae33e76f8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2060.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-04-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
13d5d865-bfd9-4b15-a43f-407f63791acf	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-04-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6f2bf4c4-ae72-4e1d-b2c8-12dc1b4f0749	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-04-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
0fc159ae-882d-4c34-9d79-b32ca6561266	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-04-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7cdc0bce-c18a-4f44-84f5-03236ff32ef5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-04-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6d86b6fb-0299-4422-8a7b-18562e7fb440	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-04-02 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6193d525-9855-4ec8-99b9-ccc60d16b89c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-04-05 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
faff98ec-54ab-4313-9463-3b2f55bca793	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-04-08 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5754fefa-9c9a-4146-bffb-4bbe88c9a2cc	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-04-11 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c050fb82-55d9-4f8e-bff8-476e825abf31	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-04-15 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d5947290-dd9b-4751-bb16-796956302b24	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-04-18 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
097a52f9-e2be-4307-87e4-da782ec844ea	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-04-21 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
9ad45d0a-667f-40bc-8c47-e5220ffb68dd	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-04-24 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
510cfd67-81e3-499c-ad34-41e473efcb2b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1930.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-04-16 14:00:00	CARD	General online shopping	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a840a043-7d22-4d5c-92c6-4707e59f7d5a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	900.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-04-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c17732f3-df74-4f72-aa18-08484c28ab3f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-05-01 10:00:00	BANK_TRANSFER	Monthly Salary - May 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f230df76-4975-4cc8-a8ab-e048d63cd343	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-05-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
b11ab67c-ce1f-41cd-ad4a-c4289eeecec4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1230.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-05-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
920f3bd2-d67c-492d-8e03-d22ba7807472	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-05-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5a443d10-31b3-44f4-aad0-8022bdc3359b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-05-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a93271f6-9cf3-4378-af51-79248c8f7f2b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-05-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d626f45e-0c54-483b-ae10-4f3195577fae	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-05-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c1cd61af-972c-4ebb-b78c-641ed0f799d1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-05-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d760f1b0-08ec-479c-8312-973fa3a1221d	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1750.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-05-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
0281606b-9fd6-41fb-b22e-47384a6fdc5c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1870.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-05-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
29f524d3-2553-4cfc-b265-6a74e6829411	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1990.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-05-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
8093a867-f091-40c9-9995-20abf92dc222	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2110.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-05-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
bfec5f71-5525-49c3-aa58-67eef5c924c4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-05-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
48375ad2-c453-4e38-aa5a-fddd4fd82d7a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-05-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
685ee352-d95f-4c52-a21f-de51b25d1587	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-05-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
bc0936f4-51b1-4921-b020-63ba434e9a2a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-05-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c7a712bc-b03b-4a77-b4f3-6dd0a2b829f7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-05-02 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
3d375bb4-b2d0-4bf4-ac75-7bff309e0530	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-05-05 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
67a8e818-6fbb-4b58-9560-e40ab7b30600	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-05-08 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
63fa791e-fe11-4e28-bd04-e07aeb0fa303	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-05-11 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
be0dd3b0-c465-4628-aa6d-57767182a0d0	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-05-15 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
23922794-ad85-442e-a74d-65b7b54b0d56	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-05-18 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5cc5aa84-6bff-4586-8060-a2c1c8de54b1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-05-21 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
40620ef1-a397-4638-b1c3-635e2fdf38b9	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-05-24 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
56dcb56c-65f8-4d4f-91e0-5181626afd09	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2010.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-05-16 14:00:00	CARD	General online shopping	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
bea4ec1b-977d-4a7b-8cdf-2728fd0bc24c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	950.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-05-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
3282bcca-f324-48a6-9302-cf3cb3a37527	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-06-01 10:00:00	BANK_TRANSFER	Monthly Salary - June 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
dd04730e-4825-4037-a9e8-f58e02bdb7e1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	6000.00	INCOME	60bc2573-7be7-4b2a-8018-0b2d073bc929	Global Tech Corp	2026-06-18 12:00:00	BANK_TRANSFER	API Integration Project	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
22535906-032c-4c3d-8aa2-a02bcf627be7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-06-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
e7bdbf58-a463-4b2b-a311-a0791763bcf4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1270.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-06-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1dca0b39-cd01-4514-be90-742b2c1f0a5e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-06-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7c08354d-5715-403e-b088-46ccb873cacb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-06-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
48468578-7534-4ab8-ac0e-887b09ca82ad	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-06-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
22f09340-f6f3-4ad6-b561-0b6726277ac7	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-06-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
2c7236b7-89ad-4cf2-9d20-a9b4b45af773	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-06-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
752fdfcf-4d06-4542-9566-3cae1a536bda	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1800.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-06-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
39876687-0b35-4201-916e-26d8a63f1af9	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1920.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-06-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5274c84d-259a-49dc-b146-7eaa527fb1ee	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2040.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-06-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1e60c02b-6e39-478d-8395-9116f7338a95	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2160.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-06-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
889ba76a-ce9f-4ef7-af1c-11c391cad610	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-06-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5150b294-2244-41ca-8b68-0a789ea512bb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-06-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
09340ca2-9fc1-4e33-99c3-a5453c2c0fa6	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-06-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a3195f8b-a124-4e4a-ab8d-83e508c94f2b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-06-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
ad923464-6e21-4d40-8d77-a67432c522bb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-06-02 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
26b3367a-b130-45fa-bbd0-5a35830743e8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-06-05 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1a1da79d-4196-4f2f-a5c9-b8c8a65aea38	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-06-08 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
82a19c8b-4654-4ce3-a1d7-1e79717a902e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-06-11 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
21d8f7fa-0dc4-41a7-b93b-f6772d6d13c1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-06-15 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
108eb027-f66a-437b-b9d6-6ebb1e112e91	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	290.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-06-18 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
b65d1ab6-a1b8-46ae-adec-e7a14e92c63a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	220.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-06-21 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c251a7c3-5a4d-4591-9633-3b6b52663f6f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	255.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-06-24 20:15:00	CARD	Weekend delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
8de335c4-79cc-4d95-92ab-2ea67783c527	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2090.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-06-16 14:00:00	CARD	General online shopping	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
19056bd1-318f-41b3-b902-636bd8666363	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1000.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-06-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
31185374-046f-4808-b92f-1042a4111cbb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-07-01 10:00:00	BANK_TRANSFER	Monthly Salary - July 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
677fe5f8-0917-487b-bc20-ac587fef033a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	3500.00	INCOME	60bc2573-7be7-4b2a-8018-0b2d073bc929	Local Retailer	2026-07-22 11:00:00	BANK_TRANSFER	E-commerce Consultation	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
dc85eaf7-0118-42eb-a92f-c82d58aa0a68	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-07-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5d369870-ae85-4865-a22f-1b7799a54c02	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1310.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-07-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
67c3bc76-64e7-4634-84a1-dd440666ed74	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-07-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
5da55632-ec07-4477-9d08-b06534d838a4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-07-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
aead8c14-8135-4cf3-b489-3c03a264db85	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-07-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
558746f6-65f3-4410-869c-1e8b6b9cd9c6	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-07-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7320f407-3248-444b-86a1-e25b1440285c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-07-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
4a24adfa-67dd-4dba-a081-97f19cdc163f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1850.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-07-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
379098be-cce8-46fa-90c5-a691c5890d35	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1970.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-07-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d9d88e6c-9252-463f-a0b5-32168cc36ecc	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2090.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-07-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7d197450-f5e1-4ab8-813f-a321d96c8cc5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2210.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-07-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
4fa347e4-c80f-4b4d-8089-4dc928d08fec	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-07-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
dd6af810-15ac-47d4-b1ab-9cc1e8a8a13f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-07-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d9907c79-f46c-4549-b6aa-6304d4312713	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-07-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6f3a3c1e-85b9-44df-be6c-1c32e3b847f2	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-07-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
98f66704-a96c-4582-a97a-8ab9bbc2a1a1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-07-02 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
70527f0e-9b14-40d4-bf1f-0d1ed4e1b6b8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-07-03 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
8e815a7a-e064-4cfd-9cfa-8c75046b902d	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-07-05 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
cc1bc0e9-fb08-42da-9d03-1bf971aa3825	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-07-06 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a985dc51-6449-4eb3-9ebb-4aba069473ee	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-07-08 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
a2dac70e-8c96-4f3d-9585-6c9e87bef151	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-07-09 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
7c9f4383-3c2b-4280-854e-9d7d579d5b0e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-07-11 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f75fdf81-86b2-4cd1-b601-06a5b6825ed4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-07-12 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
ebe534c4-87a6-40f4-8385-df58a5eac16d	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-07-14 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c84a8b8c-7edd-4f92-bbdd-e42bfe928425	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-07-15 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
eafed618-9e65-4a7b-9bd7-30b0565984cf	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-07-17 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
ab7883c3-afa5-4670-ad22-7e5fca72e0fb	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-07-18 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
e5de5b62-95d2-4f32-b303-700d246629d9	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-07-20 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
948ce296-b801-4cdd-990a-2b986712fcfc	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-07-21 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f3f50c21-5f75-4daa-94fd-bc7474f6ead6	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-07-23 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
107390f6-f8d9-4af8-a9ef-8441dea0644b	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-07-24 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
385fb1fa-2001-407b-a4ae-7ba8665a658f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-07-26 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
f2f33262-e19f-421d-a1de-d0e12e0eeeee	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2170.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-07-16 14:00:00	CARD	General online shopping	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
20570f41-6dc7-468b-aed2-5ef5070386ac	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1050.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-07-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
2638c553-88d7-4810-b8cc-931463ff25a6	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	28000.00	INCOME	885474a3-dfed-46a1-b5e1-3e793a7a0df6	Tech Innovations LLC	2026-08-01 10:00:00	BANK_TRANSFER	Monthly Salary - August 2026	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
70ca093b-57b8-4c42-ac58-40da7a609f78	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	8500.00	EXPENSE	91ce08b1-6e28-42fc-bd01-dd09e173a029	Property Management Co.	2026-08-02 11:00:00	BANK_TRANSFER	Apartment Monthly Rent (Zamalek)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
e2fb6045-ea2c-48c8-8c35-96839f2a7f50	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1350.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Electricity & Utility Authority (Fawry)	2026-08-05 09:30:00	E_WALLET	Monthly electricity and utility bills	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
41f036c9-8ec0-4f8f-b81e-1a9d058c7eb4	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	650.00	EXPENSE	7f6ea402-d298-489a-a37f-b249ede6d968	Telecom Egypt (WE Internet)	2026-08-06 10:15:00	CARD	VDSL Ultra 200Mbps Home Internet	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
0657ea9f-854a-46b0-9a1d-7dfd5b149d08	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	250.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Netflix Egypt	2026-08-08 14:00:00	CARD	Standard 4K Plan Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
3cfde3b9-84a9-4977-a390-f26d25463fda	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	90.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Spotify Premium	2026-08-10 08:00:00	CARD	Music Streaming Subscription	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
454d0116-5981-4591-99fe-585201e7ff44	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	80.00	EXPENSE	742b9360-19c5-4fb0-86b9-7e6dc8c9964e	Anghami Plus	2026-08-12 10:00:00	CARD	Arabic Music Subscription (Duplicated music service)	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
88810af2-4346-47da-a2f4-a89e7aaf8ff6	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1200.00	EXPENSE	45e0c4e7-9cb1-4eea-8677-77eee4f0a7f1	Gold's Gym Elite	2026-08-03 10:00:00	CARD	Monthly Club Gym Access	t	MONTHLY	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
fbb2b95b-eaf5-4e3c-9f14-fa492f63ae0e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1900.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Carrefour Hypermarket	2026-08-04 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
53b0e3f8-82c5-4ada-8841-dab49e801200	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2020.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Metro Market	2026-08-11 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
73d92b0b-46f7-401f-929d-8f04f82762e8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2140.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Seoudi Supermarket	2026-08-18 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
636c1981-b7b9-49a9-b76e-95b54277e7f5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2260.00	EXPENSE	a50ccff2-951d-4503-8883-bdfef3f7db9d	Spinneys Egypt	2026-08-25 18:30:00	CARD	Weekly household groceries and essentials	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
211ad8db-78e0-434d-a5a7-f0a6339e61dc	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	380.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-08-07 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1dc60f7e-a606-41e2-baf2-a77c9f0dc7df	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	425.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-08-15 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
ae664f6a-5b01-49c1-ba0b-eeafefb0b083	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	470.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	TotalEnergies Station	2026-08-21 08:45:00	CASH	Vehicle Fuel Refill	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c08748d5-633d-4b3e-8bab-bb2fca4aa229	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	515.00	EXPENSE	2128b155-5bf0-486e-a322-7f83d09ec5f9	Uber Egypt	2026-08-28 08:45:00	CARD	Commute to Client Office	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
62a62479-0d68-4ccb-a121-8ac1790a5f48	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-08-02 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
72a10e2e-93a5-491f-a5b4-88a9b4a37c1f	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-08-03 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6a34c54f-4798-4a1d-82cc-bf17b7f69aa8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-08-05 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1487f8e3-638c-4d77-91c9-4e54593bcf8c	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-08-06 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
656290b1-99e8-4821-b606-fed3b49f2fdf	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-08-08 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
ab4728d6-c9cf-47d8-aea3-9af5ba8332b8	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-08-09 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
b0e8838a-0769-4ac7-9cb8-db8393810431	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-08-11 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
d8d00330-127d-499a-8a67-bcae0cc02f99	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-08-12 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
53261a30-0cc5-4faf-9c6e-3c1ffbd78f29	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-08-14 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
6e27b1b4-85a8-42bb-854f-67e5c49df48a	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-08-15 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
8151628c-68ef-4aae-af27-418c260baeca	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-08-17 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
e3c1d077-103c-4775-93b1-84615d7cdea5	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-08-18 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
9ba86205-b6b8-41ea-bc53-fbbde86f8fcc	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	McDonalds Egypt	2026-08-20 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
57cf9b1c-3f89-4b02-a305-d92af6d4e8ef	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	TBS Bakery	2026-08-21 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
0f57cb4a-52f0-484d-8201-1e23fdbc7383	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	365.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	KFC Egypt	2026-08-23 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
b5dbd4d1-926d-4032-81e7-1d4a039a6295	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	295.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	Talabat Egypt	2026-08-24 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
c564bb0c-3b3f-401c-b010-bde98a63a392	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	330.00	EXPENSE	1fa1913a-6b48-4f8f-8e63-583e80dbcf7e	elmenus Delivery	2026-08-26 20:15:00	CARD	Evening dinner delivery order	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
cc4100fe-64f0-4203-bc85-f992aa894f65	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	4200.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Tradeline Stores (Apple Reseller)	2026-08-13 16:00:00	CARD	AirPods Pro & Electronics Accessories	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
0db3c5e5-874c-4970-af79-45c7a0eceadf	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	2850.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Zara Cairo Festival City	2026-08-19 19:30:00	CARD	Seasonal wardrobe refresh	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
1786cf92-9e59-473a-9261-d2a747a02ac1	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1400.00	EXPENSE	7a6ddae9-936b-4d69-8c24-781f3f69bfc5	Amazon Egypt	2026-08-24 11:20:00	CARD	Home Office Ergonomic Stand	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
739d6af0-00a5-4c0f-87dd-fad58e164c8e	a47a1170-b3e9-4245-aaeb-9a571619e44d	2555840f-dc48-4a67-9cf7-c79228195c13	1100.00	EXPENSE	98f00321-f176-45f1-851d-a422e32ade37	Vox Cinemas & Mall of Egypt	2026-08-20 21:00:00	CARD	Movie night with friends	f	\N	\N	2026-08-29 21:54:12.645	2026-08-29 21:54:12.645
10d4d705-b1ce-4004-98bb-b337282ccd25	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	500.00	EXPENSE	7a217da8-5c90-4a9b-a843-7d120c14da3e	KFC	2026-08-30 00:00:00	CASH	\N	f	\N	\N	2026-08-30 20:43:43.723	2026-08-30 20:43:43.723
195ea1da-8778-45be-9135-6f2cca4f801d	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	15000.00	INCOME	9f28ba77-defb-4ac6-a95b-c25f814af872	\N	2026-08-30 00:00:00	BANK_TRANSFER	\N	f	\N	\N	2026-08-30 20:45:24.844	2026-08-30 20:45:24.844
84b80b54-1a3f-4126-846b-94ff5f3687ab	ee759112-cc83-4a55-9407-e51d98af4593	b1c4a355-97f4-4b1f-8fe2-f768da16344c	300.00	EXPENSE	fa78289a-626c-4dc8-905b-aa1984621d1b	noon	2026-08-30 00:00:00	BANK_TRANSFER	lipstick	f	\N	\N	2026-08-30 20:47:22.638	2026-08-30 20:47:22.638
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", "displayName", role, active, "currentOrganizationId", currency, "safetyReserve", "monthlyIncomeTarget", "createdAt", "updatedAt") FROM stdin;
6f1586c7-3b34-49bd-9ba0-e124b4d378f4	admin@acme.com	$2b$10$rXxyefBVxQ0KS/42fJh1pOoJj2PWSOuyZJwHPHrWn975QkeJm5nTG	Sherif Admin	ADMIN	t	a47a1170-b3e9-4245-aaeb-9a571619e44d	EGP	30000.00	35000.00	2026-08-29 21:54:12.039	2026-08-29 21:54:12.039
2555840f-dc48-4a67-9cf7-c79228195c13	user@acme.com	$2b$10$utbsmiQj/0sARUyLMtizrO1hnIO206CAx8OXAxuRm/Z9Pnv7iqzHW	Kareem Tarek	USER	t	a47a1170-b3e9-4245-aaeb-9a571619e44d	EGP	25000.00	28000.00	2026-08-29 21:54:12.129	2026-08-29 21:54:12.129
9c1562a3-a349-484a-a5fc-ffe099b68920	jane@micromind.com	$2b$10$kqWbfs6ByYwpM8fM5QfUfulHtmvKZI2Pt1RzWlaTEagp0Fe15l/Vi	Jane Smith	USER	t	ca4ae73c-51f0-49e5-8a31-706b5dcd137f	USD	\N	\N	2026-08-29 21:54:12.218	2026-08-29 21:54:12.218
3b00c908-97b2-4bc1-912d-2c160eb95ede	jana@test.com	$2b$10$BIcLkiyfNczdblxVz.RIrOUZe4vCUBPtld21LmNL1/pGBbqGVXuXa	Jana	MANAGER	t	\N	EGP	\N	\N	2026-08-29 23:04:21.855	2026-08-29 23:04:21.855
b1c4a355-97f4-4b1f-8fe2-f768da16344c	jana2004.awad@gmail.com	$2b$10$89Ideqp2r6oxoH9HrWE8hOnCfW5O2925mlMtMBPcWiDjomClAl6Sm	jana khaled 	MANAGER	t	ee759112-cc83-4a55-9407-e51d98af4593	EGP	\N	\N	2026-08-30 18:58:56.344	2026-08-30 20:28:17.477
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chat_history chat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT chat_history_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: financial_goals financial_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT financial_goals_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: budgets_organizationId_userId_categoryId_month_year_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "budgets_organizationId_userId_categoryId_month_year_key" ON public.budgets USING btree ("organizationId", "userId", "categoryId", month, year);


--
-- Name: budgets_organizationId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_organizationId_userId_idx" ON public.budgets USING btree ("organizationId", "userId");


--
-- Name: budgets_userId_month_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_userId_month_year_idx" ON public.budgets USING btree ("userId", month, year);


--
-- Name: categories_id_organizationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "categories_id_organizationId_key" ON public.categories USING btree (id, "organizationId");


--
-- Name: categories_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "categories_organizationId_idx" ON public.categories USING btree ("organizationId");


--
-- Name: categories_organizationId_name_type_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "categories_organizationId_name_type_key" ON public.categories USING btree ("organizationId", name, type);


--
-- Name: categories_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_type_idx ON public.categories USING btree (type);


--
-- Name: chat_history_agentType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_history_agentType_idx" ON public.chat_history USING btree ("agentType");


--
-- Name: chat_history_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_history_createdAt_idx" ON public.chat_history USING btree ("createdAt");


--
-- Name: chat_history_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_history_organizationId_idx" ON public.chat_history USING btree ("organizationId");


--
-- Name: chat_history_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_history_userId_idx" ON public.chat_history USING btree ("userId");


--
-- Name: dashboards_isPublic_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dashboards_isPublic_idx" ON public.dashboards USING btree ("isPublic");


--
-- Name: dashboards_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dashboards_organizationId_idx" ON public.dashboards USING btree ("organizationId");


--
-- Name: dashboards_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dashboards_userId_idx" ON public.dashboards USING btree ("userId");


--
-- Name: documents_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "documents_createdAt_idx" ON public.documents USING btree ("createdAt");


--
-- Name: documents_fileType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "documents_fileType_idx" ON public.documents USING btree ("fileType");


--
-- Name: documents_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "documents_organizationId_idx" ON public.documents USING btree ("organizationId");


--
-- Name: documents_uploadedBy_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "documents_uploadedBy_idx" ON public.documents USING btree ("uploadedBy");


--
-- Name: financial_goals_organizationId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "financial_goals_organizationId_userId_idx" ON public.financial_goals USING btree ("organizationId", "userId");


--
-- Name: financial_goals_userId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "financial_goals_userId_status_idx" ON public.financial_goals USING btree ("userId", status);


--
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_email_idx ON public.invitations USING btree (email);


--
-- Name: invitations_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invitations_organizationId_idx" ON public.invitations USING btree ("organizationId");


--
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invitations_token_idx ON public.invitations USING btree (token);


--
-- Name: invitations_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invitations_token_key ON public.invitations USING btree (token);


--
-- Name: organization_members_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "organization_members_organizationId_idx" ON public.organization_members USING btree ("organizationId");


--
-- Name: organization_members_organizationId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON public.organization_members USING btree ("organizationId", "userId");


--
-- Name: organization_members_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "organization_members_userId_idx" ON public.organization_members USING btree ("userId");


--
-- Name: organizations_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizations_slug_idx ON public.organizations USING btree (slug);


--
-- Name: organizations_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug);


--
-- Name: reports_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_createdAt_idx" ON public.reports USING btree ("createdAt");


--
-- Name: reports_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_organizationId_idx" ON public.reports USING btree ("organizationId");


--
-- Name: reports_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reports_userId_idx" ON public.reports USING btree ("userId");


--
-- Name: sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_expiresAt_idx" ON public.sessions USING btree ("expiresAt");


--
-- Name: sessions_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_token_idx ON public.sessions USING btree (token);


--
-- Name: sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_token_key ON public.sessions USING btree (token);


--
-- Name: sessions_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "sessions_userId_idx" ON public.sessions USING btree ("userId");


--
-- Name: subscriptions_organizationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_organizationId_key" ON public.subscriptions USING btree ("organizationId");


--
-- Name: subscriptions_plan_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_plan_idx ON public.subscriptions USING btree (plan);


--
-- Name: subscriptions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscriptions_status_idx ON public.subscriptions USING btree (status);


--
-- Name: transactions_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "transactions_categoryId_idx" ON public.transactions USING btree ("categoryId");


--
-- Name: transactions_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_date_idx ON public.transactions USING btree (date);


--
-- Name: transactions_organizationId_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "transactions_organizationId_userId_idx" ON public.transactions USING btree ("organizationId", "userId");


--
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- Name: transactions_userId_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "transactions_userId_date_idx" ON public.transactions USING btree ("userId", date);


--
-- Name: users_currentOrganizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_currentOrganizationId_idx" ON public.users USING btree ("currentOrganizationId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: budgets budgets_categoryId_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_categoryId_organizationId_fkey" FOREIGN KEY ("categoryId", "organizationId") REFERENCES public.categories(id, "organizationId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budgets budgets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_history chat_history_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_history
    ADD CONSTRAINT "chat_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboards dashboards_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT "dashboards_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboards dashboards_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT "dashboards_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: documents documents_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_goals financial_goals_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT "financial_goals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: financial_goals financial_goals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_goals
    ADD CONSTRAINT "financial_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_members organization_members_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: organization_members organization_members_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_members
    ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_categoryId_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_categoryId_organizationId_fkey" FOREIGN KEY ("categoryId", "organizationId") REFERENCES public.categories(id, "organizationId") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PLubLYVLVoRw6lMhOJFGblY3KNH5Wog6iacfxrDTdFCobKc7kkzRV9tntCOUa41

