# PDF Verification Guide
## Based on DATASHEET1.xlsx Reference Data

### Where PDFs are Saved
**Location:** `C:\Users\Book5\Downloads\`

When you export PDFs from the browser, they are automatically saved to your Downloads folder with the filename you specify (e.g., `reem-eight.pdf`).

---

## Manual Verification Steps

### Step 1: Import DATASHEET1.xlsx (Recommended Method)

1. Open the Sales Offer Generator app at `http://localhost:8000`
2. Click **"Import Excel"** button
3. Select `DATASHEET1.xlsx` from your project folder
4. The app will automatically populate all fields from the Excel sheet

**OR** manually enter the data below:

---

## TEST 1: Off-Plan Resale PDF Verification

### Reference Data (from DATASHEET1.xlsx - Offplan Sheet)

| Field | Expected Value |
|-------|---------------|
| **Project Name** | Reem Eight |
| **Unit No** | 05 Layout |
| **Unit Type** | Apartment |
| **Unit Model** | 1 Bedroom |
| **Views** | Mangrove Views |
| **Internal Area** | 173.94 Sq.Ft |
| **Balcony Area** | 918.38 Sq.Ft |
| **Total Area** | 1092.32 Sq.Ft |
| **Original Price** | 2,118,940 AED |
| **Selling Price** | 2,500,000 AED |
| **Resale Clause %** | 40% |
| **Amount Paid %** | 40% |
| **Admin Fees** | 5,250 AED |

### Expected Calculated Values in PDF

| Field | Expected Value | Formula |
|-------|---------------|---------|
| **Refund** | 847,576 AED | Original × 40% = 2,118,940 × 0.40 |
| **Balance** | 0 AED | (Resale Clause % - Amount Paid %) × Original = (40% - 40%) × 2,118,940 |
| **Premium** | 381,060 AED | Selling - Original = 2,500,000 - 2,118,940 |
| **ADGM** | 50,000 AED | Selling × 2% = 2,500,000 × 0.02 |
| **Agency Fees** | 52,500 AED | Selling × 2.1% = 2,500,000 × 0.021 |
| **Total Initial Payment** | **1,336,386 AED** | Refund + Balance + Premium + Admin + ADGM + Agency |

### PDF Content Checklist

- [ ] **Header:** Kennedy Property logo visible
- [ ] **Title:** "FLOOR PLANS 1 Bedroom" (or similar)
- [ ] **Property Details Table:** All 8 rows with correct values
- [ ] **Financial Breakdown Table:** All values match expected amounts above
- [ ] **Payment Plan Table:** Shows 4 rows (10%, 10%, 10%, 70%)
- [ ] **Payment Plan Amounts:** Calculated from Original Price (not Selling Price)
  - 10% = 211,894 AED
  - 70% = 1,483,258 AED
- [ ] **Resale Footnote:** "* Allowed to sell prior to handover after 30% of the Purchase Price is paid."
- [ ] **Footer:** "Reem Eight" and "SALE OFFER"
- [ ] **Agent Credit:** "Created by Sanoop Syamalan - Associate Director - Kennedy Property Brokers LLC"

---

## TEST 2: Ready Property PDF Verification

### Switch to Ready Property Category

1. Click **"Ready Property"** button (top of form)
2. Import DATASHEET1.xlsx again (it will use the "Ready" sheet)
   **OR** manually enter the data below:

### Reference Data (from DATASHEET1.xlsx - Ready Sheet)

| Field | Expected Value |
|-------|---------------|
| **Project Name** | Reem Nine |
| **Unit No** | 06 Layout |
| **Unit Type** | Apartment |
| **Unit Model** | 2 Bedroom + Store & Laundry Room |
| **Views** | Reem Skyline Views |
| **Internal Area** | 1496 Sq.Ft |
| **Balcony Area** | 366 Sq.Ft |
| **Total Area** | 1862 Sq.Ft |
| **Selling Price** | 3,500,000 AED |
| **Admin Fees** | 5,250 AED |

### Expected Calculated Values in PDF

| Field | Expected Value | Formula |
|-------|---------------|---------|
| **ADGM** | 70,000 AED | Selling × 2% = 3,500,000 × 0.02 |
| **Agency Fees** | 73,500 AED | Selling × 2.1% = 3,500,000 × 0.021 |
| **Total Initial Payment** | **3,648,750 AED** | Selling + Admin + ADGM + Agency |

### PDF Content Checklist

- [ ] **Header:** Kennedy Property logo visible
- [ ] **Title:** "FLOOR PLANS 2 Bedroom + Store & Laundry Room"
- [ ] **Property Details Table:** All 8 rows with correct values
- [ ] **Financial Breakdown Table:** 
  - [ ] NO Refund field (hidden for Ready)
  - [ ] NO Balance field (hidden for Ready)
  - [ ] NO Premium field (hidden for Ready)
  - [ ] Selling Price: 3,500,000 AED
  - [ ] Admin Fees: 5,250 AED
  - [ ] ADGM: 70,000 AED
  - [ ] Agency Fees: 73,500 AED
  - [ ] Total: 3,648,750 AED
- [ ] **Property Status Section:** Visible (if dates entered)
- [ ] **NO Payment Plan Table:** Should be hidden for Ready Property
- [ ] **NO Resale Footnote:** Should be hidden for Ready Property
- [ ] **Footer:** "Reem Nine" and "SALE OFFER"

---

## Visual Quality Checks

### Layout & Formatting
- [ ] Text is readable and properly formatted
- [ ] Numbers are formatted with commas (e.g., 1,336,386 not 1336386)
- [ ] Currency symbol (AED) appears correctly
- [ ] Tables are properly aligned
- [ ] No text is cut off or overlapping
- [ ] Page margins are appropriate
- [ ] Logo/image quality is good

### Template Variations
Test all three templates:
- [ ] **Landscape:** Wide format, side-by-side layout
- [ ] **Portrait:** Tall format, vertical layout
- [ ] **Minimal:** Simplified layout

---

## Common Issues to Check

1. **Wrong Calculations:** Verify all formulas match expected values
2. **Missing Fields:** Ensure all required fields appear in PDF
3. **Hidden Fields:** Verify Off-plan fields are hidden in Ready mode
4. **Payment Plan:** Verify amounts are calculated from Original Price (not Selling Price)
5. **Text Wrapping:** Long project names should wrap properly
6. **Zero Values:** Fields with 0 should display "AED 0" not be blank

---

## Quick Verification Script

After exporting PDFs, verify they contain the correct values by:

1. Opening the PDF in Adobe Reader or browser
2. Using Ctrl+F to search for key values:
   - Search "1,336,386" in Offplan PDF
   - Search "3,648,750" in Ready PDF
   - Search "847,576" (Refund) in Offplan PDF
   - Search "381,060" (Premium) in Offplan PDF

---

## Summary

**PDFs Location:** `C:\Users\Book5\Downloads\`

**Files to Verify:**
- `reem-eight.pdf` (or your Offplan filename)
- `reem-nine.pdf` (or your Ready filename)

**Key Values to Verify:**
- **Offplan Total:** 1,336,386 AED
- **Ready Total:** 3,648,750 AED

If all values match, the PDF generation is working correctly! ✅

