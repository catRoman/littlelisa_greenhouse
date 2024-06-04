import { useContext, useEffect, useState } from "react";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";

import { GreenHouseViewState } from "../../../../../../../../types/enums";

type ControllerSubMenuProps = {};

export default function ControllerSubMenu({}: ControllerSubMenuProps) {
  const {
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);

  const { user_id: userId, greenhouse_id: greenhouseId } =
    fetchedGreenhouseData!;

  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [updating, isUpdating] = useState<boolean>(false);

  const defaultControllerForm = {
    newTag: "",
    x_pos: "",
    y_pos: "",
    z_pos: "",
  };

  const [errors, setErrors] = useState({
    controllerForm: "",
  });

  const [controllerForm, setControllerForm] = useState(defaultControllerForm);

  const inputSensorChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    console.log(`name: ${name} value:${value}`);
    setControllerForm({ ...controllerForm, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  function controllerFormSubmitHandler(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    const newErrors = { controllerForm: "" };

    let valid = true;

    if (
      controllerForm.x_pos === "" &&
      controllerForm.y_pos === "" &&
      controllerForm.z_pos === "" &&
      controllerForm.newTag === ""
    ) {
      newErrors.controllerForm =
        "Must make a change for controller to update...";
      valid = false;
    }

    if (
      Number(controllerForm.x_pos) < 1 ||
      Number(controllerForm.y_pos) < 1 ||
      Number(controllerForm.z_pos) < 1
    ) {
      newErrors.controllerForm = "Coordinate cannot be less than one...";
      valid = false;
    }

    if (controllerForm.newTag === "") {
      newErrors.controllerForm = "Tag cannot be empty...";
      valid = false;
    }

    setErrors(newErrors);
    setUpdateCheck(!updateCheck);
    if (valid) {
      const controllerData = new FormData();

      const controllerId = fetchedGreenhouseData?.controllers[0].module_id!;
      controllerData.append("controller_id", controllerId);

      controllerData.append("new_tag", controllerForm.newTag);
      controllerData.append("x_pos", controllerForm.x_pos);
      controllerData.append("y_pos", controllerForm.y_pos);
      controllerData.append("z_pos", controllerForm.z_pos);

      console.log(controllerForm);

      const updateController = async () => {
        try {
          const response = await fetch(
            `/api/users/${userId}/greenhouses/${greenhouseId}/controller/${controllerId}/update`,
            {
              method: "PUT",
              body: controllerData,
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
            controllerForm:
              "There was an error connecting to node. Please try again... ",
          });
        } finally {
          setControllerForm({
            newTag: "",
            x_pos: "",
            y_pos: "",
            z_pos: "-1",
          });
          isUpdating(false);
        }
      };
      if (fetchedGreenhouseData) {
        isUpdating(true);
        updateController();
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
                onClick={controllerFormSubmitHandler}
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
          {errors.controllerForm && (
            <h5 className="  text-xs text-red-300">{errors.controllerForm}</h5>
          )}
          {!errors.controllerForm && !updateCheck && !updating && (
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
          {moduleType === "controller" ? "Update/Add Sensor:" : "Add Sensor:"}
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
                  `${fetchedGreenhouseData && selectedPlot ? selectedPlot.col! - fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point.x! + 1 : 0}`,
                  `${fetchedGreenhouseData && selectedPlot ? selectedPlot.row! - fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point.y! + 1 : 0}`,
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
          {!currentSensors || currentSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : viewState === GreenHouseViewState.Plot ? (
            currentSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentSensor-option-${index}`}
                  value={[
                    `${sensor.sensor_id}`,
                    `${sensor.module_id}`,
                    `${sensor.local_id}`,
                    `${sensor.type}`,
                    `-1`,
                    `-1`,
                  ]}
                >
                  {`${sensor.type}: ${sensor.location} (module: ${sensor.module_id})`}
                </option>
              );
            })
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
                    `-1`,
                    `-1`,
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
          {!currentSensors || currentSensors?.length < 1 ? (
            <option value="" disabled>
              No sensors available
            </option>
          ) : (
            currentSensors?.map((sensor, index) => {
              return (
                <option
                  key={`currentNode-option-${index}`}
                  value={[
                    `${sensor.sensor_id}`,
                    `${sensor.module_id}`,
                    `${sensor.local_id}`,
                    `${sensor.type}`,
                    `${fetchedGreenhouseData && selectedPlot ? selectedPlot.col! - fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point.x! + 1 : 0}`,
                    `${fetchedGreenhouseData && selectedPlot ? selectedPlot.row! - fetchedGreenhouseData.zones[selectedZoneNumber].zone_start_point.y! + 1 : 0}`,
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
