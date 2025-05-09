import TopNavIcon from "./TopNavIcon";
import TopNavProfile from "./TopNavProfile";
import { currentUser } from "../../data/user";

export default function TopNav() {
  return (
    <div className=" flex items-center justify-between bg-zinc-900 p-4 pt-2">
      <div className="flex items-center gap-4 ">
        <img src="../../../assets/greenhouse-logo.svg" width="40" />
        <h3 className="pt-2">LittleLisa</h3>
      </div>
      <div className="flex items-center ">
        <div className="flex gap-2">
          <TopNavIcon iconPath="../../../assets/topNavIcons/searchIcon.svg" />
          <TopNavIcon iconPath="../../../assets/topNavIcons/addNoteIcon.svg" />
          <TopNavIcon iconPath="../../../assets/topNavIcons/notificationIcon.svg" />
          <TopNavIcon iconPath="../../../assets/topNavIcons/appsIcon.svg" />
        </div>
        <div className="px-6 ">
          <TopNavProfile user={currentUser} />
        </div>
        <TopNavIcon iconPath="../../../assets/topNavIcons/settingIcon.svg" />
      </div>
    </div>
  );
}
