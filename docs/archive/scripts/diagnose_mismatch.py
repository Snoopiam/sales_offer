#!/usr/bin/env python3
"""Diagnose field mismatch between Excel and HTML extraction"""

import openpyxl

def diagnose():
    workbook = openpyxl.load_workbook("Book1.xlsx", data_only=True)
    sheet = workbook.active
    data = []
    for row in sheet.iter_rows(values_only=True):
        data.append(list(row))
    
    print("=" * 80)
    print("FIELD MAPPING DIAGNOSIS")
    print("=" * 80)
    
    print("\n📋 CURRENT EXTRACTION LOGIC:")
    print("-" * 80)
    print("Project Details: Column 2 (index 2)")
    print("Initial Payments: Column 6 (index 6)")
    print("Payment Plan: Columns 9-11 (indices 9-11)")
    
    print("\n💰 EXTRACTED VALUES (What JavaScript would extract):")
    print("-" * 80)
    
    # Project Details
    print("\nPROJECT DETAILS:")
    if len(data) > 0 and len(data[0]) > 2:
        print(f"  Project Name: {data[0][2]} (from [0][2])")
    if len(data) > 1 and len(data[1]) > 2:
        print(f"  Unit No: {data[1][2]} (from [1][2])")
    if len(data) > 2 and len(data[2]) > 2:
        print(f"  Unit Type: {data[2][2]} (from [2][2])")
    if len(data) > 3 and len(data[3]) > 2:
        print(f"  Unit Model: {data[3][2]} (from [3][2])")
    if len(data) > 4 and len(data[4]) > 2:
        print(f"  Views: {data[4][2]} (from [4][2])")
    if len(data) > 5 and len(data[5]) > 2:
        print(f"  Internal Area: {data[5][2]} (from [5][2])")
    if len(data) > 6 and len(data[6]) > 2:
        print(f"  Balcony Area: {data[6][2]} (from [6][2])")
    if len(data) > 7 and len(data[7]) > 2:
        print(f"  Total Area: {data[7][2]} (from [7][2])")
    if len(data) > 8 and len(data[8]) > 2:
        print(f"  Original Price: {data[8][2]} (from [8][2])")
    if len(data) > 9 and len(data[9]) > 2:
        print(f"  Selling Price: {data[9][2]} (from [9][2])")
    
    print("\nINITIAL PAYMENTS:")
    print("  (HTML Field) -> (Excel Label) -> (Value from Column 6)")
    print("-" * 80)
    
    mappings = [
        ("u_paid (Paid to Developer)", "Row 1: Refund (30% of Original Price)", 1, 6),
        ("u_bal (Resale Top-up)", "Row 2: Balance Resale Clause", 2, 6),
        ("u_prem (Premium)", "Row 3: Premium", 3, 6),
        ("u_adm (ADM Fee)", "Row 4: Admin Fees (SAAS)", 4, 6),
        ("u_trans (Transfer Fees)", "Row 5: ADGM (2% of Selling Price)", 5, 6),
        ("u_broker (Broker Fees)", "Row 6: Agency Fees", 6, 6),
    ]
    
    for html_field, excel_label, row, col in mappings:
        if len(data) > row and len(data[row]) > col:
            value = data[row][col]
            label_col4 = data[row][4] if len(data[row]) > 4 else "N/A"
            print(f"  {html_field}")
            print(f"    Excel Label: {label_col4}")
            print(f"    Value: {value} (from [{row}][{col}])")
            print()
    
    print("\n" + "=" * 80)
    print("CHECKING FOR ALTERNATIVE DATA LOCATIONS:")
    print("=" * 80)
    
    # Check if there's data in other columns
    print("\nColumn 4 (E) - Payment Labels:")
    for i in range(1, min(8, len(data))):
        if len(data[i]) > 4 and data[i][4]:
            print(f"  Row {i}: {data[i][4]}")
    
    print("\nColumn 5 (F) - Payment Recipients:")
    for i in range(1, min(8, len(data))):
        if len(data[i]) > 5 and data[i][5]:
            print(f"  Row {i}: {data[i][5]}")
    
    print("\nColumn 6 (G) - Payment Values:")
    for i in range(1, min(8, len(data))):
        if len(data[i]) > 6 and data[i][6] is not None:
            print(f"  Row {i}: {data[i][6]}")

if __name__ == "__main__":
    diagnose()

