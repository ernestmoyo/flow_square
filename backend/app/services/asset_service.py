import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.asset import Asset, System, Tag
from app.schemas.asset import AssetCreate, AssetUpdate, SystemCreate, TagCreate


class AssetService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_asset(self, asset_id: uuid.UUID) -> Asset:
        result = await self.db.execute(select(Asset).where(Asset.id == asset_id))
        asset = result.scalar_one_or_none()
        if asset is None:
            raise NotFoundException("Asset", str(asset_id))
        return asset

    async def create_asset(self, body: AssetCreate) -> Asset:
        asset = Asset(**body.model_dump())
        self.db.add(asset)
        await self.db.flush()
        await self.db.refresh(asset)
        return asset

    async def update_asset(self, asset_id: uuid.UUID, body: AssetUpdate) -> Asset:
        asset = await self.get_asset(asset_id)
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(asset, field, value)
        await self.db.flush()
        await self.db.refresh(asset)
        return asset

    async def create_system(self, body: SystemCreate) -> System:
        await self.get_asset(body.asset_id)  # ensure asset exists
        system = System(**body.model_dump())
        self.db.add(system)
        await self.db.flush()
        await self.db.refresh(system)
        return system

    async def create_tag(self, body: TagCreate) -> Tag:
        tag = Tag(**body.model_dump())
        self.db.add(tag)
        await self.db.flush()
        await self.db.refresh(tag)
        return tag

    async def search_tags(self, query: str, limit: int = 20) -> list[Tag]:
        result = await self.db.execute(
            select(Tag)
            .where(Tag.name.ilike(f"%{query}%"), Tag.deleted_at.is_(None))
            .limit(limit)
        )
        return list(result.scalars().all())
