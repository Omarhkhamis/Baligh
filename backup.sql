--
-- PostgreSQL database dump
--

\restrict fDeJEASs1ylEY9k9HrXgTGlxjq9alxLdfcUvdZoAP9jwZprcAsVZnQvQpiFUsXc

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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

--
-- Name: FeedbackStatus; Type: TYPE; Schema: public; Owner: balagh
--

CREATE TYPE public."FeedbackStatus" AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'RESOLVED',
    'REJECTED'
);


ALTER TYPE public."FeedbackStatus" OWNER TO balagh;

--
-- Name: NewsCategory; Type: TYPE; Schema: public; Owner: balagh
--

CREATE TYPE public."NewsCategory" AS ENUM (
    'PRESS_RELEASES',
    'EVENTS',
    'MEDIA',
    'ANNOUNCEMENTS',
    'OTHER',
    'TRAINING',
    'EVENT',
    'ACHIEVEMENT',
    'STATEMENT'
);


ALTER TYPE public."NewsCategory" OWNER TO balagh;

--
-- Name: ReportStudyCategory; Type: TYPE; Schema: public; Owner: balagh
--

CREATE TYPE public."ReportStudyCategory" AS ENUM (
    'MONTHLY_REPORT',
    'RESEARCH',
    'INFOGRAPHIC',
    'POLICY_BRIEF',
    'OTHER'
);


