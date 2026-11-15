import os
import random
import sys
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.base import Base
from app.database.connection import SessionLocal, engine
from app.models.batch import MedicineBatch
from app.models.medicine import Medicine
from app.models.stock_movement import MovementType, StockMovement

MEDICINE_CATALOGUE = [
    (
        "MED-101",
        "Amoxicillin 500mg",
        "Amoxicillin Trihydrate",
        "Antibiotics",
        "GlaxoSmithKline",
        "Capsules",
        20,
        "Broad-spectrum penicillin antibiotic",
    ),
    (
        "MED-102",
        "Paracetamol 650mg",
        "Acetaminophen",
        "Analgesics",
        "Cipla Ltd",
        "Tablets",
        50,
        "Antipyretic and pain reliever for fever and mild to moderate pain",
    ),
    (
        "MED-103",
        "Azithromycin 500mg",
        "Azithromycin Dihydrate",
        "Antibiotics",
        "Pfizer",
        "Tablets",
        15,
        "Macrolide antibiotic for respiratory and skin infections",
    ),
    (
        "MED-104",
        "Metformin 500mg",
        "Metformin Hydrochloride",
        "Antidiabetics",
        "Sun Pharma",
        "Tablets",
        40,
        "First-line medication for type 2 diabetes management",
    ),
    (
        "MED-105",
        "Atorvastatin 20mg",
        "Atorvastatin Calcium",
        "Cardiovascular",
        "Novartis",
        "Tablets",
        25,
        "HMG-CoA reductase inhibitor for lowering cholesterol",
    ),
    (
        "MED-106",
        "Amlodipine 5mg",
        "Amlodipine Besylate",
        "Cardiovascular",
        "Lupin Pharmaceuticals",
        "Tablets",
        30,
        "Calcium channel blocker used to treat high blood pressure",
    ),
    (
        "MED-107",
        "Omeprazole 20mg",
        "Omeprazole",
        "Gastrointestinal",
        "AstraZeneca",
        "Capsules",
        25,
        "Proton-pump inhibitor for acid reflux and GERD",
    ),
    (
        "MED-108",
        "Pantoprazole 40mg",
        "Pantoprazole Sodium",
        "Gastrointestinal",
        "Dr. Reddy's",
        "Tablets",
        30,
        "Gastric acid-reducer for gastric ulcers and esophagitis",
    ),
    (
        "MED-109",
        "Cetirizine 10mg",
        "Cetirizine Dihydrochloride",
        "Antihistamines",
        "Sanofi",
        "Tablets",
        35,
        "Second-generation antihistamine for seasonal allergies",
    ),
    (
        "MED-110",
        "Montelukast 10mg",
        "Montelukast Sodium",
        "Respiratory",
        "Merck & Co.",
        "Tablets",
        20,
        "Leukotriene receptor antagonist for asthma and allergic rhinitis",
    ),
    (
        "MED-111",
        "Ciprofloxacin 500mg",
        "Ciprofloxacin Hydrochloride",
        "Antibiotics",
        "Bayer",
        "Tablets",
        15,
        "Fluoroquinolone antibiotic for urinary and abdominal infections",
    ),
    (
        "MED-112",
        "Ibuprofen 400mg",
        "Ibuprofen",
        "Analgesics",
        "Abbott Laboratories",
        "Tablets",
        45,
        "Nonsteroidal anti-inflammatory drug (NSAID) for inflammation",
    ),
    (
        "MED-113",
        "Losartan 50mg",
        "Losartan Potassium",
        "Cardiovascular",
        "Torrent Pharmaceuticals",
        "Tablets",
        25,
        "Angiotensin II receptor antagonist for hypertension",
    ),
    (
        "MED-114",
        "Levothyroxine 50mcg",
        "Levothyroxine Sodium",
        "Endocrinology",
        "AbbVie",
        "Tablets",
        30,
        "Thyroid hormone replacement for hypothyroidism",
    ),
    (
        "MED-115",
        "Metoprolol 50mg",
        "Metoprolol Succinate",
        "Cardiovascular",
        "AstraZeneca",
        "Tablets",
        20,
        "Beta-blocker for hypertension and angina pectoris",
    ),
    (
        "MED-116",
        "Doxycycline 100mg",
        "Doxycycline Hyclate",
        "Antibiotics",
        "Mylan",
        "Capsules",
        20,
        "Tetracycline class antibiotic for bacterial infections",
    ),
    (
        "MED-117",
        "Prednisolone 10mg",
        "Prednisolone",
        "Corticosteroids",
        "Cadila Healthcare",
        "Tablets",
        15,
        "Synthetic glucocorticoid corticosteroid for severe inflammation",
    ),
    (
        "MED-118",
        "Salbutamol Inhaler",
        "Albuterol Sulfate",
        "Respiratory",
        "GlaxoSmithKline",
        "Inhalers",
        10,
        "Short-acting beta2-adrenergic agonist for acute bronchospasm",
    ),
    (
        "MED-119",
        "Clopidogrel 75mg",
        "Clopidogrel Bisulfate",
        "Cardiovascular",
        "Sanofi",
        "Tablets",
        25,
        "Antiplatelet medication used to reduce the risk of heart disease",
    ),
    (
        "MED-120",
        "Gabapentin 300mg",
        "Gabapentin",
        "Neurology",
        "Pfizer",
        "Capsules",
        20,
        "Anticonvulsant medication used to treat neuropathic pain",
    ),
    (
        "MED-121",
        "Tramadol 50mg",
        "Tramadol Hydrochloride",
        "Analgesics",
        "Grünenthal",
        "Capsules",
        15,
        "Opioid pain medication used to treat moderate to moderately severe pain",
    ),
    (
        "MED-122",
        "Insulin Glargine 100IU",
        "Insulin Glargine (rDNA origin)",
        "Antidiabetics",
        "Sanofi",
        "Vials",
        12,
        "Long-acting basal human insulin analog",
    ),
    (
        "MED-123",
        "Furosemide 40mg",
        "Furosemide",
        "Cardiovascular",
        "Aventis",
        "Tablets",
        20,
        "Loop diuretic used to treat fluid build-up due to heart failure",
    ),
    (
        "MED-124",
        "Cefixime 200mg",
        "Cefixime Trihydrate",
        "Antibiotics",
        "Alkem Laboratories",
        "Tablets",
        25,
        "Third-generation cephalosporin antibiotic",
    ),
    (
        "MED-125",
        "Ranitidine 150mg",
        "Ranitidine Hydrochloride",
        "Gastrointestinal",
        "GlaxoSmithKline",
        "Tablets",
        20,
        "H2 histamine receptor blocker for heartburn",
    ),
    (
        "MED-126",
        "Hydrochlorothiazide 25mg",
        "Hydrochlorothiazide",
        "Cardiovascular",
        "Novartis",
        "Tablets",
        30,
        "Thiazide diuretic for hypertension and peripheral edema",
    ),
    (
        "MED-127",
        "Loperamide 2mg",
        "Loperamide Hydrochloride",
        "Gastrointestinal",
        "Johnson & Johnson",
        "Capsules",
        20,
        "Antidiarrheal medication for acute and chronic diarrhea",
    ),
    (
        "MED-128",
        "Diclofenac 50mg",
        "Diclofenac Sodium",
        "Analgesics",
        "Novartis",
        "Tablets",
        30,
        "NSAID for osteoarthritis and acute musculoskeletal disorders",
    ),
    (
        "MED-129",
        "Escitalopram 10mg",
        "Escitalopram Oxalate",
        "Psychiatry",
        "Lundbeck",
        "Tablets",
        20,
        "Selective serotonin reuptake inhibitor (SSRI) for depression",
    ),
    (
        "MED-130",
        "Sertraline 50mg",
        "Sertraline Hydrochloride",
        "Psychiatry",
        "Pfizer",
        "Tablets",
        20,
        "SSRI antidepressant for major depressive disorder and OCD",
    ),
]


