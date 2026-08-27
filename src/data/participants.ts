export type CheckinStatus = 'presente' | 'pendente'
export type FacialStatus = 'aprovado' | 'pendente' | 'nao-cadastrado'
export type Participant = {
  id:number; name:string; email:string; document:string; ticket:string; order:string; eventId:number;
  purchaseDate:string; value:number; checkin:CheckinStatus; checkinTime?:string; facial:FacialStatus; gate?:string
}

export const participants:Participant[] = [
  {id:1,name:'Ana Beatriz Souza',email:'ana.souza@email.com',document:'***.458.219-**',ticket:'Pista • Inteira',order:'#DI-98231',eventId:2,purchaseDate:'12/08/2026 14:21',value:180,checkin:'presente',checkinTime:'18:47',facial:'aprovado',gate:'Portão A'},
  {id:2,name:'Lucas Henrique Lima',email:'lucas.lima@email.com',document:'***.771.903-**',ticket:'Pista • Meia',order:'#DI-98232',eventId:2,purchaseDate:'12/08/2026 14:25',value:90,checkin:'pendente',facial:'aprovado'},
  {id:3,name:'Mariana Costa',email:'mariana.costa@email.com',document:'***.120.765-**',ticket:'VIP • Inteira',order:'#DI-98244',eventId:3,purchaseDate:'13/08/2026 09:14',value:240,checkin:'presente',checkinTime:'07:56',facial:'pendente',gate:'Portão VIP'},
  {id:4,name:'Rafael Martins',email:'rafael.m@email.com',document:'***.882.140-**',ticket:'Plateia • Inteira',order:'#DI-98261',eventId:3,purchaseDate:'13/08/2026 11:02',value:120,checkin:'pendente',facial:'nao-cadastrado'},
  {id:5,name:'Camila Rocha',email:'camila.rocha@email.com',document:'***.309.512-**',ticket:'Plateia • Meia',order:'#DI-98275',eventId:4,purchaseDate:'13/08/2026 13:45',value:60,checkin:'presente',checkinTime:'08:03',facial:'aprovado',gate:'Portão B'},
  {id:6,name:'Felipe Andrade',email:'felipe.andrade@email.com',document:'***.672.310-**',ticket:'Pista • Inteira',order:'#DI-98301',eventId:1,purchaseDate:'14/08/2026 10:06',value:150,checkin:'pendente',facial:'pendente'},
  {id:7,name:'Juliana Freitas',email:'juliana.freitas@email.com',document:'***.246.889-**',ticket:'Pista • Inteira',order:'#DI-98310',eventId:2,purchaseDate:'14/08/2026 10:51',value:180,checkin:'presente',checkinTime:'18:52',facial:'aprovado',gate:'Portão A'},
  {id:8,name:'Pedro Alves',email:'pedro.alves@email.com',document:'***.519.402-**',ticket:'Cortesia',order:'#DI-98318',eventId:1,purchaseDate:'14/08/2026 12:33',value:0,checkin:'pendente',facial:'nao-cadastrado'}
]
