import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";
import ReactDatePicker from "react-datepicker";
import { Node } from "../../../../../../../../types/common";

export default function NodeSubMenu() {
  const {
    selectedPlot,
    selectedZoneNumber,
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    fetchedGreenhouseData,
    unassignedNodeList,
  } = useContext(GreenHouseContext);

  const { user_id: userId, greenhouse_id: greenhouseId } =
    fetchedGreenhouseData!;

  const [updateCheck, setUpdateCheck] = useState<boolean>(false);

  const defaultNodeForm = {
    selectedAddNode: "",
    selectedRemoveNode: "",
  };

  const [nodeForm, setNodeForm] = useState(defaultNodeForm);
  const [currentNodes, setCurrentNodes] = useState<Node[]>();

  useEffect(() => {
    setCurrentNodes(
      fetchedGreenhouseData?.zones[selectedZoneNumber].nodes?.filter((node) => {
        return node.square_id === selectedPlot?.square_db_id;
      }),
    );
  }, [fetchedGreenhouseData, selectedPlot, selectedZoneNumber]);

  const selectNodeHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    console.log(`name: ${name} value:${value}`);
    setNodeForm({ ...nodeForm, [name]: value });
    // setErrors({ ...errors, [name]: "" });
  };

  //   useEffect(() => {}, [refreshGreenhouseData]);

  function nodeFormSubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setUpdateCheck(!updateCheck);

    const nodeData = new FormData();
    nodeData.append("add_node_id", nodeForm.selectedAddNode);
    nodeData.append("remove_node_id", nodeForm.selectedRemoveNode);

    console.log(nodeForm.selectedAddNode);
    console.log(unassignedNodeList);
    const updateSquare = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}/greenhouses/${greenhouseId}/squares/${selectedPlot?.square_db_id}/nodeUpdate`,
          {
            method: "PUT",
            body: nodeData,
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        setRefreshGreenhouseData(!refreshGreenhouseData);
        console.log(responseData);
      } catch (error) {
        console.log(error);
      } finally {
        setNodeForm({
          selectedAddNode: "",
          selectedRemoveNode: "",
        });
      }
    };

    updateSquare();
  }

  return (
    <div className=" py-2 pl-4">
      <form className="grid grid-cols-2 gap-2 pl-4">
        <div className="col-span-2 flex justify-between">
          <div className="">
            {updateCheck && (
              <p className="mt-1 text-sm text-green-500">Are you Sure?</p>
            )}
          </div>

          {!updateCheck ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setUpdateCheck(!updateCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button
                onClick={nodeFormSubmitHandler}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Update
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setUpdateCheck(!updateCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <label htmlFor="addNode" id="addNode">
          Add Node:
        </label>
        <select
          name="selectedAddNode"
          id="addNode"
          value={nodeForm.selectedAddNode}
          className="mt-1 rounded-md pl-2"
          onChange={selectNodeHandler}
        >
          <option value="" disabled>
            available nodes
          </option>
          {unassignedNodeList.map((node, index) => {
            return (
              <option
                key={`unassignedNode-option-${index}`}
                value={`${node.node_id}`}
              >
                {`${node.location} (${node.module_id})`}
              </option>
            );
          })}
        </select>
        <label htmlFor="removeNode" id="removeNode">
          Remove Node:
        </label>
        <select
          name="selectedRemoveNode"
          id="removeNode"
          value={nodeForm.selectedRemoveNode}
          className="mt-1 rounded-md pl-2"
          onChange={selectNodeHandler}
        >
          <option value="" disabled>
            current plot nodes
          </option>
          {currentNodes?.map((node, index) => {
            return (
              <option
                key={`currentNode-option-${index}`}
                value={`${node.node_id}`}
              >
                {`${node.location} (${node.module_id})`}
              </option>
            );
          })}
        </select>
      </form>
    </div>
  );
}
