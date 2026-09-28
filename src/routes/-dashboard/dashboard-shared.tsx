import type { ReactNode } from "react";
export function DashboardHead({kicker,title,children}:{kicker:string;title:string;children?:ReactNode}){return <div className="dash-head"><div className="dash-head-copy"><div className="dash-kicker">{kicker}</div><h1>{title}</h1></div>{children}</div>}
