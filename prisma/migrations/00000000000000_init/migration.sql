-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('WEB', 'WEB_APP', 'MOBILE_APP', 'PHOTOGRAPHY', 'VIDEO', 'STUDIO');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO_EMBED');

-- CreateEnum
CREATE TYPE "PriceUnit" AS ENUM ('PROJECT', 'DAY', 'HALF_DAY', 'HOUR', 'MONTH', 'PERSON', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'DRONE', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('CONTACT', 'QUOTE', 'RENTAL', 'SERVICE_PAGE');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "taglineTh" TEXT NOT NULL,
    "taglineEn" TEXT NOT NULL,
    "descriptionTh" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "coverImage" TEXT,
    "accentColor" TEXT,
    "highlightsTh" TEXT[],
    "highlightsEn" TEXT[],
    "processTh" JSONB,
    "processEn" JSONB,
    "faqTh" JSONB,
    "faqEn" JSONB,
    "seoTitleTh" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionTh" TEXT,
    "seoDescriptionEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "priceFrom" DECIMAL(12,2),
    "priceUnit" "PriceUnit" NOT NULL DEFAULT 'PROJECT',
    "isStartingPrice" BOOLEAN NOT NULL DEFAULT true,
    "includesTh" TEXT[],
    "includesEn" TEXT[],
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "summaryTh" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "bodyTh" TEXT,
    "bodyEn" TEXT,
    "clientName" TEXT,
    "year" INTEGER,
    "location" TEXT,
    "coverImage" TEXT NOT NULL,
    "coverBlurData" TEXT,
    "videoUrl" TEXT,
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "techStack" TEXT[],
    "creditsTh" JSONB,
    "creditsEn" JSONB,
    "seoTitleTh" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionTh" TEXT,
    "seoDescriptionEn" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "serviceId" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMedia" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "blurData" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "captionTh" TEXT,
    "captionEn" TEXT,
    "altTh" TEXT,
    "altEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionTh" TEXT,
    "descriptionEn" TEXT,
    "specs" JSONB,
    "dailyRate" DECIMAL(10,2),
    "weeklyRate" DECIMAL(10,2),
    "depositAmount" DECIMAL(10,2),
    "image" TEXT,
    "gallery" TEXT[],
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "authorAvatar" TEXT,
    "submitterEmail" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "serviceCategory" "ServiceCategory",
    "locale" TEXT NOT NULL DEFAULT 'th',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "replyTh" TEXT,
    "replyEn" TEXT,
    "repliedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'CONTACT',
    "services" "ServiceCategory"[],
    "budgetRange" TEXT,
    "preferredDate" TIMESTAMP(3),
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'th',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadItem" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "labelSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "days" INTEGER,

    CONSTRAINT "LeadItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "leadId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerCompany" TEXT,
    "customerAddress" TEXT,
    "customerTaxId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'th',
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 7,
    "vatAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "withholdingRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "withholdingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "termsText" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit" TEXT,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleTh" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "excerptTh" TEXT NOT NULL,
    "excerptEn" TEXT NOT NULL,
    "bodyTh" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverBlurData" TEXT,
    "tags" TEXT[],
    "seoTitleTh" TEXT,
    "seoTitleEn" TEXT,
    "seoDescriptionTh" TEXT,
    "seoDescriptionEn" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "readingMinutes" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleTh" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "bioTh" TEXT,
    "bioEn" TEXT,
    "photo" TEXT,
    "email" TEXT,
    "socials" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "blurData" TEXT,
    "altTh" TEXT,
    "altEn" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'uploads',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_category_key" ON "Service"("category");

-- CreateIndex
CREATE INDEX "Service_isActive_order_idx" ON "Service"("isActive", "order");

-- CreateIndex
CREATE INDEX "ServicePackage_serviceId_order_idx" ON "ServicePackage"("serviceId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_category_publishedAt_idx" ON "Project"("status", "category", "publishedAt");

-- CreateIndex
CREATE INDEX "Project_status_isFeatured_order_idx" ON "Project"("status", "isFeatured", "order");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_order_idx" ON "ProjectMedia"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");

-- CreateIndex
CREATE INDEX "Equipment_isActive_category_order_idx" ON "Equipment"("isActive", "category", "order");

-- CreateIndex
CREATE INDEX "Review_status_isPinned_createdAt_idx" ON "Review"("status", "isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "Review_ipHash_createdAt_idx" ON "Review"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_refCode_key" ON "Lead"("refCode");

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_ipHash_createdAt_idx" ON "Lead"("ipHash", "createdAt");

-- CreateIndex
CREATE INDEX "LeadItem_leadId_idx" ON "LeadItem"("leadId");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE INDEX "Quote_status_issueDate_idx" ON "Quote"("status", "issueDate");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_order_idx" ON "QuoteItem"("quoteId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "TeamMember_isActive_order_idx" ON "TeamMember"("isActive", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_key_key" ON "MediaAsset"("key");

-- CreateIndex
CREATE INDEX "MediaAsset_folder_createdAt_idx" ON "MediaAsset"("folder", "createdAt");

-- AddForeignKey
ALTER TABLE "ServicePackage" ADD CONSTRAINT "ServicePackage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadItem" ADD CONSTRAINT "LeadItem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
