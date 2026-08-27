import { ArrowUp } from 'lucide-react'
export default function ScrollTop(){return <button className="scroll-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Voltar ao topo"><ArrowUp size={23}/></button>}
