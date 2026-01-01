# Sales Offer Generator — Field Reference

**Version:** 1.0
**Last Updated:** 2026-01-01

This document lists all fields in the Sales Offer Generator, their data sources, calculations, and default values.

---

## Table of Contents

1. [Property Details](#property-details)
2. [Area Fields (Standard)](#area-fields-standard)
3. [Area Fields (Villa/Townhouse)](#area-fields-villatownhouse)
4. [Area Fields (Plot)](#area-fields-plot)
5. [Financial Breakdown](#financial-breakdown)
6. [Off-Plan Resale Fields](#off-plan-resale-fields)
7. [Fee Fields](#fee-fields)
8. [Ready Property Fields](#ready-property-fields)
9. [Payment Plan](#payment-plan)

---

## Legend

| Symbol         | Meaning                               |
| -------------- | ------------------------------------- |
| **Excel**      | Value can be imported from Excel file |
| **Manual**     | User enters value manually            |
| **Calculated** | Auto-calculated from other fields     |
| **Dropdown**   | Selection from predefined options     |
| **Default**    | Has a default value                   |

---

## Property Details

| Field            | Form ID      | Example Value | Source           | Notes                                                               |
| ---------------- | ------------ | ------------- | ---------------- | ------------------------------------------------------------------- |
| **Project Name** | `inp_proj`   | REEM EIGHT    | Excel / Manual   | Excel headers: `project`, `project name`, `development`, `building` |
| **Unit No**      | `u_unitno`   | 05 Layout     | Excel / Manual   | Excel headers: `unit`, `unit no`, `unit number`, `apt`, `apartment` |
| **Unit Type**    | `u_unittype` | Apartment     | Excel / Manual   | Excel headers: `type`, `unit type`, `property type`                 |
| **Unit Model**   | `u_bed`      | 1 Bedroom     | Excel / Dropdown | Excel headers: `bedroom`, `bedrooms`, `bed`, `beds`, `br`, `model`  |
| **Views**        | `u_views`    | Sea View      | Excel / Dropdown | Excel headers: `view`, `views`, `facing`, `orientation`             |

### Unit Model Options (Dropdown)

- Studio
- 1 Bedroom / 1 Bedroom + Maid
- 2 Bedroom / 2 Bedroom + Maid / 2 Bedroom + Store & Laundry
- 3 Bedroom / 3 Bedroom + Maid
- 4 Bedroom / 4 Bedroom + Maid
- 5 Bedroom / 5 Bedroom + Maid
- 6 Bedroom / 7 Bedroom
- Penthouse / Duplex / Townhouse / Villa

### Views Options (Dropdown)

- Sea View, Marina View, Garden View, Pool View
- City View, Park View, Golf View, Mangrove View
- Lake View, Boulevard View, Community View
- Landmark View, Skyline View, Canal View, Courtyard View

---

## Area Fields (Standard)

For apartments and standard units.

| Field             | Form ID      | Example Value | Source         | Notes                                                                          |
| ----------------- | ------------ | ------------- | -------------- | ------------------------------------------------------------------------------ |
| **Internal Area** | `u_internal` | 918.38        | Excel / Manual | Excel headers: `internal`, `internal area`, `built up`, `bua`, `sqft internal` |
| **Balcony Area**  | `u_balcony`  | 173.94        | Excel / Manual | Excel headers: `balcony`, `balcony area`, `terrace`, `outdoor`                 |
| **Total Area**    | `u_area`     | 1092.32 Sq.Ft | **Calculated** | See formula below                                                              |

### Total Area Calculation

```
Total Area = Internal Area + Balcony Area
```

**Example:**

- Internal: 918.38 Sq.Ft
- Balcony: 173.94 Sq.Ft
- **Total: 1,092.32 Sq.Ft**

_Note: Field can be "locked" to override auto-calculation with manual value._

---

## Area Fields (Villa/Townhouse)

Shown when Unit Model is Townhouse or Villa.

| Field                      | Form ID            | Example Value | Source         | Notes                       |
| -------------------------- | ------------------ | ------------- | -------------- | --------------------------- |
| **Internal Area**          | `u_villa_internal` | 2500          | Manual         | Villa internal living space |
| **Balcony/Terrace**        | `u_villa_terrace`  | 500           | Manual         | Outdoor covered area        |
| **BUA (Built-Up Area)**    | `u_bua`            | 3000 Sq.Ft    | **Calculated** | = Internal + Terrace        |
| **GFA (Gross Floor Area)** | `u_gfa`            | 3500          | Manual         | Total enclosed area         |
| **Total Area**             | `u_villa_total`    | 4000          | Manual         | Total property area         |
| **Plot Size**              | `u_plotsize`       | 8000          | Manual         | Land plot size              |

### BUA Calculation

```
BUA = Villa Internal Area + Terrace Area
```

---

## Area Fields (Plot)

Shown when Unit Type is Plot/Land.

| Field                  | Form ID           | Example Value | Source | Notes                  |
| ---------------------- | ----------------- | ------------- | ------ | ---------------------- |
| **Plot Size**          | `u_plot_size`     | 10000         | Manual | Total land area        |
| **Allowed Build Area** | `u_allowed_build` | 6000          | Manual | Maximum buildable area |

---

## Financial Breakdown

### Price Fields

| Field              | Form ID  | Example Value | Source         | Notes                                                                                                                    |
| ------------------ | -------- | ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Original Price** | `u_orig` | 2,118,940     | Excel / Manual | Developer purchase price. Excel headers: `original`, `original price`, `list price`, `developer price`, `purchase price` |
| **Selling Price**  | `u_sell` | 2,500,000     | Excel / Manual | Asking price. Excel headers: `selling`, `selling price`, `offer price`, `sale price`, `asking price`                     |

---

## Off-Plan Resale Fields

These fields appear only for Off-Plan Resale category.

| Field                     | Form ID               | Example Value | Source         | Calculation                                           |
| ------------------------- | --------------------- | ------------- | -------------- | ----------------------------------------------------- |
| **Resale Clause %**       | `u_resaleclause`      | 40            | Manual         | Developer's minimum payment requirement before resale |
| **Amount Paid %**         | `u_amountpaidpercent` | 20            | Manual         | Percentage already paid to developer                  |
| **Amount Paid (AED)**     | `u_amountpaid`        | 500,000       | Manual         | Direct AED amount (overrides %)                       |
| **Refund**                | `u_paid`              | 400,000       | **Calculated** | See formula below                                     |
| **Balance Resale Clause** | `u_bal`               | 400,000       | **Calculated** | See formula below                                     |
| **Premium**               | `u_prem`              | 381,060       | **Calculated** | See formula below                                     |

### Refund Calculation

Amount to be refunded to the original buyer.

```
IF Amount Paid (AED) > 0:
    Refund = Amount Paid (AED)
ELSE IF Amount Paid % > 0:
    Refund = Original Price × (Amount Paid % / 100)
ELSE:
    Refund = 0
```

**Example:**

- Original Price: AED 2,000,000
- Amount Paid %: 20%
- **Refund = 2,000,000 × 0.20 = AED 400,000**

### Balance Resale Clause Calculation

Additional amount buyer must pay to meet developer's resale requirements.

```
IF Amount Paid % < Resale Clause %:
    Balance = (Resale Clause % - Amount Paid %) × Original Price / 100
ELSE:
    Balance = 0
```

**Example:**

- Original Price: AED 2,000,000
- Resale Clause: 40%
- Amount Paid: 20%
- **Balance = (40% - 20%) × 2,000,000 = AED 400,000**

### Premium Calculation

Profit/markup being added to the original price.

```
Premium = Selling Price - Original Price
```

**Example:**

- Original: AED 2,000,000
- Selling: AED 2,500,000
- **Premium = AED 500,000**

_Note: Can be negative for distressed sales._

---

## Fee Fields

| Field                    | Form ID       | Example Value | Source         | Calculation                  | Default |
| ------------------------ | ------------- | ------------- | -------------- | ---------------------------- | ------- |
| **Admin Fees (SAAS)**    | `u_adm`       | 5,250         | Excel / Manual | None                         | None    |
| **ADGM**                 | `u_trans`     | 50,000        | **Calculated** | 2% of Original Price         | None    |
| **ADGM Termination Fee** | `u_adgm_term` | 505           | Manual         | None                         | **505** |
| **ADGM Electronic Fee**  | `u_adgm_elec` | 525           | Manual         | None                         | **525** |
| **Agency Fees**          | `u_broker`    | 52,500        | **Calculated** | 2% of Selling Price + 5% VAT | None    |

### ADGM Calculation

Abu Dhabi Global Market registration fee.

```
ADGM = Original Price × 0.02
```

**Example:**

- Original Price: AED 2,500,000
- **ADGM = 2,500,000 × 0.02 = AED 50,000**

_Why Original Price (not Selling): ADGM fee is based on the registered contract value._

### Agency Fees Calculation

Real estate agency commission.

```
Agency Fees = (Selling Price × 0.02) × 1.05
            = Selling Price × 0.021
```

**Breakdown:**

- Base (2%): Selling Price × 0.02
- VAT (5%): Base × 0.05
- Total: Base + VAT

**Example:**

- Selling Price: AED 2,500,000
- Base (2%): 2,500,000 × 0.02 = AED 50,000
- VAT (5%): 50,000 × 0.05 = AED 2,500
- **Total: AED 52,500**

---

## Total Initial Payment Calculation

### Off-Plan Resale Formula

```
Total = Refund + Balance + Premium + Admin + ADGM + ADGM Termination + ADGM Electronic + Agency
```

### Ready Property Formula

```
Total = Selling Price + Admin + ADGM + ADGM Termination + ADGM Electronic + Agency
```

---

## Ready Property Fields

These fields appear only for Ready Property category.

### Handover Dates

| Field                         | Form ID                    | Example Value   | Source   | Notes                           |
| ----------------------------- | -------------------------- | --------------- | -------- | ------------------------------- |
| **Project Completion Type**   | `u_projecthandover_type`   | Month / Quarter | Dropdown | Format selector                 |
| **Project Completion Period** | `u_projecthandover_period` | 6 (Jun)         | Dropdown | Month (1-12) or Quarter (Q1-Q4) |
| **Project Completion Year**   | `u_projecthandover_year`   | 2020            | Manual   | Year (2000-2050)                |
| **Unit Received Type**        | `u_unithandover_type`      | Month / Quarter | Dropdown | Format selector                 |
| **Unit Received Period**      | `u_unithandover_period`    | 8 (Aug)         | Dropdown | Month (1-12)                    |
| **Unit Received Year**        | `u_unithandover_year`      | 2021            | Manual   | Year                            |

### Calculated Ages

| Field              | Form ID           | Example Value    | Source         | Notes                          |
| ------------------ | ----------------- | ---------------- | -------------- | ------------------------------ |
| **Project Age**    | `u_projectage`    | 5 Years 6 Months | **Calculated** | From Project Completion to now |
| **Unit Ownership** | `u_unitownership` | 4 Years 5 Months | **Calculated** | From Unit Received to now      |

### Occupancy Status

| Field      | Form ID   | Options                          | Default        |
| ---------- | --------- | -------------------------------- | -------------- |
| **Status** | (buttons) | Owner Occupied / Vacant / Leased | Owner Occupied |

### Lease Details (shown when Leased)

| Field              | Form ID           | Example Value | Source | Notes                  |
| ------------------ | ----------------- | ------------- | ------ | ---------------------- |
| **Current Rent**   | `u_currentrent`   | 85,000        | Manual | Annual rent in AED     |
| **Lease Until**    | `u_leaseuntil`    | 2025-12-31    | Manual | Date picker            |
| **Rent Refund**    | `u_rentrefund`    | Yes/No        | Manual | Pro-rata refund toggle |
| **Service Charge** | `u_servicecharge` | 15,000        | Manual | Annual service charge  |

---

## Payment Plan

For Off-Plan Resale properties.

| Column           | Example Value | Source         | Notes                                     |
| ---------------- | ------------- | -------------- | ----------------------------------------- |
| **Date**         | 15 Mar 2025   | Excel / Manual | Excel converts serial dates automatically |
| **Percentage**   | 10            | Excel / Manual | Payment percentage (should total 100%)    |
| **Amount (AED)** | 250,000       | Excel / Manual | Payment amount                            |

### Excel Import for Payment Plan

The system looks for payment plan data in Excel with these headers:

- Date column: `date`, `milestone`
- Percentage column: `%`, `percent`
- Amount column: `amount`, `aed`

Rows marked as "Paid" are automatically skipped.

### Payment Plan Validation

- Total percentage should equal 100%
- Warning shown if total does not match

---

## Excel Import Column Mapping

### Smart Header Detection

The system automatically detects columns based on header names (case-insensitive):

| Field          | Recognized Headers                                                              |
| -------------- | ------------------------------------------------------------------------------- |
| Project Name   | `project`, `project name`, `development`, `building`                            |
| Unit No        | `unit`, `unit no`, `unit number`, `apt`, `apartment`                            |
| Unit Type      | `type`, `unit type`, `property type`                                            |
| Bedrooms       | `bedroom`, `bedrooms`, `bed`, `beds`, `br`, `model`                             |
| Views          | `view`, `views`, `facing`, `orientation`                                        |
| Internal Area  | `internal`, `internal area`, `built up`, `bua`, `sqft internal`                 |
| Balcony Area   | `balcony`, `balcony area`, `terrace`, `outdoor`                                 |
| Total Area     | `total`, `total area`, `gross area`, `gfa`, `total sqft`                        |
| Original Price | `original`, `original price`, `list price`, `developer price`, `purchase price` |
| Selling Price  | `selling`, `selling price`, `offer price`, `sale price`, `asking price`         |
| Amount Paid    | `paid`, `amount paid`, `paid to developer`, `payment made`                      |
| Balance        | `balance`, `balance due`, `remaining`                                           |
| Premium        | `premium`, `profit`, `markup`                                                   |
| Admin Fees     | `admin`, `admin fee`, `admin fees`, `saas`                                      |
| ADGM           | `adgm`, `transfer`, `transfer fee`, `dld`                                       |
| Agency Fees    | `agency`, `agency fee`, `broker`, `commission`                                  |

### Sheet Selection

- For **Off-Plan**: Looks for sheet named "Offplan" (case-insensitive)
- For **Ready**: Looks for sheet named "Ready" (case-insensitive)
- Falls back to first sheet if specific sheet not found

### Legacy Format (Fixed Columns)

If smart detection fails, falls back to fixed column positions:

- Column C (index 2): Property details (rows 1-10)
- Column G (index 6): Financial data (rows 2-7)
- Columns J-L (index 9-11): Payment plan

---

## Field Lock Feature

Calculated fields can be "locked" to override auto-calculation with manual values:

- **Lockable fields:** Total Area, Refund, Balance, Premium, ADGM, Agency Fees
- **How it works:** Click the lock icon next to the field
- **When locked:** Field becomes editable, auto-calculation disabled
- **When unlocked:** Field recalculates automatically

---

## Default Values Summary

| Field                       | Default Value   |
| --------------------------- | --------------- |
| ADGM Termination Fee        | AED 505         |
| ADGM Electronic Service Fee | AED 525         |
| Property Category           | Off-Plan Resale |
| Occupancy Status            | Owner Occupied  |
| Show Property Status        | Yes             |
| Project Handover Type       | Month           |
| Unit Handover Type          | Month           |

---

## Currency Format

All currency values are displayed in **AED (UAE Dirham)** format:

- Format: `AED X,XXX,XXX`
- Thousands separator: comma
- No decimal places (rounded to whole numbers)

**Example:** `AED 2,500,000`

---

_Document generated for Sales Offer Generator v1.0_
