export const RECOVERY_ENGINE_RELEASE='25.8.3-auto-recovery-engine-2026-09-03'
export const RECOVERY_STEPS=[
 {attempt:1,afterMinutes:30,channel:'whatsapp',label:'WhatsApp • 30 min'},
 {attempt:2,afterMinutes:120,channel:'email',label:'E-mail • 2 h'},
 {attempt:3,afterMinutes:1440,channel:'whatsapp',label:'WhatsApp • 24 h'},
 {attempt:4,afterMinutes:2880,channel:'email',label:'E-mail • 48 h'},
] as const
export const recoveryStopRules=['Compra concluída','Oportunidade recuperada','Opt-out/sem consentimento','Evento fora do escopo da produtora'] as const
