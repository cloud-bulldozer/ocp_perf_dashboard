
export const INITIAL_DATA = {
    initialState: true,
    success: 0,
    failure: 0,
    total: 0,
    others: 0,
    benchmarks: ["All"],
    versions: ["All"],
    workers: ["All"],
    ciSystems: ["All"],
    networkTypes: ["All"],
    selectedBenchmark: "All",
    selectedVersion: "All",
    selectedPlatform: "All",
    selectedWorkerCount: "All",
    selectedNetworkType: "All",
    selectedCiSystem: "All",
    waitForUpdate: false,
    platforms: ["All"],
    copyData: [],
    data: [],
    updatedTime: 'Loading',
    error: null,
    tableData : [{ name: "Benchmark", value: "benchmark" },
                 {name:"ReleaseStream", value: "releaseStream"},
                 {name: "WorkerCount", value: "workerNodesCount"},
                 {name: "StartDate", value: "startDate"},
                 {name: "EndDate", value: "endDate"},
                 {name: "Status", value: "jobStatus"}]
}
