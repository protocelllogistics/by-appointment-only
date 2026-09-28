import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getConnectionStatus } from "@/lib/integrations.functions";
const stateLabel={connected:"Connected",ready:"Ready, not syncing",not_connected:"Not connected"} as const;
type Setting={label:string;value:string;note:string;options:string[]};
const initialPolicy:Setting[]=[
 {label:"Grace period",value:"10 min",note:"Served as normal. The session is shortened to protect the next booking. No fee.",options:["5 min","10 min","15 min"]},
 {label:"Late window",value:"10 to 20 min",note:"Served as a shortened or reduced service. Waived if the stylist was running late.",options:["5 to 15 min","10 to 20 min","15 to 25 min"]},
 {label:"Late fee",value:"£10",note:"Applied automatically from the check-in time. Always smaller than the no-show fee.",options:["£5","£10","£15"]},
 {label:"No-show after",value:"20 min",note:"The slot is freed straight away. The record is kept.",options:["15 min","20 min","25 min"]},
 {label:"No-show fee",value:"£25",note:"Charged only once staff confirm the no-show. Late fee only if the client is served anyway.",options:["£20","£25","£30"]},
];
const initialBooking:Setting[]=[
 {label:"Clash goodwill",value:"£5",note:"Taken off automatically when a client rebooks from the clash screen. Once per clash.",options:["£0","£5","£10"]},
 {label:"Booking form timeout",value:"10 min",note:"After this long with no activity the form closes. Nothing is held.",options:["5 min","10 min","15 min"]},
 {label:"Free cancellation until",value:"24 hours before",note:"Later cancellations count as late cancels.",options:["12 hours before","24 hours before","48 hours before"]},
];
const messages=[
 ["Late chase","Sent from Today","Hi {client}, we’re ready for {pet} at {time}. Are you on your way?"],
 ["Clash","Calendar sync gap","Sorry {client}, {time} was booked moments before you. Here are the closest times, with £5 off: {times}"],
 ["Ready for collection","At check-out","{pet} is ready to collect. {health_flags}"],
 ["Rebook link","No-show, reschedule","We missed {pet} today. Pick a new time here: {link}"],
];
export function SettingsScreen(){const [editing,setEditing]=useState(false),[policy,setPolicy]=useState(initialPolicy),[booking,setBooking]=useState(initialBooking),[draftPolicy,setDraftPolicy]=useState(initialPolicy),[draftBooking,setDraftBooking]=useState(initialBooking);const start=()=>{setDraftPolicy(policy);setDraftBooking(booking);setEditing(true)},cancel=()=>setEditing(false),save=()=>{setPolicy(draftPolicy);setBooking(draftBooking);setEditing(false)};return <section className="dash-page dash-settings-page"><header className="dash-head"><div className="dash-head-copy"><div className="dash-kicker">Policies, messages and connections</div><h1>Settings</h1></div>{editing?<><span className="dash-tag coral">Editing settings</span><Button variant="ghost" onClick={cancel}>Cancel</Button><Button className="dash-coral-action" onClick={save}>Save settings</Button></>:<Button className="dash-outline-action" onClick={start}>Edit settings</Button>}</header><div className="dash-settings-grid"><SettingsPanel title="Lateness and no-shows" subtitle="Shown and agreed at booking" values={editing?draftPolicy:policy} editing={editing} setValues={setDraftPolicy}/><div className="dash-panel dash-settings-column"><SettingsPanelBody title="Booking" values={editing?draftBooking:booking} editing={editing} setValues={setDraftBooking}/><h2>Connections</h2><Connections/></div><div className="dash-panel dash-settings-column"><h2>Messages</h2><small>Sent on WhatsApp, with SMS as a fallback</small>{messages.map(([name,when,text])=><div className="dash-message" key={name}><div><b>{name}</b><small>{when}</small></div><p>{text}</p></div>)}</div></div></section>}
function SettingsPanel({title,subtitle,...props}:{title:string;subtitle:string;values:Setting[];editing:boolean;setValues:(values:Setting[])=>void}){return <div className="dash-panel dash-settings-column"><h2>{title}</h2><small>{subtitle}</small><SettingRows {...props}/></div>}
function SettingsPanelBody({title,...props}:{title:string;values:Setting[];editing:boolean;setValues:(values:Setting[])=>void}){return <><h2>{title}</h2><SettingRows {...props}/></>}
function SettingRows({values,editing,setValues}:{values:Setting[];editing:boolean;setValues:(values:Setting[])=>void}){return <>{values.map((setting,index)=><div className="dash-policy" key={setting.label}><div className="dash-policy-line"><b>{setting.label}</b><strong>{setting.value}</strong></div><p>{setting.note}</p>{editing&&<div className="dash-choice-pills">{setting.options.map(option=><Button key={option} data-active={setting.value===option} onClick={()=>setValues(values.map((item,itemIndex)=>itemIndex===index?{...item,value:option}:item))}>{option}</Button>)}</div>}</div>)}</>}
function Connections(){const {data=[]}=useQuery({queryKey:["connection-status"],queryFn:()=>getConnectionStatus()});if(!data.length)return <small>Checking connections…</small>;return <>{data.map(c=><div className="dash-connection" key={c.name} data-state={c.state}><i style={c.state==="connected"?undefined:{opacity:.3}}/><span><b>{c.name}</b><small>{c.note}</small></span><strong style={c.state==="connected"?undefined:{opacity:.6}}>{stateLabel[c.state]}</strong></div>)}</>}