ALTER TYPE public."ReportStudyCategory" OWNER TO balagh;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: balagh
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."RiskLevel" OWNER TO balagh;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminUser; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."AdminUser" (
    id uuid NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."AdminUser" OWNER TO balagh;

--
-- Name: AnalysisLog; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."AnalysisLog" (
    id uuid NOT NULL,
    "inputText" text NOT NULL,
    classification text NOT NULL,
    "riskLevel" public."RiskLevel" NOT NULL,
    "confidenceScore" numeric(5,4) NOT NULL,
    "detectedKeywords" text[] DEFAULT ARRAY[]::text[],
    "aiScores" json,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."AnalysisLog" OWNER TO balagh;

--
-- Name: FeedbackSubmission; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."FeedbackSubmission" (
    id uuid NOT NULL,
    "analysisLogId" uuid NOT NULL,
    message text NOT NULL,
    "contactEmail" text,
    status public."FeedbackStatus" DEFAULT 'PENDING'::public."FeedbackStatus" NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."FeedbackSubmission" OWNER TO balagh;

--
-- Name: LegalReport; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."LegalReport" (
    id uuid NOT NULL,
    "analysisLogId" uuid NOT NULL,
    title text NOT NULL,
    details text NOT NULL,
    "reporterEmail" text,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."LegalReport" OWNER TO balagh;

--
-- Name: NewsArticle; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."NewsArticle" (
    id uuid NOT NULL,
    title json NOT NULL,
    body json NOT NULL,
    category public."NewsCategory" NOT NULL,
    slug text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL,
    "imageUrl" text,
    summary json NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    "videoUrl" text,
    "authorName" text,
    "authorNameEn" text
);


ALTER TABLE public."NewsArticle" OWNER TO balagh;

--
-- Name: ReportStudy; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."ReportStudy" (
    id uuid NOT NULL,
    title json NOT NULL,
    body json NOT NULL,
    category public."ReportStudyCategory" NOT NULL,
    "documentUrl" text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(6) with time zone,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL,
    "imageUrl" text,
    summary json,
    "authorName" text,
    "authorNameEn" text
);


ALTER TABLE public."ReportStudy" OWNER TO balagh;

--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: balagh
--

CREATE TABLE public."TeamMember" (
    id uuid NOT NULL,
    name json NOT NULL,
    role json NOT NULL,
    bio text,
    "imageUrl" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."TeamMember" OWNER TO balagh;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: balagh
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


ALTER TABLE public._prisma_migrations OWNER TO balagh;

--
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."AdminUser" (id, email, "passwordHash", name, "createdAt", "updatedAt") FROM stdin;
54b924a9-73b2-4a64-a98a-38a922cc7929	admin@admin.com	$2b$10$yWvV11AqSldezLHwa/KQMe0A8.kK3s7F8wf9DC6D3/hV6SPwDm8p6	Admin	2025-12-19 17:02:26.506108+01	2025-12-19 17:13:37.178+01
\.


--
-- Data for Name: AnalysisLog; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."AnalysisLog" (id, "inputText", classification, "riskLevel", "confidenceScore", "detectedKeywords", "aiScores", "createdAt", "updatedAt") FROM stdin;
9e615f43-f6fd-41d4-98f1-3aafd19d9b35	يجب ابادة اهل حنكوشيا	خطاب كراهية	HIGH	9.0000	{ابادة}	{"speech_type":"تحريض على العنف","intensity_score":9,"vulnerability_score":5,"context_score":4,"target_group":"اهل حنكوشيا","rationale":"يدعو النص بشكل صريح إلى إبادة جماعية، وهو ما يمثل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراعات ويهدد الأمن والسلم الاجتماعي.","locale":"ar","created_at":"2025-12-19T16:29:33.746Z","image_description":null,"has_image":false}	2025-12-19 16:29:33.746+01	2025-12-19 16:29:33.754+01
f402ad3a-f314-49c6-bb28-aadca8f5229d	يجب إبادة الدروز	خطاب كراهية	HIGH	9.0000	{إبادة,الدروز}	{"speech_type":"تحريض على العنف","intensity_score":9,"vulnerability_score":5,"context_score":4,"target_group":"الدروز","rationale":"يدعو النص بشكل صريح إلى إبادة جماعية ضد طائفة الدروز، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد السلم الأهلي.","locale":"ar","created_at":"2025-12-19T17:06:53.681Z","image_description":null,"has_image":false}	2025-12-19 17:06:53.681+01	2025-12-19 17:06:53.689+01
11cc7f77-4243-4b18-829a-093cece0fbc6	يجب إبادة	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"تنميط ثقافي غير ضار","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"الصورة عبارة عن عرض تقديمي لمناقشة حول منتج غذائي، ولا تحتوي على أي رموز بصرية مرتبطة بخطاب الكراهية أو التحريض على العنف.","locale":"ar","created_at":"2025-12-19T17:08:41.156Z","image_description":null,"has_image":true}	2025-12-19 17:08:41.156+01	2025-12-19 17:08:41.16+01
c0ef6986-2fef-4d81-b6fb-34aafdcb17b3	يجب إبادة السنة	خطاب كراهية	HIGH	9.0000	{إبادة,السنة}	{"speech_type":"تحريض على العنف","intensity_score":9,"vulnerability_score":5,"context_score":4,"target_group":"السنة","rationale":"يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.","locale":"ar","created_at":"2025-12-19T17:09:33.380Z","image_description":null,"has_image":false}	2025-12-19 17:09:33.38+01	2025-12-19 17:09:33.383+01
fb1a4bd9-079f-4497-b220-9ebe78d54175	Report link: https://meet.google.com/snh-ntnm-dyi	خطاب كراهية	HIGH	0.0000	{الدروز}	{"reasoning":"يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.","imageDescription":"","postLink":"https://meet.google.com/snh-ntnm-dyi","reporterCountry":"UK","targetGroup":"الدروز"}	2025-12-19 17:20:41.038+01	2025-12-19 17:20:42.039+01
d3a97a40-b892-4a61-9ce0-c2307d7fa42c	Report link: https://meet.google.com/snh-ntnm-dyi	خطاب كراهية	HIGH	0.0000	{الأرمن}	{"reasoning":"يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.","imageDescription":"","postLink":"https://meet.google.com/snh-ntnm-dyi","reporterCountry":"France","targetGroup":"الأرمن"}	2025-12-19 17:26:08.679+01	2025-12-19 17:26:09.664+01
17c37126-e769-4b52-9549-36e72cd2e89a	Report link: https://meet.google.com/test	خطاب كراهية	HIGH	0.0000	{"السريان الآشوريين"}	{"reasoning":"يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.","imageDescription":"","postLink":"https://meet.google.com/test","reporterCountry":"Syria","targetGroup":"السريان الآشوريين"}	2025-12-19 17:34:56.219+01	2025-12-19 17:34:56.558+01
24c8d373-63e1-49af-852c-25d38d62712a	الدروز كلاب	خطاب كراهية	HIGH	9.0000	{كلاب}	{"speech_type":"نزع إنسانية","intensity_score":9,"vulnerability_score":4,"context_score":4,"target_group":"الدروز","rationale":"يستخدم النص وصفًا مهينًا (كلاب) لنزع الصفة الإنسانية عن جماعة الدروز، مما يمثل تحقيرًا صريحًا. هذا النوع من الخطاب يمهد للعنف والإقصاء، ويزيد من حدة التوتر الطائفي في السياق السوري.","locale":"ar","created_at":"2025-12-19T17:52:21.466Z","image_description":null,"has_image":false}	2025-12-19 17:52:21.466+01	2025-12-19 17:52:21.47+01
93853efe-e18f-4236-8493-ce9ed9cd8b3a	Report link: test	خطاب كراهية	HIGH	0.0000	{الدروز}	{"reasoning":"يستخدم النص وصفًا مهينًا (كلاب) لنزع الصفة الإنسانية عن جماعة الدروز، مما يمثل تحقيرًا صريحًا. هذا النوع من الخطاب يمهد للعنف والإقصاء، ويزيد من حدة التوتر الطائفي في السياق السوري.","imageDescription":"","postLink":"test","reporterCountry":"Sweden","targetGroup":"الدروز"}	2025-12-19 17:52:47.394+01	2025-12-19 17:52:47.974+01
9e198ece-4342-42a5-9100-12e362326afc	Report link: test	خطاب كراهية	HIGH	0.0000	{الإيزيديون}	{"reasoning":"يستخدم النص وصفًا مهينًا (كلاب) لنزع الصفة الإنسانية عن جماعة الدروز، مما يمثل تحقيرًا صريحًا. هذا النوع من الخطاب يمهد للعنف والإقصاء، ويزيد من حدة التوتر الطائفي في السياق السوري.","imageDescription":"","postLink":"test","reporterCountry":"Austria","targetGroup":"الإيزيديون"}	2025-12-19 18:00:10.733+01	2025-12-19 18:00:11.195+01
7e11ad78-fe99-4303-87e3-8c2808ed3dca	مرحبا	خطاب كراهية	LOW	1.0000	{}	{"speech_type":"إهانة شخصية","intensity_score":1,"vulnerability_score":1,"context_score":1,"target_group":null,"rationale":"النص عبارة عن تحية بسيطة ولا يحمل أي دلالات سلبية أو خطاب كراهية.","locale":"ar","created_at":"2025-12-25T12:54:54.650Z","image_description":null,"has_image":false}	2025-12-25 12:54:54.65+01	2025-12-25 12:54:54.657+01
1e4aa831-ef73-4abe-ae88-cbce4b6efeb5	مرحبا\n	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"تحية عادية لا تحتوي على أي خطاب كراهية أو تحريض.","locale":"ar","created_at":"2025-12-25T21:30:48.336Z","image_description":null,"has_image":false}	2025-12-25 21:30:48.336+01	2025-12-25 21:30:48.346+01
c326c071-fa20-4031-b5e7-bc42e869f26a	مرحبا\n	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"تحية عادية لا تحتوي على أي خطاب كراهية أو تحريض.","locale":"ar","created_at":"2025-12-25T21:31:05.408Z","image_description":null,"has_image":false}	2025-12-25 21:31:05.408+01	2025-12-25 21:31:05.409+01
5fbd19df-9cc0-4bb7-adc1-af66a4cfc603	مرحبا\n	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"تحية عادية لا تحتوي على أي خطاب كراهية أو تحريض.","locale":"ar","created_at":"2025-12-25T21:31:34.867Z","image_description":null,"has_image":false}	2025-12-25 21:31:34.867+01	2025-12-25 21:31:34.869+01
15a8adc2-fa51-419a-819d-0fa164f03207	مرحبا\n	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"تحية عادية لا تحتوي على أي خطاب كراهية أو تحريض.","locale":"ar","created_at":"2025-12-25T21:32:32.388Z","image_description":null,"has_image":false}	2025-12-25 21:32:32.388+01	2025-12-25 21:32:32.39+01
47790a1d-f1be-44f7-94ef-936841145a92	الجيش السوري يدخل مناطق سيطرة المعارضة	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"خبر ميداني يصف تحركات عسكرية دون لغة تحريضية أو كراهية.","locale":"ar","created_at":"2025-12-25T21:35:43.804Z","image_description":null,"has_image":false}	2025-12-25 21:35:43.804+01	2025-12-25 21:35:43.807+01
020be50a-3894-4bbb-b267-50e5524cd155	إنهم لايؤتمنون يجب ردعهم \n	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"","locale":"ar","created_at":"2025-12-26T11:45:00.745Z","image_description":null,"has_image":false}	2025-12-26 11:45:00.745+01	2025-12-26 11:45:00.759+01
5b52d6e7-0028-4613-97b1-af2a6d9cd45e	الدروز كلاب	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"","locale":"ar","created_at":"2025-12-26T11:48:14.762Z","image_description":null,"has_image":false}	2025-12-26 11:48:14.762+01	2025-12-26 11:48:14.764+01
24000201-4005-4fcd-b93d-4cb2cc01dfc1	الدروز كلاب	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"","locale":"ar","created_at":"2025-12-26T11:51:06.203Z","image_description":null,"has_image":false}	2025-12-26 11:51:06.203+01	2025-12-26 11:51:06.324+01
01e19b15-c89b-43ab-911a-f50d39f740c8	الدروز كلاب	خطاب كراهية	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"","locale":"ar","created_at":"2025-12-26T11:52:39.592Z","image_description":null,"has_image":false}	2025-12-26 11:52:39.592+01	2025-12-26 11:52:39.595+01
30725f38-f618-4f5e-bf98-e04d9b96ff6c	الدروز حيوانات\n	خطاب كراهية	MEDIUM	7.0000	{}	{"speech_type":"C","intensity_score":7,"vulnerability_score":7,"context_score":0,"target_group":null,"rationale":"","locale":"ar","created_at":"2025-12-26T11:53:20.160Z","image_description":null,"has_image":false}	2025-12-26 11:53:20.16+01	2025-12-26 11:53:20.165+01
d66445c9-92bb-46d4-b693-2f1dcef2543e	الدروز عرصات	محتوى غير كاره	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"لم يقدم النموذج تفسيراً.","locale":"ar","created_at":"2025-12-26T11:55:07.574Z","image_description":null,"has_image":false}	2025-12-26 11:55:07.574+01	2025-12-26 11:55:07.577+01
db605c1e-2f6a-464c-86e2-3da16041a34a	الادالبة كلاب	خطاب كراهية	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"لم يقدم النموذج تفسيراً.","locale":"ar","created_at":"2025-12-27T20:18:37.193Z","image_description":null,"has_image":false}	2025-12-27 20:18:37.193+01	2025-12-27 20:18:37.209+01
c688ebd0-a810-4f31-b046-3e0a619751d8	الدروز كلاب\n	خطاب كراهية	LOW	0.0000	{}	{"speech_type":"None","intensity_score":0,"vulnerability_score":0,"context_score":0,"target_group":null,"rationale":"لم يقدم النموذج تفسيراً.","locale":"ar","created_at":"2025-12-27T20:18:53.263Z","image_description":null,"has_image":false}	2025-12-27 20:18:53.263+01	2025-12-27 20:18:53.265+01
57297cf6-326f-4841-a479-33f76b73fe9d	يجب إبادة أهل إدلب	خطاب كراهية	HIGH	9.0000	{إبادة}	{"speech_type":"تحريض على العنف","intensity_score":9,"vulnerability_score":5,"context_score":4,"target_group":"أهل إدلب","rationale":"يدعو النص بشكل صريح إلى العنف والإبادة الجماعية ضد سكان إدلب، مما يشكل تهديدًا وجوديًا لهم. هذا النوع من الخطاب يغذي الصراع ويهيئ لارتكاب انتهاكات جسيمة.","locale":"ar","created_at":"2025-12-27T20:25:43.833Z","image_description":null,"has_image":false}	2025-12-27 20:25:43.833+01	2025-12-27 20:25:43.835+01
b26e2926-99a6-4902-b8d1-fb71536b0725	الدروز كلاب\n	خطاب كراهية	HIGH	9.0000	{الدروز,كلاب}	{"speech_type":"نزع إنسانية","intensity_score":9,"vulnerability_score":4,"context_score":3,"target_group":"الدروز","rationale":"النص يصف جماعة الدروز بالكلاب، وهو ما يمثل نزعًا للإنسانية وتشبيهًا مهينًا. هذا النوع من الخطاب يهدف إلى شيطنة المجموعة المستهدفة، مما قد يؤدي إلى تبرير العنف أو التمييز ضدهم في سياق الصراع السوري.","locale":"ar","created_at":"2025-12-27T20:25:54.126Z","image_description":null,"has_image":false}	2025-12-27 20:25:54.126+01	2025-12-27 20:25:54.127+01
d21d59b5-3f94-4344-8df8-2a7375ff8289	يجب محاسبة المجرمين	خطاب كراهية	LOW	1.0000	{}	{"speech_type":"إهانة شخصية","intensity_score":1,"vulnerability_score":1,"context_score":1,"target_group":null,"rationale":"العبارة تعبر عن رأي شخصي حول ضرورة المحاسبة، ولا تتضمن أي تحريض أو استهداف لجماعة معينة.","locale":"ar","created_at":"2025-12-27T20:26:10.307Z","image_description":null,"has_image":false}	2025-12-27 20:26:10.307+01	2025-12-27 20:26:10.309+01
74b9beda-11fe-4360-81e4-a2eef1a111af	يجب محاسبة المجرمين	محتوى غير كاره	LOW	1.0000	{"محاسبة المجرمين"}	{"speech_type":"إهانة شخصية","intensity_score":1,"vulnerability_score":1,"context_score":1,"target_group":null,"rationale":"هذا النص يدعو إلى المحاسبة، وهو أمر ضروري لتحقيق العدالة، ولكنه لا يحرض على الكراهية أو العنف ضد أي مجموعة معينة.","locale":"ar","created_at":"2025-12-27T20:28:23.174Z","image_description":null,"has_image":false}	2025-12-27 20:28:23.174+01	2025-12-27 20:28:23.176+01
\.