def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_meds = db.query(Medicine).count()
        if existing_meds >= 30:
            print(f"Database already contains {existing_meds} medicines. Skipping duplicate seed.")
            return

        print("Seeding 30 medicines, multi-tier batches, and historical movements...")
        today = date.today()
        ref_counter = 1000

        for idx, (code, name, generic, category, mfg, unit, reorder, desc) in enumerate(
            MEDICINE_CATALOGUE
        ):
            medicine = Medicine(
                medicine_code=code,
                name=name,
                generic_name=generic,
                category=category,
                manufacturer=mfg,
                unit=unit,
                reorder_level=reorder,
                description=desc,
                is_active=True,
            )
            db.add(medicine)
            db.flush()

            # Create 2 to 3 batches per medicine with varying shelf lives
            num_batches = 2 if idx % 3 == 0 else 3

            for b_idx in range(1, num_batches + 1):
                ref_counter += 1
                batch_no = f"BTH-{code[-3:]}-{b_idx:02d}"

                # Determine dates and stock characteristics
                if b_idx == 1 and idx in [0, 4, 10]:
                    # Expired batch scenario (expired 45 to 90 days ago)
                    mfg_date = today - timedelta(days=500)
                    exp_date = today - timedelta(days=45)
                    initial_qty = random.randint(50, 100)
                    available_qty = random.randint(10, 30)  # remaining expired units
                elif b_idx == 1 and idx in [1, 6, 12, 18]:
                    # Expiring soon scenario (within next 15-25 days)
                    mfg_date = today - timedelta(days=340)
                    exp_date = today + timedelta(days=random.randint(10, 25))
                    initial_qty = random.randint(60, 120)
                    available_qty = random.randint(8, 25)
                elif idx in [2, 7, 14, 21] and b_idx == 1:
                    # Low stock scenario (below reorder level)
                    mfg_date = today - timedelta(days=120)
                    exp_date = today + timedelta(days=280)
                    initial_qty = 50
                    available_qty = random.randint(2, max(3, reorder // 3))
                else:
                    # Healthy, long-dated batch
                    mfg_date = today - timedelta(days=random.randint(30, 90))
                    exp_date = today + timedelta(days=random.randint(300, 720))
                    initial_qty = random.randint(100, 300)
                    available_qty = initial_qty - random.randint(10, 50)

                cost_price = Decimal(str(round(random.uniform(5.0, 45.0), 2)))
                sell_price = Decimal(str(round(float(cost_price) * random.uniform(1.3, 1.8), 2)))

                batch = MedicineBatch(
                    medicine_id=medicine.id,
                    batch_number=batch_no,
                    manufacturing_date=mfg_date,
                    expiry_date=exp_date,
                    purchase_price=cost_price,
                    selling_price=sell_price,
                    initial_quantity=initial_qty,
                    available_quantity=available_qty,
                )
                db.add(batch)
                db.flush()

                # 1. Purchase movement (initial receipt)
                po_movement = StockMovement(
                    medicine_id=medicine.id,
                    batch_id=batch.id,
                    movement_type=MovementType.PURCHASE,
                    quantity=initial_qty,
                    reference_number=f"PO-{ref_counter}",
                    notes=f"Initial vendor shipment received from {mfg}",
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(40, 120)),
                )
                db.add(po_movement)

                # 2. Sales movements (if some units were sold)
                units_sold = initial_qty - available_qty
                if units_sold > 5:
                    ref_counter += 1
                    sale_movement = StockMovement(
                        medicine_id=medicine.id,
                        batch_id=batch.id,
                        movement_type=MovementType.SALE,
                        quantity=-units_sold,
                        reference_number=f"INV-{ref_counter}",
                        notes="Prescription dispensing order fulfilled",
                        created_at=datetime.now(timezone.utc)
                        - timedelta(days=random.randint(5, 30)),
                    )
                    db.add(sale_movement)

                # 3. Occasional Customer Return movement
                if idx in [3, 9, 15, 23] and b_idx == 2 and exp_date > today:
                    ref_counter += 1
                    ret_qty = random.randint(2, 5)
                    batch.available_quantity += ret_qty
                    ret_movement = StockMovement(
                        medicine_id=medicine.id,
                        batch_id=batch.id,
                        movement_type=MovementType.RETURN,
                        quantity=ret_qty,
                        reference_number=f"RET-{ref_counter}",
                        notes="Unopened customer return within allowable policy window",
                        created_at=datetime.now(timezone.utc)
                        - timedelta(days=random.randint(1, 10)),
                    )
                    db.add(ret_movement)

                # 4. Occasional Stock Adjustment movement
                if idx in [5, 11, 19, 27] and b_idx == 1:
                    ref_counter += 1
                    adj_qty = -random.randint(1, 3)
                    if batch.available_quantity + adj_qty >= 0:
                        batch.available_quantity += adj_qty
                        adj_movement = StockMovement(
                            medicine_id=medicine.id,
                            batch_id=batch.id,
                            movement_type=MovementType.ADJUSTMENT,
                            quantity=adj_qty,
                            reference_number=f"ADJ-{ref_counter}",
                            notes="[DECREASE] Physical damaged packaging during warehouse shelf handling",
                            created_at=datetime.now(timezone.utc)
                            - timedelta(days=random.randint(2, 8)),
                        )
                        db.add(adj_movement)

        db.commit()
        print("Successfully seeded 30 medicines with complete batches and historical movements!")

    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
