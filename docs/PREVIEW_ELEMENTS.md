# Live Preview Elements Documentation

Complete reference of all elements in the A4 document preview.

---

## Page Structure

```
#a4Page (297mm x 210mm landscape)
├── .header-bar                    // Colored bar at top
├── .logo-area                     // Company logo container
│   └── #logoImg                   // Logo image
├── .document-header               // Title section
│   └── #disp_title                // Main title (Unit Model)
├── .content-row                   // Two-column layout
│   ├── .col-left (40%)            // Data tables
│   │   ├── Table: Property Details
│   │   ├── Table: Financial Breakdown
│   │   ├── Table: Property Status (Ready only)
│   │   └── Table: Payment Plan (Off-Plan only)
│   └── .col-right (60%)           // Floor plan
│       └── #floorPlanImg          // Floor plan image
├── .footer-area                   // Bottom right
│   ├── #disp_proj                 // Project name
│   └── .footer-sub                // "SALE OFFER"
└── .created-by-footer             // Agent credit line
```

---

## 1. Header Bar

| Element | ID/Class | Description |
|---------|----------|-------------|
| Header Bar | `.header-bar` | 8mm colored bar at top, uses brand color |

**CSS Variable:** `--primary-color` (default: `#62c6c1`)

---

## 2. Logo Area

| Element | ID/Class | Description |
|---------|----------|-------------|
| Container | `.logo-area` | Positioned top-right (12mm from top, 15mm from right) |
| Image | `#logoImg` | Company logo, max 60px height |

**Source:** Uploaded via Settings > Branding

---

## 3. Document Header

| Element | ID/Class | Description | Source Input |
|---------|----------|-------------|--------------|
| Main Title | `#disp_title` | Unit model (e.g., "1 Bedroom") | `#u_bed` select |

