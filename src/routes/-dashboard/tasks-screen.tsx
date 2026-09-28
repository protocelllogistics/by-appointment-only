import { useState } from "react";
import { Button } from "@/components/ui/button";

type Task={id:string;cat:string;name:string;min:number;note:string;by?:string;at?:string;link?:string};
const sourceTasks:Task[]=[
 {id:"k1",cat:"Health and style log",name:"Finish Kobe’s log",min:5,note:"Pre-filled from last visit"},
 {id:"k2",cat:"Equipment",name:"Clean and oil clipper blades",min:10,note:"Bay 4 set"},
 {id:"k3",cat:"Inventory",name:"Count shampoo and conditioner",min:10,note:"Oatmeal shampoo running low"},
];
const categories=["Health and style log","Equipment","Inventory","Grooming skills"];
const times=[5,10,20,25];

export function TasksScreen(){
 const [tasks,setTasks]=useState(sourceTasks),[done,setDone]=useState<string[]>([]),[form,setForm]=useState(false),[name,setName]=useState(""),[cat,setCat]=useState<string>(categories[0] ?? "Health and style log"),[min,setMin]=useState(10),[link,setLink]=useState("None");
 const toggle=(id:string)=>setDone(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);
 const add=()=>{if(!name.trim())return;const task:Task={id:`team-${tasks.length+1}`,name:name.trim(),cat,min,note:"Added by the team",by:"You",at:"just now",...(link==="None"?{}:{link})};setTasks(current=>[...current,task]);setName("");setForm(false)};
 return <section className="dash-page dash-tasks-page"><header className="dash-head"><div className="dash-head-copy"><div className="dash-kicker">Friday 25 September · 25 min free</div><h1>Tasks</h1></div><Button className="dash-outline-action" onClick={()=>setForm(true)}>New task</Button></header>
 {form&&<div className="dash-task-form"><label htmlFor="task-name">Task</label><input id="task-name" className="dash-input" value={name} onChange={event=>setName(event.target.value)} placeholder="What needs doing"/><span>Type</span><Choice items={categories} value={cat} pick={setCat}/><span>Time</span><Choice items={times.map(value=>`${value} min`)} value={`${min} min`} pick={value=>setMin(Number(value.split(" ")[0]))}/><span>Link to</span><Choice items={["None","Pet","Booking","Stylist"]} value={link} pick={setLink}/><span/><div className="dash-task-form-actions"><Button className="dash-coral-action" onClick={add}>Add task</Button><Button variant="ghost" onClick={()=>setForm(false)}>Cancel</Button></div></div>}
 <div className="dash-task-list">{tasks.filter(task=>!task.by).map(task=><TaskRow key={task.id} task={task} done={done.includes(task.id)} toggle={()=>toggle(task.id)}/>)}</div>
 {tasks.some(task=>task.by)&&<><div className="dash-team-title"><h2>Added by the team</h2><span>{tasks.filter(task=>task.by&&!done.includes(task.id)).length} open</span></div><div className="dash-task-list">{tasks.filter(task=>task.by).map(task=><TaskRow key={task.id} task={task} done={done.includes(task.id)} toggle={()=>toggle(task.id)}/>)}</div></>}
 </section>;
}
function Choice({items,value,pick}:{items:string[];value:string;pick:(item:string)=>void}){return <div className="dash-choice-pills">{items.map(item=><Button key={item} data-active={item===value} onClick={()=>pick(item)}>{item}</Button>)}</div>}
function TaskRow({task,done,toggle}:{task:Task;done:boolean;toggle:()=>void}){return <Button variant="ghost" className="dash-task-row" onClick={toggle}><span className="dash-task-circle" data-done={done}>{done?"✓":""}</span><span><b data-done={done}>{task.name}</b><small>{task.cat} · {task.by?`added ${task.at} by ${task.by}`:task.note}</small></span>{task.link&&<i>{task.link}</i>}<strong>{task.min} min</strong></Button>}