import { type User } from "../../data/user";

type TopNavIconProps = {
  user: User;
};

export default function TopNavProfile({ user }: TopNavIconProps) {
  return (
    <div className="flex items-center gap-1 ">
      <img className="rounded-full " src={user.picPath} width="30" />
      <p>{user.name}</p>
    </div>
  );
}
