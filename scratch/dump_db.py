
import sqlite3
import sys

con = sqlite3.connect(r"C:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\pb_data\\data.db")
with open(r"C:\\Users\\JULIAN\\Desktop\\GravyLocalTABS\\scratch\\dump.sql", 'w', encoding='utf-8') as f:
    for line in con.iterdump():
        # Omitir indices huerfanos problematicos
        if 'sqlite_autoindex_inventory_concepts_1' in line:
            continue
        f.write('%s\n' % line)
con.close()
print("Dump generado exitosamente.")
