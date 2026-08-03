import openpyxl
import os

excel_path = r"c:\Users\JULIAN\Desktop\GravyLocal2.0\DatosReferencia\reporteCompras\Informe de compras.xlsx"
if os.path.exists(excel_path):
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    sheet = wb.active
    # Get column headers (Row 7)
    headers = [cell.value for cell in sheet[7]]
    print("All Headers:", headers)
    # Check if there are other rows and how many columns they have
    for r_idx in range(8, 15):
        row_vals = [cell.value for cell in sheet[r_idx]]
        print(f"Row {r_idx}: {row_vals[:len(headers)]}")
