import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";
import { Sensor } from "../../../../../../../../types/common";

type SensorSubMenuProps = {
  moduleType: string;
};

export default function SensorSubMenu({ moduleType }: SensorSubMenuProps) {
  const {
    selectedPlot,
    selectedZoneNumber,
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    fetchedGreenhouseData,
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
    x_pos: "",
    y_pos: "",
    z_pos: "",
    updateType: "",
    moduleMac: "",
    localId: "",
    sensorType: "",
    module_type: moduleType,
  };

  const [errors, setErrors] = useState({
    sensorForm: "",
  });

  const [sensorForm, setSensorForm] = useState(defaultSensorForm);
  const [currentSensors, setCurrentSensors] = useState<Sensor[]>();
  const [currentGlobalSensors, setCurrentGlobalSensors] = useState<Sensor[]>();

  useEffect(() => {
    //make list of zones nodes module_id
    //loop through unassigned sensors
    //if list of zones contains unassigned sensors
    //add to list of currentzoneunassigned sensors
    let zoneNodeList: string[] | undefined = [];
    if (moduleType === "node") {
      zoneNodeList = fetchedGreenhouseData?.zones[
        selectedZoneNumber
      ].nodes?.map((node) => node.module_id);
      setZoneUnassignedSensors(
        unassignedSensorList.filter((sensor) =>
          zoneNodeList?.includes(sensor.module_id),
        ),
      );
    } else {
      zoneNodeList = fetchedGreenhouseData?.controllers?.map(
        (controller) => controller.module_id,
      );
      setZoneUnassignedSensors(
        unassignedSensorList.filter((sensor) =>
          zoneNodeList?.includes(sensor.module_id),
        ),
      );
    }
  }, [
    unassignedSensorList,
    moduleType,
    selectedZoneNumber,
    fetchedGreenhouseData,
  ]);

  useEffect(() => {
    setCurrentSensors(
      fetchedGreenhouseData?.zones[selectedZoneNumber].sensors?.filter(
        (sensor) => {
          return sensor.square_id === selectedPlot?.square_db_id;
        },
      ),
    );
    setCurrentGlobalSensors(
      fetchedGreenhouseData?.zones[0].sensors?.filter((sensor) => {
        return (
          sensor.zn_rel_pos &&
          sensor.zn_rel_pos?.x > 0 &&
          sensor.zn_rel_pos.y > 0 &&
          sensor.zn_rel_pos.z > 0
        );
      }),
    );
  }, [fetchedGreenhouseData, selectedPlot, selectedZoneNumber]);

  const selectSensorChangeHandler = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    //console.log(`name: ${name} value:${value}`);
    const values = value.split(",");
    console.log(`values: ${values}`);
    let type = "";
    if (name === "selectedAddSensor") {
      type = "add";
    } else if (name === "selectedRemoveSensor") {
      type = "remove";
    } else if (name === "selectedSensorTag") {
      type = "tag";
    }
    console.log(values[3]);

    setSensorForm({
      ...sensorForm,
      updateType: type,
      [name]: values[0],
      moduleMac: values[1],
      localId: values[2],
      sensorType: values[3],
      x_pos: values[4],
      y_pos: values[5],
      z_pos: "-1",
    });

    setErrors({ ...errors, [name]: "" });
  };
  const inputSensorChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    console.log(`name: ${name} value:${value}`);
    setSensorForm({ ...sensorForm, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {}, [refreshGreenhouseData]);

  function sensorFormSubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const newErrors = { sensorForm: "" };
    const isOnlyOneSelected = () => {
      const { selectedAddSensor, selectedRemoveSensor, selectedSensorTag } =
        sensorForm;
      const nonEmptyFields = [
        selectedAddSensor,
        selectedRemoveSensor,
        selectedSensorTag,
      ].filter((field) => field !== "");
      return nonEmptyFields.length === 1;
    };

    let valid = true;

    if (
      sensorForm.selectedAddSensor === "" &&
      sensorForm.selectedRemoveSensor === "" &&
      sensorForm.newSensorTag === ""
    ) {
      newErrors.sensorForm = "Must make a change for sensor to update...";
      valid = false;
    }

    // if (
    //   sensorForm.sensorType !== "DHT22" ||
    //   sensorForm.sensorType !== "soil_moisture" ||
    //   sensorForm.sensorType !== "light" ||
    //   sensorForm.sensorType !== "sound" ||
    //   sensorForm.sensorType !== "movement" ||
    //   sensorForm.sensorType !== "camera"
    // ) {
    //   newErrors.sensorForm = "Invalid sensor type...";
    //   valid = false;
    // }
    if (
      moduleType === "controller" &&
      sensorForm.selectedAddSensor &&
      (Number(sensorForm.x_pos) < 1 ||
        Number(sensorForm.y_pos) < 1 ||
        Number(sensorForm.z_pos) < 1)
    ) {
      newErrors.sensorForm = "Coordinate cannot be less than one...";
      valid = false;
    }

    if (!isOnlyOneSelected()) {
      newErrors.sensorForm =
        "can only update one sensor option at a to update...";
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

      const selectedSensor = [
        sensorForm.selectedAddSensor,
        sensorForm.selectedRemoveSensor,
        sensorForm.selectedSensorTag,
      ].filter((field) => field !== "")[0];
      const sensorData = new FormData();

      sensorData.append("sensor_id", selectedSensor);
      sensorData.append("local_id", sensorForm.localId);
      sensorData.append("sensor_type", sensorForm.sensorType);

      sensorData.append("type", sensorForm.updateType);
      sensorData.append("module_mac", sensorForm.moduleMac);
      sensorData.append("new_tag", sensorForm.newSensorTag);
      sensorData.append("x_pos", sensorForm.x_pos);
      sensorData.append("y_pos", sensorForm.y_pos);
      sensorData.append("z_pos", sensorForm.z_pos);
      sensorData.append("module_type", sensorForm.module_type);

      // if (fetchedGreenhouseData && nodeForm.selectedAddNode !== "") {
      //   nodeData.append("add_node_mac");
      // }

      console.log(sensorForm);

      const updateSquare = async (selectedSensor: string) => {
        try {
          let url;
          if (moduleType === "controller") {
            url = `/api/users/${userId}/greenhouses/${greenhouseId}/sensors/${selectedSensor}/update`;
          } else {
            url = `/api/users/${userId}/greenhouses/${greenhouseId}/zones/${fetchedGreenhouseData?.zones[selectedZoneNumber].zone_id}/squares/${selectedPlot?.square_db_id}/sensors/${selectedSensor}/update`;
          }
          const response = await fetch(url, {
            method: "PUT",
            body: sensorData,
          });

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
            x_pos: "",
            y_pos: "",
            z_pos: "",
            updateType: "",
            moduleMac: "",
            localId: "",
            sensorType: "",
            module_type: moduleType,
          });
          isUpdating(false);
        }
      };
      if (fetchedGreenhouseData) {
        isUpdating(true);
        updateSquare(selectedSensor);
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
                value={[
                  `${sensor.sensor_id}`,
                  `${sensor.module_id}`,
                  `${sensor.local_id}`,
                  `${sensor.type}`,
                  `${selectedPlot?.col}`,
                  `${selectedPlot?.row}`,
                ]}
              >
                {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
              </option>
            );
          })}
        </select>
        {sensorForm.selectedAddSensor && moduleType === "controller" && (
          <div className="col-span-2 flex">
            <label id="x_pos">
              x pos:
              <input
                name="x_pos"
                id="x_pos"
                value={sensorForm.x_pos}
                className="mt-1  w-[40%] rounded-md pl-2"
                onChange={inputSensorChangeHandler}
                placeholder={"0"}
              ></input>
            </label>
            <label id="y_pos">
              y pos:
              <input
                name="y_pos"
                id="y_pos"
                value={sensorForm.y_pos}
                className="mt-1 w-[40%] rounded-md pl-2"
                onChange={inputSensorChangeHandler}
                placeholder={"0"}
              ></input>
            </label>
            <label id="z_pos">
              z pos:
              <input
                name="z_pos"
                id="z_pos"
                value={sensorForm.z_pos}
                className="mt-1 w-[40%] rounded-md pl-2"
                onChange={inputSensorChangeHandler}
                placeholder={"0"}
              ></input>
            </label>
          </div>
        )}

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
          {moduleType === "node" ? (
            !currentSensors || currentSensors?.length < 1 ? (
              <option value="" disabled>
                No sensors available
              </option>
            ) : (
              currentSensors?.map((sensor, index) => {
                return (
                  <option
                    key={`currentSensor-option-${index}`}
                    value={[
                      `${sensor.sensor_id}`,
                      `${sensor.module_id}`,
                      `${sensor.local_id}`,
                      `${sensor.type}`,
                      `${selectedPlot?.col}`,
                      `${selectedPlot?.row}`,
                    ]}
                  >
                    {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
                  </option>
                );
              })
            )
          ) : !currentGlobalSensors || currentGlobalSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : (
            currentGlobalSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentSensor-option-${index}`}
                  value={[
                    `${sensor.sensor_id}`,
                    `${sensor.module_id}`,
                    `${sensor.local_id}`,
                    `${sensor.type}`,
                    `${sensor?.zn_rel_pos?.x}`,
                    `${sensor?.zn_rel_pos?.y}`,
                  ]}
                >
                  {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
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
          {moduleType === "node" ? (
            !currentSensors || currentSensors?.length < 1 ? (
              <option value="" disabled>
                No sensors available
              </option>
            ) : (
              currentSensors?.map((sensor, index) => {
                return (
                  <option
                    key={`currentSensor-option-${index}`}
                    value={[
                      `${sensor.sensor_id}`,
                      `${sensor.module_id}`,
                      `${sensor.local_id}`,
                      `${sensor.type}`,
                      `${selectedPlot?.col}`,
                      `${selectedPlot?.row}`,
                    ]}
                  >
                    {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
                  </option>
                );
              })
            )
          ) : !currentGlobalSensors || currentGlobalSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : (
            currentGlobalSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentSensor-option-${index}`}
                  value={[
                    `${sensor.sensor_id}`,
                    `${sensor.module_id}`,
                    `${sensor.local_id}`,
                    `${sensor.type}`,
                    `${sensor?.zn_rel_pos?.x}`,
                    `${sensor?.zn_rel_pos?.y}`,
                  ]}
                >
                  {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
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
