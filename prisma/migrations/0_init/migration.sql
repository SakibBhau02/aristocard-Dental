-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "doctorSlug" TEXT,
    "serviceSlug" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "followUpDate" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "rating" INTEGER NOT NULL,
    "serviceSlug" TEXT,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legacyId" INTEGER NOT NULL DEFAULT 0,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "credentialsJson" TEXT NOT NULL DEFAULT '[]',
    "role" TEXT NOT NULL,
    "roleBn" TEXT,
    "department" TEXT NOT NULL,
    "departmentBn" TEXT,
    "bio" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 1,
    "patientsTreated" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "specializationsJson" TEXT NOT NULL DEFAULT '[]',
    "languagesJson" TEXT NOT NULL DEFAULT '["Bangla","English"]',
    "consultationDaysJson" TEXT NOT NULL DEFAULT '[]',
    "accent" TEXT NOT NULL DEFAULT '#012c5f',
    "photo" TEXT,
    "educationJson" TEXT,
    "membershipsJson" TEXT,
    "awardsJson" TEXT,
    "quote" TEXT,
    "quoteBn" TEXT,
    "focusServicesJson" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "excerpt" TEXT NOT NULL,
    "excerptBn" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "readTime" TEXT NOT NULL DEFAULT '5 min read',
    "date" TEXT NOT NULL,
    "updated" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Dr. Shazia Khanam',
    "authorCredentials" TEXT NOT NULL DEFAULT 'BDS, MDS',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tagsJson" TEXT NOT NULL DEFAULT '[]',
    "serviceRefsJson" TEXT,
    "image" TEXT,
    "imageAlt" TEXT,
    "quickAnswer" TEXT NOT NULL,
    "quickAnswerBn" TEXT,
    "sectionsJson" TEXT NOT NULL,
    "sectionsBnJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT NOT NULL,
    "questionBn" TEXT,
    "answer" TEXT NOT NULL,
    "answerBn" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmileCase" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "treatment" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Cosmetic',
    "serviceSlug" TEXT,
    "beforeSrc" TEXT NOT NULL,
    "afterSrc" TEXT NOT NULL,
    "beforeAlt" TEXT,
    "afterAlt" TEXT,
    "title" TEXT NOT NULL,
    "patient" TEXT NOT NULL,
    "age" INTEGER NOT NULL DEFAULT 30,
    "duration" TEXT NOT NULL,
    "proceduresJson" TEXT NOT NULL DEFAULT '[]',
    "result" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmileCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceContent" (
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "nameBn" TEXT,
    "shortName" TEXT,
    "shortNameBn" TEXT,
    "tagline" TEXT,
    "taglineBn" TEXT,
    "excerpt" TEXT,
    "excerptBn" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "duration" TEXT,
    "longevity" TEXT,
    "anesthesia" TEXT,
    "featured" BOOLEAN,
    "overviewJson" TEXT,
    "benefitsJson" TEXT,
    "processJson" TEXT,
    "idealJson" TEXT,
    "faqsJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceContent_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'home',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'image',
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "key" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivity" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "actorLabel" TEXT,
    "role" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "label" TEXT,
    "metaJson" TEXT NOT NULL DEFAULT '{}',
    "session" TEXT,
    "device" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_refCode_key" ON "Appointment"("refCode");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_slug_key" ON "Doctor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SmileCase_slug_key" ON "SmileCase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE INDEX "TrackingEvent_type_createdAt_idx" ON "TrackingEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_createdAt_idx" ON "TrackingEvent"("createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_session_idx" ON "TrackingEvent"("session");
