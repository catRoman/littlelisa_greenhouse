import { useContext, useState } from "react";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";

export default function ControllerSubMenu() {
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

  const inputControllerChangeHandler = (
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

    if (controllerForm.x_pos && controllerForm.y_pos && controllerForm.z_pos) {
      if (
        Number(controllerForm.x_pos) < 1 ||
        Number(controllerForm.y_pos) < 1 ||
        Number(controllerForm.z_pos) < 1
      ) {
        newErrors.controllerForm = "Coordinate cannot be less than one...";
        valid = false;
      }
    }

    // if (controllerForm.newTag === "") {
    //   newErrors.controllerForm = "Tag cannot be empty...";
    //   valid = false;
    // }

    setErrors(newErrors);
    setUpdateCheck(!updateCheck);
    if (valid && fetchedGreenhouseData) {
      const controllerData = new FormData();

      const controllerId = fetchedGreenhouseData.controllers[0].controller_id!;

      controllerData.append("controller_id", controllerId.toString());

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
            z_pos: "",
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
      <form className="grid grid-cols-2 gap-2 pl-4">
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
              Controller can be assigned anywhere in the greenhouse using
              absolute positioning...
            </h5>
          )}
          {updateCheck && (
            <p className="mt-1 text-sm text-green-500">Are you Sure?</p>
          )}
          {updating && (
            <p className="mt-1 text-sm text-green-500">Updating...</p>
          )}
        </div>
        <h4 className="">Update controller Position:</h4>
        <div className=" col-span-2 flex">
          <label id="x_pos">
            x pos:
            <input
              name="x_pos"
              id="x_pos"
              value={controllerForm.x_pos}
              className="mt-1  w-[40%] rounded-md pl-2"
              onChange={inputControllerChangeHandler}
              placeholder={fetchedGreenhouseData!.controllers[0].zn_rel_pos!.x.toString()}
            ></input>
          </label>
          <label id="y_pos">
            y pos:
            <input
              name="y_pos"
              id="y_pos"
              value={controllerForm.y_pos}
              className="mt-1 w-[40%] rounded-md pl-2"
              onChange={inputControllerChangeHandler}
              placeholder={fetchedGreenhouseData!.controllers[0].zn_rel_pos!.y.toString()}
            ></input>
          </label>
          <label id="z_pos">
            z pos:
            <input
              name="z_pos"
              id="z_pos"
              value={controllerForm.z_pos}
              className="mt-1 w-[40%] rounded-md pl-2"
              onChange={inputControllerChangeHandler}
              placeholder={fetchedGreenhouseData!.controllers[0].zn_rel_pos!.z.toString()}
            ></input>
          </label>
        </div>

        <label className="col-span-2 mt-2 flex flex-nowrap" id="newTag">
          New Tag:
          <input
            name="newTag"
            id="newTag"
            value={controllerForm.newTag}
            className="ml-2 rounded-md pl-2 "
            onChange={inputControllerChangeHandler}
            placeholder={fetchedGreenhouseData?.controllers[0].location}
          ></input>
        </label>
      </form>
    </div>
  );
}
