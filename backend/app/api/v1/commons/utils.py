from app.services.search import ElasticService
from fastapi import HTTPException, status
import re


async def getMetadata(uuid: str, configpath: str):
    query = {"query": {"query_string": {"query": (f'uuid: "{uuid}"')}}}
    print(query)
    es = ElasticService(configpath=configpath)
    response = await es.post(query=query)
    await es.close()
    meta = [item["_source"] for item in response["data"]]
    return meta[0]


def updateStatus(job):
    return job["jobStatus"].lower()


def updateBenchmark(job):
    if job["upstreamJob"].__contains__("upgrade"):
        return "upgrade-" + job["benchmark"]
    return job["benchmark"]


def jobType(job):
    if job["upstreamJob"].__contains__("periodic"):
        return "periodic"
    return "pull request"


def isRehearse(job):
    if job["upstreamJob"].__contains__("rehearse"):
        return "True"
    return "False"


def clasifyAWSJobs(job):
    if job["upstreamJob"].__contains__("rosa-hcp"):
        return "AWS ROSA-HCP"
    if job["clusterType"].__contains__("rosa"):
        return "AWS ROSA"
    return job["platform"]


def getBuild(job):
    releaseStream = job["releaseStream"] + "-"
    ocpVersion = job["ocpVersion"]
    return ocpVersion.replace(releaseStream, "")


def getReleaseStream(row):
    if row["releaseStream"].__contains__("fast"):
        return "Fast"
    elif row["releaseStream"].__contains__("stable"):
        return "Stable"
    elif row["releaseStream"].__contains__("eus"):
        return "EUS"
    elif row["releaseStream"].__contains__("candidate"):
        return "Release Candidate"
    elif row["releaseStream"].__contains__("rc"):
        return "Release Candidate"
    elif row["releaseStream"].__contains__("nightly"):
        return "Nightly"
    elif row["releaseStream"].__contains__("ci"):
        return "ci"
    elif row["releaseStream"].__contains__("ec"):
        return "Engineering Candidate"
    return "Stable"


def build_sort_terms(sort_string: str) -> list[dict[str, str]]:
    """

    Validates and transforms a sort string in the format 'sort=key:direction' to
    a list of dictionaries [{key: {"order": direction}}].

    :param sort_string: str, input string in the format 'sort=key:direction'

    :return: list, transformed sort structure or raises a ValueError for invalid input

    """

    pattern = r"^([\w]+):(asc|desc)$"
    match = re.match(pattern, sort_string)

    if not match:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid sort string format. Expected 'sort=key:direction' with direction as 'asc' or 'desc'.",
        )

    key, direction = match.groups()
    return [{key: {"order": direction}}]
