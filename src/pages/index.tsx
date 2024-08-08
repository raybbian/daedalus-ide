import { Inter } from "next/font/google";
import Ide from "@/components/ide";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  return (
    <main className={`w-[100dvw] h-[100dvh] ${inter.className} text-daedalus11`}>
      <Ide />
    </main>
  );
}
