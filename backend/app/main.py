import time

import httpx
from httpx import Response
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import orjson

from services import transform

<<<<<<< HEAD:backend/main.py
from pydantic import BaseModel

from api.elasticsearch_api import Elasticsearch_API

class Timesrange(BaseModel):
    format: str
    gte: str
    lte: str

class Timestamp(BaseModel):
    timestamp: Timesrange

class Range(BaseModel):
    range: Timestamp

class Query(BaseModel):
    query: Range

origins = [
    "http://localhost:3000",
]

=======
>>>>>>> main:backend/app/main.py
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root(request: Request):
    return {
        "url": str(request.url),
        "root_path": request.scope.get('root_path')
    }



@app.get("/domain/{domain}")
async def get_domain(domain: str):
    async with httpx.AsyncClient() as client:
        resp: Response = await client.get(f"http://ip-api.com/json/{domain}")
        resp.raise_for_status()
    return resp.json()


@app.get('/time')
async def now():
    return {'time': time.time()}


@app.get('/api/widened')
def wide():
    transform.to_ocpapp_tst('tests/mocklong.csv', 'tests/widened2.json')
    with open('tests/widened2.json', 'r') as wjson:
        return orjson.loads(wjson.read())

@app.post('/api/download')
def download(query: Query):

    es = Elasticsearch_API()
    response = {}
    
    try:
        # first get the es response
        response = es.post(query)
    except:
        print("Elasticsearch post failed")

    try:
        # parse the response
        response = transform.to_ocp_data(response)
    except:
        print("Error parsing Elasticsearch response")

    return response