import { redirect } from "next/navigation";

// Weather has been removed — the app now opens straight into Giá vàng.
export default function RootPage() {
  redirect("/gold");
}
