import sqlite3, json, random, string

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

# 1. Asegurar tipo de transacción LQ
lq = c.execute("SELECT id, code, name FROM transaction_types WHERE code='LQ'").fetchone()
if not lq:
    lq_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
    c.execute("""
        INSERT INTO transaction_types (id, code, name, prefix, consecutive, active, description)
        VALUES (?, 'LQ', 'Liquidacion Definitiva de Nomina', 'LQ', 1, 1, 'Liquidacion y prestaciones sociales de retiro')
    """, (lq_id,))
    print(f"+ Creado tipo de transacción LQ con ID: {lq_id}")
else:
    print(f"Tipo de transacción LQ ya existe con ID: {lq[0]}")

# 2. Colección payroll_settlements
settlement_col = c.execute("SELECT id FROM _collections WHERE name='payroll_settlements'").fetchone()
tp_id = c.execute("SELECT id FROM _collections WHERE name='third_parties'").fetchone()[0]

fields = [
    {"autogeneratePattern":"[a-z0-9]{15}","help":"","hidden":False,"id":"text3208210256","max":15,"min":15,"name":"id","pattern":"^[a-z0-9]+$","presentable":False,"primaryKey":True,"required":True,"system":True,"type":"text"},
    {"cascadeDelete":False,"collectionId":tp_id,"help":"","hidden":False,"id":"relation_employee","maxSelect":1,"minSelect":0,"name":"employee_id","presentable":False,"required":True,"system":False,"type":"relation"},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_settlement_date","max":0,"min":0,"name":"settlement_date","pattern":"","presentable":False,"primaryKey":False,"required":True,"system":False,"type":"text"},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_hire_date","max":0,"min":0,"name":"hire_date","pattern":"","presentable":False,"primaryKey":False,"required":False,"system":False,"type":"text"},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_contract_type","max":0,"min":0,"name":"contract_type","pattern":"","presentable":False,"primaryKey":False,"required":False,"system":False,"type":"text"},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_reason","max":0,"min":0,"name":"reason","pattern":"","presentable":False,"primaryKey":False,"required":False,"system":False,"type":"text"},
    {"help":"","hidden":False,"id":"num_basic_salary","max":None,"min":0,"name":"basic_salary","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_transport_allowance","max":None,"min":0,"name":"transport_allowance","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_base_prestaciones","max":None,"min":0,"name":"base_prestaciones","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_pending_days","max":None,"min":0,"name":"pending_salary_days","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_pending_sal_amt","max":None,"min":0,"name":"pending_salary_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_pending_trn_amt","max":None,"min":0,"name":"pending_transport_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_sev_days","max":None,"min":0,"name":"severance_days","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_sev_amt","max":None,"min":0,"name":"severance_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_sev_int_amt","max":None,"min":0,"name":"severance_interest_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_bon_days","max":None,"min":0,"name":"bonus_days","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_bon_amt","max":None,"min":0,"name":"bonus_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_vac_days","max":None,"min":0,"name":"vacation_days","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_vac_amt","max":None,"min":0,"name":"vacation_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_ind_amt","max":None,"min":0,"name":"indemnity_amount","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_oth_earn","max":None,"min":0,"name":"other_earnings","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_tot_earn","max":None,"min":0,"name":"total_earnings","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_hlth_ded","max":None,"min":0,"name":"health_deduction","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_pen_ded","max":None,"min":0,"name":"pension_deduction","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_oth_ded","max":None,"min":0,"name":"other_deductions","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_tot_ded","max":None,"min":0,"name":"total_deductions","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"num_net_pay","max":None,"min":0,"name":"net_pay","onlyInt":False,"presentable":False,"required":False,"system":False,"type":"number"},
    {"help":"","hidden":False,"id":"json_prov_applied","maxSize":0,"name":"provisions_applied","presentable":False,"required":False,"system":False,"type":"json"},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_notes","max":0,"min":0,"name":"notes","pattern":"","presentable":False,"primaryKey":False,"required":False,"system":False,"type":"text"},
    {"help":"","hidden":False,"id":"sel_status","maxSelect":0,"name":"status","presentable":False,"required":False,"system":False,"type":"select","values":["draft","approved","paid"]},
    {"autogeneratePattern":"","help":"","hidden":False,"id":"text_tx_id","max":0,"min":0,"name":"tx_id","pattern":"","presentable":False,"primaryKey":False,"required":False,"system":False,"type":"text"},
    {"hidden":False,"id":"autodate_created","name":"created","onCreate":True,"onUpdate":False,"presentable":False,"system":False,"type":"autodate"},
    {"hidden":False,"id":"autodate_updated","name":"updated","onCreate":True,"onUpdate":True,"presentable":False,"system":False,"type":"autodate"}
]

fields_json = json.dumps(fields)
rule = "@request.auth.id != ''"

if not settlement_col:
    new_col_id = "pbc_" + str(random.randint(1000000000, 9999999999))
    c.execute("""
        INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
        VALUES (?, 0, 'base', 'payroll_settlements', ?, '[]', ?, ?, ?, ?, ?, '{}', datetime('now'), datetime('now'))
    """, (new_col_id, fields_json, rule, rule, rule, rule, rule))
    print(f"+ Coleccion payroll_settlements registrada en _collections con ID {new_col_id}")
    
    # Crear tabla SQLite
    c.execute("""
        CREATE TABLE IF NOT EXISTS payroll_settlements (
            id TEXT PRIMARY KEY,
            employee_id TEXT,
            settlement_date TEXT,
            hire_date TEXT,
            contract_type TEXT,
            reason TEXT,
            basic_salary REAL DEFAULT 0,
            transport_allowance REAL DEFAULT 0,
            base_prestaciones REAL DEFAULT 0,
            pending_salary_days REAL DEFAULT 0,
            pending_salary_amount REAL DEFAULT 0,
            pending_transport_amount REAL DEFAULT 0,
            severance_days REAL DEFAULT 0,
            severance_amount REAL DEFAULT 0,
            severance_interest_amount REAL DEFAULT 0,
            bonus_days REAL DEFAULT 0,
            bonus_amount REAL DEFAULT 0,
            vacation_days REAL DEFAULT 0,
            vacation_amount REAL DEFAULT 0,
            indemnity_amount REAL DEFAULT 0,
            other_earnings REAL DEFAULT 0,
            total_earnings REAL DEFAULT 0,
            health_deduction REAL DEFAULT 0,
            pension_deduction REAL DEFAULT 0,
            other_deductions REAL DEFAULT 0,
            total_deductions REAL DEFAULT 0,
            net_pay REAL DEFAULT 0,
            provisions_applied TEXT DEFAULT '{}',
            notes TEXT DEFAULT '',
            status TEXT DEFAULT 'draft',
            tx_id TEXT DEFAULT '',
            created TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now')),
            updated TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%fZ', 'now'))
        )
    """)
    print("+ Tabla SQLite payroll_settlements creada.")
else:
    print(f"Colección payroll_settlements ya existe con ID: {settlement_col[0]}")

conn.commit()
conn.close()
print("Operación completada exitosamente.")
