import { redirect } from "next/navigation";

export default function Home() {
  // Redirect visitors from the root URL ("/") to the login page.
  redirect("/login");
}
