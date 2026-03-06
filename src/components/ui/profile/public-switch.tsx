export default function PublicSwitch({value}:{value:boolean}) {
  return (
   <h1>{value? "Currently Public" : "Currently Private"}</h1>
  );
}
