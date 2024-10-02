'use client'
import { useRouter } from "next/navigation";
export default function Home() {


  const route = useRouter()

  route.push("api/auth/signin?callbackUrl=%2Fhome")

  return (
    <></>
  );
}
