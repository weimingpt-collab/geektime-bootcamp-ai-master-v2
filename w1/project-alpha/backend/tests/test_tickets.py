def test_create_ticket(client):
    response = client.post(
        "/api/v1/tickets",
        json={"title": "Test Ticket", "description": "Test Description"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Ticket"
    assert data["status"] == "pending"


def test_list_tickets(client):
    # Create a ticket first
    client.post("/api/v1/tickets", json={"title": "Test Ticket"})

    # List tickets
    response = client.get("/api/v1/tickets")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tickets"]) == 1


def test_get_ticket(client):
    # Create a ticket
    create_response = client.post("/api/v1/tickets", json={"title": "Test Ticket"})
    ticket_id = create_response.json()["id"]

    # Get the ticket
    response = client.get(f"/api/v1/tickets/{ticket_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Ticket"


def test_update_ticket(client):
    # Create a ticket
    create_response = client.post("/api/v1/tickets", json={"title": "Original Title"})
    ticket_id = create_response.json()["id"]

    # Update the ticket
    response = client.put(
        f"/api/v1/tickets/{ticket_id}",
        json={"title": "Updated Title"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


def test_delete_ticket(client):
    # Create a ticket
    create_response = client.post("/api/v1/tickets", json={"title": "To Delete"})
    ticket_id = create_response.json()["id"]

    # Delete the ticket
    response = client.delete(f"/api/v1/tickets/{ticket_id}")
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/v1/tickets/{ticket_id}")
    assert get_response.status_code == 404


def test_complete_ticket(client):
    # Create a ticket
    create_response = client.post("/api/v1/tickets", json={"title": "To Complete"})
    ticket_id = create_response.json()["id"]

    # Complete the ticket
    response = client.patch(f"/api/v1/tickets/{ticket_id}/complete")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["completed_at"] is not None


def test_uncomplete_ticket(client):
    # Create and complete a ticket
    create_response = client.post("/api/v1/tickets", json={"title": "To Uncomplete"})
    ticket_id = create_response.json()["id"]
    client.patch(f"/api/v1/tickets/{ticket_id}/complete")

    # Uncomplete the ticket
    response = client.patch(f"/api/v1/tickets/{ticket_id}/uncomplete")
    assert response.status_code == 200
    assert response.json()["status"] == "pending"
    assert response.json()["completed_at"] is None


def test_filter_tickets_by_status(client):
    # Create tickets
    client.post("/api/v1/tickets", json={"title": "Pending Ticket"})
    complete_response = client.post("/api/v1/tickets", json={"title": "Completed Ticket"})
    complete_id = complete_response.json()["id"]
    client.patch(f"/api/v1/tickets/{complete_id}/complete")

    # Filter by pending
    response = client.get("/api/v1/tickets?status=pending")
    assert response.status_code == 200
    assert all(t["status"] == "pending" for t in response.json()["tickets"])

    # Filter by completed
    response = client.get("/api/v1/tickets?status=completed")
    assert response.status_code == 200
    assert all(t["status"] == "completed" for t in response.json()["tickets"])


def test_search_tickets(client):
    # Create tickets
    client.post("/api/v1/tickets", json={"title": "Search Test Ticket"})
    client.post("/api/v1/tickets", json={"title": "Another Ticket"})

    # Search
    response = client.get("/api/v1/tickets?search=Search")
    assert response.status_code == 200
    assert len(response.json()["tickets"]) == 1
    assert "Search" in response.json()["tickets"][0]["title"]
