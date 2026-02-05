---
wave: 3
depends_on:
  - 01-PLAN-marketing-landing
files_modified:
  - src/pages/blog/index.astro
  - src/pages/blog/[...slug].astro
  - src/content/config.ts
  - src/content/blog/sample-post.md
  - src/components/marketing/ContactForm.astro
  - src/pages/index.astro
  - public/admin/index.html
  - public/admin/config.yml
  - astro.config.mjs
autonomous: true
---

# Plan: Blog with Decap CMS & Contact Form

## Objective

Set up a blog using Astro's content collections with Decap CMS for easy editing, plus a contact form using Netlify Forms with pre-filled message template.

## Tasks

### Task 1: Configure Content Collection for Blog

**Action:** Set up Astro content collection for blog posts
**Files:** src/content/config.ts
**Details:**

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default('VWCGApp Team'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false)
  })
});

export const collections = { blog };
```

### Task 2: Create Blog Index Page

**Action:** Create blog listing page with SEO
**Files:** src/pages/blog/index.astro
**Details:**

```astro
---
import { getCollection } from 'astro:content';
import MarketingLayout from '../../layouts/MarketingLayout.astro';
import Footer from '../../components/marketing/Footer.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<MarketingLayout
  title="Blog - Business Insights & Strategies"
  description="Expert insights on leadership, business assessment, strategic planning, and operational excellence for SMB owners."
