import { redirect } from "next/navigation";

// The site lives at /nathia (noindexed there); the root just forwards to it.
export default function Home() {
  redirect("/nathia");
}
