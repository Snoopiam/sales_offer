#!/usr/bin/env python3
"""Detailed Excel structure analysis"""

import openpyxl

def analyze_excel():
    workbook = openpyxl.load_workbook("Book1.xlsx", data_only=True)
    sheet = workbook.active

    print("=" * 80)
    print("DETAILED EXCEL STRUCTURE ANALYSIS")
    print("=" * 80)

    # Get all data
    data = []
    for row in sheet.iter_rows(values_only=True):
        data.append(list(row))

    print("\n📊 COMPLETE ROW-BY-ROW BREAKDOWN:")
    print("-" * 80)

    for i, row in enumerate(data[:15]):
        print(f"\nRow {i}:")
        for j, cell in enumerate(row[:15]):
            if cell is not None and str(cell).strip():
                print(f"  Col {j} ({chr(65+j) if j < 26 else '?'}): {repr(cell)}")

    print("\n" + "=" * 80)
    print("LOOKING FOR PAYMENT-RELATED FIELDS:")
    print("=" * 80)

    # Search for "Paid", "Seller", "Developer", "15%" etc.
    keywords = ["Paid", "Seller", "Developer", "15%", "Refund", "Balance", "Premium", "Admin", "ADGM", "Agency"]

    for i, row in enumerate(data[:20]):
        for j, cell in enumerate(row[:15]):
            if cell and any(keyword.lower() in str(cell).lower() for keyword in keywords):
                print(f"Row {i}, Col {j} ({chr(65+j) if j < 26 else '?'}): {repr(cell)}")

    print("\n" + "=" * 80)
    print("INITIAL PAYMENTS SECTION (Rows 1-7, All Columns):")
    print("=" * 80)

    for i in range(1, min(8, len(data))):
        print(f"\nRow {i}:")
        for j in range(min(15, len(data[i]) if data[i] else 0)):
            cell = data[i][j] if data[i] and j < len(data[i]) else None
            if cell is not None:
                print(f"  [{i}][{j}] = {repr(cell)}")

if __name__ == "__main__":
    analyze_excel()

