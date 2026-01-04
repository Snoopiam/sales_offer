# PDF Quality Verification Report
## Based on DATASHEET1.xlsx Reference Data

### Reference Data Source
**File:** `DATASHEET1.xlsx`
- **Offplan Sheet:** Contains reference values for Off-Plan Resale
- **Ready Sheet:** Contains reference values for Ready Property

---

## TEST 1: Off-Plan Resale PDF Verification

### Step 1: Import DATASHEET1.xlsx (Offplan Sheet)
1. Ensure "Off-Plan Resale" category is selected
2. Click "Import Excel" button
3. Upload `DATASHEET1.xlsx`
4. Verify it imports from "Offplan" sheet

### Step 2: Expected Values (from DATASHEET1.xlsx - Offplan Sheet)

| Field | Expected Value | Field ID |
|-------|---------------|----------|
| Project Name | Reem Eight | inp_proj |
| Unit No | 05 Layout | u_unitno |
| Unit Type | Apartment | u_unittype |
| Unit Model | 1 Bedroom | u_bed |
| Views | Mangrove Views | u_views |
| Internal Area | 173.94 Sq.Ft | u_internal |
| Balcony Area | 918.38 Sq.Ft | u_balcony |
| Total Area | 1092.32 Sq.Ft | u_area (auto-calculated) |
| Original Price | 2,118,940 AED | u_orig |
| Selling Price | 2,500,000 AED | u_sell |
| **Refund** | **847,576 AED** | u_paid |
| **Balance** | **0 AED** | u_bal |
| **Premium** | **381,060 AED** | u_prem |
| Admin Fees | 5,250 AED | u_adm |
| ADGM (2%) | 50,000 AED | u_trans |
| Agency Fees (2%+VAT) | 52,500 AED | u_broker |
| **TOTAL INITIAL PAYMENT** | **1,336,386 AED** | totalDisplay |

### Step 3: Generate PDF
1. Click "Export" button
2. Select "PDF Document"
3. Filename: `OFFPLAN-VERIFIED.pdf`
4. Click "Export"

### Step 4: Verify PDF Content
**Open the generated PDF and verify:**

✅ **Property Details Section:**
- Project Name: Reem Eight
- Unit No: 05 Layout
- Unit Type: Apartment
- Unit Model: 1 Bedroom
- Views: Mangrove Views
- Internal Area: 173.94 Sq.Ft
- Balcony Area: 918.38 Sq.Ft
- Total Area: 1092.32 Sq.Ft

✅ **Financial Breakdown Section:**
- Original Price: AED 2,118,940
- Selling Price: AED 2,500,000
- Refund (Amount Paid to Developer): **AED 847,576** ⚠️ VERIFY THIS
- Balance Resale Clause: **AED 0** ⚠️ VERIFY THIS
- Premium: **AED 381,060** ⚠️ VERIFY THIS
- Admin Fees: AED 5,250
- ADGM: AED 50,000
- Agency Fees: AED 52,500
- **Total Initial Payment: AED 1,336,386** ⚠️ VERIFY THIS

✅ **Payment Plan Table:**
- Should show payment schedule with correct percentages and amounts

✅ **Resale Footnote:**
- "* Allowed to sell prior to handover after 30% of the Purchase Price is paid."

---

## TEST 2: Ready Property PDF Verification

### Step 1: Switch to Ready Property
1. Click "Ready Property" category button
2. Click "Import Excel" button
3. Upload `DATASHEET1.xlsx` again
4. Verify it imports from "Ready" sheet

### Step 2: Expected Values (from DATASHEET1.xlsx - Ready Sheet)

| Field | Expected Value | Field ID |
|-------|---------------|----------|
| Project Name | Reem Nine | inp_proj |
| Unit No | 06 Layout | u_unitno |
| Unit Type | Apartment | u_unittype |
| Unit Model | 2 Bedroom + Store & Laundry Room | u_bed |
| Views | Reem Skyline Views | u_views |
| Internal Area | 1,496 Sq.Ft | u_internal |
| Balcony Area | 366 Sq.Ft | u_balcony |
| Total Area | 1,862 Sq.Ft | u_area (auto-calculated) |
| Original Price | 2,519,949 AED | u_orig (if Show Original is enabled) |
| Selling Price | 3,500,000 AED | u_sell |
| Admin Fees | 5,250 AED | u_adm |
| ADGM (2%) | 70,000 AED | u_trans |
| Agency Fees (2%+VAT) | 73,500 AED | u_broker |
| **TOTAL INITIAL PAYMENT** | **2,668,699 AED** | totalDisplay |

### Step 3: Generate PDF
1. Click "Export" button
2. Select "PDF Document"
3. Filename: `READY-VERIFIED.pdf`
4. Click "Export"

### Step 4: Verify PDF Content
**Open the generated PDF and verify:**

✅ **Property Details Section:**
- Project Name: Reem Nine
- Unit No: 06 Layout
- Unit Type: Apartment
- Unit Model: 2 Bedroom + Store & Laundry Room
- Views: Reem Skyline Views
- Internal Area: 1,496 Sq.Ft
- Balcony Area: 366 Sq.Ft
- Total Area: 1,862 Sq.Ft

✅ **Financial Breakdown Section:**
- Selling Price: AED 3,500,000
- Admin Fees: AED 5,250
- ADGM: AED 70,000
- Agency Fees: AED 73,500
- **Total Initial Payment: AED 2,668,699** ⚠️ VERIFY THIS

✅ **Property Status Table:**
- Should show handover dates, ages, occupancy status

✅ **Missing Elements (Should NOT appear):**
- ❌ Refund row
- ❌ Balance Resale Clause row
- ❌ Premium row
- ❌ Payment Plan table
- ❌ Resale footnote

---

## Critical Verification Points

### ⚠️ KEY VALUES TO VERIFY IN PDFs:

**OFFPLAN PDF:**
1. **Refund = 847,576 AED** (40% of 2,118,940 = 847,576)
2. **Balance = 0 AED** (Already paid 40%, resale clause is 40%)
3. **Premium = 381,060 AED** (2,500,000 - 2,118,940)
4. **Total = 1,336,386 AED** (847,576 + 0 + 381,060 + 5,250 + 50,000 + 52,500)

**READY PDF:**
1. **Total = 2,668,699 AED** (3,500,000 + 5,250 + 70,000 + 73,500)
2. **No Off-plan rows** (Refund, Balance, Premium should be hidden)
3. **No Payment Plan table**

---

## PDF Location
After export, PDFs will be saved to:
- **Windows:** `C:\Users\[YourUsername]\Downloads\`
- **Filenames:** `OFFPLAN-VERIFIED.pdf` and `READY-VERIFIED.pdf`

---

## Next Steps
1. Import DATASHEET1.xlsx for Offplan category
2. Generate PDF and save as `OFFPLAN-VERIFIED.pdf`
3. Open PDF and verify all values match reference data above
4. Switch to Ready category
5. Import DATASHEET1.xlsx again (will use Ready sheet)
6. Generate PDF and save as `READY-VERIFIED.pdf`
7. Open PDF and verify all values match reference data above
8. Report any discrepancies found

