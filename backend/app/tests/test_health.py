from fastapi import status


def test_health_probe(client):
    res = client.get("/health")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_readiness_probe(client):
    res = client.get("/ready")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
