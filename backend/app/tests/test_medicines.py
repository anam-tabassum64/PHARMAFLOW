from fastapi import status


def test_medicine_creation(client):
    payload = {
        "medicine_code": "MED-TEST-001",
        "name": "Test Medicine 500mg",
        "generic_name": "Testium Active",
        "category": "Antibiotics",
        "manufacturer": "Pharma Labs Inc",
        "unit": "Tablets",
        "reorder_level": 20,
        "description": "Standard testing medication",
        "is_active": True,
    }
    response = client.post("/api/v1/medicines", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["medicine_code"] == payload["medicine_code"]
    assert data["name"] == payload["name"]
    assert "id" in data
    assert data["total_available_stock"] == 0


def test_duplicate_medicine_code_rejected(client):
    payload = {
        "medicine_code": "MED-DUP-001",
        "name": "Duplicate Medicine",
        "generic_name": "Test Generic",
        "category": "Analgesics",
        "manufacturer": "Lab X",
        "unit": "Capsules",
        "reorder_level": 10,
    }
    res1 = client.post("/api/v1/medicines", json=payload)
    assert res1.status_code == status.HTTP_201_CREATED

    # Second creation with identical code must fail with 409
    res2 = client.post("/api/v1/medicines", json=payload)
    assert res2.status_code == status.HTTP_409_CONFLICT


def test_medicine_update_and_delete(client):
    payload = {
        "medicine_code": "MED-DEL-001",
        "name": "To Delete Medicine",
        "generic_name": "Generic Temp",
        "category": "Vitamins",
        "manufacturer": "Lab Temp",
        "unit": "Bottles",
        "reorder_level": 5,
    }
    res = client.post("/api/v1/medicines", json=payload)
    assert res.status_code == status.HTTP_201_CREATED
    med_id = res.json()["id"]

    # Update
    upd_res = client.put(f"/api/v1/medicines/{med_id}", json={"name": "Updated Medicine Name"})
    assert upd_res.status_code == status.HTTP_200_OK
    assert upd_res.json()["name"] == "Updated Medicine Name"

    # Delete without movements should succeed
    del_res = client.delete(f"/api/v1/medicines/{med_id}")
    assert del_res.status_code == status.HTTP_204_NO_CONTENT
