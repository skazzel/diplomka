from openai import OpenAI
import base64
import os
import time
import shutil
import mysql.connector
from mysql.connector import Error
from pathlib import Path
import fitz
from concurrent.futures import ThreadPoolExecutor

client = OpenAI(api_key="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")
IMAGE_DIR = "../backend/upload-image/"
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "99030564fq",
    "database": "syshosp"
}

def connect_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✅ Připojeno k DB:", conn.database)
        return conn
    except Error as e:
        print(f"❌ DB připojení selhalo: {e}")
        return None

def save_to_db(birth_number, context):
    if not birth_number or not birth_number.isdigit():
        print("⚠️ Neplatné rodné číslo, záznam nebude uložen.")
        return
    conn = connect_db()
    if not conn:
        return
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO refered_anamneses (birth_number, context) VALUES (%s, %s)",
            (birth_number, context)
        )
        conn.commit()
        print(f"✅ Uloženo do DB pro {birth_number}")
    except Error as e:
        print(f"❌ Chyba při ukládání do DB: {e}")
    finally:
        cursor.close()
        conn.close()

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def extract_text_from_image(image_path):
    file_ext = os.path.splitext(image_path)[1].lower().replace('.', '')
    base64_image = encode_image_to_base64(image_path)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": (
                    "You are a medical OCR assistant. Extract ALL visible printed or handwritten text. Output raw text only."
                )},
                {
                    "role": "user",
                    "content": [{
                        "type": "image_url",
                        "image_url": {"url": f"data:image/{file_ext};base64,{base64_image}"}
                    }]
                }
            ],
            max_tokens=2048
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ Chyba při OCR ({image_path}): {e}")
        return None

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"❌ Chyba při čtení PDF ({pdf_path}): {e}")
        return None

def process_folder(folder_path):
    raw_folder_name = os.path.basename(folder_path)
    birth_number = raw_folder_name.strip()

    if not birth_number.isdigit():
        print(f"⚠️ Složka má neplatné jméno (není rodné číslo): {birth_number}")
        return

    combined_text = ""

    for file in Path(folder_path).glob("*"):
        suffix = file.suffix.lower()
        text = None

        if suffix in [".png", ".jpg", ".jpeg"]:
            print(f"🖼️ Zpracovávám obrázek: {file.name}")
            text = extract_text_from_image(str(file))
        elif suffix == ".pdf":
            print(f"📄 Zpracovávám PDF: {file.name}")
            text = extract_text_from_pdf(str(file))
        else:
            print(f"⏭️ Přeskakuji nepodporovaný soubor: {file.name}")

        if text:
            combined_text += text + "\n"

    if combined_text.strip():
        save_to_db(birth_number, combined_text.strip())
        shutil.rmtree(folder_path)
        print(f"🗑️ Složka {raw_folder_name} byla zpracována a odstraněna.")
    else:
        print(f"⚠️ Ve složce {raw_folder_name} nebyl rozpoznán žádný text.")

def monitor_folder():
    print(f"👀 Sleduji složku: {IMAGE_DIR}")
    processed_folders = set()
    with ThreadPoolExecutor(max_workers=1) as executor:
        while True:
            try:
                for folder in os.listdir(IMAGE_DIR):
                    folder_path = os.path.join(IMAGE_DIR, folder)
                    if os.path.isdir(folder_path) and folder not in processed_folders:
                        processed_folders.add(folder)
                        executor.submit(process_folder, folder_path)
            except Exception as e:
                print(f"❌ Chyba během monitorování složky: {e}")
            time.sleep(5)

if __name__ == "__main__":
    monitor_folder()
