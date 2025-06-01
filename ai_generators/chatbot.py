import time
import sys
import io
import requests
import mysql.connector
from mysql.connector import Error
import json
import concurrent.futures

# Nastavení výstupu na UTF-8 a zajištění nebufferovaného výstupu
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "99030564fq",
    "database": "syshosp"
}

# Langflow API Configuration
FLOW_ID = "d7ce0d00-842c-47d4-ab7a-cdced6fe7a6a"
API_URL = f"http://127.0.0.1:7860/api/v1/run/{FLOW_ID}"
SESSION_ID = "user-session-3"
MAX_WORKERS = 4

def connect_db():
    try:
        print("🔌 Připojuji se k databázi...", flush=True)
        return mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"❌ Chyba při připojování k databázi: {e}", flush=True)
        return None

pain_type_map = {
    "Tupá": "Tupá (dull)",
    "Ostrá": "Ostrá (sharp)",
    "Pálivá": "Pálivá (burning)",
    "Řezavá": "Řezavá (cutting)",
    "Píchavá": "Píchavá (stabbing)",
    "Křečovitá": "Křečovitá (cramping)"
}

pain_change_map = {
    "Zhoršuje": "Zhoršuje se",
    "Zlepšuje": "Zlepšuje se",
    "Nemění se": "Nemění se"
}

pain_time_map = {
    "Ráno": "Ráno",
    "Večer": "Večer",
    "Příznaky jsou stejné celý den": "Stejná intenzita během dne"
}

pain_area_map = {
    "head": "Hlava",
    "neck": "Krk",
    "left-breast": "Levé prso",
    "right-breast": "Pravé prso",
    "left-arm": "Levá paže",
    "left-forearm": "Levé předloktí",
    "left-hand": "Levá ruka",
    "right-arm": "Pravá paže",
    "right-forearm": "Pravé předloktí",
    "right-hand": "Pravá ruka",
    "upper-updomen": "Horní břicho",
    "pelvis": "Pánev",
    "left-knee": "Levé koleno",
    "left-shin": "Levý bérec",
    "left-ankle": "Levý kotník",
    "left-foot": "Levá noha",
    "right-knee": "Pravé koleno",
    "right-shin": "Pravý bérec",
    "right-ankle": "Pravý kotník",
    "right-foot": "Pravá noha",
    "lower-left-abdomen": "Dolní levé břicho",
    "lower-right-abdomen": "Dolní pravé břicho",
    "left-thigh": "Levé stehno",
    "right-thigh": "Pravé stehno",
    "back-head": "Zadní hlava",
    "back-neck": "Zadní krk",
    "back-right-arm": "Zadní pravá paže",
    "back-right-forearm": "Zadní pravé předloktí",
    "back-right-hand": "Zadní pravá ruka",
    "back-left-arm": "Zadní levá paže",
    "back-left-forearm": "Zadní levé předloktí",
    "back-left-hand": "Zadní levá ruka",
    "right-upper-back": "Horní část zad – pravá",
    "left-upper-back": "Horní část zad – levá",
    "back-left-shoulder": "Zadní levé rameno",
    "back-right-shoulder": "Zadní pravé rameno",
    "middle-back": "Střední část zad",
    "right-lower-back": "Dolní část zad – pravá",
    "left-lower-back": "Dolní část zad – levá",
    "ass": "Hýždě",
    "back-left-thigh": "Zadní levé stehno",
    "back-right-thigh": "Zadní pravé stehno",
    "back-left-knee": "Zadní levé koleno",
    "back-right-knee": "Zadní pravé koleno",
    "back-left-calf": "Zadní levé lýtko",
    "back-right-calf": "Zadní pravé lýtko",
    "back-left-foot": "Zadní levé chodidlo",
    "back-right-foot": "Zadní pravé chodidlo"
}

