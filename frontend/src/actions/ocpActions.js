import * as API_ROUTES from "@/utils/apiConstants";
import * as TYPES from "./types.js";

import { appendDateFilter, appendQueryString } from "@/utils/helper.js";
import {
  deleteAppliedFilters,
  getFilteredData,
  getRequestParams,
  getSelectedFilter,
} from "./commonActions";

import API from "@/utils/axiosInstance";
import { cloneDeep } from "lodash";
import { showFailureToast } from "./toastActions";

export const fetchOCPJobs = () => async (dispatch) => {
  try {
    dispatch({ type: TYPES.LOADING });

    const params = dispatch(getRequestParams("ocp"));

    const response = await API.get(API_ROUTES.OCP_JOBS_API_V1, { params });

    if (response.status === 200) {
      const startDate = response.data.startDate,
        endDate = response.data.endDate;
      //on initial load startDate and endDate are empty, so from response append to url
      appendDateFilter(startDate, endDate);
      dispatch({
        type: TYPES.SET_OCP_DATE_FILTER,
        payload: {
          start_date: startDate,
          end_date: endDate,
        },
      });
    }
    if (response?.data?.results?.length > 0) {
      dispatch({
        type: TYPES.SET_OCP_JOBS_DATA,
        payload: response.data.results,
      });

      dispatch({
        type: TYPES.SET_OCP_PAGE_TOTAL,
        payload: {
          total: response.data.total,
          offset: response.data.offset,
        },
      });

      dispatch(applyFilters());
      dispatch(tableReCalcValues());
    }
  } catch (error) {
    dispatch(showFailureToast());
  }
  dispatch({ type: TYPES.COMPLETED });
};

export const setOCPPage = (pageNo) => ({
  type: TYPES.SET_OCP_PAGE,
  payload: pageNo,
});

export const setOCPPageOptions = (page, perPage) => ({
  type: TYPES.SET_OCP_PAGE_OPTIONS,
  payload: { page, perPage },
});

export const setOCPOffset = (offset) => ({
  type: TYPES.SET_OCP_OFFSET,
  payload: offset,
});

export const setOCPSortIndex = (index) => ({
  type: TYPES.SET_OCP_SORT_INDEX,
  payload: index,
});

export const setOCPSortDir = (direction) => ({
  type: TYPES.SET_OCP_SORT_DIR,
  payload: direction,
});

export const setOCPCatFilters = (category) => (dispatch, getState) => {
  const filterData = [...getState().ocp.filterData];
  const options = filterData.filter((item) => item.name === category)[0].value;
  const list = options.map((item) => ({ name: item, value: item }));

  dispatch({
    type: TYPES.SET_OCP_CATEGORY_FILTER,
    payload: category,
  });
  dispatch({
    type: TYPES.SET_OCP_FILTER_OPTIONS,
    payload: list,
  });
};

export const applyFilters = () => (dispatch, getState) => {
  const { appliedFilters } = getState().ocp;

  const results = [...getState().ocp.results];

  const isFilterApplied =
    Object.keys(appliedFilters).length > 0 &&
    !Object.values(appliedFilters).includes("");

  const filtered = isFilterApplied
    ? getFilteredData(appliedFilters, results)
    : results;

  dispatch({
    type: TYPES.SET_OCP_FILTERED_DATA,
    payload: filtered,
  });
  dispatch(tableReCalcValues());
  dispatch(buildFilterData());
};

export const setSelectedFilterFromUrl = (params) => (dispatch, getState) => {
  const selectedFilters = cloneDeep(getState().ocp.selectedFilters);
  for (const key in params) {
    selectedFilters.find((i) => i.name === key).value = params[key].split(",");
  }
  dispatch({
    type: TYPES.SET_SELECTED_OCP_FILTERS,
    payload: selectedFilters,
  });
};
export const setSelectedFilter =
  (selectedCategory, selectedOption, isFromMetrics) => (dispatch) => {
    const selectedFilters = dispatch(
      getSelectedFilter(selectedCategory, selectedOption, "ocp", isFromMetrics)
    );
    dispatch({
      type: TYPES.SET_SELECTED_OCP_FILTERS,
      payload: selectedFilters,
    });
  };
export const setOCPAppliedFilters = (navigate) => (dispatch, getState) => {
  const { start_date, end_date, selectedFilters } = getState().ocp;
  const appliedFilterArr = selectedFilters.filter((i) => i.value.length > 0);

  const appliedFilters = {};
  appliedFilterArr.forEach((item) => {
    appliedFilters[item["name"]] = item.value;
  });

  dispatch({
    type: TYPES.SET_OCP_APPLIED_FILTERS,
    payload: appliedFilters,
  });
  appendQueryString({ ...appliedFilters, start_date, end_date }, navigate);
  dispatch(applyFilters());
};

