# Excel Data Retrieval Logic - Audit Report

## Overview
This document explains how the sales offer generator extracts data from Excel files.

## Excel Structure Mapping

### Data Source: SheetJS Library
- Uses `XLSX.read()` to parse Excel files
- Converts to JSON array format: `jsonData[row][column]`
- **Important**: Excel rows/columns are 0-indexed in JavaScript arrays

---

## COLUMN 1: PROJECT DETAILS

### Row Mapping (Column Index 1 = Column B in Excel)

| Excel Row | Array Index | Field Name | HTML Element | Notes |
|-----------|-------------|------------|--------------|-------|
| Row 1 | `jsonData[1][1]` | Project Name | `inp_proj` | Converted to UPPERCASE |
| Row 2 | `jsonData[2][1]` | Unit No | `u_unitno` | e.g., "05 Layout" |
| Row 3 | `jsonData[3][1]` | Unit Type | `u_unittype` | e.g., "Apartment" |
| Row 4 | `jsonData[4][1]` | Unit Model | `inp_title` + `u_bed` | Extracts bedroom count via regex |
| Row 5 | `jsonData[5][1]` | Views | `u_views` | e.g., "Mangrove Views" |
| Row 6 | `jsonData[6][1]` | Internal Area | `u_internal` | Parsed as float |
| Row 7 | `jsonData[7][1]` | Balcony Area | `u_balcony` | Parsed as float |
| Row 8 | `jsonData[8][1]` | Total Area | `u_area` | Only used if Internal/Balcony not set |
| Row 8 | `jsonData[8][3]` | Original Price | `u_orig` | Column D (index 3) |
| Row 9 | `jsonData[9][1]` | Selling Price | `u_sell` | Parsed as float, rounded |

### Special Logic:
- **Unit Model (Row 4)**: 
  - Sets both `inp_title` (full text) and `u_bed` (extracted bedroom count)
  - Regex: `/(\d+)\s*bedroom/i` to extract number
  - Falls back to "Studio" if contains "studio"
  
- **Total Area**: 
  - Auto-calculated from Internal + Balcony if both provided
  - Only uses Row 8 value if Internal/Balcony are empty

---

## COLUMN 4: INITIAL PAYMENTS

### Row Mapping (Column Index 4 = Column E in Excel)

| Excel Row | Array Index | Field Name | HTML Element | Mapping |
|-----------|-------------|------------|--------------|---------|
| Row 1 | `jsonData[1][4]` | Refund (30%) | `u_paid` | "Paid to Developer" |
| Row 2 | `jsonData[2][4]` | Balance Resale Clause | `u_bal` | "Resale Top-up" |
| Row 3 | `jsonData[3][4]` | Premium | `u_prem` | Selling - Original |
| Row 4 | `jsonData[4][4]` | Admin Fees | `u_adm` | SAAS Admin Fees |
| Row 5 | `jsonData[5][4]` | ADGM (2%) | `u_trans` | "Transfer Fees" |
| Row 6 | `jsonData[6][4]` | Agency Fees | `u_broker` | "Broker Fees" |

### Data Processing:
- All values parsed as `parseFloat()`
- Rounded using `Math.round()`
- Checks for `undefined` and empty strings before parsing

---

## COLUMNS 9-11: PAYMENT PLAN

### Column Mapping
- **Column 9** (Index 9 = Column J): Percentage
- **Column 10** (Index 10 = Column K): Date
- **Column 11** (Index 11 = Column L): Amount

### Row Scanning Logic:
```javascript
for (let i = 1; i < jsonData.length && i < 10; i++) {
    // Checks rows 1-9 (Excel rows 2-10)
    // Looks for data in columns 9, 10, 11
}
```

### Date Formatting:
1. **Text Dates**: 
   - "On Booking" → Kept as-is
   - "On Handover" → Kept as-is
   
2. **Date Objects**: 
   - Converts to "DD MMM YYYY" format
   - Example: `2025-02-01` → `01 Feb 2025`

3. **String Dates**: 
   - Attempts `new Date()` parsing
   - Falls back to original string if parsing fails

### Percentage Formatting:
- Removes `%` symbol if present
- Parses as float
- Keeps as number (no % added during extraction)

### Amount Formatting:
- Removes: "AED", "Paid", commas
- Parses as float
- Rounds to nearest integer

### Output Format:
```
Date,Percent,Amount
On Booking,0.1,211894
01 Feb 2025,0.1,211894
01 Jun 2025,0.1,211894
On Handover,0.7,1483258
```

---

## POTENTIAL ISSUES IDENTIFIED

### ⚠️ Issue 1: Payment Plan Row Range
**Current**: Scans rows 1-9 (Excel rows 2-10)
**Expected**: Should scan rows 2-5 based on plan document
**Impact**: May pick up incorrect data if payment plan is in different rows

### ⚠️ Issue 2: Column Index Assumptions
**Assumption**: Column 1 = Index 1, Column 4 = Index 4, etc.
**Reality**: If Excel has empty columns at start, indices will shift
**Impact**: Data may map to wrong fields

### ⚠️ Issue 3: Total Area Calculation
**Logic**: Only calculates if BOTH Internal AND Balcony are provided
**Issue**: If only one is provided, Total Area won't auto-calculate
**Fix Needed**: Should calculate if at least one is provided

### ⚠️ Issue 4: Empty Cell Handling
**Current**: Checks `!== undefined && !== ''`
**Issue**: May miss `null` or `0` values that are valid
**Impact**: Valid zero values might be skipped

---

## TESTING RECOMMENDATIONS

1. **Test with actual Book1.xlsx**:
   - Verify all fields populate correctly
   - Check Payment Plan extraction
   - Validate date formatting

2. **Test edge cases**:
   - Empty cells
   - Zero values
   - Missing columns
   - Different date formats

3. **Test calculations**:
   - Total Area auto-calculation
   - Premium auto-calculation
   - Total fees sum

---

## RECOMMENDED FIXES

1. **Fix Payment Plan row range** to match actual Excel structure
2. **Add column detection** to handle variable Excel layouts
3. **Improve Total Area calculation** to work with partial data
4. **Add validation** for required fields
5. **Add debug logging** to show what data was extracted

