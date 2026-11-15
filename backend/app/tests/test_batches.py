from datetime import date, timedelta

from fastapi import status


def test_batch_creation(client):
    # 1. Create a medicine first
    med_payload = {
        "medicine_code": "MED-BATCH-001",
        "name": "Batch Test Med",
        "generic_name": "Active Ingredient",
        "category": "Cardiovascular",
        "manufacturer": "BioHealth",
        "unit": "Tablets",
        "reorder_level": 15,
    }
    med_res = client.post("/api/v1/medicines", json=med_payload)
    med_id = med_res.json()["id"]

    # 2. Create batch
    today = date.today()
    batch_payload = {
        "medicine_id": med_id,
        "batch_number": "BTH-TEST-001",
        "manufacturing_date": (today - timedelta(days=30)).isoformat(),
        "expiry_date": (today + timedelta(days=365)).isoformat(),
        "purchase_price": "12.50",
        "selling_price": "20.00",
        "initial_quantity": 100,
    }
    batch_res = client.post("/api/v1/batches", json=batch_payload)
    assert batch_res.status_code == status.HTTP_201_CREATED
    data = batch_res.json()
    assert data["batch_number"] == "BTH-TEST-001"
    assert data["available_quantity"] == 100
    assert data["is_expired"] is False
    assert data["days_to_expiry"] > 300


def test_invalid_dates_batch_rejected(client):
    med_res = client.post(
        "/api/v1/medicines",
        json={
            "medicine_code": "MED-BATCH-INV",
            "name": "Invalid Date Med",
            "generic_name": "Active",
            "category": "General",
            "manufacturer": "BioHealth",
            "unit": "Tablets",
        },
    )
    med_id = med_res.json()["id"]

    today = date.today()
    # Expiry before manufacturing date
    batch_payload = {
        "medicine_id": med_id,
        "batch_number": "BTH-INV-001",
        "manufacturing_date": today.isoformat(),
        "expiry_date": (today - timedelta(days=10)).isoformat(),
        "purchase_price": "10.00",
        "selling_price": "15.00",
        "initial_quantity": 50,
    }
    batch_res = client.post("/api/v1/batches", json=batch_payload)
    assert batch_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_duplicate_batch_number_rejected(client):
    med_res = client.post(
        "/api/v1/medicines",
        json={
            "medicine_code": "MED-BATCH-DUP",
            "name": "Dup Batch Med",
            "generic_name": "Active",
            "category": "General",
            "manufacturer": "BioHealth",
            "unit": "Tablets",
        },
    )
    med_id = med_res.json()["id"]
    today = date.today()

    batch_payload = {
        "medicine_id": med_id,
        "batch_number": "BTH-DUP-001",
        "manufacturing_date": (today - timedelta(days=10)).isoformat(),
        "expiry_date": (today + timedelta(days=100)).isoformat(),
        "purchase_price": "5.00",
        "selling_price": "8.00",
        "initial_quantity": 50,
    }
    res1 = client.post("/api/v1/batches", json=batch_payload)
    assert res1.status_code == status.HTTP_201_CREATED

    # Duplicate creation for same medicine
    res2 = client.post("/api/v1/batches", json=batch_payload)
    assert res2.status_code == status.HTTP_409_CONFLICT