def get_labels_from_ids(table_name, ids_input):
    if not ids_input:
        return ""

    if isinstance(ids_input, int):
        ids = [str(ids_input)]
    elif isinstance(ids_input, str):
        ids = [id.strip() for id in ids_input.split(',') if id.strip().isdigit()]
    elif isinstance(ids_input, list):
        ids = [str(id) for id in ids_input if str(id).isdigit()]
    else:
        return ""

    if not ids:
        return ""

    conn = connect_db()
    if not conn:
        return ""

    cursor = conn.cursor()
    try:
        column_name = {
            'symptoms': 'symptom_cz',
            'operations': 'operation_cz',
            'medications': 'name',
            'chronical_diseases': 'chronical_cz',
            'allergy_symptoms': 'symptom_cz'
        }.get(table_name, table_name[:-1])

        placeholders = ','.join(['%s'] * len(ids))
        query = f"SELECT {column_name} FROM {table_name} WHERE id IN ({placeholders})"
        cursor.execute(query, ids)
        rows = cursor.fetchall()
        labels = [row[0] for row in rows]
        return ", ".join(labels)
    except Error as e:
        print(f"❌ Chyba při načítání názvů z {table_name}: {e}", flush=True)
        return ""
    finally:
        cursor.close()
        conn.close()

