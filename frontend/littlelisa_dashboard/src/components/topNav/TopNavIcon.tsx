type TopNavIconProps = {
  iconPath: string;
};

export default function TopNavIcon({ iconPath }: TopNavIconProps) {
  return (
    <a className=" hover:stroke-stone-100" href="#">
      <img src={iconPath} width="30" />
    </a>
  );
}
