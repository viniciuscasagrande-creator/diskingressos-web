import jwt from 'jsonwebtoken'
export type TokenUser={id:number;name:string;email:string;role:string;producerId:number|null}
const secret=process.env.JWT_SECRET||'dev-secret-change-me'
export function signToken(user:TokenUser){return jwt.sign(user,secret,{expiresIn:'8h'})}
export function verifyToken(token:string){return jwt.verify(token,secret) as TokenUser}
export function globalAdmin(role:string){return role==='admin-master'||role==='admin'}
