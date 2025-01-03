# Define the keywords for sorting.
DIRECTIONS = ("asc", "desc")
FIELDS = (
    "ciSystem.keyword",
    "benchmark.keyword",
    "ocpVersion.keyword",
    "releaseStream.keyword",
    "platform.keyword",
    "networkType.keyword",
    "ipsec.keyword",
    "fips.keyword",
    "encrypted.keyword",
    "publish.keyword",
    "computeArch.keyword",
    "controlPlaneArch.keyword",
    "jobStatus.keyword",
    "startDate",
    "endDate",
    "workerNodesCount",
    "masterNodesCount",
    "infraNodesCount",
    "totalNodesCount",
)

OCP_FIELD_CONSTANT_DICT = {
    "ciSystem": "ciSystem.keyword",
    "platform": "platform.keyword",
    "benchmark": "benchmark.keyword",
    "releaseStream": "releaseStream.keyword",
    "networkType": "networkType.keyword",
    "workerNodesCount": "workerNodesCount",
    "jobStatus": "jobStatus.keyword",
    "controlPlaneArch": "controlPlaneArch.keyword",
    "publish": "publish.keyword",
    "fips": "fips.keyword",
    "encrypted": "encrypted.keyword",
    "ipsec": "ipsec.keyword",
    "ocpVersion": "ocpVersion.keyword",
    "build": "ocpVersion.keyword",
    "upstream": "upstreamJob.keyword",
    "clusterType": "clusterType.keyword",
}

QUAY_FIELD_CONSTANT_DICT = {
    "benchmark": "benchmark.keyword",
    "platform": "platform.keyword",
    "releaseStream": "releaseStream.keyword",
    "workerNodesCount": "workerNodesCount",
    "jobStatus": "jobStatus.keyword",
    "build": "ocpVersion.keyword",
    "upstream": "upstreamJob.keyword",
    "clusterType": "clusterType.keyword",
}

RELEASE_STREAM_DICT = {
    "fast": "Fast",
    "stable": "Stable",
    "eus": "EUS",
    "candidate": "Release Candidate",
    "rc": "Release Candidate",
    "nightly": "Nightly",
    "ci": "ci",
    "ec": "Engineering Candidate",
}
