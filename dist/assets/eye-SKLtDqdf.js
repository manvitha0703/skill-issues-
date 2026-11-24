import{r as c}from"./index-MUH6MEco.js";/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=e=>(e.match(/\d+[xX]\d+|[A-Z]?[a-z]+|[A-Z]|\d+/g)??[]).join("-").toLowerCase();/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function B(e,t,n=[]){if(t==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:E(e),size:24,node:t,...n.length>0?{aliases:n}:{}}}/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=e=>{let t="",n=!1;for(const o of e){if(o==="-"||o==="_"||o<=" "){n=t.length>0;continue}t.length===0?t+=o.toLowerCase():t+=n?o.toUpperCase():o,n=!1}return t};/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=e=>{const t=I(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=(...e)=>{const t=new Set;for(const n of e)if(typeof n=="string")for(const o of n.split(/\s+/))o&&t.add(o);return[...t].join(" ")};/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function y(e){return e!=null}function $(e,t={}){var g,w;const n=t.attributeNames??{},o=s=>n[s]??s,l=e.size??e.width??r.width,d=e.size??e.height??r.height,h=((g=e.aliases)==null?void 0:g.filter(s=>typeof s=="string"&&s.trim()!=="").map(s=>`lucide-${s}`))??[],f=[...e.name?[`lucide-${e.name}`]:[],...h],i=((w=t.className)==null?void 0:w.split(" ").filter(Boolean))??[],k=t.includeDefaultClasses===!1?S(...i):S("lucide",...f,...i),x=t.absoluteStrokeWidth?Number(t.strokeWidth??r["stroke-width"])*Number(e.size??e.width??r.width)/Number(t.size??t.width??r.width):t.strokeWidth??r["stroke-width"];return["svg",{...Object.entries(r).reduce((s,[u,a])=>(s[o(u)]=a,s),{}),..."color"in t&&t.color&&{[o("stroke")]:t.color},..."size"in t&&y(t.size)&&{[o("width")]:t.size,[o("height")]:t.size},..."width"in t&&y(t.width)&&{[o("width")]:t.width},..."height"in t&&y(t.height)&&{[o("height")]:t.height},[o("stroke-width")]:x,...k&&{[o("class")]:k},[o("viewBox")]:`0 0 ${l} ${d}`,...t.hasA11yProp===!1?{[o("aria-hidden")]:"true"}:{},..."attributes"in t&&t.attributes},e.node.map(s=>{const[u,a,b]=s,C=t.nonScalingStroke?{[o("vector-effect")]:"non-scaling-stroke",...a}:a;return b?[u,C,b]:[u,C]})]}/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function D(e,t={}){return $(e,{...t,attributeNames:{...t.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=e=>{if(e==null||typeof e!="object")return!1;for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)&&(t.startsWith("aria-")||t==="role"||t==="title")&&e[t]!=null)return!0;return!1},_=c.createContext({}),F=()=>c.useContext(_),U=c.forwardRef(({color:e,size:t,width:n,height:o,strokeWidth:l,absoluteStrokeWidth:d,nonScalingStroke:h,className:f="",children:i,iconNode:k=[],icon:x={node:k,aliases:[],size:24},...N},g)=>{const{size:w=24,strokeWidth:s=2,absoluteStrokeWidth:u=!1,nonScalingStroke:a=!1,color:b="currentColor",className:C=""}=F()??{},z=!!i||R(N),[A,W,v=[]]=D(x,{color:e??b,width:n??t??w,height:o??t??w,strokeWidth:l??s,absoluteStrokeWidth:d??u,nonScalingStroke:h??a,className:S(C,f),hasA11yProp:z,attributes:N});return c.createElement(A,{ref:g,...W},[...v.map(([L,j])=>c.createElement(L,j)),...Array.isArray(i)?i:[i]])});/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Z(e,t=[],n=[]){const o=typeof e=="string"?B(e,t,n):e,l=c.forwardRef(({className:d,...h},f)=>c.createElement(U,{ref:f,icon:o,className:d,...h}));return o.name&&(l.displayName=P(o.name)),l}/**
 * @license lucide-react v1.77.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m={name:"eye",size:24,node:[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]};m.node;const q=Z(m);export{q as E,Z as c};