def get_unprocessed_patients():
    conn = connect_db()
    if not conn:
        return []
    cursor = conn.cursor(dictionary=True)
    print("🔍 Kontroluji nové pacienty...", flush=True)
    cursor.execute("""
        SELECT * FROM patients
        WHERE pending = 1
        ORDER BY date DESC LIMIT 5
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

def process_patient(patient):
    print(f"\n🧠 Generuji pro pacienta ID: {patient['patient_id']}", flush=True)
    if not patient:
        print("❌ Neplatná data pacienta.", flush=True)
        return
    print("WTF:", patient, flush=True)

    try:
        full_prompt = build_full_prompt(patient)
        print("📨 Prompt pro AI:", flush=True)
        print(full_prompt, flush=True)

        anamnesis = generate_anamnesis(full_prompt)
        if anamnesis.strip():
            print("📄 Vygenerovaná anamnéza:", flush=True)
            print(anamnesis, flush=True)
            birth_number = patient.get("birth_number", "neuvedeno")
            save_anamnesis_to_db(patient['patient_id'], anamnesis, birth_number)
            mark_patient_processed(patient['patient_id'])
        else:
            print("❌ AI odpověď je prázdná.", flush=True)

    except Exception as e:
        print(f"❌ Chyba ve zpracování pacienta: {e}", flush=True)

def mark_patient_processed(patient_id):
    conn = connect_db()
    if not conn:
        return
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE patients SET pending = 0 WHERE patient_id = %s", (patient_id,))
        conn.commit()
    except Error as e:
        print(f"❌ Chyba při označení pacienta jako zpracovaného: {e}", flush=True)
    finally:
        cursor.close()
        conn.close()


def build_full_prompt(patient):
    def is_provided(val):
        return val not in [None, "", "null", "neuvedeno"]

    def yes_no(val):
        if val is None:
            return None
        if isinstance(val, str):
            if val.lower() in ['yes', 'y', 'ano', 'a', '1']:
                return "ano"
            if val.lower() in ['no', 'n', 'ne', '0']:
                return "ne"
        if isinstance(val, bool):
            return "ano" if val else "ne"
        return str(val).lower()

    def cz_month_format(date_str):
        month_map = {
            "January": "ledna", "February": "února", "March": "března",
            "April": "dubna", "May": "května", "June": "června",
            "July": "července", "August": "srpna", "September": "září",
            "October": "října", "November": "listopadu", "December": "prosince"
        }
        for en, cz in month_map.items():
            if en in date_str:
                return date_str.replace(en, cz)
        return date_str

    sections = []

    # NO (Nynější onemocnění)
    no_parts = []
    if is_provided(patient.get("duration")):
        no_parts.append(f"Pacient udává trvání potíží po dobu {patient['duration']}")
    if is_provided(patient.get("condition")):
        no_parts[-1] += f", aktuální stav {patient['condition'].lower()}."
    if is_provided(patient.get("symptoms")):
        symptom = get_labels_from_ids("symptoms", patient["symptoms"]).lower()
        pain_type = patient.get("pain_type", "").lower()
        symptom_line = f"Hlavním symptomem je {pain_type} bolest {symptom}" if pain_type else f"Hlavním symptomem je {symptom}"
        if is_provided(patient.get("pain_areas")):
            area = pain_area_map.get(patient["pain_areas"], patient["pain_areas"])
            symptom_line += f" lokalizovaná v oblasti {area.lower()}."
        else:
            symptom_line += "."
        no_parts.append(symptom_line)
    if is_provided(patient.get("pain_intensity")):
        change = patient.get("pain_change", "")
        no_parts.append(f"Intenzita bolesti je hodnocena jako {patient['pain_intensity']}/10" + (f" a {change.lower()}." if change else "."))
    if is_provided(patient.get("pain_time")):
        no_parts.append("Bolest je konstantní během dne." if "celý" in patient["pain_time"].lower() else f"Bolest v průběhu dne: {patient['pain_time']}.")
    if is_provided(patient.get("pain_worse")) or is_provided(patient.get("pain_relief")):
        worse = patient.get("pain_worse", "").strip()
        relief = patient.get("pain_relief", "").strip()
        no_parts.append(f"{'Nic ji nezhoršuje' if 'nic' in worse.lower() else f'Zhoršuje bolest: {worse}'} a {'nic nepomáhá' if 'nic' in relief.lower() else f'úlevu přináší: {relief}'}.")

    if is_provided(patient.get("similar_around")):
        no_parts.append(f"Podobné potíže v okolí {'nejsou hlášeny' if yes_no(patient['similar_around']) == 'ne' else 'byly zaznamenány'}.")
    if is_provided(patient.get("previous_trouble")):
        no_parts.append(f"Pacient si {'není vědom předchozích podobných potíží' if 'nevím' in patient['previous_trouble'].lower() else patient['previous_trouble']}.")

    if no_parts:
        sections.append("**Nynější onemocnění (NO):**  \n" + " ".join(no_parts))

    oa_parts = []

    # Debug: Print raw chronic_condition
    print("🔎 Raw chronic_condition:", patient.get("chronic_condition"))

    # Přidej jména onemocnění
    if is_provided(patient.get("chronic_condition")):
        label = get_labels_from_ids("chronical_diseases", patient["chronic_condition"])
        print("✅ Loaded label from chronical_diseases:", label)
        if is_provided(label):
            oa_parts.append(label)

    # Debug: Print raw chronical_since
    print("📅 Raw chronical_since:", patient.get("chronical_since"))

    # Přidej od kdy
    if is_provided(patient.get("chronical_since")):
        try:
            chronical = json.loads(patient["chronical_since"])
            print("📋 Parsed chronical_since:", chronical)
            for entry in chronical:
                disease = entry.get("disease")
                since = cz_month_format(entry.get("since", ""))
                print(f"➡️ disease: {disease}, since: {since}")
                if disease and since:
                    oa_parts.append(f"{disease} od {since}")
        except Exception as e:
            print("❌ Error parsing chronical_since:", e)

    # Debug: Final OA part
    print("🧩 Final OA parts:", oa_parts)

    # Přidání do výstupu
    if oa_parts:
        sections.append("**Osobní anamnéza (OA):**  \n" + ". ".join(oa_parts) + ".")


    # FA (Farmakologická anamnéza)
    fa_parts = []
    if is_provided(patient.get("medication_details")):
        try:
            meds = json.loads(patient["medication_details"])
            for m in meds:
                since = cz_month_format(m.get("since", ""))
                fa_parts.append(f"{m['medication']} — od {since}, dávkování {m['frequency']}")
        except:
            pass
    if fa_parts:
        sections.append("**Farmakologická anamnéza (FA):**  \n" + " ".join(fa_parts))

    # SA (Sociální anamnéza)
    sa_parts = []
    if is_provided(patient.get("living_with")):
        sa_parts.append(f"Bydlení {patient['living_with'].lower()}")
    if is_provided(patient.get("residence_type")):
        sa_parts[-1] += f" v {patient['residence_type'].lower()}."
    if is_provided(patient.get("is_smoking")):
        sa_parts.append("Nekouří." if yes_no(patient["is_smoking"]) == "ne" else "Kouří.")
    if is_provided(patient.get("is_drinking")):
        sa_parts.append("Nepije alkohol." if yes_no(patient["is_drinking"]) == "ne" else "Pije alkohol.")
    if is_provided(patient.get("drugs")):
        try:
            drug_status = json.loads(patient["drugs"]).get("status")
            if is_provided(drug_status):
                sa_parts.append("Neužívá drogy." if yes_no(drug_status) == "ne" else "Užívá drogy.")
        except:
            pass
    if sa_parts:
        sections.append("**Sociální anamnéza (SA):**  \n" + " ".join(sa_parts))

    # PA (Pracovní anamnéza)
    if is_provided(patient.get("employment_status")):
        status = patient['employment_status'].strip().lower()
        if status == "pracuji":
            pa_line = "Zaměstnán."
        elif status == "nepracuji":
            pa_line = "Nezaměstnán."
        else:
            pa_line = f"Pracovní status: {status}."
        sections.append("**Pracovní anamnéza (PA):**  \n" + pa_line)

    # AA (Alergologická anamnéza)
    aa_parts = []
    if is_provided(patient.get("food_allergy")):
        aa_parts.append(f"Alergie na {patient['food_allergy']}.")
    if is_provided(patient.get("medication_allergy")):
        aa_parts.append(f"Alergie na léky: {patient['medication_allergy']}.")
    else:
        aa_parts.append("Alergie na léky neguje.")
    if aa_parts:
        sections.append("**Alergologická anamnéza (AA):**  \n" + " ".join(aa_parts))

    return "**Anamnéza pacienta**\n\n" + "\n\n".join(sections)


def save_anamnesis_to_db(patient_id, content, birth_number):
    conn = connect_db()
    if not conn:
        print("❌ Nelze se připojit k databázi pro uložení anamnézy.", flush=True)
        return

    try:
        cursor = conn.cursor()
        query = "INSERT INTO anamneses (patient_id, content, created, birth_number) VALUES (%s, %s, NOW(), %s)"
        cursor.execute(query, (patient_id, content, birth_number))
        conn.commit()
        print("✅ Anamnéza byla úspěšně uložena do tabulky `anamneses`.", flush=True)
    except Error as e:
        print(f"❌ Chyba při ukládání do tabulky `anamneses`: {e}", flush=True)
    finally:
        cursor.close()
        conn.close()

def generate_anamnesis(prompt):
    payload = {
        "input_value": prompt,
        "session_id": SESSION_ID
    }
    try:
        response = requests.post(API_URL, json=payload)
        print(f"📡 Langflow API status: {response.status_code}", flush=True)
        response.raise_for_status()
        data = response.json()
        outputs = data.get("outputs", [])
        if outputs:
            inner_outputs = outputs[0].get("outputs", [])
            if inner_outputs:
                message = inner_outputs[0].get("results", {}).get("message", {})
                text_data = message.get("data", {})
                return text_data.get("text", "")
    except Exception as e:
        print(f"❌ Chyba při komunikaci s API: {e}", flush=True)
    return ""

def main():
    print("🚀 Spouštím AI worker...", flush=True)

    while True:
        print("\n⏳ [LOOP] Pravidelná kontrola v databázi...", flush=True)
        patients = get_unprocessed_patients()
        print(f"🔍 Nalezeno {len(patients)} pacient(ů) k vygenerování.", flush=True)

        if not patients:
            print("🟡 Žádní noví pacienti. Čekám 10s...", flush=True)
            time.sleep(10)
            continue

        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            executor.map(process_patient, patients)

        print("🕓 Zpoždění 10 sekund...", flush=True)
        time.sleep(10)

if __name__ == "__main__":
    main()
