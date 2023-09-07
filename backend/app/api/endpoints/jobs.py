from .common import getData
from fastapi import APIRouter

from app.async_util import trio_run_with_asyncio

router = APIRouter()

@router.post('/api/jobs')
@router.get('/api/jobs')
async def jobs():
    return await getData("PROW")