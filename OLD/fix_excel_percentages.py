#!/usr/bin/env python3
"""
Fix Excel percentages from decimal (0.1) to whole numbers (10)
This ensures the percentages display correctly as 10%, 10%, 10%, 70%
"""

import openpyxl
import os

def fix_percentages():
    excel_path = r"C:\SnoopLabs\Labs\RealEstate_apps\Sales Offer\Book1.xlsx"
    
    if not os.path.exists(excel_path):
        print(f"❌ Excel file not found: {excel_path}")
        return False
    
    print("=" * 70)
    print("FIXING EXCEL PERCENTAGES")
    print("=" * 70)
    print(f"\n📁 Opening: {excel_path}\n")
    
    try:
        wb = openpyxl.load_workbook(excel_path, data_only=False)  # Use data_only=False to preserve formulas
        ws = wb.active
        
        print("📊 Current Payment Plan percentages (Column J, Rows 3-6):")
        print("-" * 70)
        
        # Column J = Column 10 (index 10)
        # Rows 3-6 = indices 3-6 (Excel rows 4-7)
        changes = []
        
        for row_idx in range(3, 7):  # Rows 3, 4, 5, 6
            cell = ws.cell(row=row_idx + 1, column=10)  # +1 because openpyxl is 1-indexed
            current_value = cell.value
            
            print(f"  Row {row_idx + 1}, Col 10: {current_value} (type: {type(current_value).__name__})")
            
            # Check if it's a decimal percentage that needs conversion
            if current_value is not None:
                try:
                    num_value = float(current_value)
                    # If it's a decimal between 0 and 1, convert to percentage
                    if 0 < num_value < 1:
                        new_value = num_value * 100
                        cell.value = new_value
                        changes.append((row_idx + 1, current_value, new_value))
                        print(f"    → Converting {current_value} to {new_value}")
                    elif num_value >= 1:
                        print(f"    → Already a whole number ({num_value}), keeping as-is")
                    else:
                        print(f"    → Value is {num_value}, skipping")
                except (ValueError, TypeError):
                    print(f"    → Non-numeric value, skipping")
        
        if changes:
            print(f"\n💾 Saving changes...")
            wb.save(excel_path)
            print(f"✅ Excel file updated!")
            print(f"\n📋 Changes made:")
            for row, old_val, new_val in changes:
                print(f"  Row {row}: {old_val} → {new_val}")
        else:
            print(f"\n⚠️  No changes needed - percentages are already whole numbers")
        
        print("\n" + "=" * 70)
        print("✅ COMPLETE")
        print("=" * 70)
        print("\nNow when you upload Book1.xlsx, percentages will show as:")
        print("  10%, 10%, 10%, 70% (instead of 0.1%, 0.1%, 0.1%, 0.7%)")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    fix_percentages()

