import uuid
from datetime import date, timedelta

from fastapi import status


def _create_medicine_and_batch(client, initial_qty=100, is_expired=False):
    suffix = uuid.uuid4().hex[:6]
    med_res = client.post(
        "/api/v1/medicines",
        json={
            "medicine_code": f"MED-MOV-{suffix}",
            "name": f"Movement Test Med {suffix}",
            "generic_name": "Active Agent",
            "category": "Antibiotics",
            "manufacturer": "Pharma Core",
            "unit": "Tablets",
            "reorder_level": 10,
        },
    )
    med_data = med_res.json()
    med_id = med_data["id"]

    today = date.today()
    if is_expired:
        mfg = today - timedelta(days=400)
        exp = today - timedelta(days=30)
    else:
        mfg = today - timedelta(days=30)
        exp = today + timedelta(days=365)

    batch_res = client.post(
        "/api/v1/batches",
        json={
            "medicine_id": med_id,
            "batch_number": f"BTH-{suffix}",
            "manufacturing_date": mfg.isoformat(),
            "expiry_date": exp.isoformat(),
            "purchase_price": "10.00",
            "selling_price": "18.00",
            "initial_quantity": initial_qty,
        },
    )
    batch_data = batch_res.json()
    return med_data, batch_data


def test_purchase_restock(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50)

    # Restock 30 units
    purchase_payload = {
        "medicine_id": med["id"],
        "batch_id": batch["id"],
        "quantity": 30,
        "notes": "Vendor shipment delivery",
    }
    res = client.post("/api/v1/movements/purchase", json=purchase_payload)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert data["movement_type"] == "PURCHASE"
    assert data["quantity"] == 30

    # Verify stock increased to 80
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 80


def test_successful_sale(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=100)

    sale_payload = {
        "batch_id": batch["id"],
        "quantity": 25,
        "reference_number": "INV-TEST-001",
        "notes": "Prescription sale",
    }
    res = client.post("/api/v1/movements/sale", json=sale_payload)
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert data["movement_type"] == "SALE"
    assert data["quantity"] == -25

    # Check batch quantity reduced to 75
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 75


def test_expired_batch_sale_rejection(client):
    # Expired batch
    med, batch = _create_medicine_and_batch(client, initial_qty=50, is_expired=True)

    sale_payload = {"batch_id": batch["id"], "quantity": 5}
    res = client.post("/api/v1/movements/sale", json=sale_payload)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "expired" in res.json()["detail"].lower()

    # Stock must remain unchanged
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 50


def test_insufficient_quantity_rejection(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=20)

    # Requesting 25 when only 20 available
    sale_payload = {"batch_id": batch["id"], "quantity": 25}
    res = client.post("/api/v1/movements/sale", json=sale_payload)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "insufficient stock" in res.json()["detail"].lower()

    # Stock must remain unchanged
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 20


def test_negative_quantity_rejection(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50)

    sale_payload = {"batch_id": batch["id"], "quantity": -10}
    res = client.post("/api/v1/movements/sale", json=sale_payload)
    # Pydantic validation rejects negative quantities
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_batch_rejection(client):
    fake_id = str(uuid.uuid4())
    sale_payload = {"batch_id": fake_id, "quantity": 5}
    res = client.post("/api/v1/movements/sale", json=sale_payload)
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_stock_adjustment_workflows(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50)

    # 1. Decrease adjustment
    adj_dec = {
        "batch_id": batch["id"],
        "direction": "DECREASE",
        "quantity": 10,
        "notes": "Damaged ampoule discarded during inspection",
    }
    res = client.post("/api/v1/movements/adjustment", json=adj_dec)
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json()["quantity"] == -10
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 40

    # 2. Increase adjustment
    adj_inc = {
        "batch_id": batch["id"],
        "direction": "INCREASE",
        "quantity": 5,
        "notes": "Reconciled after physical inventory audit",
    }
    res = client.post("/api/v1/movements/adjustment", json=adj_inc)
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json()["quantity"] == 5
    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 45

    # 3. Reject adjustment making stock negative
    adj_neg = {
        "batch_id": batch["id"],
        "direction": "DECREASE",
        "quantity": 100,
        "notes": "Invalid over-reduction",
    }
    res_neg = client.post("/api/v1/movements/adjustment", json=adj_neg)
    assert res_neg.status_code == status.HTTP_400_BAD_REQUEST


def test_return_workflow(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50)

    # Valid return
    ret_payload = {
        "batch_id": batch["id"],
        "quantity": 5,
        "notes": "Unopened return by patient",
    }
    res = client.post("/api/v1/movements/return", json=ret_payload)
    assert res.status_code == status.HTTP_201_CREATED
    assert res.json()["movement_type"] == "RETURN"
    assert res.json()["quantity"] == 5

    b_res = client.get(f"/api/v1/batches/{batch['id']}")
    assert b_res.json()["available_quantity"] == 55


def test_expired_batch_return_rejection(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50, is_expired=True)

    # Return of expired batch must be rejected from saleable inventory
    ret_payload = {
        "batch_id": batch["id"],
        "quantity": 5,
        "notes": "Attempt to return expired medication",
    }
    res = client.post("/api/v1/movements/return", json=ret_payload)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "expired" in res.json()["detail"].lower()


def test_cannot_delete_medicine_with_movements(client):
    med, batch = _create_medicine_and_batch(client, initial_qty=50)

    # Perform a sale movement
    client.post("/api/v1/movements/sale", json={"batch_id": batch["id"], "quantity": 5})

    # Attempt to delete medicine must be rejected with 409 Conflict
    del_res = client.delete(f"/api/v1/medicines/{med['id']}")
    assert del_res.status_code == status.HTTP_409_CONFLICT
