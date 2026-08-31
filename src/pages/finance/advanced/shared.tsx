import React from 'react';
type Props={onNavigate?:(key:string)=>void};
const Box=({title,children}:{title:string,children:React.ReactNode})=><section className="fat-card"><h3>{title}</h3>{children}</section>;
export {Box}; export type {Props};
