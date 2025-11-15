-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('DRAFT', 'PARSING', 'PARSED', 'BUILDING', 'BUILT', 'DEPLOYED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommitType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MERGE', 'BRANCH');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('PENDING', 'QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'BUILDING', 'DEPLOYING', 'LIVE', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "clerkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rawInput" TEXT,
    "specJson" JSONB,
    "status" "IdeaStatus" NOT NULL DEFAULT 'DRAFT',
    "branch" TEXT NOT NULL DEFAULT 'main',
    "parentIdeaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commits" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CommitType" NOT NULL,
    "message" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "diff" JSONB,
    "specSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "BuildStatus" NOT NULL DEFAULT 'PENDING',
    "agent" TEXT,
    "logs" TEXT,
    "outputPath" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "buildId" TEXT,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "platform" TEXT NOT NULL,
    "url" TEXT,
    "version" TEXT,
    "config" JSONB,
    "error" TEXT,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_tokens" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "figmaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE INDEX "ideas_userId_idx" ON "ideas"("userId");

-- CreateIndex
CREATE INDEX "ideas_status_idx" ON "ideas"("status");

-- CreateIndex
CREATE INDEX "ideas_branch_idx" ON "ideas"("branch");

-- CreateIndex
CREATE INDEX "commits_ideaId_idx" ON "commits"("ideaId");

-- CreateIndex
CREATE INDEX "commits_branch_idx" ON "commits"("branch");

-- CreateIndex
CREATE INDEX "projects_ideaId_idx" ON "projects"("ideaId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "builds_projectId_idx" ON "builds"("projectId");

-- CreateIndex
CREATE INDEX "builds_status_idx" ON "builds"("status");

-- CreateIndex
CREATE INDEX "deployments_projectId_idx" ON "deployments"("projectId");

-- CreateIndex
CREATE INDEX "deployments_status_idx" ON "deployments"("status");

-- CreateIndex
CREATE INDEX "design_tokens_projectId_idx" ON "design_tokens"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "design_tokens_projectId_key_key" ON "design_tokens"("projectId", "key");

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_parentIdeaId_fkey" FOREIGN KEY ("parentIdeaId") REFERENCES "ideas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
