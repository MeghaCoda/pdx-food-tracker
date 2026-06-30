Here’s a clean roadmap-style summary you can paste directly into your repo.

---

# Project Summary: Verified Food & Discount Resource Platform

## Core Goal

Build a **high-precision, low-noise directory of food access resources in Portland** that helps working-class and low-income residents quickly find *reliable* ways to reduce food costs.

The system prioritizes:

* **Accuracy over completeness**
* **Actionable information over broad listings**
* **Time savings for users over exhaustive search**

---

## Key User Problem Being Solved

Existing platforms (e.g. coupon sites, general directories) suffer from:

* High noise / outdated information
* Unreliable discount listings
* Users wasting time testing invalid offers
* Lack of execution-level truth (what actually works in practice)

This system is designed to avoid “RetailMeNot-style junk data” by aggressively filtering and verifying information before it is shown.

---

## Data Philosophy (Critical Design Principle)

Each listing represents a **claim about real-world food access**, not just a suggestion.

We explicitly distinguish between:

* **Observed claims** (unverified user reports)
* **Business claims** (self-reported by owners/staff)
* **Verified claims** (confirmed by trained volunteers)
* **Maintained claims** (recently re-checked and still valid)

Only **verified + maintained data** is shown prominently to users.

---

## Verification Model

### Two-tier contributor system

#### 1. Casual Volunteers (High volume, low trust)

* Walk neighborhoods (“1 block at a time” model)
* Submit observed discounts or signage
* Capture raw leads (not final truth)
* Goal: generate coverage and discovery

#### 2. Approved Verifiers (Low volume, high trust)

* Call businesses or verify in person
* Confirm real-world execution (not just stated policy)
* Resolve conflicts between claims
* Maintain data freshness

---

## Key Insight: Execution vs Policy

A major design requirement:

> The system must reflect what actually works for a customer, not just what a business claims.

Example:

* A “senior discount” is only valid if staff consistently apply it in practice
* Policies that are not enforced are treated as unreliable or downgraded

---

## Business Participation System (High Priority Feature)

### QR-based Business Update Flow

* Each listing has a QR code
* Business scans QR → lands on pre-filled listing page
* Owner/manager can:

  * confirm existing info
  * update details
  * deactivate or reactivate offers

### Structured data requirements:

* discount type
* eligibility rules
* timing/availability
* expiration (if applicable)
* enforcement reliability (“always applied vs inconsistent”)

---

## Identity & Trust Binding (Important)

To prevent spoofing or false “official” updates:

* Business updates should require **identity binding**, such as:

  * verified business email domain, OR
  * SMS verification to listed business phone, OR
  * manual claim approval

Goal:

> Ensure only legitimate business representatives can submit “official” updates

---

## Data Quality Controls

### Submission filtering (critical)

Not all submitted data becomes visible.

Pipeline:

1. User submission (raw signal)
2. Aggregation / clustering of similar reports
3. Confidence scoring (based on volume + agreement)
4. Verification queue (selective, not exhaustive review)
5. Publication only after passing verification thresholds

---

## Verification Metadata Requirements

Each verified listing includes:

* Verifier identity (approved volunteer)
* Verification date
* Verification method:

  * phone call
  * in-person visit
  * website confirmation
  * owner confirmation
* Optional evidence (URL, notes, etc.)

---

## Trust & Freshness Model

Listings are continuously evaluated based on:

* Time since last verification
* Source type (owner vs independent verifier)
* Frequency of change (seasonal vs stable listings)

Optional labels:

* Owner verified (recent / stale)
* Volunteer verified (recent / stale)
* Needs re-verification

---

## Volunteer System Design Goals

* Casual volunteers can contribute in ~1 hour increments
* Structured tasks prevent low-quality submissions
* Verifiers are shielded from “dead lead overload” via prioritization logic
* Volunteers are motivated by clear, local impact (“1 block mapping” model)

---

## Key Design Principles

* **Never delete truth; only supersede it**
* **Separate observation from verification**
* **Optimize for execution-level reality**
* **Show uncertainty when it exists instead of hiding it**
* **Prefer missing data over misleading data**
* **Minimize user decision fatigue by maximizing precision**

---

## Product Vision Shift

This system is not:

* a coupon site
* a directory
* a crowdsourced listing app

It is:

> a **curated, continuously-verified civic registry of food access and discounts**

Optimized for:

* speed of decision-making
* reliability of outcomes
* real-world usability under financial stress

---

If you want, I can also turn this into:

* a database schema (tables + states + transitions), or
* a “verification workflow spec” for your moderator UI, or
* an MVP feature roadmap split into phases (0 → launch → scale)
