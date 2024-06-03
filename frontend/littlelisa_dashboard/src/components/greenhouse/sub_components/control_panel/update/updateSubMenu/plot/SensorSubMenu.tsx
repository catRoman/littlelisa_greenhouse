import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";
import { Node, Sensor } from "../../../../../../../../types/common";

export default function SensorSubMenu() {
  const {
    selectedPlot,
    selectedZoneNumber,
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    fetchedGreenhouseData,
    unassignedNodeList,
    unassignedSensorList,
  } = useContext(GreenHouseContext);

  const { user_id: userId, greenhouse_id: greenhouseId } =
    fetchedGreenhouseData!;

  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [updating, isUpdating] = useState<boolean>(false);

  const [zoneUnassignedSensors, setZoneUnassignedSensors] = useState<Sensor[]>(
    [],
  );

  const defaultSensorForm = {
    selectedNode: "",
    selectedAddSensor: "",
    selectedRemoveSensor: "",
    selectedSensorTag: "",
    newSensorTag: "",
  };

  const [errors, setErrors] = useState({
    sensorForm: "",
  });

  const [sensorForm, setSensorForm] = useState(defaultSensorForm);
  const [currentSensors, setCurrentSensors] = useState<Sensor[]>();

  useEffect(() => {
    //make list of zones nodes module_id
    //loop through unassigned sensors
    //if list of zones contains unassigned sensors
    //add to list of currentzoneunassigned sensors

    const zoneNodeList = fetchedGreenhouseData?.zones[
      selectedZoneNumber
    ].nodes?.map((node) => node.module_id);
    setZoneUnassignedSensors(
      unassignedSensorList.filter((sensor) =>
        zoneNodeList?.includes(sensor.module_id),
      ),
    );
  }, [unassignedSensorList, selectedZoneNumber, fetchedGreenhouseData]);

  useEffect(() => {
    setCurrentSensors(
      fetchedGreenhouseData?.zones[selectedZoneNumber].sensors?.filter(
        (sensor) => {
          return sensor.square_id === selectedPlot?.square_db_id;
        },
      ),
    );
  }, [fetchedGreenhouseData, selectedPlot, selectedZoneNumber]);

  const selectSensorChangeHandler = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    //console.log(`name: ${name} value:${value}`);
    setSensorForm({ ...sensorForm, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  const inputSensorChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    //console.log(`name: ${name} value:${value}`);
    setSensorForm({ ...sensorForm, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {}, [refreshGreenhouseData]);

  function sensorFormSubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const newErrors = { sensorForm: "" };

    let valid = true;
    if (
      sensorForm.selectedAddSensor === "" &&
      sensorForm.selectedRemoveSensor === "" &&
      sensorForm.newSensorTag === ""
    ) {
      newErrors.sensorForm = "Must make a change for sensor to update...";
      valid = false;
    }
    if (sensorForm.selectedSensorTag !== "" && sensorForm.newSensorTag === "") {
      newErrors.sensorForm = "Tag cannot be empty...";
      valid = false;
    }
    if (sensorForm.selectedSensorTag === "" && sensorForm.newSensorTag !== "") {
      newErrors.sensorForm = "Must select sensor to change tag...";
      valid = false;
    }

    setErrors(newErrors);
    setUpdateCheck(!updateCheck);
    if (valid) {
      // if (fetchedGreenhouseData && nodeForm.selectedAddNode) {
      //   const add_node_mac =
      //     fetchedGreenhouseData.zones[selectedZoneNumber].nodes[
      //       nodeForm.selectedAddNode
      //     ];
      // }

      //parse serialized data

      const sensorData = new FormData();

      sensorData.append("add_sensor_id", sensorForm.selectedAddSensor);
      sensorData.append("remove_sensor_id", sensorForm.selectedRemoveSensor);
      sensorData.append("new_tag", sensorForm.newSensorTag);
      sensorData.append("new_tag_id", sensorForm.selectedSensorTag);

      // if (fetchedGreenhouseData && nodeForm.selectedAddNode !== "") {
      //   nodeData.append("add_node_mac");
      // }

      console.log(sensorForm);

      const updateSquare = async () => {
        try {
          const response = await fetch(
            `/api/users/${userId}/greenhouses/${greenhouseId}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/squares/${selectedPlot?.square_db_id}/sensorUpdate`,
            {
              method: "PUT",
              body: sensorData,
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
          setErrors({
            sensorForm:
              "There was an error connecting to node. Please try again... ",
          });
        } finally {
          setSensorForm({
            selectedNode: "",
            selectedAddSensor: "",
            selectedRemoveSensor: "",
            selectedSensorTag: "",
            newSensorTag: "",
          });
          isUpdating(false);
        }
      };
      if (fetchedGreenhouseData) {
        isUpdating(true);
        updateSquare();
      }
    } else {
      console.log(errors);
    }
  }

  return (
    <div className=" py-2 pl-4">
      <form className="grid grid-cols-2 gap-1 pl-4">
        <div className="col-span-2   justify-between">
          {!updateCheck ? (
            <div className="float-right mb-3 justify-end gap-2">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setUpdateCheck(!updateCheck);
                }}
                className="ml-2 rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="float-right mb-3 justify-end gap-2">
              <button
                onClick={sensorFormSubmitHandler}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Update
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setUpdateCheck(!updateCheck);
                }}
                className="ml-2 rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Cancel
              </button>
            </div>
          )}
          {errors.sensorForm && (
            <h5 className="  text-xs text-red-300">{errors.sensorForm}</h5>
          )}
          {!errors.sensorForm && !updateCheck && !updating && (
            <h5 className="  text-xs text-purple-300">
              Sensors will appear as available apon data transmittion, sensor
              locations can be reassigned here...
            </h5>
          )}
          {updateCheck && (
            <p className="mt-1 text-sm text-green-500">Are you Sure?</p>
          )}
          {updating && (
            <p className="mt-1 text-sm text-green-500">Updating...</p>
          )}
        </div>

        <label htmlFor="addSensor" id="addSensor">
          Add Sensor:
        </label>
        <select
          name="selectedAddSensor"
          id="addSensors"
          value={sensorForm.selectedAddSensor}
          className=" rounded-md pl-2"
          onChange={selectSensorChangeHandler}
        >
          <option value="" disabled>
            available sensors
          </option>
          {zoneUnassignedSensors.map((sensor, index) => {
            return (
              <option
                key={`unassignedSensor-option-${index}`}
                value={`${sensor.sensor_id}-${sensor.module_id}-${selectedPlot?.col}-${selectedPlot?.row}`}
              >
                {`${sensor.location} (${sensor.module_id})`}
              </option>
            );
          })}
        </select>
        <label htmlFor="removeSensor" id="removeSensor">
          Remove Sensor:
        </label>
        <select
          name="selectedRemoveSensor"
          id="removeSensor"
          value={sensorForm.selectedRemoveSensor}
          className="rounded-md pl-2"
          onChange={selectSensorChangeHandler}
        >
          <option value="" disabled>
            Select sensor
          </option>
          {!currentSensors || currentSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : (
            currentSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentSensor-option-${index}`}
                  value={`${sensor.sensor_id}-${sensor.module_id}-${selectedPlot?.col}-${selectedPlot?.row}`}
                >
                  {`${sensor.location} (${sensor.module_id})`}
                </option>
              );
            })
          )}
        </select>

        <label htmlFor="selectSensorTag" id="selectSensorTag">
          Update Sensor Tag:
        </label>
        <select
          name="selectedSensorTag"
          id="selectSensorTag"
          value={sensorForm.selectedSensorTag}
          className="rounded-md pl-2"
          onChange={selectSensorChangeHandler}
        >
          <option value="" disabled>
            select sensor
          </option>
          {!currentSensors || currentSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : (
            currentSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentNode-option-${index}`}
                  value={`${sensor.sensor_id}-${sensor.module_id}-${selectedPlot?.col}-${selectedPlot?.row}`}
                >
                  {`${sensor.location} (id: ${sensor.module_id})`}
                </option>
              );
            })
          )}
        </select>
        {sensorForm.selectedSensorTag && (
          <>
            <label className="pl-4" id="newSensorTag">
              New Tag:
            </label>
            <input
              name="newSensorTag"
              id="newSensorTag"
              value={sensorForm.newSensorTag}
              className="rounded-md pl-2"
              onChange={inputSensorChangeHandler}
              placeholder={
                currentSensors?.find(
                  (sensor) =>
                    sensor.sensor_id === Number(sensorForm.selectedSensorTag) ||
                    "new tag",
                )?.location
              }
            ></input>
          </>
        )}
      </form>
    </div>
  );
}