--
-- Data for Name: FeedbackSubmission; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."FeedbackSubmission" (id, "analysisLogId", message, "contactEmail", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LegalReport; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."LegalReport" (id, "analysisLogId", title, details, "reporterEmail", "createdAt", "updatedAt") FROM stdin;
495db174-cdcb-4cfd-82e0-22ddf5b95efb	fb1a4bd9-079f-4497-b220-9ebe78d54175	User report - خطاب كراهية	Post link: https://meet.google.com/snh-ntnm-dyi\nReporter country: UK\nTarget group: الدروز\nReasoning: يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.	\N	2025-12-19 17:20:42.109+01	2025-12-19 17:20:42.109+01
eecc8770-8233-4e40-8704-b967a9cc12ec	d3a97a40-b892-4a61-9ce0-c2307d7fa42c	User report - خطاب كراهية	Post link: https://meet.google.com/snh-ntnm-dyi\nReporter country: France\nTarget group: الأرمن\nReasoning: يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.	\N	2025-12-19 17:26:09.717+01	2025-12-19 17:26:09.717+01
90f1e2f7-0851-4a83-a27b-abcc5444f034	17c37126-e769-4b52-9549-36e72cd2e89a	User report - خطاب كراهية	Post link: https://meet.google.com/test\nReporter country: Syria\nTarget group: السريان الآشوريين\nReasoning: يدعو النص بشكل صريح إلى إبادة جماعية ضد جماعة السنة، مما يشكل تحريضًا مباشرًا على العنف والإقصاء. هذا النوع من الخطاب يغذي الصراع الطائفي في سوريا ويهدد بتبرير المزيد من العنف.	\N	2025-12-19 17:34:56.586+01	2025-12-19 17:34:56.586+01
66d9d1c7-8067-436c-9fc7-074cd7941efe	93853efe-e18f-4236-8493-ce9ed9cd8b3a	User report - خطاب كراهية	Post link: test\nReporter country: Sweden\nTarget group: الدروز\nReasoning: يستخدم النص وصفًا مهينًا (كلاب) لنزع الصفة الإنسانية عن جماعة الدروز، مما يمثل تحقيرًا صريحًا. هذا النوع من الخطاب يمهد للعنف والإقصاء، ويزيد من حدة التوتر الطائفي في السياق السوري.	\N	2025-12-19 17:52:48.019+01	2025-12-19 17:52:48.019+01
2e3a9ec4-a63a-477d-a10c-8d61dda6878d	9e198ece-4342-42a5-9100-12e362326afc	User report - خطاب كراهية	Post link: test\nReporter country: Austria\nTarget group: الإيزيديون\nReasoning: يستخدم النص وصفًا مهينًا (كلاب) لنزع الصفة الإنسانية عن جماعة الدروز، مما يمثل تحقيرًا صريحًا. هذا النوع من الخطاب يمهد للعنف والإقصاء، ويزيد من حدة التوتر الطائفي في السياق السوري.	\N	2025-12-19 18:00:11.254+01	2025-12-19 18:00:11.254+01
\.


--
-- Data for Name: NewsArticle; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."NewsArticle" (id, title, body, category, slug, "isPublished", "publishedAt", "createdAt", "updatedAt", "imageUrl", summary, tags, "videoUrl", "authorName", "authorNameEn") FROM stdin;
97a14911-ff93-461a-80bf-f652a4b3fd88	{"ar":"تجربة","en":"Test"}	{"ar":"في هذا اللقاء الإعلامي القصير، يتم تسليط الضوء على مبادرة \\"بلّغ\\" كخطوة رائدة لرفع مستوى الوعي الرقمي بين السوريين.\\n\\nتتناول المبادرة آليات رصد ومواجهة خطاب الكراهية المنتشر على منصات التواصل الاجتماعي، وتهدف إلى خلق بيئة رقمية أكثر أماناً ومسؤولية.\\n\\nشاهد الفيديو للتعرف أكثر على أهداف المبادرة وكيفية المساهمة فيها.","en":"In this short media interview, the \\"Ballagh\\" initiative is highlighted as a pioneering step to raise digital awareness among Syrians.\\n\\nThe initiative addresses mechanisms for monitoring and countering hate speech spreading on social media platforms, aiming to create a safer and more responsible digital environment.\\n\\nWatch the video to learn more about the initiative's goals and how to contribute."}	TRAINING	test	t	2025-12-19 00:00:00+01	2025-12-19 17:01:48.819+01	2025-12-19 17:03:11.791+01	/uploads/1766107482246-05296c58.webp	{"ar":"ملخص عربيملخص عربيملخص عربيملخص عربيملخص عربيملخص عربيملخص عربي","en":"A media interview highlighting the \\"Ballagh\\" initiative and its role in enhancing digital awareness and countering hate speech in Syria."}	{}	https://youtu.be/ksacY4LRf4g	محمد الجسيم	Mhmad jaseem
\.


--
-- Data for Name: ReportStudy; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."ReportStudy" (id, title, body, category, "documentUrl", "isPublished", "publishedAt", "createdAt", "updatedAt", "imageUrl", summary, "authorName", "authorNameEn") FROM stdin;
18984e55-d9b2-4e8e-a88a-8745c6e3c07e	{"ar":"Test study","en":"دراسة أجنبية"}	{"ar":" عربي بوديعربي بوديعربي بوديعربي بوديعربي بوديعربي بوديعربي بوديعربي بودي","en":"English bodtyEnglish bodtyEnglish bodtyEnglish bodtyEnglish bodtyEnglish bodtyEnglish bodtyEnglish bodtyEnglish bodty"}	INFOGRAPHIC	\N	t	2025-12-19 17:06:21.275+01	2025-12-19 17:04:27.466+01	2025-12-19 17:06:21.277+01	/uploads/1766107482246-05296c58.webp	{"ar":"تجربة تجربة تجربة عربي","en":"Test Test Test English "}	نورس يكن	Nawras Yakan
\.


--
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public."TeamMember" (id, name, role, bio, "imageUrl", "sortOrder", "createdAt", "updatedAt") FROM stdin;
8d35bd01-1080-4d7c-ab97-ab842e2ae36e	{"ar":"عمر حاج خميس","en":"Omar Haj Khamis"}	{"ar":"مهندس برمجيات","en":"Software Eng"}	\N	/uploads/1766102945619-4b2e4542.webp	0	2025-12-19 16:58:19.557+01	2025-12-19 16:58:19.557+01
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: balagh
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
11d08605-fac8-4f7f-9f91-f28fc86a0351	ea5bb4783e691a0a84704739a9c79d6ad907ceb70ef4d64bf9ed64f7b6315ba2	2025-12-19 16:02:47.094929+01	20251218224804_init_balagh	\N	\N	2025-12-19 16:02:46.951677+01	1
e9848766-8834-4200-ba16-b81f6f7cd11f	9d65e475d03cb4900dd07c08c10c212e578d5d5af1df2b8e627296e47bcc5762	2025-12-19 16:02:47.127864+01	20251218225411_add_admin_user	\N	\N	2025-12-19 16:02:47.097531+01	1
e9d2ec5f-b823-4967-94c6-a176a9d55771	92acd517aaaca65f6be9af0112a8e0e3c70365d64579dae0ccf4488c8e73d51b	2025-12-19 16:02:47.138375+01	20251218233812_news_categories_and_fields	\N	\N	2025-12-19 16:02:47.130237+01	1
10d49b0f-1904-48e8-b58d-c6646be4e956	6b8f539e7aea328953a2e5ea5f51b8c8a89014de7d34ec5d685f4869390c7ce9	2025-12-19 16:02:47.149403+01	20251218235008_report_study_summary_image	\N	\N	2025-12-19 16:02:47.140752+01	1
2ea87a28-3349-4e41-9c23-c96660ada5b5	7a776cd40110f8e4ba467b3b0ec0923335554c74ab0ffe572b2397199d5feadb	2025-12-19 16:02:47.160871+01	20251219005329_add_author_name_to_news	\N	\N	2025-12-19 16:02:47.152999+01	1
53854f6e-6e1c-445c-af01-903fc6cd0be7	5f00a9e9f7ebae35c1a11c9ddcaa1439cfcee1d04558ed56ea75f6c6cf9d8294	2025-12-19 16:02:47.171544+01	20251219012628_add_author_name_en	\N	\N	2025-12-19 16:02:47.163126+01	1
c9f1676b-c9c2-4ed3-9a1d-f67fa9b9346a	501d1695a1efad925baec6f5f1cb124c3a565a871376abeb537ad82b32efa7b9	2025-12-19 16:29:34.399535+01	20251219161000_add_report_author	\N	\N	2025-12-19 16:29:34.384367+01	1
\.


--
-- Name: AdminUser AdminUser_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY (id);


--
-- Name: AnalysisLog AnalysisLog_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."AnalysisLog"
    ADD CONSTRAINT "AnalysisLog_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackSubmission FeedbackSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."FeedbackSubmission"
    ADD CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY (id);


--
-- Name: LegalReport LegalReport_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."LegalReport"
    ADD CONSTRAINT "LegalReport_pkey" PRIMARY KEY (id);


--
-- Name: NewsArticle NewsArticle_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."NewsArticle"
    ADD CONSTRAINT "NewsArticle_pkey" PRIMARY KEY (id);


--
-- Name: ReportStudy ReportStudy_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."ReportStudy"
    ADD CONSTRAINT "ReportStudy_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AdminUser_email_key; Type: INDEX; Schema: public; Owner: balagh
--

CREATE UNIQUE INDEX "AdminUser_email_key" ON public."AdminUser" USING btree (email);


--
-- Name: AnalysisLog_createdAt_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "AnalysisLog_createdAt_idx" ON public."AnalysisLog" USING btree ("createdAt");


--
-- Name: AnalysisLog_riskLevel_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "AnalysisLog_riskLevel_idx" ON public."AnalysisLog" USING btree ("riskLevel");


--
-- Name: FeedbackSubmission_analysisLogId_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "FeedbackSubmission_analysisLogId_idx" ON public."FeedbackSubmission" USING btree ("analysisLogId");


--
-- Name: FeedbackSubmission_status_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "FeedbackSubmission_status_idx" ON public."FeedbackSubmission" USING btree (status);


--
-- Name: LegalReport_analysisLogId_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "LegalReport_analysisLogId_idx" ON public."LegalReport" USING btree ("analysisLogId");


--
-- Name: NewsArticle_category_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "NewsArticle_category_idx" ON public."NewsArticle" USING btree (category);


--
-- Name: NewsArticle_publishedAt_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "NewsArticle_publishedAt_idx" ON public."NewsArticle" USING btree ("publishedAt");


--
-- Name: NewsArticle_slug_key; Type: INDEX; Schema: public; Owner: balagh
--

CREATE UNIQUE INDEX "NewsArticle_slug_key" ON public."NewsArticle" USING btree (slug);


--
-- Name: ReportStudy_category_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "ReportStudy_category_idx" ON public."ReportStudy" USING btree (category);


--
-- Name: ReportStudy_publishedAt_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "ReportStudy_publishedAt_idx" ON public."ReportStudy" USING btree ("publishedAt");


--
-- Name: TeamMember_sortOrder_idx; Type: INDEX; Schema: public; Owner: balagh
--

CREATE INDEX "TeamMember_sortOrder_idx" ON public."TeamMember" USING btree ("sortOrder");


--
-- Name: FeedbackSubmission FeedbackSubmission_analysisLogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."FeedbackSubmission"
    ADD CONSTRAINT "FeedbackSubmission_analysisLogId_fkey" FOREIGN KEY ("analysisLogId") REFERENCES public."AnalysisLog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LegalReport LegalReport_analysisLogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: balagh
--

ALTER TABLE ONLY public."LegalReport"
    ADD CONSTRAINT "LegalReport_analysisLogId_fkey" FOREIGN KEY ("analysisLogId") REFERENCES public."AnalysisLog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fDeJEASs1ylEY9k9HrXgTGlxjq9alxLdfcUvdZoAP9jwZprcAsVZnQvQpiFUsXc

