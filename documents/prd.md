\# Product Requirements Document (PRD)



\## Product: BuzzinBeats



\---



**# 1. 📌 Product Overview**



BuzzinBeats is a SaaS platform that allows creators and affiliate marketers to quickly create \*\*product-focused landing pages\*\* using Amazon products (via ASIN).



Users can:



\* Add products automatically using ASIN

\* Generate affiliate links

\* Create simple product landing pages

\* Share pages via links/QR codes

\* Track performance using analytics



\---



\# 2. 🎯 Problem Statement



Creators currently:



\* Manually copy product details from Amazon

\* Struggle with expired or broken links

\* Lack simple tools to create product landing pages

\* Cannot easily track performance (clicks, conversions)



\---



\# 3. 👤 Target Users



\* YouTubers

\* Influencers

\* Affiliate marketers

\* Content creators



\---



\# 4. 🚀 Core Features



\---



\## 4.1 User System



\* User signup/login

\* Each user gets a unique ID (e.g., BA001)

\* Users can create multiple pages



\---



\## 4.2 Page System



\* Each page has a unique ID:



&#x20; ```text

&#x20; BA001-P001

&#x20; ```

\* Pages are product-only landing pages

\* No bio or extra content



\---



\## 4.3 Product Management



\### Manual Add:



\* Add product image

\* Title

\* Description

\* Affiliate links



\---



\### Auto Add (ASIN Based):



\* Input ASIN

\* Fetch:



&#x20; \* Image

&#x20; \* Title

&#x20; \* Description

\* Auto-generate affiliate link



\---



\## 4.4 Multi-ASIN Input System



\* Tag-based input (chip system)

\* Supports:



&#x20; \* Enter-based input

&#x20; \* Bulk paste (comma, space, newline)



\---



\### Validation:



\* ASIN must be 10 characters

\* Invalid ASINs are rejected



\---



\### Duplicate Prevention:



\* Do not allow duplicate ASIN input

\* Show message:

&#x20; “This ASIN is already added”



\---



\### Backend Safety:



\* Remove duplicates before processing



\---



\## 4.5 Affiliate Store ID System



\* User enters Store ID (once)

\* Stored permanently

\* Not editable by default



\---



\### Controls:



\* Edit Store ID

\* Delete Store ID



\---



\### Behavior:



\* Required before adding products

\* Used to generate affiliate links dynamically



\---



\## 4.6 Landing Page System



\* Product-only pages

\* Uses platform default design (no color/theme customization)



\---



\### Layout Selection System



Users can choose from multiple layout styles:



\---



\#### Layout Options:



1\. Grid Card Layout (Default)

2\. Horizontal List Layout

3\. Single Column Layout

4\. Featured + Grid Layout

5\. Compact Grid Layout



\---



\### Default Layout:



\* User can set one layout as default

\* Applies to all pages



\---



\## 4.7 Product Display



Each product includes:



\* Image

\* Title

\* Short description

\* Multiple Buy Buttons (for different stores)



\---



\## 4.8 Analytics Dashboard



\---



\### Metrics:



\* Total Page Views

\* Total Clicks

\* Unique Visitors

\* Conversion Rate

\* Top Performing Page



\---



\### Sections:



\#### 1. Trend Graph



\* Views over time

\* Clicks over time



\#### 2. Product Performance



\* Product name

\* Views

\* Clicks

\* CTR



\#### 3. Store Performance



\* Store name

\* Click count



\#### 4. Device Analytics



\* Mobile vs Desktop



\#### 5. Top Pages



\* Page name

\* Views

\* Clicks



\---



\### Filters:



\* Date range

\* Page selection



\---



\## 4.9 QR Redirect System



\* Old QR codes must continue working

\* Old GitHub/AppScript links redirect to new BuzzinBeats pages



\---



\### Flow:



```text

QR → Old URL → Redirect → New Landing Page

```



\---



\# 5. 🔄 User Flow



```text

User Signup →

Set Store ID →

Create Page →

Choose Layout →

Add Products (ASIN/manual) →

Publish Page →

Share Link/QR →

Track Analytics

```



\---



\# 6. 🎨 UI/UX Requirements



\* Clean and minimal design

\* Mobile responsive

\* Card-based layouts

\* Fast loading pages

\* Clear call-to-action buttons



\---



\# 7. ⚠️ Constraints



\* No theme/color customization (for now)

\* Only product-based landing pages

\* Must prevent duplicate ASIN input

\* Must support multiple store links per product



\---



\# 8. 🧠 System Requirements



\* Efficient API usage (Amazon API with caching)

\* Batch ASIN processing

\* Backend validation for all inputs

\* Secure storage of API keys



\---



\# 9. 🚀 Future Scope (Optional)



\* Bulk ASIN upload (CSV)

\* Revenue tracking

\* A/B testing layouts

\* Custom domain support

\* Advanced design customization



\---



\# 10. 🏆 Success Metrics



\* Number of pages created

\* Product additions per user

\* Click-through rate (CTR)

\* User retention

\* Conversion performance



\---



\# Final Vision



BuzzinBeats should be:

👉 A fast, simple, and powerful tool that helps creators

\*\*turn product links into high-converting landing pages with analytics.\*\*



