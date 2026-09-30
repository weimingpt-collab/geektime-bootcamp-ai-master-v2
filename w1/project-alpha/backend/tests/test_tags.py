def test_create_tag(client):
    response = client.post(
        "/api/v1/tags",
        json={"name": "test-tag", "color": "#FF0000"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "test-tag"
    assert data["color"] == "#FF0000"


def test_list_tags(client):
    # Create a tag first
    client.post("/api/v1/tags", json={"name": "test-tag"})

    # List tags
    response = client.get("/api/v1/tags")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tags"]) == 1


def test_get_tag(client):
    # Create a tag
    create_response = client.post("/api/v1/tags", json={"name": "test-tag"})
    tag_id = create_response.json()["id"]

    # Get the tag
    response = client.get(f"/api/v1/tags/{tag_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "test-tag"


def test_delete_tag(client):
    # Create a tag
    create_response = client.post("/api/v1/tags", json={"name": "to-delete"})
    tag_id = create_response.json()["id"]

    # Delete the tag
    response = client.delete(f"/api/v1/tags/{tag_id}")
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/v1/tags/{tag_id}")
    assert get_response.status_code == 404


def test_add_tags_to_ticket(client):
    # Create ticket and tags
    ticket_response = client.post("/api/v1/tickets", json={"title": "Test Ticket"})
    ticket_id = ticket_response.json()["id"]

    tag1_response = client.post("/api/v1/tags", json={"name": "tag1"})
    tag2_response = client.post("/api/v1/tags", json={"name": "tag2"})
    tag1_id = tag1_response.json()["id"]
    tag2_id = tag2_response.json()["id"]

    # Add tags to ticket
    response = client.post(f"/api/v1/tickets/{ticket_id}/tags", json=[tag1_id, tag2_id])
    assert response.status_code == 200
    assert len(response.json()["tags"]) == 2


def test_remove_tag_from_ticket(client):
    # Create ticket and tag
    ticket_response = client.post("/api/v1/tickets", json={"title": "Test Ticket"})
    ticket_id = ticket_response.json()["id"]

    tag_response = client.post("/api/v1/tags", json={"name": "tag1"})
    tag_id = tag_response.json()["id"]

    # Add tag to ticket
    client.post(f"/api/v1/tickets/{ticket_id}/tags", json=[tag_id])

    # Remove tag from ticket
    response = client.delete(f"/api/v1/tickets/{ticket_id}/tags/{tag_id}")
    assert response.status_code == 204

    # Verify removal
    get_response = client.get(f"/api/v1/tickets/{ticket_id}")
    assert len(get_response.json()["tags"]) == 0