export const removeOCPAppliedFilters =
  (filterKey, filterValue, navigate) => (dispatch, getState) => {
    const appliedFilters = dispatch(
      deleteAppliedFilters(filterKey, filterValue, "ocp")
    );
    const { start_date, end_date } = getState().ocp;
    dispatch({
      type: TYPES.SET_OCP_APPLIED_FILTERS,
      payload: appliedFilters,
    });
    appendQueryString({ ...appliedFilters, start_date, end_date }, navigate);
    dispatch(applyFilters());
  };

export const setOCPDateFilter =
  (start_date, end_date, navigate) => (dispatch, getState) => {
    const appliedFilters = getState().ocp.appliedFilters;

    dispatch({
      type: TYPES.SET_OCP_DATE_FILTER,
      payload: {
        start_date,
        end_date,
      },
    });

    appendQueryString({ ...appliedFilters, start_date, end_date }, navigate);
  };

export const applyOCPDateFilter =
  (start_date, end_date, navigate) => (dispatch) => {
    dispatch(setOCPDateFilter(start_date, end_date, navigate));
    dispatch(fetchOCPJobs());
  };
export const setFilterFromURL = (searchParams) => ({
  type: TYPES.SET_OCP_APPLIED_FILTERS,
  payload: searchParams,
});

export const setOCPOtherSummaryFilter = () => (dispatch, getState) => {
  const filteredResults = [...getState().ocp.filteredResults];
  const keyWordArr = ["success", "failure"];
  const data = filteredResults.filter(
    (item) => !keyWordArr.includes(item.jobStatus?.toLowerCase())
  );
  dispatch({
    type: TYPES.SET_OCP_FILTERED_DATA,
    payload: data,
  });
  dispatch(tableReCalcValues());
};

export const getOCPSummary = (countObj) => (dispatch) => {
  const other =
    countObj["total"] -
    ((countObj["success"] || 0) + (countObj["failure"] || 0));
  const summary = {
    othersCount: other,
    successCount: countObj["success"] || 0,
    failureCount: countObj["failure"] || 0,
    total: countObj["total"],
  };
  dispatch({
    type: TYPES.SET_OCP_SUMMARY,
    payload: summary,
  });
};

export const fetchGraphData =
  (uuid, nodeName) => async (dispatch, getState) => {
    try {
      dispatch({ type: TYPES.GRAPH_LOADING });

      const graphData = getState().ocp.graphData;
      const hasData = graphData.filter((a) => a.uuid === uuid).length > 0;
      if (!hasData) {
        const response = await API.get(
          `${API_ROUTES.OCP_GRAPH_API_V1}/${uuid}`
        );

        if (response.status === 200) {
          dispatch({
            type: TYPES.SET_OCP_GRAPH_DATA,
            payload: { uuid, data: [[nodeName, response.data]] },
          });
        }
      }
    } catch (error) {
      dispatch(showFailureToast());
    }
    dispatch({ type: TYPES.GRAPH_COMPLETED });
  };

export const setTableColumns = (key, isAdding) => (dispatch, getState) => {
  let tableColumns = [...getState().ocp.tableColumns];
  const tableFilters = getState().ocp.tableFilters;

  if (isAdding) {
    const filterObj = tableFilters.find((item) => item.value === key);
    tableColumns.push(filterObj);
  } else {
    tableColumns = tableColumns.filter((item) => item.value !== key);
  }

  dispatch({
    type: TYPES.SET_OCP_COLUMNS,
    payload: tableColumns,
  });
};
export const tableReCalcValues = () => (dispatch, getState) => {
  const { page, perPage } = getState().ocp;

  dispatch(setOCPPageOptions(page, perPage));
};

export const buildFilterData = () => async (dispatch, getState) => {
  try {
    const { tableFilters, categoryFilterValue } = getState().ocp;

    const params = dispatch(getRequestParams("ocp"));

    const response = await API.get("/api/v1/ocp/filters", { params });
    if (response.status === 200 && response?.data?.filterData?.length > 0) {
      let data = cloneDeep(response.data.filterData);
      for (let i = 0; i < tableFilters.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (tableFilters[i]["value"] === data[j]["key"]) {
            data[j]["name"] = tableFilters[i]["name"];
          }
        }
      }
      data.forEach((item) => {
        if (item["key"] === "ocpVersion") {
          item["name"] = "Version";
        }
      });
      dispatch(getOCPSummary(response.data.summary));
      dispatch({
        type: TYPES.SET_OCP_FILTER_DATA,
        payload: data,
      });
      const activeFilter = categoryFilterValue || tableFilters[0].name;
      dispatch(setOCPCatFilters(activeFilter));
    }
  } catch (error) {
    console.log(error);
  }
};