**Font:** 40px, bold, dark gray (#1f2937)

---

## 4. Property Details Table

| Row ID | Label | Value ID | Source Input | Visibility |
|--------|-------|----------|--------------|------------|
| - | Unit No | `#disp_unit_no` | `#u_unitno` | Always |
| - | Unit Type | `#disp_unit_type` | `#u_unittype` | Always |
| - | Views | `#disp_views` | `#u_views` | Always |
| `#disp_row_internal` | Internal Area (Sq.Ft) | `#disp_internal` | `#u_internal` | Standard units |
| `#disp_row_balcony` | Balcony Area (Sq.Ft) | `#disp_balcony` | `#u_balcony` | Standard units |
| `#disp_row_area` | Total Area (Sq.Ft) | `#disp_area` | `#u_area` (calculated) | Standard units |

### Villa/Townhouse Rows (hidden by default)

| Row ID | Label | Value ID | Source Input |
|--------|-------|----------|--------------|
| `#disp_row_villa_internal` | Internal Area (Sq.Ft) | `#disp_villa_internal` | `#u_villa_internal` |
| `#disp_row_villa_terrace` | Balcony/Terrace (Sq.Ft) | `#disp_villa_terrace` | `#u_villa_terrace` |
| `#disp_row_bua` | BUA - Built-Up Area (Sq.Ft) | `#disp_bua` | `#u_bua` |
| `#disp_row_gfa` | GFA - Gross Floor Area (Sq.Ft) | `#disp_gfa` | `#u_gfa` |
| `#disp_row_villa_total` | Total Area (Sq.Ft) | `#disp_villa_total` | `#u_villa_total` |
| `#disp_row_plotsize` | Plot Size (Sq.Ft) | `#disp_plotsize` | `#u_plotsize` |

### Plot Rows (hidden by default)

| Row ID | Label | Value ID | Source Input |
|--------|-------|----------|--------------|
| `#disp_row_plot_size` | Plot Size (Sq.Ft) | `#disp_plot_size` | `#u_plot_size` |
| `#disp_row_allowed_build` | Allowed Build Area (Sq.Ft) | `#disp_allowed_build` | `#u_allowed_build` |

---

## 5. Financial Breakdown Table

| Row ID | Label ID | Label Text | Value ID | Source Input | Visibility |
|--------|----------|------------|----------|--------------|------------|
| `#disp_row_orig` | - | Original Price | `#disp_orig` | `#u_orig` | Off-Plan / Toggle |
| - | - | Selling Price | `#disp_sell` | `#u_sell` | Always |
| `#disp_divider_offplan` | - | (divider) | - | - | Off-Plan only |
| `#disp_row_paid` | `#label_paid` | Refund (Amount Paid to Developer) | `#disp_paid` | `#u_paid` | Off-Plan only |
| `#disp_row_bal` | `#label_bal` | Balance Resale Clause | `#disp_bal` | `#u_bal` | Off-Plan only |
| `#disp_row_prem` | `#label_prem` | Premium (Selling Price - Original Price) | `#disp_prem` | `#u_prem` | Off-Plan only |
| - | `#label_adm` | Admin Fees (SAAS) | `#disp_adm` | `#u_adm` | Always |
| - | `#label_trans` | ADGM (2% of Original Price) | `#disp_trans` | `#u_trans` | Always |
| - | `#label_adgm_term` | ADGM Termination Fee | `#disp_adgm_term` | `#u_adgm_term` | Always |
| - | `#label_adgm_elec` | ADGM Electronic Service Fee | `#disp_adgm_elec` | `#u_adgm_elec` | Always |
| - | `#label_broker` | Agency Fees (2% of Selling Price + Vat) | `#disp_broker` | `#u_broker` | Always |
| - | - | Total Initial Payment | `#disp_total` | Calculated | Always |

**Note:** Labels can be customized via Settings > Field Labels

---

## 6. Property Status Table (Ready Property Only)

**Table ID:** `#propertyStatusTable`
**Visibility:** Only shown when category = "ready"

| Row ID | Label | Value ID | Source Input | Toggle Target |
|--------|-------|----------|--------------|---------------|
| `#disp_row_projecthandover` | Project Completion | `#disp_projecthandover` | Date selectors | `disp_row_projecthandover` |
| `#disp_row_projectage` | Project Age | `#disp_projectage` | Calculated | `disp_row_projectage` |
| `#disp_row_unithandover` | Unit Received | `#disp_unithandover` | Date selectors | `disp_row_unithandover` |
| `#disp_row_unitownership` | Unit Ownership | `#disp_unitownership` | Calculated | `disp_row_unitownership` |
| - | (divider) | - | - | - |
| `#disp_row_occupancy` | Status | `#disp_occupancy` | Occupancy buttons | `disp_row_occupancy` |
| `#disp_row_currentrent` | Current Rent | `#disp_currentrent` | `#u_currentrent` | `disp_row_currentrent` |
| `#disp_row_leaseuntil` | Lease Until | `#disp_leaseuntil` | `#u_leaseuntil` | `disp_row_leaseuntil` |
| `#disp_row_rentrefund` | Rent Refund | `#disp_rentrefund` | `#u_rentrefund` | `disp_row_rentrefund` |
| `#disp_row_servicecharge` | Service Charge | `#disp_servicecharge` | `#u_servicecharge` | `disp_row_servicecharge` |

---

## 7. Payment Plan Table (Off-Plan Only)

**Table ID:** `#previewPaymentPlanTable`
**Title ID:** `#paymentPlanTitle`
**Body ID:** `#pp_body`
**Visibility:** Only shown when category = "offplan"

| Column | Header | Content |
|--------|--------|---------|
| 1 | Date Of Payment | Payment date/milestone |
| 2 | % | Percentage of total |
| 3 | Amount (AED) | Calculated amount |

**Source:** `#paymentPlanBody` table in input panel

---

## 8. Floor Plan Image

| Element | ID/Class | Description |
|---------|----------|-------------|
| Container | `.col-right` | 60% width, centered |
| Frame | `.floorplan-frame` | Border container |
| Image | `#floorPlanImg` | Floor plan image |
| Placeholder | `#imgPlaceholder` | Shown when no image |

**Source:** `#fp_upload` file input

---

## 9. Footer Area

| Element | ID/Class | Description | Source |
|---------|----------|-------------|--------|
| Container | `.footer-area` | Bottom-right positioned | - |
| Project Name | `#disp_proj` | Project name, uppercase | `#inp_proj` |
| Subtitle | `.footer-sub` | "SALE OFFER" text | Static |

**Font:** Project name 18px bold, subtitle 12px brand color

---

## 10. Created By Footer

| Element | Class | Description |
|---------|-------|-------------|
| Footer | `.created-by-footer` | Centered at bottom |

**Content:** "Created by [Agent Name] - [Title] - [Company]"
**Font:** 9px, gray (#6b7280), uppercase

---

## Element ID Summary

### Display Values (disp_*)

| ID | Table | Description |
|----|-------|-------------|
| `disp_title` | Header | Unit model title |
| `disp_unit_no` | Property | Unit number |
| `disp_unit_type` | Property | Unit type |
| `disp_views` | Property | Views |
| `disp_internal` | Property | Internal area |
| `disp_balcony` | Property | Balcony area |
| `disp_area` | Property | Total area |
| `disp_villa_internal` | Property | Villa internal area |
| `disp_villa_terrace` | Property | Villa terrace area |
| `disp_bua` | Property | Built-up area |
| `disp_gfa` | Property | Gross floor area |
| `disp_villa_total` | Property | Villa total area |
| `disp_plotsize` | Property | Plot size |
| `disp_plot_size` | Property | Plot size (alt) |
| `disp_allowed_build` | Property | Allowed build area |
| `disp_orig` | Financial | Original price |
| `disp_sell` | Financial | Selling price |
| `disp_paid` | Financial | Refund amount |
| `disp_bal` | Financial | Balance resale |
| `disp_prem` | Financial | Premium |
| `disp_adm` | Financial | Admin fees |
| `disp_trans` | Financial | ADGM fee |
| `disp_adgm_term` | Financial | ADGM termination |
| `disp_adgm_elec` | Financial | ADGM electronic |
| `disp_broker` | Financial | Agency fees |
| `disp_total` | Financial | Total payment |
| `disp_projecthandover` | Status | Project completion |
| `disp_projectage` | Status | Project age |
| `disp_unithandover` | Status | Unit received |
| `disp_unitownership` | Status | Unit ownership |
| `disp_occupancy` | Status | Occupancy status |
| `disp_currentrent` | Status | Current rent |
| `disp_leaseuntil` | Status | Lease until |
| `disp_rentrefund` | Status | Rent refund |
| `disp_servicecharge` | Status | Service charge |
| `disp_proj` | Footer | Project name |

### Row Visibility (disp_row_*)

| ID | Controls |
|----|----------|
| `disp_row_internal` | Internal area row |
| `disp_row_balcony` | Balcony area row |
| `disp_row_area` | Total area row |
| `disp_row_villa_internal` | Villa internal row |
| `disp_row_villa_terrace` | Villa terrace row |
| `disp_row_bua` | BUA row |
| `disp_row_gfa` | GFA row |
| `disp_row_villa_total` | Villa total row |
| `disp_row_plotsize` | Plot size row |
| `disp_row_plot_size` | Plot size row (alt) |
| `disp_row_allowed_build` | Allowed build row |
| `disp_row_orig` | Original price row |
| `disp_divider_offplan` | Divider row |
| `disp_row_paid` | Refund row |
| `disp_row_bal` | Balance row |
| `disp_row_prem` | Premium row |
| `disp_row_projecthandover` | Project completion row |
| `disp_row_projectage` | Project age row |
| `disp_row_unithandover` | Unit received row |
| `disp_row_unitownership` | Unit ownership row |
| `disp_row_occupancy` | Occupancy row |
| `disp_row_currentrent` | Current rent row |
| `disp_row_leaseuntil` | Lease until row |
| `disp_row_rentrefund` | Rent refund row |
| `disp_row_servicecharge` | Service charge row |

### Labels (label_*)

| ID | Default Text | Customizable |
|----|--------------|--------------|
| `label_paid` | Refund (Amount Paid to Developer) | Yes |
| `label_bal` | Balance Resale Clause | Yes |
| `label_prem` | Premium (Selling Price - Original Price) | Yes |
| `label_adm` | Admin Fees (SAAS) | Yes |
| `label_trans` | ADGM (2% of Original Price) | Yes |
| `label_adgm_term` | ADGM Termination Fee | No |
| `label_adgm_elec` | ADGM Electronic Service Fee | No |
| `label_broker` | Agency Fees (2% of Selling Price + Vat) | Yes |

---

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.data-table` | Two-column label/value table |
| `.pp-table` | Payment plan table |
| `.table-title` | Section header (caption) |
| `.row-label` | Left column (labels) |
| `.row-value` | Right column (values) |
| `.row-value-bold` | Bold value |
| `.total-row` | Highlighted total row |
| `.divider-row` | Visual separator |
| `.header-bar` | Colored top bar |
| `.logo-area` | Logo container |
| `.logo-img` | Logo image |
| `.document-header` | Title section |
| `.main-title` | Main title text |
| `.content-row` | Two-column layout |
| `.col-left` | Left column (40%) |
| `.col-right` | Right column (60%) |
| `.floorplan-frame` | Floor plan container |
| `.footer-area` | Footer container |
| `.footer-proj` | Project name |
| `.footer-sub` | "SALE OFFER" text |
| `.created-by-footer` | Agent credit |

---

## Template Variations

| Template | Page Size | Orientation |
|----------|-----------|-------------|
| `landscape` | 297mm x 210mm | Landscape |
| `portrait` | 210mm x 297mm | Portrait |
| `minimal` | 297mm x 210mm | Landscape (simplified) |

---

*Generated for Sales Offer Generator v1.0*
