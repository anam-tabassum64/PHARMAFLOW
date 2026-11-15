import concurrent.futures
import uuid
from datetime import date, timedelta

from fastapi import status
from fastapi.testclient import TestClient

from app.main import app


def test_concurrent_sales_prevent_overselling():
    """
    Demonstrates that simultaneous concurrent sales cannot oversell
    or make available stock negative.
    """
    client = TestClient(app)

    # Setup test medicine and batch with EXACTLY 10 units
    suffix = uuid.uuid4().hex[:6]
    med_res = client.post(
        "/api/v1/medicines",
        json={
            "medicine_code": f"MED-CONC-{suffix}",
            "name": f"Concurrency Test Med {suffix}",
            "generic_name": "Atomic Compound",
            "category": "Critical Care",
            "manufacturer": "BioConcurrency",
            "unit": "Vials",
            "reorder_level": 5,
        },
    )
    assert med_res.status_code == status.HTTP_201_CREATED
    med_id = med_res.json()["id"]

    today = date.today()
    batch_res = client.post(
        "/api/v1/batches",
        json={
            "medicine_id": med_id,
            "batch_number": f"BTH-CONC-{suffix}",
            "manufacturing_date": (today - timedelta(days=20)).isoformat(),
            "expiry_date": (today + timedelta(days=200)).isoformat(),
            "purchase_price": "25.00",
            "selling_price": "40.00",
            "initial_quantity": 10,
        },
    )
    assert batch_res.status_code == status.HTTP_201_CREATED
    batch_id = batch_res.json()["id"]

    # 15 concurrent threads, each trying to buy 2 units (Total requested: 30 units, available: only 10)
    num_requests = 15
    quantity_per_sale = 2

    def attempt_sale(thread_idx):
        thread_client = TestClient(app)
        res = thread_client.post(
            "/api/v1/movements/sale",
            json={
                "batch_id": batch_id,
                "quantity": quantity_per_sale,
                "reference_number": f"INV-CONC-{thread_idx}",
            },
        )
        return res.status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(attempt_sale, i) for i in range(num_requests)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    success_count = sum(1 for code in results if code == status.HTTP_201_CREATED)
    failure_count = sum(1 for code in results if code == status.HTTP_400_BAD_REQUEST)

    # Verify final stock
    final_batch = client.get(f"/api/v1/batches/{batch_id}").json()
    final_stock = final_batch["available_quantity"]

    print(
        f"\n[Concurrency Test] Total Requests: {num_requests}, Succeeded: {success_count}, Failed: {failure_count}, Final Stock: {final_stock}"
    )

    # Core assertions:
    # 1. Total units sold must equal success_count * quantity_per_sale
    assert success_count * quantity_per_sale <= 10
    # 2. Stock must NEVER be negative
    assert final_stock >= 0
    # 3. Exactly 10 units were available, so 5 requests (5 * 2 = 10) succeed and 10 fail
    assert success_count == 5
    assert failure_count == 10
    assert final_stock == 0
