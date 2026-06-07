"""Rate-limiter singleton, used by the auth + render routers.

Defaults come from settings. In test mode (`ENV=test`) limits are effectively
disabled so the test suite doesn't run into them mid-flight.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from flova_api.settings import get_settings

_s = get_settings()
limiter = Limiter(
    key_func=get_remote_address,
    # Tests run many requests against the same in-memory address — disable there.
    enabled=_s.env != "test",
)


def auth_limit() -> str:
    return get_settings().rate_limit_auth


def render_limit() -> str:
    return get_settings().rate_limit_render
