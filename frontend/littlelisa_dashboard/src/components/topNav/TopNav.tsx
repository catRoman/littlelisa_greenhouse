import TopNavIcon from "./TopNavIcon";
import TopNavProfile from "./TopNavProfile";
import { currentUser } from "../../data/user";

export default function TopNav() {
  return (
    <div className=" flex items-center justify-between p-4 pt-2">
      <div className="flex items-center gap-4 ">
        <img src="../../../public/assets/greenhouse-logo.svg" width="40" />
        <h3 className="pt-2">LittleLisa</h3>
      </div>
      <div className="flex items-center ">
        <div className="flex gap-2">
          <TopNavIcon iconPath="../../../public/assets/topNavIcons/searchIcon.svg" />
          <TopNavIcon iconPath="../../../public/assets/topNavIcons/addNoteIcon.svg" />
          <TopNavIcon iconPath="../../../public/assets/topNavIcons/notificationIcon.svg" />
          <TopNavIcon iconPath="../../../public/assets/topNavIcons/appsIcon.svg" />
        </div>
        <div className="px-6 ">
          <TopNavProfile user={currentUser} />
        </div>
        <TopNavIcon iconPath="../../../public/assets/topNavIcons/settingIcon.svg" />
      </div>
    </div>
  );
}
