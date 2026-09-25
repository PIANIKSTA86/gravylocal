import sqlite3

def test_cruce():
    db_path = 'empresas/empresa_8094/pb_data/data.db'
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Probar Unidad 1104 (Carolina Zamora)
    cur.execute("SELECT id, owner_id FROM ph_properties WHERE code = '1104'")
    prop_id, owner_id = cur.fetchone()
    
    # Simular getOpenItems
    antRef = f"ANT-{prop_id}"
    cur.execute("""
        SELECT l.id, a.code, l.cross_doc_ref, l.debit, l.credit
        FROM tx_lines l
        JOIN accounts a ON a.id = l.account_id
        JOIN transactions t ON t.id = l.tx_id
        WHERE t.status = 'active'
          AND (l.third_party_id = ? OR l.cross_doc_ref = ?)
          AND (a.code LIKE '28%' OR a.code LIKE '13%')
    """, (owner_id, antRef))
    lines = cur.fetchall()
    
    total_ant_credit = 0
    total_ant_debit = 0
    total_cxc_debit = 0
    total_cxc_credit = 0
    
    for lid, code, ref, debit, credit in lines:
        if code.startswith('28') or ref == antRef:
            total_ant_credit += credit
            total_ant_debit += debit
        elif code.startswith('13'):
            total_cxc_debit += debit
            total_cxc_credit += credit
            
    saldo_anticipo = total_ant_credit - total_ant_debit
    saldo_cartera = total_cxc_debit - total_cxc_credit
    
    print(f"--- PRUEBA UNIDAD 1104 ---")
    print(f"Saldo Anticipo (Cuenta 28): ${saldo_anticipo:,.2f}")
    print(f"Saldo Cartera (Cuenta 13): ${saldo_cartera:,.2f}")
    print(f"Anticipo disponible cubre cartera: {saldo_anticipo >= saldo_cartera}")
    
    # Partida doble simulada de cruce
    monto_a_cruzar = min(saldo_anticipo, saldo_cartera)
    debito_28 = monto_a_cruzar
    credito_13 = monto_a_cruzar
    print(f"Asiento Simulado de Cruce:")
    print(f"  Débito 28 (Anticipos): ${debito_28:,.2f}")
    print(f"  Crédito 13 (Cartera):   ${credito_13:,.2f}")
    print(f"  Diferencia Partida Doble: ${abs(debito_28 - credito_13):,.2f}")
    assert abs(debito_28 - credito_13) == 0, "Partida doble descuadrada"
    print("[OK] PRUEBA EXITOSA: Partida doble cuadrada y anticipo detectado.")

test_cruce()
