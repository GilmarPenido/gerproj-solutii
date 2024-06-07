import { PiSpinnerGap } from "react-icons/pi";

export default function Loading() {



    return (
        <div className="min-h-[100px] w-full flex flex-row aitems-center justify-center">
            <PiSpinnerGap className="size-8 text-blue-700 animate-spin"/>
        </div>
        
        
    )

}