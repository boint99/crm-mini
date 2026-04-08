import { useId, useMemo } from "react";
import { useMachine, normalizeProps } from "@zag-js/react";
import * as tree from "@zag-js/tree-view";
import {
  Building2,
  ChevronRight,
  FolderTree,
  Network,
  Shapes,
} from "lucide-react";

const mergeClassName = (props, className) => ({
  ...props,
  className: [props.className, className].filter(Boolean).join(" "),
});

const fakeRoot = {
  value: "ROOT",
  label: "CRM Organization",
  type: "ROOT",
  children: [
    {
      value: "COMPANY_1",
      label: "COM001 - Viettel Solutions",
      type: "COMPANY",
      data: {
        COMPANY_ID: 1,
        COMPANY_CODE: "COM001",
        COMPANY_NAME: "Viettel Solutions",
        STATUS: "ENABLE",
      },
      children: [
        {
          value: "DIVISION_1",
          label: "DIV001 - Khoi Ky Thuat",
          type: "DIVISION",
          data: {
            DIVISION_ID: 1,
            DIVISION_CODE: "DIV001",
            DIVISION_NAME: "Khoi Ky Thuat",
            COMPANY_ID: 1,
            STATUS: "ENABLE",
          },
          children: [
            {
              value: "ORG_1",
              label: "ORG001 - Trung tam Ha tang",
              type: "ORG_UNIT",
              data: {
                ORG_UNIT_ID: 1,
                UNIT_CODE: "ORG001",
                UNIT_NAME: "Trung tam Ha tang",
                DIVISION_ID: 1,
                PARENT_UNIT_ID: null,
                STATUS: "ENABLE",
              },
              children: [
                {
                  value: "ORG_2",
                  label: "ORG002 - Phong Mang Core",
                  type: "ORG_UNIT",
                  data: {
                    ORG_UNIT_ID: 2,
                    UNIT_CODE: "ORG002",
                    UNIT_NAME: "Phong Mang Core",
                    DIVISION_ID: 1,
                    PARENT_UNIT_ID: 1,
                    STATUS: "ENABLE",
                  },
                  children: [
                    {
                      value: "ORG_3",
                      label: "ORG003 - Doi IP Core",
                      type: "ORG_UNIT",
                      data: {
                        ORG_UNIT_ID: 3,
                        UNIT_CODE: "ORG003",
                        UNIT_NAME: "Doi IP Core",
                        DIVISION_ID: 1,
                        PARENT_UNIT_ID: 2,
                        STATUS: "ENABLE",
                      },
                    },
                    {
                      value: "ORG_4",
                      label: "ORG004 - Doi Bao mat",
                      type: "ORG_UNIT",
                      data: {
                        ORG_UNIT_ID: 4,
                        UNIT_CODE: "ORG004",
                        UNIT_NAME: "Doi Bao mat",
                        DIVISION_ID: 1,
                        PARENT_UNIT_ID: 2,
                        STATUS: "ENABLE",
                      },
                    },
                  ],
                },
                {
                  value: "ORG_5",
                  label: "ORG005 - Phong Truyen dan",
                  type: "ORG_UNIT",
                  data: {
                    ORG_UNIT_ID: 5,
                    UNIT_CODE: "ORG005",
                    UNIT_NAME: "Phong Truyen dan",
                    DIVISION_ID: 1,
                    PARENT_UNIT_ID: 1,
                    STATUS: "ENABLE",
                  },
                },
              ],
            },
          ],
        },
        {
          value: "DIVISION_2",
          label: "DIV002 - Khoi Van hanh",
          type: "DIVISION",
          data: {
            DIVISION_ID: 2,
            DIVISION_CODE: "DIV002",
            DIVISION_NAME: "Khoi Van hanh",
            COMPANY_ID: 1,
            STATUS: "ENABLE",
          },
          children: [
            {
              value: "ORG_10",
              label: "ORG010 - Trung tam Dieu hanh",
              type: "ORG_UNIT",
              data: {
                ORG_UNIT_ID: 10,
                UNIT_CODE: "ORG010",
                UNIT_NAME: "Trung tam Dieu hanh",
                DIVISION_ID: 2,
                PARENT_UNIT_ID: null,
                STATUS: "ENABLE",
              },
              children: [
                {
                  value: "ORG_11",
                  label: "ORG011 - Phong Giam sat",
                  type: "ORG_UNIT",
                  data: {
                    ORG_UNIT_ID: 11,
                    UNIT_CODE: "ORG011",
                    UNIT_NAME: "Phong Giam sat",
                    DIVISION_ID: 2,
                    PARENT_UNIT_ID: 10,
                    STATUS: "ENABLE",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const iconByType = {
  COMPANY: Building2,
  DIVISION: Network,
  ORG_UNIT: FolderTree,
  ROOT: Shapes,
};

function OrgUnitPage() {
  const id = useId();

  const collection = useMemo(
    () =>
      tree.collection({
        rootNode: fakeRoot,
      }),
    [],
  );

  const service = useMachine(tree.machine, {
    id,
    collection,
    defaultExpandedValue: ["COMPANY_1", "DIVISION_1", "ORG_1", "ORG_2"],
    selectionMode: "single",
  });

  const api = tree.connect(service, normalizeProps);

  const selectedNode = api.selectedValue[0]
    ? collection.findNode(api.selectedValue[0])
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Org Unit Tree (Fake Data)
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Demo cay to chuc theo schema COMPANY {">"} DIVISION {">"} ORG_UNITS.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section
          {...mergeClassName(
            api.getRootProps(),
            "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm",
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              {...mergeClassName(
                api.getLabelProps(),
                "text-base font-semibold text-gray-900",
              )}
            >
              Tree
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => api.expand()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => api.collapse()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Collapse all
              </button>
            </div>
          </div>

          <ul {...mergeClassName(api.getTreeProps(), "space-y-1")}>
            {api.getVisibleNodes().map(({ node, indexPath }) => {
              const state = api.getNodeState({ node, indexPath });
              const Icon = iconByType[node.type] || FolderTree;
              const depthPadding = `${Math.max((state.depth - 1) * 14, 0)}px`;

              if (state.isBranch) {
                return (
                  <li
                    key={state.value}
                    {...api.getBranchProps({ node, indexPath })}
                  >
                    <div
                      {...mergeClassName(
                        api.getBranchControlProps({ node, indexPath }),
                        "group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500",
                      )}
                      style={{ paddingLeft: depthPadding }}
                    >
                      <button
                        type="button"
                        {...mergeClassName(
                          api.getBranchTriggerProps({ node, indexPath }),
                          "inline-flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100",
                        )}
                        aria-label={`Toggle ${node.label}`}
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition ${state.expanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      <Icon className="h-4 w-4 text-slate-500" />
                      <span
                        {...api.getBranchTextProps({ node, indexPath })}
                        className="font-medium"
                      >
                        {node.label}
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={state.value}
                  {...mergeClassName(
                    api.getItemProps({ node, indexPath }),
                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500",
                  )}
                  style={{ paddingLeft: depthPadding }}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center" />
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span {...api.getItemTextProps({ node, indexPath })}>
                    {node.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">
            Selected Node
          </h3>
          {!selectedNode ? (
            <p className="mt-3 text-sm text-gray-500">
              Chon mot node de xem du lieu schema fake.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Label:</span>{" "}
                <span className="text-gray-900">{selectedNode.label}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>{" "}
                <span className="text-gray-900">{selectedNode.type}</span>
              </div>
              {selectedNode.data ? (
                <pre className="overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                  {JSON.stringify(selectedNode.data, null, 2)}
                </pre>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default OrgUnitPage;
