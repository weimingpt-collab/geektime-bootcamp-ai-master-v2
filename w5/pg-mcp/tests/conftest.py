"""Pytest configuration and shared fixtures.

This module provides shared fixtures and configuration for all tests.
"""

import os

import pytest

from pg_mcp.config.settings import reset_settings


@pytest.fixture(autouse=True)
def reset_config(tmp_path, monkeypatch) -> None:
    """Reset global settings and isolate tests from the real .env file.

    Sub-configs (OpenAIConfig, SecurityConfig, ...) load ``.env`` from the
    current working directory. Tests must see pure defaults, so we chdir to
    an empty temp directory for the duration of each test.
    """
    monkeypatch.chdir(tmp_path)
    reset_settings()


@pytest.fixture(autouse=True)
def disable_metrics_for_tests():
    """Disable metrics for tests to avoid port conflicts."""
    os.environ["OBSERVABILITY_METRICS_ENABLED"] = "false"
    yield
    # Clean up
    if "OBSERVABILITY_METRICS_ENABLED" in os.environ:
        del os.environ["OBSERVABILITY_METRICS_ENABLED"]
