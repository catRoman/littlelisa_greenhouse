export default function OTAUpdate() {
  return (
    <div>
      <div>
        <p className="">
          Warning: This ota update will propagate throughout all connected nodes
        </p>

        <form className="" id="uploadForm">
          <input className="" type="file" id="fileInput" name="file" required />
          <button className="" type="submit" id="uploadBtn">
            Upload Firmware
          </button>
        </form>
        <div className="">
          <p className="">Upload in progress...</p>
          <p className=""></p>
        </div>
      </div>
    </div>
  );
}
