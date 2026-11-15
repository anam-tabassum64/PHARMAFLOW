from fastapi import status


def test_inventory_summary_and_reports(client):
    # 1. Test Summary
    res = client.get("/api/v1/inventory/summary")
    assert res.status_code == status.HTTP_200_OK
    summary = res.json()
    assert "total_medicines" in summary
    assert "total_units_in_stock" in summary
    assert "total_inventory_valuation" in summary

    # 2. Test Low Stock
    low_res = client.get("/api/v1/inventory/low-stock")
    assert low_res.status_code == status.HTTP_200_OK
    assert isinstance(low_res.json(), list)

    # 3. Test Stock Report
    stock_res = client.get("/api/v1/reports/stock")
    assert stock_res.status_code == status.HTTP_200_OK
    assert isinstance(stock_res.json(), list)

    # 4. Test Expiry Report
    exp_res = client.get("/api/v1/reports/expiry")
    assert exp_res.status_code == status.HTTP_200_OK
    exp_data = exp_res.json()
    assert "expired_batches" in exp_data
    assert "expiring_in_30_days" in exp_data
    assert "safe_batches" in exp_data

    # 5. Test Movement Report
    mov_res = client.get("/api/v1/reports/movements")
    assert mov_res.status_code == status.HTTP_200_OK
    mov_data = mov_res.json()
    assert "total_movements" in mov_data
    assert "purchases_count" in mov_data
    assert "sales_count" in mov_data
