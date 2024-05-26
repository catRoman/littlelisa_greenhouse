import { useContext, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { GreenHouseContext } from "../../../../../context/GreenHouseContextProvider";

export default function PlantInfoSubMenu() {
  const { selectedPlot } = useContext(GreenHouseContext);
  const [emptyCheck, setEmptyCheck] = useState<boolean>(false);
  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [plantInfo, setPlantInfo] = useState({
    plant_type: selectedPlot ? selectedPlot.plant_type : "",
    date_planted: selectedPlot?.date_planted
      ? new Date(selectedPlot.date_planted!)
      : new Date("04-09-2000"),
    date_expected_harvest: selectedPlot?.date_expected_harvest
      ? new Date(selectedPlot.date_expected_harvest!)
      : new Date("04-09-2000"),
    is_transplanted: selectedPlot?.is_transplanted
      ? selectedPlot.is_transplanted
      : false,
  });

  const [errors, setErrors] = useState({
    date_issue: "",
    plant_type: "",
  });

  const plantedChangeHandler = (date: Date) => {
    setPlantInfo({ ...plantInfo, date_planted: date });
    setErrors({ ...errors, date_issue: "" });
  };
  const harvestChangeHandler = (date: Date) => {
    setPlantInfo({ ...plantInfo, date_expected_harvest: date });
    setErrors({ ...errors, date_issue: "" });
  };
  const plantInfoChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setPlantInfo({ ...plantInfo, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  function plantInfoSubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const newErrors = { date_issue: "", plant_type: "" };
    console.log(plantInfo);
    let valid = true;
    if (plantInfo.date_expected_harvest < plantInfo.date_planted) {
      newErrors.date_issue = "Surley you expect a harvest after planting...";
      valid = false;
    }
    if (!plantInfo.plant_type) {
      console.log("plant type error");
      newErrors.plant_type = "Need a plant type, take a geuss...";
      valid = false;
    }
    setErrors(newErrors);
    setUpdateCheck(!updateCheck);
  }
  function emptySubmitHandler(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    console.log("emptyied");
    setEmptyCheck(!emptyCheck);
  }
  return (
    <div className=" py-2 pl-4">
      <form className="grid grid-cols-2 gap-2 pl-4">
        <div className="col-span-2 flex justify-between">
          <div className="">
            {!errors.date_issue &&
              !emptyCheck &&
              !errors.plant_type &&
              !updateCheck && (
                <h5 className="  text-purple-300">Plant info...</h5>
              )}
            {errors.date_issue && (
              <p className="mt-1 text-sm text-red-500">{errors.date_issue}</p>
            )}
            {errors.plant_type && (
              <p className="mt-1 text-sm text-red-500">{errors.plant_type}</p>
            )}
            {emptyCheck && (
              <p className="mt-1 text-sm text-red-500">
                Are you Sure? This is clear the plot for good
              </p>
            )}
            {updateCheck && (
              <p className="mt-1 text-sm text-green-500">Are you Sure?</p>
            )}
          </div>

          {emptyCheck ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={emptySubmitHandler}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Empty
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setEmptyCheck(!emptyCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Cancel
              </button>
            </div>
          ) : !updateCheck ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  setEmptyCheck(!emptyCheck);
                }}
                className="rounded-md border bg-zinc-700 p-2 text-sm hover:bg-zinc-200 hover:font-bold hover:text-red-900"
              >
                Empty
              </button>
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
                onClick={plantInfoSubmitHandler}
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

        <label id="plantType">
          Plant Type:
          <input
            name="plant_type"
            id="plantType"
            className="mt-1 rounded-md pl-2"
            onChange={plantInfoChangeHandler}
            placeholder={plantInfo.plant_type}
          ></input>
        </label>
        <div className="align-center mt-1 flex gap-4">
          <label id="isTransplanted" className="inline-flex items-center">
            Transplanted:
          </label>
          <input
            name="is_transplanted"
            type="checkbox"
            onChange={plantInfoChangeHandler}
            defaultChecked={
              plantInfo.is_transplanted !== null && plantInfo.is_transplanted
            }
          />
        </div>

        <label id="plantType">
          Planted:
          <ReactDatePicker
            name="date_planted"
            className="mt-1 rounded-md pl-2"
            selected={plantInfo.date_planted}
            onChange={plantedChangeHandler}
          />
        </label>

        <label id="plantType">
          Est. Harvest:
          <ReactDatePicker
            name="date_expected_harvest"
            className="mt-1 rounded-md pl-2"
            selected={plantInfo.date_expected_harvest}
            onChange={harvestChangeHandler}
          />
        </label>
      </form>
    </div>
  );
}
