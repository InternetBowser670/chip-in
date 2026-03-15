import { BsEye, BsEyeSlash } from "react-icons/bs";

export default function PublicSwitch({value}:{value:boolean}) {
  return (
   <div className="border-2 rounded-lg p-1 w-25">
    {value? 
    <div className="flex justify-center items-center gap-2">
      <BsEye/> 
      <h1>Public</h1>
    </div> : 
    <div className="flex justify-center items-center gap-2 ">
      <BsEyeSlash/>
      <h1>Private</h1>
    </div>
    }
   </div>
  );
}
