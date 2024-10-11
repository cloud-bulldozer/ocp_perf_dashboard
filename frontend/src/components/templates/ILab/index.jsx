import "./index.less";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Card,
  CardBody,
} from "@patternfly/react-core";
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import {
  fetchILabJobs,
  fetchMetricsInfo,
  fetchPeriods,
  setIlabDateFilter,
} from "@/actions/ilabActions";
import { formatDateTime, uid } from "@/utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ILabGraph from "./ILabGraph";
import MetaRow from "./MetaRow";
import MetricsSelect from "./MetricsDropdown";
import RenderPagination from "@/components/organisms/Pagination";
import StatusCell from "./StatusCell";
import TableFilter from "@/components/organisms/TableFilters";

const ILab = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { start_date, end_date } = useSelector((state) => state.ilab);
  const [expandedResult, setExpandedResult] = useState([]);
  const [expanded, setAccExpanded] = useState(["bordered-toggle1"]);

  const onToggle = (id) => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [
          ...expanded.slice(0, index),
          ...expanded.slice(index + 1, expanded.length),
        ]
        : [...expanded, id];
    setAccExpanded(newExpanded);
  };
  const isResultExpanded = (res) => expandedResult?.includes(res);
  const setExpanded = async (run, isExpanding = true) => {
    setExpandedResult((prevExpanded) => {
      const otherExpandedRunNames = prevExpanded.filter((r) => r !== run.id);
      return isExpanding
        ? [...otherExpandedRunNames, run.id]
        : otherExpandedRunNames;
    });
    if (isExpanding) {
      dispatch(fetchPeriods(run.id));
      dispatch(fetchMetricsInfo(run.id));
    }
  };

  const { totalItems, page, perPage, tableData } = useSelector(
    (state) => state.ilab
  );

  const [selectedRuns, setSelectedRuns] = useState([]);
  const setRunSelected = (run, isSelecting = true) =>
    setSelectedRuns((prevSelected) => {
      const others = prevSelected.filter((r) => r != run.id);
      return isSelecting ? [...others, run.id] : others;
    });
  const selectAllRuns = (isSelecting = true) =>
    setSelectedRuns(isSelecting ? tableData.map((r) => r.id) : []);
  const areAllRunsSelected = selectedRuns.length === tableData.length;
  const isRunSelected = (run) => selectedRuns.includes(run.id);

  useEffect(() => {
    if (searchParams.size > 0) {
      // date filter is set apart
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");

      searchParams.delete("start_date");
      searchParams.delete("end_date");
      const params = Object.fromEntries(searchParams);
      const obj = {};
      for (const key in params) {
        obj[key] = params[key].split(",");
      }
      dispatch(setIlabDateFilter(startDate, endDate, navigate));
    }
  }, []);

  useEffect(() => {
    dispatch(fetchILabJobs());
  }, [dispatch]);

  const columnNames = {
    benchmark: "Benchmark",
    email: "Email",
    name: "Name",
    source: "Source",
    metric: "Metric",
    begin_date: "Start Date",
    end_date: "End Date",
    status: "Status",
  };

  return (
    <>
      {selectedRuns.length > 1 && <Button variant="secondary">Graph</Button>}
      <TableFilter
        start_date={start_date}
        end_date={end_date}
        type={"ilab"}
        showColumnMenu={false}
        navigation={navigate}
      />
      <Table aria-label="Misc table" isStriped variant="compact">
        <Thead>
          <Tr key={uid()}>
            <Th
              screenReaderText="Row selection"
              select={{
                onSelect: (_event, isSelecting) => selectAllRuns(isSelecting),
                isSelected: areAllRunsSelected,
              }}
            />
            <Th screenReaderText="Row expansion" />
            <Th>{columnNames.metric}</Th>
            <Th>{columnNames.begin_date}</Th>
            <Th>{columnNames.end_date}</Th>
            <Th>{columnNames.status}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((item, rowIndex) => (
            <>
              <Tr key={uid()}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: (_event, isSelecting) =>
                      setRunSelected(item, isSelecting),
                    isSelected: isRunSelected(item),
                  }}
                />
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: isResultExpanded(item.id),
                    onToggle: () =>
                      setExpanded(item, !isResultExpanded(item.id)),
                    expandId: `expandId-${uid()}`,
                  }}
                />

                <Td>{item.primary_metrics[0]}</Td>
                <Th>{formatDateTime(item.begin_date)}</Th>
                <Th>{formatDateTime(item.end_date)}</Th>
                <Td>
                  <StatusCell value={item.status} />
                </Td>
              </Tr>
              <Tr key={uid()} isExpanded={isResultExpanded(item.id)}>
                <Td colSpan={8}>
                  <ExpandableRowContent>
                    <Accordion asDefinitionList={false} togglePosition="start">
                      <AccordionItem>
                        <AccordionToggle
                          onClick={() => {
                            onToggle("bordered-toggle1");
                          }}
                          isExpanded={expanded.includes("bordered-toggle1")}
                          id="bordered-toggle1"
                        >
                          Metadata
                        </AccordionToggle>

                        <AccordionContent
                          id="bordered-expand1"
                          isHidden={!expanded.includes("bordered-toggle1")}
                        >
                          <div className="metadata-wrapper">
                            <Card className="metadata-card" isCompact>
                              <CardBody>
                                <MetaRow
                                  key={uid()}
                                  heading={"Fields"}
                                  metadata={[
                                    ["benchmark", item.benchmark],
                                    ["name", item.name],
                                    ["email", item.email],
                                    ["source", item.source],
                                  ]}
                                />
                              </CardBody>
                            </Card>
                            <Card className="metadata-card" isCompact>
                              <CardBody>
                                <MetaRow
                                  key={uid()}
                                  heading={"Tags"}
                                  metadata={Object.entries(item.tags)}
                                />
                              </CardBody>
                            </Card>
                            <Card className="metadata-card" isCompact>
                              <CardBody>
                                <MetaRow
                                  key={uid()}
                                  heading={"Common Parameters"}
                                  metadata={Object.entries(item.params)}
                                />
                                {item.iterations.length > 1 && (
                                  <div>
                                    <Accordion
                                      asDefinitionList={false}
                                      togglePosition="start"
                                    >
                                      <AccordionItem>
                                        <AccordionToggle
                                          onClick={() => {
                                            onToggle("bordered-toggle3");
                                          }}
                                          isExpanded={expanded.includes(
                                            "bordered-toggle3"
                                          )}
                                          id="bordered-toggle3"
                                        >
                                          {`Unique parameters for ${item.iterations.length} Iterations`}
                                        </AccordionToggle>
                                        <AccordionContent
                                          id="bordered-expand3"
                                          isHidden={
                                            !expanded.includes(
                                              "bordered-toggle3"
                                            )
                                          }
                                        >
                                          {item.iterations.map((i) => (
                                            <MetaRow
                                              key={uid()}
                                              heading={`Iteration ${i.iteration} Parameters`}
                                              metadata={Object.entries(
                                                i.params
                                              ).filter(
                                                (i) => !(i[0] in item.params)
                                              )}
                                            />
                                          ))}
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  </div>
                                )}
                              </CardBody>
                            </Card>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem>
                        <AccordionToggle
                          onClick={() => {
                            onToggle("bordered-toggle2");
                          }}
                          isExpanded={expanded.includes("bordered-toggle2")}
                          id="bordered-toggle2"
                        >
                          Metrics & Graph
                        </AccordionToggle>
                        <AccordionContent
                          id="bordered-expand2"
                          isHidden={!expanded.includes("bordered-toggle2")}
                        >
                          Metrics: <MetricsSelect item={item} />
                          <div className="graph-card">
                            <ILabGraph item={item} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </>
          ))}
        </Tbody>
      </Table>
      <RenderPagination
        items={totalItems}
        page={page}
        perPage={perPage}
        type={"ilab"}
      />
    </>
  );
};

export default ILab;
