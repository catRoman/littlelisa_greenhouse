import { useContext, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { GreenHouseContext } from "../../../../../../../context/GreenHouseContextProvider";

export default function GreenhouseInfoSubMenu() {
  const {
    setRefreshGreenhouseData,
    refreshGreenhouseData,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);

  const {
    user_id: userId,
    greenhouse_id: greenhouseId,
    lat,
    long,
    location,
    style,
  } = fetchedGreenhouseData!;

  const [updateCheck, setUpdateCheck] = useState<boolean>(false);

  const defaultGreenhouseInfo = {
    lat: lat.toString(),
    long: long.toString(),
    style: style,
    location: location,
  };

  const [greenhouseInfo, setGreenhouseInfo] = useState(defaultGreenhouseInfo);

  const [errors, setErrors] = useState({
    error: "",
  });

  const greenhouseInfoChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    console.log(`name: ${name} value:${value}`);
    setGreenhouseInfo({ ...greenhouseInfo, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  useEffect(() => {}, [refreshGreenhouseData]);

  function greenhouseInfoSubmitHandler(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    const newErrors = { error: "" };
    console.log(greenhouseInfo);
    let valid = true;
    if (isNaN(lat) || isNaN(long)) {
      newErrors.error = "lat and long must be a number...";
      valid = false;
    }
    if (Number(greenhouseInfo.lat) < -90 || Number(greenhouseInfo.lat) > 90) {
      newErrors.error = "latitude must be between -90 and 90...";
      valid = false;
    }
    if (
      Number(greenhouseInfo.long) < -180 ||
      Number(greenhouseInfo.long) > 180
    ) {
      newErrors.error = "longitude must be between -90 and 90...";
      valid = false;
    }

    setErrors(newErrors);
    setUpdateCheck(!updateCheck);
    if (valid) {
      const greenhouseInfoFormData = new FormData();
      greenhouseInfoFormData.append("lat", greenhouseInfo.lat);
      greenhouseInfoFormData.append("long", greenhouseInfo.long);
      greenhouseInfoFormData.append("style", greenhouseInfo.style);
      greenhouseInfoFormData.append("location", greenhouseInfo.location);

      const updateSquare = async () => {
        try {
          const response = await fetch(
            `/api/users/${userId}/greenhouses/${greenhouseId}/update`,
            {
              method: "PUT",
              body: greenhouseInfoFormData,
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
          setGreenhouseInfo(defaultGreenhouseInfo);
        }
      };

      updateSquare();
    } else {
      console.log(errors);
    }
  }

  return (
    <div className=" py-2 pl-4">
      <form className="grid grid-cols-2 gap-2 pl-4">
        <div className="col-span-2 flex justify-between">
          <div className="">
            {!errors.error && !updateCheck && (
              <h5 className="  text-purple-300">Greenhouse info...</h5>
            )}
            {errors.error && (
              <p className="mt-1 text-sm text-red-500">{errors.error}</p>
            )}

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
                onClick={greenhouseInfoSubmitHandler}
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

        <label id="location">
          Location description:
          <input
            name="location"
            id="location"
            value={greenhouseInfo.location}
            className="mt-1 rounded-md pl-2"
            onChange={greenhouseInfoChangeHandler}
            placeholder={location}
          ></input>
        </label>
        <label id="isTransplanted">
          Style:
          <input
            name="style"
            id="style"
            value={greenhouseInfo.style}
            className="mt-1 rounded-md pl-2"
            onChange={greenhouseInfoChangeHandler}
            placeholder={style}
          />
        </label>
        {/* <div className="align-center mt-1 flex gap-4">
        </div> */}

        <label id="lat">
          Latitude:
          <input
            name="lat"
            id="lat"
            value={greenhouseInfo.lat}
            className="mt-1 rounded-md pl-2"
            onChange={greenhouseInfoChangeHandler}
            placeholder={lat.toString()}
          />
        </label>

        <label id="long">
          Longitude
          <input
            name="long"
            id="long"
            value={greenhouseInfo.long}
            className="mt-1 rounded-md pl-2"
            onChange={greenhouseInfoChangeHandler}
            placeholder={long.toString()}
          />
        </label>
      </form>
    </div>
  );
}