>
  <header class="bg-indigo-600 text-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl sm:text-4xl font-bold">Blog</h1>
      <p class="mt-2 text-indigo-100">Insights for growing businesses</p>
    </div>
  </header>

  <main class="py-12 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {posts.length === 0 ? (
        <div class="text-center py-12">
          <p class="text-gray-500">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {post.data.heroImage && (
                <img
                  src={post.data.heroImage}
                  alt={post.data.title}
                  class="w-full h-48 object-cover"
                />
              )}
              <div class="p-6">
                <time class="text-sm text-gray-500">
                  {post.data.pubDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <h2 class="mt-2 text-xl font-semibold text-gray-900">
                  <a href={`/blog/${post.slug}`} class="hover:text-indigo-600 transition-colors">
                    {post.data.title}
                  </a>
                </h2>
                <p class="mt-2 text-gray-600 line-clamp-3">
                  {post.data.description}
                </p>
                <div class="mt-4 flex flex-wrap gap-2">
                  {post.data.tags.slice(0, 3).map(tag => (
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  </main>

  <Footer />
</MarketingLayout>
```

### Task 3: Create Blog Post Template

**Action:** Create individual blog post page
**Files:** src/pages/blog/[...slug].astro
**Details:**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import MarketingLayout from '../../layouts/MarketingLayout.astro';
import Footer from '../../components/marketing/Footer.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<MarketingLayout
  title={post.data.title}
  description={post.data.description}
  ogImage={post.data.heroImage}
>
  <article class="bg-white">
    <!-- Hero -->
    <header class="bg-indigo-600 text-white py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 text-sm text-indigo-200 mb-4">
          <a href="/blog" class="hover:text-white">Blog</a>
          <span>/</span>
          <span>{post.data.tags[0] || 'Article'}</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold">{post.data.title}</h1>
        <div class="mt-4 flex items-center gap-4 text-sm text-indigo-200">
          <span>{post.data.author}</span>
          <span>•</span>
          <time>
            {post.data.pubDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </div>
    </header>

    <!-- Hero Image -->
    {post.data.heroImage && (
      <div class="max-w-4xl mx-auto -mt-6 px-4">
        <img
          src={post.data.heroImage}
          alt={post.data.title}
          class="w-full rounded-xl shadow-lg"
        />
      </div>
    )}

    <!-- Content -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="prose prose-lg prose-indigo max-w-none">
        <Content />
      </div>

      <!-- Tags -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <div class="flex flex-wrap gap-2">
          {post.data.tags.map(tag => (
            <span class="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-12 p-8 bg-indigo-50 rounded-xl text-center">
        <h3 class="text-xl font-semibold text-gray-900">Ready to assess your business?</h3>
        <p class="mt-2 text-gray-600">Get clear visibility into your gaps with our free tools.</p>
        <a
          href="/app"
          class="mt-4 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start Free Assessment
        </a>
      </div>
    </div>
  </article>

  <Footer />
</MarketingLayout>

<style is:global>
  /* Tailwind Typography overrides */
  .prose h2 {
    @apply text-2xl font-bold mt-8 mb-4;
  }
  .prose h3 {
    @apply text-xl font-semibold mt-6 mb-3;
  }
  .prose p {
    @apply mb-4;
  }
  .prose ul, .prose ol {
    @apply mb-4 pl-6;
  }
  .prose li {
    @apply mb-2;
  }
  .prose a {
    @apply text-indigo-600 hover:text-indigo-700;
  }
  .prose blockquote {
    @apply border-l-4 border-indigo-500 pl-4 italic text-gray-700;
  }
  .prose code {
    @apply bg-gray-100 px-1 py-0.5 rounded text-sm;
  }
  .prose pre {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
  }
</style>
```

### Task 4: Create Sample Blog Posts

**Action:** Create sample blog posts for content
**Files:** src/content/blog/sample-post.md, src/content/blog/why-assess-business.md
**Details:**

Create blog directory and sample posts:

```markdown
<!-- src/content/blog/why-assess-business.md -->
---
title: "Why Every SMB Owner Needs a Business Assessment"
description: "Discover how systematic business assessment helps SMB owners identify gaps, prioritize improvements, and make better strategic decisions."
pubDate: 2026-02-01
author: "VWCGApp Team"
tags: ["business assessment", "strategy", "SMB"]
---

# Why Every SMB Owner Needs a Business Assessment

Running a small or medium-sized business is challenging. You're constantly juggling operations, strategy, people, and finances. But how do you know where to focus your limited time and resources?

## The Visibility Problem

Most business owners operate with incomplete information about their own company:

- **Leadership gaps** go unnoticed until key people leave
- **Operational inefficiencies** compound slowly over time
- **Strategic misalignment** between vision and execution
- **Hidden risks** in financial health and market position

## The Assessment Solution

A systematic business assessment provides:

### 1. Objective Visibility
Stop guessing and start measuring. Assessments turn subjective feelings into actionable data.

### 2. Prioritized Action
Not everything needs attention right now. Assessments help you identify what matters most.

### 3. Progress Tracking
Reassess periodically to measure improvement and catch new gaps early.

## What to Assess

The most valuable business assessments cover:

- **AI Readiness** - Are you prepared for the AI transformation?
- **Leadership DNA** - Do your leaders have the capabilities you need?
- **Business EQ** - How emotionally intelligent is your organization?
- **SWOT Analysis** - What are your real strengths, weaknesses, opportunities, and threats?
- **Financial Health** - Are your finances setting you up for success or failure?
- **SOP Maturity** - Do you have the processes to scale?

## Get Started

Ready to see where your business really stands? Try our free assessment tools and get instant insights—no email required.

[Start Your Assessment →](/app)
```

### Task 5: Set Up Decap CMS

**Action:** Configure Decap CMS for blog management
**Files:** public/admin/index.html, public/admin/config.yml
**Details:**

Create admin/index.html:
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager | VWCGApp</title>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</head>
<body>
</body>
</html>
```

Create admin/config.yml:
```yaml
backend:
  name: git-gateway
  branch: main

# For local development
local_backend: true

media_folder: "public/images/blog"
public_folder: "/images/blog"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Description", name: "description", widget: "text" }
      - { label: "Publish Date", name: "pubDate", widget: "datetime" }
      - { label: "Hero Image", name: "heroImage", widget: "image", required: false }
      - { label: "Author", name: "author", widget: "string", default: "VWCGApp Team" }
      - { label: "Tags", name: "tags", widget: "list", default: ["business"] }
      - { label: "Draft", name: "draft", widget: "boolean", default: false }
      - { label: "Body", name: "body", widget: "markdown" }
```

### Task 6: Create Contact Form Component

**Action:** Create contact form with Netlify Forms and pre-filled message
**Files:** src/components/marketing/ContactForm.astro
**Details:**

```astro
---
interface Props {
  prefilledMessage?: string;
}

const { prefilledMessage = "Please contact me to discuss execution of my recommendations." } = Astro.props;
---

<section id="contact" class="py-16 sm:py-24 bg-white">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
        Get Expert Guidance
      </h2>
      <p class="mt-4 text-lg text-gray-600">
        Want help executing your assessment recommendations? Let's talk.
      </p>
    </div>

    <!-- CTT-01: Netlify Forms -->
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      class="space-y-6"
    >
      <!-- Honeypot field for spam prevention -->
      <p class="hidden">
        <label>Don't fill this out: <input name="bot-field" /></label>
      </p>

      <input type="hidden" name="form-name" value="contact" />

      <div class="grid sm:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Your company name"
        />
      </div>

      <!-- CTT-02: Pre-filled message template -->
      <div>
        <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >{prefilledMessage}</textarea>
        <p class="mt-1 text-sm text-gray-500">
          Feel free to modify or add to the message above.
        </p>
      </div>

      <div>
        <button
          type="submit"
          class="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Send Message
        </button>
      </div>

      <p class="text-sm text-gray-500">
        We'll respond within 24 business hours. Your information is never shared.
      </p>
    </form>
  </div>
</section>

<script>
  // Optional: Form submission feedback
  const form = document.querySelector('form[name="contact"]');
  form?.addEventListener('submit', async (e) => {
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (button) {
      button.textContent = 'Sending...';
      button.disabled = true;
    }
  });
</script>
```

### Task 7: Add Contact Form to Landing Page

**Action:** Add ContactForm component to landing page
**Files:** src/pages/index.astro
**Details:**

Update landing page to include contact form before footer:

```astro
---
import MarketingLayout from '../layouts/MarketingLayout.astro';
import Hero from '../components/marketing/Hero.astro';
import Features from '../components/marketing/Features.astro';
import SampleReport from '../components/marketing/SampleReport.astro';
import CTA from '../components/marketing/CTA.astro';
import ContactForm from '../components/marketing/ContactForm.astro';
import Footer from '../components/marketing/Footer.astro';

// ... rest of page config
---

<MarketingLayout title={pageTitle} description={pageDescription}>
  <main>
    <Hero ctaHref="/app" />
    <Features />
    <SampleReport />
    <CTA ctaHref="/app" />
    <ContactForm />
  </main>
  <Footer />
</MarketingLayout>
```

### Task 8: Update Astro Config for Decap CMS

**Action:** Ensure Astro config supports content collections
**Files:** astro.config.mjs
**Details:**

Verify content collections are enabled (should already be in Astro 5):

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://vwcgapp.com',
  integrations: [react(), tailwind()],
  // Content collections are enabled by default in Astro 5
});
```

### Task 9: Create Blog Content Directory

**Action:** Ensure content directory structure exists
**Files:** src/content/blog/.gitkeep
**Details:**

Create directory structure and initial content.

### Task 10: Verify Build

**Action:** Run build to verify blog and contact form work
**Files:** N/A

## Verification

- [ ] Blog index page lists posts (ACC-01 - publicly accessible)
- [ ] Individual blog posts render correctly
- [ ] Decap CMS admin page loads at /admin
- [ ] Contact form displays with pre-filled message (CTT-02)
- [ ] Form has Netlify data-netlify attribute (CTT-01)
- [ ] Form includes honeypot spam protection
- [ ] Mobile responsive design
- [ ] Build completes successfully

## Must-Haves

- MKT-02: Blog with Decap CMS for WordPress-like content editing
- CTT-01: Contact form using Netlify Forms (no backend)
- CTT-02: Pre-filled message template
- CTT-03: Form submission sends to consultant email (via Netlify)
