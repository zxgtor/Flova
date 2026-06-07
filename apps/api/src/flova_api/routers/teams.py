"""Teams + members.

Scope: every team has exactly one owner (creator). Owner can add/remove members.
Members see the team in their list. Invite-via-email-with-token is intentionally
out of scope — for this skeleton you can only add users who already registered.
"""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from flova_api.db import get_session
from flova_api.models import Team, TeamMember, TeamRole, User
from flova_api.schemas import (
    TeamCreate,
    TeamMemberAdd,
    TeamMemberOut,
    TeamOut,
)
from flova_api.security import current_user

router = APIRouter(prefix="/api/teams", tags=["teams"])


async def _my_role(session: AsyncSession, team_id: str, user: User) -> TeamRole | None:
    """The caller's role on the team, or None if they're not a member."""
    row = await session.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id, TeamMember.user_id == user.id
        )
    )
    member = row.scalar_one_or_none()
    return member.role if member else None


async def _require_membership(
    session: AsyncSession, team_id: str, user: User
) -> tuple[Team, TeamRole]:
    team = (
        await session.execute(select(Team).where(Team.id == team_id))
    ).scalar_one_or_none()
    role = await _my_role(session, team_id, user)
    if team is None or role is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return team, role


def _team_out(team: Team, role: TeamRole) -> TeamOut:
    return TeamOut(
        id=team.id,
        owner_id=team.owner_id,
        name=team.name,
        created_at=team.created_at,
        my_role=role,
    )


@router.get("", response_model=list[TeamOut])
async def list_my_teams(
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[TeamOut]:
    rows = await session.execute(
        select(Team, TeamMember.role)
        .join(TeamMember, TeamMember.team_id == Team.id)
        .where(TeamMember.user_id == user.id)
        .order_by(Team.created_at.desc())
    )
    return [_team_out(team, role) for team, role in rows.all()]


@router.post("", response_model=TeamOut, status_code=201)
async def create_team(
    body: TeamCreate,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TeamOut:
    team = Team(owner_id=user.id, name=body.name)
    session.add(team)
    # Flush so `team.id` is populated, then add the owner as a member so
    # /api/teams listings + permission checks treat owners and admins/editors/
    # viewers consistently.
    await session.flush()
    session.add(TeamMember(team_id=team.id, user_id=user.id, role=TeamRole.owner))
    await session.commit()
    await session.refresh(team)
    return _team_out(team, TeamRole.owner)


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(
    team_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TeamOut:
    team, role = await _require_membership(session, team_id, user)
    return _team_out(team, role)


@router.get("/{team_id}/members", response_model=list[TeamMemberOut])
async def list_members(
    team_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[TeamMemberOut]:
    await _require_membership(session, team_id, user)
    rows = await session.execute(
        select(TeamMember, User)
        .join(User, User.id == TeamMember.user_id)
        .where(TeamMember.team_id == team_id)
        .order_by(TeamMember.created_at.asc())
    )
    return [
        TeamMemberOut(
            id=m.id,
            user_id=u.id,
            email=u.email,
            display_name=u.display_name,
            role=m.role,
            created_at=m.created_at,
        )
        for m, u in rows.all()
    ]


@router.post("/{team_id}/members", response_model=TeamMemberOut, status_code=201)
async def add_member(
    team_id: str,
    body: TeamMemberAdd,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TeamMemberOut:
    team, role = await _require_membership(session, team_id, user)
    if role not in {TeamRole.owner, TeamRole.admin}:
        raise HTTPException(status_code=403, detail="Owner/admin only")

    target = (
        await session.execute(select(User).where(User.email == body.email))
    ).scalar_one_or_none()
    if target is None:
        # We don't have email-invite tokens yet, so the invited user must already
        # be a registered Flova account. ADR-0007 calls out the follow-up.
        raise HTTPException(
            status_code=404,
            detail="No Flova account for that email. Ask them to sign up first.",
        )
    if target.id == team.owner_id:
        raise HTTPException(status_code=400, detail="Owner is already on the team")
    existing = (
        await session.execute(
            select(TeamMember).where(
                TeamMember.team_id == team_id, TeamMember.user_id == target.id
            )
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Already a member")
    if body.role == TeamRole.owner:
        raise HTTPException(status_code=400, detail="Can't add a second owner")

    member = TeamMember(team_id=team_id, user_id=target.id, role=body.role)
    session.add(member)
    await session.commit()
    await session.refresh(member)
    return TeamMemberOut(
        id=member.id,
        user_id=target.id,
        email=target.email,
        display_name=target.display_name,
        role=member.role,
        created_at=member.created_at,
    )


@router.delete("/{team_id}/members/{member_id}", status_code=204)
async def remove_member(
    team_id: str,
    member_id: str,
    user: Annotated[User, Depends(current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    team, role = await _require_membership(session, team_id, user)
    member = (
        await session.execute(select(TeamMember).where(TeamMember.id == member_id))
    ).scalar_one_or_none()
    if member is None or member.team_id != team_id:
        raise HTTPException(status_code=404, detail="Member not found")
    # Owner can remove anyone except themselves. Admins can remove editor/viewer.
    # Anyone can remove themselves (leave).
    self_remove = member.user_id == user.id
    is_owner = role == TeamRole.owner
    is_admin = role == TeamRole.admin
    can_remove = (
        self_remove
        or (is_owner and member.user_id != team.owner_id)
        or (is_admin and member.role in {TeamRole.editor, TeamRole.viewer})
    )
    if not can_remove:
        raise HTTPException(status_code=403, detail="Cannot remove that member")
    if self_remove and is_owner:
        raise HTTPException(
            status_code=400, detail="Owner can't leave; delete the team instead"
        )
    _ = datetime  # keep import used after future timestamp work
    await session.delete(member)
    await session.commit()
